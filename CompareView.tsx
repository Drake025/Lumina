import React, { useState, useRef } from 'react';
import { motion } from 'motion/react';

interface CompareViewProps {
  original: string;
  styled: string;
}

export default function CompareView({ original, styled }: CompareViewProps) {
  const [sliderPos, setSliderPos] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const position = ((x - rect.left) / rect.width) * 100;
    
    setSliderPos(Math.min(Math.max(position, 0), 100));
  };

  return (
    <div 
      ref={containerRef}
      className="relative w-full aspect-video rounded-3xl overflow-hidden cursor-col-resize select-none"
      onMouseMove={handleMove}
      onTouchMove={handleMove}
    >
      {/* Styled Image (Background) */}
      <img src={styled} alt="Styled" className="absolute inset-0 w-full h-full object-cover" />
      
      {/* Original Image (Foreground with clip) */}
      <div 
        className="absolute inset-0 w-full h-full overflow-hidden"
        style={{ clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }}
      >
        <img src={original} alt="Original" className="absolute inset-0 w-full h-full object-cover" />
      </div>

      {/* Slider Line */}
      <div 
        className="absolute inset-y-0 w-1 bg-white shadow-lg z-10"
        style={{ left: `${sliderPos}%` }}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full shadow-xl flex items-center justify-center">
          <div className="flex gap-1">
            <div className="w-1 h-4 bg-sand rounded-full" />
            <div className="w-1 h-4 bg-sand rounded-full" />
          </div>
        </div>
      </div>

      {/* Labels */}
      <div className="absolute bottom-6 left-6 z-20 bg-black/40 backdrop-blur-md text-white px-4 py-1 rounded-full text-xs font-medium">
        Original
      </div>
      <div className="absolute bottom-6 right-6 z-20 bg-olive/80 backdrop-blur-md text-white px-4 py-1 rounded-full text-xs font-medium">
        Styled
      </div>
    </div>
  );
}
