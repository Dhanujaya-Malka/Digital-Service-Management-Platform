'use client';

import { useState, useRef } from 'react';
import { 
  Play, 
  Video, 
  CheckCircle2, 
  Download, 
  Smartphone, 
  Laptop, 
  ExternalLink, 
  Sparkles,
  Info
} from 'lucide-react';
import { Button } from '@/components/ui/button';

function YouTubeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
    </svg>
  );
}

export default function VideoTutorial() {
  const [videoSource, setVideoSource] = useState<'local' | 'youtube'>('local');
  const [hasVideoError, setHasVideoError] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const togglePlay = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
        setIsPlaying(true);
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    }
  };

  const chapters = [
    { time: '0:00', title: 'Choose Package', desc: 'Select Dialog, SLT, Hutch, or Airtel pack' },
    { time: '0:45', title: 'Install App', desc: 'Download v2rayNG (Android) or V2Box (iOS)' },
    { time: '1:15', title: 'Import Config', desc: 'Scan QR code or paste vless:// link' },
    { time: '1:50', title: 'Connect & Test', desc: 'Browse YouTube & TikTok with unlimited speed' },
  ];

  const appLinks = [
    {
      os: 'Android',
      app: 'v2rayNG',
      icon: Smartphone,
      link: 'https://play.google.com/store/apps/details?id=com.v2ray.ang',
      badge: 'Recommended',
    },
    {
      os: 'iOS / iPhone',
      app: 'Streisand / V2Box',
      icon: Smartphone,
      link: 'https://apps.apple.com/app/streisand/id6450534064',
      badge: 'App Store',
    },
    {
      os: 'Windows PC',
      app: 'v2rayN / Nekoray',
      icon: Laptop,
      link: 'https://github.com/2dust/v2rayN/releases',
      badge: 'Desktop',
    },
  ];

  return (
    <section className="my-16 max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/25 text-xs font-semibold text-primary mb-3">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Quick Video Guide</span>
        </div>
        <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground">
          Watch How to Connect in Under 2 Minutes
        </h2>
        <p className="mt-2 text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto">
          Follow our simple visual tutorial to set up your V2Ray config and enjoy unlimited bypass internet on any device.
        </p>

        {/* Source Switcher (Local MP4 vs YouTube) */}
        <div className="flex items-center justify-center gap-2 mt-4">
          <button
            type="button"
            onClick={() => setVideoSource('local')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              videoSource === 'local'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'bg-muted text-muted-foreground hover:text-foreground'
            }`}
          >
            <Video className="h-3.5 w-3.5" />
            <span>Local Video (/videos/tutorial.mp4)</span>
          </button>
          <button
            type="button"
            onClick={() => setVideoSource('youtube')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              videoSource === 'youtube'
                ? 'bg-red-600 text-white shadow-sm'
                : 'bg-muted text-muted-foreground hover:text-foreground'
            }`}
          >
            <YouTubeIcon className="h-3.5 w-3.5" />
            <span>YouTube Tutorial</span>
          </button>
        </div>
      </div>

      {/* Video Container Box */}
      <div className="relative rounded-2xl overflow-hidden border border-border/80 bg-card shadow-2xl">
        <div className="aspect-video w-full bg-black relative flex items-center justify-center">
          {videoSource === 'local' ? (
            <>
              {/* Local Video Tag */}
              {!hasVideoError ? (
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover"
                  controls
                  playsInline
                  preload="metadata"
                  onError={() => setHasVideoError(true)}
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                >
                  <source src="/videos/tutorial.mp4" type="video/mp4" />
                  <source src="/videos/loop.mp4" type="video/mp4" />
                  <source src="/videos/how-to-connect.mp4" type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              ) : (
                /* Fallback if tutorial.mp4 hasn't been placed in public/videos yet */
                <div className="text-center px-6 py-10 max-w-lg mx-auto text-white flex flex-col items-center">
                  <div className="h-16 w-16 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center text-primary mb-4 animate-pulse">
                    <Video className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Video Tutorial Slot Ready</h3>
                  <p className="text-xs sm:text-sm text-zinc-400 mb-6 leading-relaxed">
                    Place your video file in the following location and it will automatically play here:
                  </p>
                  <div className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs font-mono text-primary mb-4 w-full text-center select-all">
                    frontend/public/videos/tutorial.mp4
                  </div>
                  <p className="text-[11px] text-zinc-500">
                    Supports .mp4, .webm format. You can also switch to the YouTube tab above to embed a YouTube video!
                  </p>
                </div>
              )}
            </>
          ) : (
            /* YouTube Video Embed */
            <iframe
              className="w-full h-full border-0"
              src="https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ"
              title="V2Nexus Connection Tutorial"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          )}
        </div>

        {/* Video Footer Info Bar */}
        <div className="p-4 md:p-6 bg-card border-t border-border flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
              <Info className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Video File Location:</p>
              <p className="text-xs text-muted-foreground font-mono">
                public/videos/tutorial.mp4 <span className="text-primary">(or how-to-connect.mp4)</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground hidden sm:inline">Need connection help?</span>
            <a 
              href="https://t.me/v2nexus_support" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-xs font-medium text-primary hover:underline flex items-center gap-1"
            >
              <span>Telegram Support</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
      </div>

      {/* Chapters / Timestamps Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mt-6">
        {chapters.map((ch, idx) => (
          <div 
            key={idx} 
            className="p-3.5 rounded-xl bg-muted/40 border border-border/60 hover:border-primary/40 transition-colors"
          >
            <div className="flex items-center gap-2 mb-1.5">
              <span className="font-mono text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-md">
                {ch.time}
              </span>
              <span className="text-xs font-semibold text-foreground truncate">{ch.title}</span>
            </div>
            <p className="text-[11px] text-muted-foreground line-clamp-2">
              {ch.desc}
            </p>
          </div>
        ))}
      </div>

      {/* Client App Download Pills */}
      <div className="mt-8 p-6 rounded-2xl bg-muted/30 border border-border">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div>
            <h4 className="text-base font-bold text-foreground flex items-center gap-2">
              <Download className="h-4 w-4 text-primary" />
              <span>Recommended Client Apps</span>
            </h4>
            <p className="text-xs text-muted-foreground mt-0.5">
              Install the matching client application on your device to import your V2Ray config:
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {appLinks.map((app, i) => (
            <a
              key={i}
              href={app.link}
              target="_blank"
              rel="noopener noreferrer"
              className="p-3.5 rounded-xl bg-card border border-border/80 hover:border-primary/50 transition-all flex items-center justify-between group shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary group-hover:scale-105 transition-transform">
                  <app.icon className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-foreground">{app.app}</p>
                  <p className="text-[10px] text-muted-foreground">{app.os}</p>
                </div>
              </div>
              <ExternalLink className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
