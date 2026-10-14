'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Package } from '@/types';
import PricingCard from '@/components/marketing/PricingCard';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';

interface PackageCarouselProps {
  packages: Package[];
}

export default function PackageCarousel({ packages }: PackageCarouselProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeftState, setScrollLeftState] = useState(0);
  const [hasUserScrolled, setHasUserScrolled] = useState(false);
  const rafId = useRef<number | null>(null);

  // Keep cardRefs array sized to packages length
  useEffect(() => {
    cardRefs.current = cardRefs.current.slice(0, packages.length);
  }, [packages.length]);

  // Center scroll to target index
  const scrollToCard = useCallback((index: number, behavior: ScrollBehavior = 'smooth') => {
    if (!containerRef.current || index < 0 || index >= packages.length) return;
    const targetCard = cardRefs.current[index];
    if (targetCard) {
      targetCard.scrollIntoView({
        behavior,
        inline: 'center',
        block: 'nearest',
      });
      setActiveIndex(index);
    }
  }, [packages.length]);

  // Center detect handler using requestAnimationFrame
  const updateActiveCard = useCallback(() => {
    if (!containerRef.current || cardRefs.current.length === 0) return;
    const container = containerRef.current;
    const containerRect = container.getBoundingClientRect();
    const containerCenter = containerRect.left + containerRect.width / 2;

    let closestIdx = 0;
    let minDistance = Infinity;

    cardRefs.current.forEach((el, idx) => {
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const cardCenter = rect.left + rect.width / 2;
      const distance = Math.abs(containerCenter - cardCenter);

      if (distance < minDistance) {
        minDistance = distance;
        closestIdx = idx;
      }
    });

    setActiveIndex(closestIdx);
  }, []);

  const handleScroll = () => {
    if (rafId.current) {
      cancelAnimationFrame(rafId.current);
    }
    rafId.current = requestAnimationFrame(() => {
      updateActiveCard();
      setHasUserScrolled(true);
    });
  };

  // Initial centering: Find recommended / popular card or middle card
  useEffect(() => {
    if (packages.length === 0) return;

    // Find popular card or middle card
    let targetIdx = packages.findIndex((p) => p.popular);
    if (targetIdx === -1) {
      targetIdx = Math.floor(packages.length / 2);
    }

    // Wait for DOM layout
    const timer = setTimeout(() => {
      scrollToCard(targetIdx, 'smooth');
    }, 150);

    return () => clearTimeout(timer);
  }, [packages, scrollToCard]);

  // Mouse Drag to Scroll handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - containerRef.current.offsetLeft);
    setScrollLeftState(containerRef.current.scrollLeft);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !containerRef.current) return;
    e.preventDefault();
    const x = e.pageX - containerRef.current.offsetLeft;
    const walk = (x - startX) * 1.5; // Drag speed multiplier
    containerRef.current.scrollLeft = scrollLeftState - walk;
  };

  // Horizontal Wheel support
  const handleWheel = (e: React.WheelEvent) => {
    if (!containerRef.current) return;
    // If vertical wheel is dominant and shift key isn't pressed, translate to horizontal scroll
    if (Math.abs(e.deltaY) > Math.abs(e.deltaX) && Math.abs(e.deltaY) > 10) {
      containerRef.current.scrollLeft += e.deltaY * 0.9;
    }
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      scrollToCard(Math.max(0, activeIndex - 1));
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      scrollToCard(Math.min(packages.length - 1, activeIndex + 1));
    }
  };

  if (packages.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground bg-muted/20 rounded-2xl border border-dashed border-border max-w-xl mx-auto">
        No packages currently available in this category.
      </div>
    );
  }

  return (
    <div 
      className="relative w-full focus:outline-none select-none"
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="region"
      aria-label="V2Ray Package Carousel"
    >
      {/* Top Controls / Center Indicator Strip */}
      <div className="flex items-center justify-between mb-4 px-2 max-w-5xl mx-auto">
        <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
          <Sparkles className="h-4 w-4 text-primary animate-pulse" />
          <span>
            Swipe or use arrows to compare packages ({activeIndex + 1} of {packages.length})
          </span>
        </div>

        {/* Arrow Navigation Buttons */}
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => scrollToCard(Math.max(0, activeIndex - 1))}
            disabled={activeIndex === 0}
            className="h-9 w-9 p-0 rounded-full border-border/80 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all disabled:opacity-30 disabled:pointer-events-none shadow-sm cursor-pointer"
            aria-label="Previous package"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => scrollToCard(Math.min(packages.length - 1, activeIndex + 1))}
            disabled={activeIndex === packages.length - 1}
            className="h-9 w-9 p-0 rounded-full border-border/80 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all disabled:opacity-30 disabled:pointer-events-none shadow-sm cursor-pointer"
            aria-label="Next package"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Horizontal Scroll Snap Container */}
      <div className="relative">
        
        {/* Left & Right Subtle Fade Gradients on edges for smooth visual blending */}
        <div className="absolute left-0 top-0 bottom-0 w-8 md:w-16 bg-gradient-to-r from-background to-transparent z-20 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-8 md:w-16 bg-gradient-to-l from-background to-transparent z-20 pointer-events-none" />

        <div
          ref={containerRef}
          onScroll={handleScroll}
          onMouseDown={handleMouseDown}
          onMouseLeave={handleMouseLeave}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
          onWheel={handleWheel}
          className={`flex items-center gap-6 overflow-x-auto py-10 px-[calc(50%-145px)] sm:px-[calc(50%-170px)] snap-x snap-mandatory scroll-smooth [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden ${
            isDragging ? 'cursor-grabbing' : 'cursor-grab'
          }`}
          style={{
            WebkitOverflowScrolling: 'touch',
          }}
        >
          {packages.map((pkg, idx) => {
            const isCenter = idx === activeIndex;

            return (
              <div
                key={pkg.id}
                ref={(el) => {
                  cardRefs.current[idx] = el;
                }}
                onClick={() => {
                  if (!isCenter) scrollToCard(idx);
                }}
                className={`w-[290px] sm:w-[340px] shrink-0 snap-center transition-all duration-300 ease-out transform ${
                  isCenter
                    ? 'scale-100 sm:scale-105 opacity-100 z-10 shadow-2xl shadow-primary/25'
                    : 'scale-90 sm:scale-95 opacity-55 hover:opacity-85 z-0 blur-[0.2px]'
                } motion-reduce:transform-none motion-reduce:transition-none`}
              >
                {/* Visual Highlight Ring around the center active card */}
                <div
                  className={`rounded-2xl h-full transition-all duration-300 ${
                    isCenter
                      ? 'ring-2 ring-primary/80 shadow-lg'
                      : 'ring-0'
                  }`}
                >
                  <PricingCard pkg={pkg} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Pagination Dot Indicators */}
      <div className="flex items-center justify-center gap-2 mt-4 pb-2">
        {packages.map((pkg, idx) => {
          const isCenter = idx === activeIndex;
          return (
            <button
              key={pkg.id}
              onClick={() => scrollToCard(idx)}
              className={`transition-all duration-300 rounded-full h-2 cursor-pointer ${
                isCenter
                  ? 'w-8 bg-primary shadow-sm shadow-primary/50'
                  : 'w-2 bg-muted-foreground/30 hover:bg-muted-foreground/60'
              }`}
              aria-label={`Go to package ${idx + 1}: ${pkg.name}`}
            />
          );
        })}
      </div>

      {/* Quick Summary under Carousel */}
      <div className="text-center mt-3 text-xs text-muted-foreground">
        Active Selection: <span className="font-semibold text-foreground">{packages[activeIndex]?.name}</span> • Rs. {packages[activeIndex]?.price}/mo
      </div>
    </div>
  );
}
