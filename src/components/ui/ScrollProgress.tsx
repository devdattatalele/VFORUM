"use client";

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

interface ScrollProgressProps {
  className?: string;
  sections?: { name: string; id: string; timestamp?: string }[]; // Added timestamp
}

export default function ScrollProgress({ 
  className, 
  sections = []
}: ScrollProgressProps) {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeSection, setActiveSection] = useState<string | null>(null);

  useEffect(() => {
    const updateScrollProgress = () => {
      const scrollTop = window.scrollY;
      const documentHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = documentHeight > 0 ? (scrollTop / documentHeight) * 100 : 0;
      setScrollProgress(Math.min(100, Math.max(0, progress)));

      // Update active section if sections are provided
      if (sections.length > 0) {
        for (let i = sections.length - 1; i >= 0; i--) {
          const element = document.getElementById(sections[i].id);
          if (element) {
            const rect = element.getBoundingClientRect();
            if (rect.top <= 100) {
              setActiveSection(sections[i].id);
              break;
            }
          }
        }
      }
    };

    window.addEventListener('scroll', updateScrollProgress);
    updateScrollProgress(); // Initial call

    return () => window.removeEventListener('scroll', updateScrollProgress);
  }, [sections]);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const getCurrentDate = () => {
    const now = new Date();
    return now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getTimeFromStart = () => {
    // Calculate time since page load
    const startTime = performance.now();
    const minutes = Math.floor(startTime / 60000);
    return minutes > 0 ? `${minutes}m` : 'now';
  };

  return (
    <div className={cn(
      "fixed right-6 top-1/2 -translate-y-1/2 z-40",
      "flex flex-col items-center",
      className
    )}>
      {/* Timeline container */}
      <div className="relative flex flex-col items-center">
        {/* Start date */}
        <div className="text-sm font-medium text-muted-foreground mb-4">
          {getCurrentDate()}
        </div>
        
        {/* Timeline track */}
        <div className="relative flex flex-col items-center">
          {/* Background line */}
          <div className="w-0.5 h-80 bg-border/40" />
          
          {/* Progress fill */}
          <div 
            className="absolute top-0 left-1/2 -translate-x-1/2 w-0.5 bg-primary transition-all duration-300 ease-out"
            style={{ height: `${(scrollProgress / 100) * 320}px` }}
          />
          
          {/* Current position indicator */}
          <div 
            className="absolute left-1/2 -translate-x-1/2 flex items-center transition-all duration-300 ease-out"
            style={{ top: `${(scrollProgress / 100) * 320}px` }}
          >
            {/* Timeline bubble */}
            <div className="relative">
              <div className="w-12 h-8 bg-primary rounded-lg flex items-center justify-center shadow-lg">
                <span className="text-xs font-bold text-primary-foreground">
                  {Math.round(scrollProgress)}%
                </span>
              </div>
              {/* Arrow pointing to line */}
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-primary rounded-full border-2 border-background" />
            </div>
            
            {/* Current section info */}
            <div className="ml-4 bg-background/95 backdrop-blur-sm border rounded-lg px-3 py-2 shadow-lg min-w-[100px]">
              <div className="text-xs font-medium text-foreground">
                {activeSection ? sections.find(s => s.id === activeSection)?.name || 'Reading' : 'Top'}
              </div>
              <div className="text-xs text-muted-foreground">
                {getCurrentDate()}
              </div>
            </div>
          </div>

          {/* Section markers */}
          {sections.map((section, index) => (
            <button
              key={section.id}
              onClick={() => scrollToSection(section.id)}
              className={cn(
                "absolute left-1/2 -translate-x-1/2 w-4 h-4 rounded-full border-2 transition-all duration-200 hover:scale-110",
                "focus:outline-none focus:ring-2 focus:ring-primary/20",
                activeSection === section.id
                  ? "bg-primary border-primary shadow-lg scale-110"
                  : "bg-background border-border hover:border-primary/50"
              )}
              style={{ top: `${(index / Math.max(sections.length - 1, 1)) * 320}px` }}
              title={section.name}
            />
          ))}
        </div>
        
        {/* End time */}
        <div className="text-sm font-medium text-muted-foreground mt-4">
          {getTimeFromStart()}
        </div>
      </div>
    </div>
  );
} 