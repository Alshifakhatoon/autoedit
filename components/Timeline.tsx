import React, { useRef } from 'react';
import { Caption, BRollSegment } from '../types';

interface TimelineProps {
  duration: number;
  currentTime: number;
  captions: Caption[];
  bRollSegments: BRollSegment[];
  onSeek: (time: number) => void;
}

const Timeline: React.FC<TimelineProps> = ({
  duration,
  currentTime,
  captions,
  bRollSegments,
  onSeek,
}) => {
  const progressBarRef = useRef<HTMLDivElement>(null);

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressBarRef.current || duration === 0) return;
    const rect = progressBarRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, x / rect.width));
    onSeek(percentage * duration);
  };

  return (
    <div className="w-full select-none">
        {/* Caption Markers Track */}
        <div className="relative h-4 mb-1 w-full flex items-end">
            {captions.map((c, idx) => (
                <div
                    key={`cap-${idx}`}
                    className="absolute h-2 bg-indigo-500/50 rounded-sm border-l border-indigo-300 text-[8px] overflow-hidden whitespace-nowrap px-1 text-white/70"
                    style={{
                        left: `${(c.startTime / duration) * 100}%`,
                        width: `${((c.endTime - c.startTime) / duration) * 100}%`,
                        top: '4px'
                    }}
                    title={c.text}
                >
                </div>
            ))}
        </div>

        {/* B-Roll Markers Track */}
         <div className="relative h-4 mb-1 w-full">
            {bRollSegments.map((b, idx) => (
                <div
                    key={`broll-${idx}`}
                    className={`absolute h-3 rounded-sm border-l text-[8px] overflow-hidden whitespace-nowrap px-1 cursor-help transition-colors ${
                        b.status === 'completed' ? 'bg-emerald-500/60 border-emerald-300' : 'bg-gray-600 border-gray-400'
                    }`}
                    style={{
                        left: `${(b.startTime / duration) * 100}%`,
                        width: `${((b.endTime - b.startTime) / duration) * 100}%`,
                    }}
                    title={b.description}
                >
                </div>
            ))}
        </div>

      {/* Main Scrubber */}
      <div
        ref={progressBarRef}
        className="relative h-6 cursor-pointer group flex items-center"
        onClick={handleSeek}
      >
        {/* Background Track */}
        <div className="absolute inset-0 h-2 bg-gray-700 rounded-full my-auto overflow-hidden">
             {/* Buffered/Loaded simulation (full for now) */}
             <div className="w-full h-full bg-gray-600/50"></div>
        </div>

        {/* Progress Fill */}
        <div
          className="absolute left-0 h-2 bg-blue-500 rounded-full my-auto pointer-events-none"
          style={{ width: `${(currentTime / duration) * 100}%` }}
        ></div>

        {/* Scrubber Knob */}
        <div
          className="absolute h-4 w-4 bg-white rounded-full shadow-lg transform -translate-x-1/2 transition-transform duration-100 group-hover:scale-125 pointer-events-none border border-gray-300"
          style={{ left: `${(currentTime / duration) * 100}%` }}
        ></div>
      </div>
      
      <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>0:00</span>
          <span>Timeline</span>
          <span>{duration > 0 ? new Date(duration * 1000).toISOString().substr(14, 5) : '--:--'}</span>
      </div>
    </div>
  );
};

export default Timeline;
