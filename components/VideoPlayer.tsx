import React, { useRef, useEffect, useState } from 'react';
import { Caption, BRollSegment } from '../types';
import { Play, Pause, Volume2, VolumeX, Maximize } from 'lucide-react';

interface VideoPlayerProps {
  videoUrl: string;
  captions: Caption[];
  bRollSegments: BRollSegment[];
  currentTime: number;
  duration: number;
  isPlaying: boolean;
  onTimeUpdate: (time: number) => void;
  onDurationChange: (duration: number) => void;
  onPlayPause: (playing: boolean) => void;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({
  videoUrl,
  captions,
  bRollSegments,
  currentTime,
  duration,
  isPlaying,
  onTimeUpdate,
  onDurationChange,
  onPlayPause,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMuted, setIsMuted] = useState(false);
  
  // Find current active caption
  const currentCaption = captions.find(
    (c) => currentTime >= c.startTime && currentTime <= c.endTime
  );

  // Find current active B-Roll
  const currentBRoll = bRollSegments.find(
    (b) => currentTime >= b.startTime && currentTime <= b.endTime && b.status === 'completed' && b.generatedImageUrl
  );

  useEffect(() => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.play().catch(() => onPlayPause(false));
      } else {
        videoRef.current.pause();
      }
    }
  }, [isPlaying, onPlayPause]);

  // Sync external currentTime changes (dragging timeline) to video
  useEffect(() => {
    if (videoRef.current && Math.abs(videoRef.current.currentTime - currentTime) > 0.5) {
      videoRef.current.currentTime = currentTime;
    }
  }, [currentTime]);

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      onTimeUpdate(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      onDurationChange(videoRef.current.duration);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const toggleFullScreen = () => {
    const playerContainer = document.getElementById('video-container');
    if (playerContainer) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        playerContainer.requestFullscreen();
      }
    }
  };

  return (
    <div id="video-container" className="relative group bg-black rounded-xl overflow-hidden shadow-2xl aspect-video flex items-center justify-center">
      <video
        ref={videoRef}
        src={videoUrl}
        className="w-full h-full object-contain"
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => onPlayPause(false)}
        onClick={() => onPlayPause(!isPlaying)}
        playsInline
      />

      {/* B-Roll Overlay */}
      {currentBRoll && (
        <div className="absolute inset-0 z-10 animate-fade-in transition-opacity duration-500 bg-black">
          <img 
            src={currentBRoll.generatedImageUrl} 
            alt="B-Roll" 
            className="w-full h-full object-contain opacity-90"
          />
           <div className="absolute top-4 right-4 bg-black/50 text-white text-xs px-2 py-1 rounded border border-white/20">
            B-Roll: {currentBRoll.description}
          </div>
        </div>
      )}

      {/* Caption Overlay */}
      {currentCaption && (
        <div className="absolute bottom-16 left-0 right-0 z-20 text-center pointer-events-none px-4">
          <span className="inline-block bg-black/60 text-yellow-300 text-lg md:text-2xl font-bold px-4 py-2 rounded-lg shadow-lg backdrop-blur-sm transition-all duration-200">
            {currentCaption.text}
          </span>
        </div>
      )}

      {/* Controls Overlay (Visible on hover or paused) */}
      <div className={`absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-30 transition-opacity duration-300 flex flex-col justify-end p-4 ${isPlaying ? 'opacity-0 group-hover:opacity-100' : 'opacity-100'}`}>
        <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
                <button
                    onClick={() => onPlayPause(!isPlaying)}
                    className="p-2 hover:bg-white/20 rounded-full text-white transition-colors"
                >
                    {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
                </button>
                <button
                    onClick={toggleMute}
                    className="p-2 hover:bg-white/20 rounded-full text-white transition-colors"
                >
                    {isMuted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
                </button>
                <span className="text-sm font-mono text-gray-300">
                    {new Date(currentTime * 1000).toISOString().substr(14, 5)} / {new Date(duration * 1000).toISOString().substr(14, 5)}
                </span>
            </div>
            
            <button
                onClick={toggleFullScreen}
                className="p-2 hover:bg-white/20 rounded-full text-white transition-colors"
            >
                <Maximize className="w-6 h-6" />
            </button>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
