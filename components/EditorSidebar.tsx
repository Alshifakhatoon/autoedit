import React from 'react';
import { Caption, BRollSegment } from '../types';
import { Wand2, Type, Image as ImageIcon, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

interface EditorSidebarProps {
  captions: Caption[];
  bRollSegments: BRollSegment[];
  onGenerateBRoll: (id: string) => void;
  currentTime: number;
  onJumpTo: (time: number) => void;
  videoTitle: string;
}

const EditorSidebar: React.FC<EditorSidebarProps> = ({
  captions,
  bRollSegments,
  onGenerateBRoll,
  currentTime,
  onJumpTo,
  videoTitle,
}) => {
  return (
    <div className="flex flex-col h-full bg-gray-800 border-l border-gray-700 w-full lg:w-96 overflow-hidden">
      <div className="p-4 border-b border-gray-700 bg-gray-800 shrink-0">
        <h2 className="font-bold text-white text-lg truncate" title={videoTitle}>{videoTitle || 'Untitled Project'}</h2>
        <p className="text-xs text-gray-400 mt-1">AI Video Analysis</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        
        {/* B-Roll Section */}
        <section>
          <div className="flex items-center justify-between mb-3 sticky top-0 bg-gray-800 z-10 py-2">
            <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider flex items-center gap-2">
              <ImageIcon className="w-4 h-4" /> B-Roll Assets
            </h3>
            <span className="text-xs bg-gray-700 px-2 py-0.5 rounded-full text-gray-300">{bRollSegments.length}</span>
          </div>

          <div className="space-y-3">
            {bRollSegments.length === 0 && (
                <div className="text-gray-500 text-sm italic text-center py-4">No B-roll opportunities detected.</div>
            )}
            {bRollSegments.map((segment) => {
              const isActive = currentTime >= segment.startTime && currentTime <= segment.endTime;
              return (
                <div
                  key={segment.id}
                  className={`p-3 rounded-lg border transition-all duration-200 ${
                    isActive
                      ? 'bg-blue-900/20 border-blue-500/50'
                      : 'bg-gray-750 border-gray-700 hover:border-gray-600'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                     <button onClick={() => onJumpTo(segment.startTime)} className="text-xs font-mono text-blue-400 hover:underline">
                        {segment.startTime.toFixed(1)}s - {segment.endTime.toFixed(1)}s
                     </button>
                     <span className={`text-[10px] px-1.5 py-0.5 rounded uppercase font-bold ${
                         segment.status === 'completed' ? 'bg-green-900 text-green-300' : 
                         segment.status === 'generating' ? 'bg-yellow-900 text-yellow-300' :
                         segment.status === 'failed' ? 'bg-red-900 text-red-300' :
                         'bg-gray-700 text-gray-400'
                     }`}>
                         {segment.status}
                     </span>
                  </div>
                  
                  <p className="text-sm text-gray-200 mb-2 leading-snug">{segment.description}</p>
                  
                  {segment.status === 'pending' && (
                    <button
                      onClick={() => onGenerateBRoll(segment.id)}
                      className="w-full py-1.5 px-3 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white text-xs font-medium rounded flex items-center justify-center gap-2 transition-colors"
                    >
                      <Wand2 className="w-3 h-3" /> Generate Asset
                    </button>
                  )}
                  {segment.status === 'generating' && (
                      <div className="flex items-center justify-center gap-2 text-xs text-yellow-400 py-1.5">
                          <Loader2 className="w-3 h-3 animate-spin" /> Generating...
                      </div>
                  )}
                  {segment.status === 'completed' && segment.generatedImageUrl && (
                      <div className="relative group rounded overflow-hidden aspect-video border border-gray-600 mt-2 cursor-pointer" onClick={() => onJumpTo(segment.startTime)}>
                          <img src={segment.generatedImageUrl} alt="Generated Asset" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <span className="text-xs text-white">Preview</span>
                          </div>
                      </div>
                  )}
                   {segment.status === 'failed' && (
                      <div className="flex items-center justify-center gap-2 text-xs text-red-400 py-1.5 cursor-pointer" onClick={() => onGenerateBRoll(segment.id)}>
                          <AlertCircle className="w-3 h-3" /> Retry
                      </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Captions Section */}
        <section>
          <div className="flex items-center justify-between mb-3 sticky top-0 bg-gray-800 z-10 py-2">
            <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider flex items-center gap-2">
              <Type className="w-4 h-4" /> Transcript
            </h3>
             <span className="text-xs bg-gray-700 px-2 py-0.5 rounded-full text-gray-300">{captions.length}</span>
          </div>
          
          <div className="space-y-1">
             {captions.length === 0 && (
                <div className="text-gray-500 text-sm italic text-center py-4">No speech detected.</div>
            )}
            {captions.map((caption, idx) => {
               const isActive = currentTime >= caption.startTime && currentTime <= caption.endTime;
               return (
                <div
                    key={idx}
                    onClick={() => onJumpTo(caption.startTime)}
                    className={`text-sm p-2 rounded cursor-pointer transition-colors ${
                        isActive ? 'bg-indigo-900/40 text-indigo-200 border-l-2 border-indigo-400' : 'text-gray-400 hover:bg-gray-700/50 hover:text-gray-200'
                    }`}
                >
                    <span className="text-[10px] text-gray-600 font-mono mr-2">{caption.startTime.toFixed(1)}s</span>
                    {caption.text}
                </div>
               );
            })}
          </div>
        </section>

      </div>
    </div>
  );
};

export default EditorSidebar;
