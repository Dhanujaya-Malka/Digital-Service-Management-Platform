'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Package } from '@/types';
import { getIspLogo, SriLankanIspStrip } from '@/components/marketing/IspLogos';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  HardDrive, 
  Smartphone, 
  Server, 
  ArrowRight, 
  Wifi, 
  ChevronLeft, 
  ChevronRight, 
  Sparkles,
  Zap,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';

interface StickyPackageCarouselProps {
  packages: Package[];
}

export default function StickyPackageCarousel({ packages }: StickyPackageCarouselProps) {
  const router = useRouter();
  const sectionRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const [maxScrollDistance, setMaxScrollDistance] = useState(0);
  const [isMounted, setIsMounted] = useState(false);

  // Filter packages by active category tab
  const filteredPackages = selectedCategory === 'all'
    ? packages
    : packages.filter((p) => p.category?.toLowerCase() === selectedCategory);

  const categories = [
    { id: 'all', label: 'All Plans', count: packages.length },
    { id: 'basic', label: 'Basic', count: packages.filter(p => p.category === 'basic').length },
    { id: 'standard', label: 'Standard', count: packages.filter(p => p.category === 'standard').length },
    { id: 'premium', label: 'Premium', count: packages.filter(p => p.category === 'premium').length },
    { id: 'ultimate', label: 'Ultimate', count: packages.filter(p => p.category === 'ultimate').length },
  ];

  // Calculate track width and maximum scroll distance
  const calculateScrollLimits = useCallback(() => {
    if (!trackRef.current) return;
    const track = trackRef.current;
    const windowWidth = window.innerWidth;
    const totalTrackWidth = track.scrollWidth;
    
    // Add margin for smooth centering of the final card
    const distance = Math.max(0, totalTrackWidth - windowWidth + 240);
    setMaxScrollDistance(distance);
  }, []);

  useEffect(() => {
    setIsMounted(true);
    calculateScrollLimits();

    const handleResize = () => {
      calculateScrollLimits();
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [calculateScrollLimits, filteredPackages]);

  // Window Scroll listener to drive the horizontal track translation
  useEffect(() => {
    let ticking = false;

    const handleWindowScroll = () => {
      if (!sectionRef.current) return;

      if (!ticking) {
        window.requestAnimationFrame(() => {
          if (!sectionRef.current) return;
          const rect = sectionRef.current.getBoundingClientRect();
          const windowHeight = window.innerHeight;
          const totalScrollableDistance = rect.height - windowHeight;

          if (totalScrollableDistance <= 0) return;

          // How far down the user has scrolled within this pinned section
          const distanceScrolled = -rect.top;
          const progress = Math.min(1, Math.max(0, distanceScrolled / totalScrollableDistance));
          setScrollProgress(progress);

          // Center highlight detection
          if (cardRefs.current.length > 0) {
            const viewportCenter = window.innerWidth / 2;
            let closestIdx = 0;
            let minDistance = Infinity;

            cardRefs.current.forEach((cardEl, idx) => {
              if (!cardEl) return;
              const cardRect = cardEl.getBoundingClientRect();
              const cardCenter = cardRect.left + cardRect.width / 2;
              const dist = Math.abs(viewportCenter - cardCenter);
              if (dist < minDistance) {
                minDistance = dist;
                closestIdx = idx;
              }
            });

            setActiveCardIndex(closestIdx);
          }

          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleWindowScroll, { passive: true });
    handleWindowScroll(); // Initial check

    return () => window.removeEventListener('scroll', handleWindowScroll);
  }, [maxScrollDistance, filteredPackages]);

  // Card click navigates to pricing page with focus
  const handleCardClick = (pkgId: string) => {
    router.push(`/pricing?plan=${pkgId}`);
  };

  // Arrow navigation: scrolls window to center previous/next card
  const handleNavigateCard = (index: number) => {
    if (!sectionRef.current || index < 0 || index >= filteredPackages.length) return;
    const totalScrollableDistance = sectionRef.current.offsetHeight - window.innerHeight;
    const progressPerCard = filteredPackages.length > 1 ? 1 / (filteredPackages.length - 1) : 0;
    const targetProgress = index * progressPerCard;
    const targetScrollTop = window.scrollY + sectionRef.current.getBoundingClientRect().top + (targetProgress * totalScrollableDistance);

    window.scrollTo({
      top: targetScrollTop,
      behavior: 'smooth',
    });
  };

  // Outer container height dictates how long the user scrolls through cards
  // ~250vh - 350vh gives a very natural, controlled scroll speed
  const dynamicContainerHeight = `${Math.max(200, filteredPackages.length * 50 + 120)}vh`;

  return (
    <div
      ref={sectionRef}
      className="relative w-full bg-background/60"
      style={{ height: dynamicContainerHeight }}
      id="packages-carousel-section"
    >
      {/* Sticky Fullscreen Container: Pins in place while cards scroll */}
      <div className="sticky top-0 h-screen w-full overflow-hidden flex flex-col justify-between py-6 md:py-8 z-30">
        
        {/* Background glow behind active cards */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-[320px] bg-primary/10 blur-[150px] rounded-full pointer-events-none" />

        {/* 1. Header Section */}
        <div className="container mx-auto px-4 md:px-6 z-10 text-center shrink-0">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1 text-[11px] font-semibold text-emerald-400 mb-2.5 shadow-sm">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>ALL SERVERS OPERATIONAL</span>
          </div>

          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight">
            Explore <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-purple-400 to-blue-400">V2Ray Packages</span>
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-lg mx-auto">
            Scroll down to browse all packages. Click any plan to view complete specs and subscribe.
          </p>

          {/* Category Tabs */}
          <div className="flex justify-center mt-4">
            <div className="inline-flex flex-wrap items-center justify-center gap-1.5 p-1 bg-muted/70 backdrop-blur-md rounded-2xl border border-border/60 max-w-full">
              {categories.map((cat) => {
                const isActive = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setSelectedCategory(cat.id);
                      setActiveCardIndex(0);
                    }}
                    className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                      isActive 
                        ? 'bg-card text-foreground shadow-sm border border-primary/40 text-primary' 
                        : 'text-muted-foreground hover:text-foreground hover:bg-card/40'
                    }`}
                  >
                    {cat.id === 'all' ? (
                      <Wifi className={`h-3.5 w-3.5 ${isActive ? 'text-primary' : 'opacity-60'}`} />
                    ) : (
                      <span className="shrink-0">{getIspLogo(cat.id, 16)}</span>
                    )}
                    <span>{cat.label}</span>
                    {cat.count > 0 && (
                      <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                        isActive ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'
                      }`}>
                        {cat.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* 2. Horizontally Translating Cards Track */}
        <div className="relative flex-1 flex items-center my-auto overflow-hidden">
          
          {/* Subtle Left & Right edge blur masks */}
          <div className="absolute left-0 top-0 bottom-0 w-12 md:w-28 bg-gradient-to-r from-background via-background/60 to-transparent z-20 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-12 md:w-28 bg-gradient-to-l from-background via-background/60 to-transparent z-20 pointer-events-none" />

          <div
            ref={trackRef}
            className="flex items-center gap-5 sm:gap-6 will-change-transform transition-transform duration-100 ease-out pl-[calc(50vw-150px)] sm:pl-[calc(50vw-175px)] pr-24"
            style={{
              transform: `translate3d(-${scrollProgress * maxScrollDistance}px, 0, 0)`,
            }}
          >
            {filteredPackages.map((pkg, idx) => {
              const isCenter = idx === activeCardIndex;

              return (
                <div
                  key={pkg.id}
                  ref={(el) => {
                    cardRefs.current[idx] = el;
                  }}
                  onClick={() => handleCardClick(pkg.id)}
                  className={`group relative w-[280px] sm:w-[320px] md:w-[340px] shrink-0 cursor-pointer rounded-2xl p-5 border backdrop-blur-xl transition-all duration-300 ease-out transform ${
                    isCenter
                      ? 'bg-card/95 border-primary ring-2 ring-primary/60 scale-100 sm:scale-105 shadow-2xl shadow-primary/20 z-10'
                      : 'bg-card/65 border-border/70 hover:border-primary/40 scale-90 sm:scale-95 opacity-55 hover:opacity-85 z-0'
                  }`}
                >
                  {/* Subtle Top Glow border */}
                  <div className={`absolute top-0 left-0 right-0 h-[2px] rounded-t-2xl bg-gradient-to-r ${
                    isCenter 
                      ? 'from-primary via-purple-500 to-blue-500 opacity-100' 
                      : 'from-transparent via-primary/30 to-transparent opacity-0 group-hover:opacity-100'
                  } transition-opacity duration-300`} />

                  {/* Top Badge Row */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="p-1 rounded-lg bg-background border border-border/60 shrink-0 shadow-sm">
                        {getIspLogo(pkg.category, 20)}
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                        {pkg.category || 'V2Ray'}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 text-[10px] font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span>ACTIVE</span>
                    </div>
                  </div>

                  {/* Plan Name */}
                  <h3 className="text-lg font-bold tracking-tight text-foreground group-hover:text-primary transition-colors line-clamp-1">
                    {pkg.name}
                  </h3>

                  {/* Pricing Strip */}
                  <div className="mt-2.5 flex items-baseline gap-1">
                    <span className="text-xs font-semibold text-muted-foreground">Rs.</span>
                    <span className="text-3xl font-black text-foreground tracking-tight font-mono">
                      {pkg.price}
                    </span>
                    <span className="text-xs text-muted-foreground ml-1">/ month</span>
                    {pkg.popular && (
                      <Badge className="ml-auto bg-primary/20 hover:bg-primary/20 text-primary border-primary/40 text-[9px] font-bold px-2 py-0.5 uppercase">
                        POPULAR
                      </Badge>
                    )}
                  </div>

                  {/* Concise Specs Grid (Indetail adu karala) */}
                  <div className="mt-4 p-3 rounded-xl bg-muted/30 border border-border/40 space-y-2 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground flex items-center gap-1.5 text-[11px]">
                        <HardDrive className="h-3.5 w-3.5 text-primary" /> Data Quota:
                      </span>
                      <span className="font-bold text-foreground text-[11px]">
                        {pkg.trafficLimit > 0 ? `${pkg.trafficLimit} GB` : 'Unlimited Data'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground flex items-center gap-1.5 text-[11px]">
                        <Smartphone className="h-3.5 w-3.5 text-primary" /> Devices:
                      </span>
                      <span className="font-semibold text-foreground text-[11px]">
                        {pkg.deviceLimit || '1 Device'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground flex items-center gap-1.5 text-[11px]">
                        <Server className="h-3.5 w-3.5 text-primary" /> Route:
                      </span>
                      <span className="font-mono text-emerald-400 font-semibold text-[10px]">
                        {pkg.serverLocation || 'SG SERVER (35ms)'}
                      </span>
                    </div>
                  </div>

                  {/* Supported Networks Strip */}
                  <div className="flex items-center justify-between py-2 px-3 rounded-xl bg-muted/20 border border-border/40 text-[10px] mt-3">
                    <span className="text-muted-foreground">Supported Networks:</span>
                    <SriLankanIspStrip size={14} />
                  </div>

                  {/* Click to View / Activate CTA banner (Replaced Choose Plan button) */}
                  <div className="mt-3.5 pt-3 border-t border-border/40 flex items-center justify-between text-xs font-semibold text-primary group-hover:text-primary/90">
                    <span className="text-[11px]">View full details & select</span>
                    <div className="flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      <span className="text-[11px]">Details</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </div>
                  </div>

                </div>
              );
            })}
          </div>

        </div>

        {/* 3. Bottom Controls & Scroll Indicator */}
        <div className="container mx-auto px-4 md:px-6 z-10 shrink-0">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 max-w-4xl mx-auto pt-2 border-t border-border/40">
            
            {/* Scroll Hint */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Sparkles className="h-3.5 w-3.5 text-primary animate-pulse" />
              <span>
                Scroll down to glide through plans ({activeCardIndex + 1} of {filteredPackages.length})
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-48 sm:w-64 h-1.5 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary rounded-full transition-all duration-75"
                style={{ width: `${Math.max(5, scrollProgress * 100)}%` }}
              />
            </div>

            {/* Arrow Navigation and View All Link */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleNavigateCard(Math.max(0, activeCardIndex - 1))}
                  disabled={activeCardIndex === 0}
                  className="h-8 w-8 p-0 rounded-full border-border/70 hover:bg-muted disabled:opacity-30 cursor-pointer"
                  aria-label="Previous plan"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleNavigateCard(Math.min(filteredPackages.length - 1, activeCardIndex + 1))}
                  disabled={activeCardIndex === filteredPackages.length - 1}
                  className="h-8 w-8 p-0 rounded-full border-border/70 hover:bg-muted disabled:opacity-30 cursor-pointer"
                  aria-label="Next plan"
                >
                  <ChevronRight className="h-3.5 w-3.5" />
                </Button>
              </div>

              <Link href="/pricing">
                <Button variant="ghost" size="sm" className="h-8 text-xs text-primary hover:text-primary/80 gap-1 px-2.5">
                  <span>View All on Pricing</span>
                  <ExternalLink className="h-3 w-3" />
                </Button>
              </Link>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
