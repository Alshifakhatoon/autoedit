import React, { useState, useEffect } from 'react';
import FileDropzone from './components/FileDropzone';
import VideoPlayer from './components/VideoPlayer';
import Timeline from './components/Timeline';
import EditorSidebar from './components/EditorSidebar';
import { analyzeVideoContent, generateBRollImage } from './services/geminiService';
import { fileToBase64 } from './utils/videoUtils';
import { Caption, BRollSegment, AppState, VideoAnalysisResult } from './types';
import { Sparkles, LayoutTemplate, Video, Film, Loader2, Type } from 'lucide-react';

export default function App() {
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  
  // Video Player State
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // Analysis Data
  const [analysisResult, setAnalysisResult] = useState<VideoAnalysisResult | null>(null);
  const [bRollSegments, setBRollSegments] = useState<BRollSegment[]>([]);

  // Cleanup object URLs
  useEffect(() => {
    return () => {
      if (videoUrl) URL.revokeObjectURL(videoUrl);
    };
  }, [videoUrl]);

  const handleFileAccepted = async (file: File) => {
    setVideoFile(file);
    const url = URL.createObjectURL(file);
    setVideoUrl(url);
    setAppState(AppState.ANALYZING);

    try {
      const base64 = await fileToBase64(file);
      const result = await analyzeVideoContent(base64, file.type);
      
      setAnalysisResult(result);
      
      // Initialize bRoll segments with unique IDs and status
      const initialBRoll = result.bRoll.map((b, idx) => ({
        ...b,
        id: `broll-${idx}-${Date.now()}`,
        status: 'pending' as const
      }));
      setBRollSegments(initialBRoll);
      
      setAppState(AppState.EDITING);
    } catch (error) {
      console.error("Processing failed", error);
      alert("Failed to analyze video. Please try a shorter video or check your API key.");
      setAppState(AppState.IDLE);
      setVideoFile(null);
    }
  };

  const handleGenerateBRoll = async (id: string) => {
    const segment = bRollSegments.find(s => s.id === id);
    if (!segment) return;

    // Optimistic update
    setBRollSegments(prev => prev.map(s => s.id === id ? { ...s, status: 'generating' } : s));

    try {
      const imageUrl = await generateBRollImage(segment.imagePrompt);
      
      setBRollSegments(prev => prev.map(s => 
        s.id === id ? { ...s, status: 'completed', generatedImageUrl: imageUrl } : s
      ));
    } catch (error) {
       console.error("Image gen failed", error);
       setBRollSegments(prev => prev.map(s => s.id === id ? { ...s, status: 'failed' } : s));
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-950 text-white font-sans">
      
      {/* Header */}
      <header className="h-16 border-b border-gray-800 bg-gray-900/50 backdrop-blur flex items-center justify-between px-6 shrink-0 z-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
            AutoEdit AI
          </span>
        </div>
        
        <div className="flex items-center gap-4">
             {appState === AppState.EDITING && (
                 <span className="text-xs px-3 py-1 bg-gray-800 rounded-full text-gray-400 border border-gray-700">
                     Preview Mode
                 </span>
             )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden relative">
        
        {/* State: IDLE - Upload */}
        {appState === AppState.IDLE && (
          <div className="flex flex-col items-center justify-center h-full p-8 animate-fade-in">
             <div className="text-center mb-10 max-w-2xl">
                 <h1 className="text-4xl md:text-5xl font-extrabold mb-4 leading-tight">
                     Transform your raw footage into <span className="text-blue-400">masterpieces.</span>
                 </h1>
                 <p className="text-lg text-gray-400">
                     AI-powered automatic captioning, scene analysis, and B-roll generation. 
                     Just upload and let the magic happen.
                 </p>
             </div>
             <FileDropzone onFileAccepted={handleFileAccepted} isLoading={false} />
             
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 max-w-4xl w-full">
                 <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
                     <Type className="w-8 h-8 text-indigo-400 mb-3" />
                     <h3 className="font-bold mb-2">Smart Captions</h3>
                     <p className="text-sm text-gray-400">Auto-transcribe audio with precise timestamp alignment.</p>
                 </div>
                 <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
                     <LayoutTemplate className="w-8 h-8 text-emerald-400 mb-3" />
                     <h3 className="font-bold mb-2">Scene Analysis</h3>
                     <p className="text-sm text-gray-400">Identifies static shots that need visual enrichment.</p>
                 </div>
                 <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
                     <Film className="w-8 h-8 text-pink-400 mb-3" />
                     <h3 className="font-bold mb-2">B-Roll Generation</h3>
                     <p className="text-sm text-gray-400">Generate context-aware images to fill visual gaps.</p>
                 </div>
             </div>
          </div>
        )}

        {/* State: ANALYZING */}
        {appState === AppState.ANALYZING && (
          <div className="flex flex-col items-center justify-center h-full space-y-6 animate-pulse">
            <div className="relative">
                <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full"></div>
                <Loader2 className="w-16 h-16 text-blue-400 animate-spin relative z-10" />
            </div>
            <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold">Analyzing Video Content</h2>
                <p className="text-gray-400">Generating transcripts and finding edit points...</p>
                <p className="text-xs text-gray-500 mt-4">This may take up to 30 seconds depending on video length.</p>
            </div>
          </div>
        )}

        {/* State: EDITING */}
        {appState === AppState.EDITING && analysisResult && videoUrl && (
          <div className="flex flex-col lg:flex-row h-full">
            
            {/* Left: Player & Timeline */}
            <div className="flex-1 flex flex-col min-w-0 bg-gray-950">
              <div className="flex-1 p-4 md:p-8 flex items-center justify-center overflow-hidden">
                 <div className="w-full max-w-5xl">
                    <VideoPlayer
                        videoUrl={videoUrl}
                        captions={analysisResult.captions}
                        bRollSegments={bRollSegments}
                        currentTime={currentTime}
                        duration={duration}
                        isPlaying={isPlaying}
                        onTimeUpdate={setCurrentTime}
                        onDurationChange={setDuration}
                        onPlayPause={setIsPlaying}
                    />
                 </div>
              </div>
              
              <div className="h-32 bg-gray-900 border-t border-gray-800 p-4 shrink-0">
                <Timeline
                  duration={duration}
                  currentTime={currentTime}
                  captions={analysisResult.captions}
                  bRollSegments={bRollSegments}
                  onSeek={(time) => {
                      setCurrentTime(time);
                      // If seeking, playing usually stops or skips, handling in VideoPlayer effect
                  }}
                />
              </div>
            </div>

            {/* Right: Sidebar */}
            <EditorSidebar
                captions={analysisResult.captions}
                bRollSegments={bRollSegments}
                onGenerateBRoll={handleGenerateBRoll}
                currentTime={currentTime}
                onJumpTo={setCurrentTime}
                videoTitle={analysisResult.title}
            />
          </div>
        )}
      </main>
      
      {/* Type definition helper for lucide */}
      <div className="hidden">
         <Sparkles /> <LayoutTemplate /> <Video /> <Film /> <Loader2 /> <Type />
      </div>
    </div>
  );
}