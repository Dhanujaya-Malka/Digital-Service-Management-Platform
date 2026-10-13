import React from 'react';

interface LogoProps {
  className?: string;
  size?: number;
}

// SLT Logo: The distinctive blue & green ribbon waves
export function SltLogo({ className = "h-5 w-5", size }: LogoProps) {
  return (
    <svg 
      viewBox="0 0 64 64" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg" 
      className={className}
      style={size ? { width: size, height: size } : undefined}
    >
      <rect width="64" height="64" rx="14" fill="#0c192c" />
      {/* Green wave */}
      <path 
        d="M18 42C24 45 32 44 38 38C44 32 48 20 42 16C36 12 28 20 22 28C16 36 14 39 18 42Z" 
        fill="#00B050" 
      />
      {/* Blue wave */}
      <path 
        d="M26 48C32 50 40 48 46 40C52 32 50 20 44 24C38 28 34 38 28 44C24 46 22 47 26 48Z" 
        fill="#0070C0" 
      />
      {/* Cyan accent */}
      <circle cx="21" cy="22" r="5" fill="#00E5FF" />
    </svg>
  );
}

// Dialog Logo: The iconic red/orange/yellow triangular petal crown
export function DialogLogo({ className = "h-5 w-5", size }: LogoProps) {
  return (
    <svg 
      viewBox="0 0 64 64" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg" 
      className={className}
      style={size ? { width: size, height: size } : undefined}
    >
      <rect width="64" height="64" rx="14" fill="#22090c" />
      {/* Top red petal */}
      <path d="M32 14L41 27H23L32 14Z" fill="#ED1C24" />
      {/* Right orange petal */}
      <path d="M43 29L51 43L37 39L43 29Z" fill="#F7931E" />
      {/* Left yellow-orange petal */}
      <path d="M21 29L27 39L13 43L21 29Z" fill="#FFC20E" />
      {/* Bottom center petal */}
      <path d="M32 48L25 39H39L32 48Z" fill="#C1272D" />
    </svg>
  );
}

// Mobitel Logo: Blue & green swooshes
export function MobitelLogo({ className = "h-5 w-5", size }: LogoProps) {
  return (
    <svg 
      viewBox="0 0 64 64" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg" 
      className={className}
      style={size ? { width: size, height: size } : undefined}
    >
      <rect width="64" height="64" rx="14" fill="#091d30" />
      <path 
        d="M16 38C16 26 26 16 38 16C44 16 48 19 48 19C48 19 42 22 38 23C30 25 24 31 24 38C24 44 28 48 34 48C40 48 44 44 46 41L48 45C45 49 39 52 33 52C22 52 16 46 16 38Z" 
        fill="#0054A6" 
      />
      <circle cx="44" cy="24" r="6" fill="#00A859" />
    </svg>
  );
}

// Airtel Logo: The clean red rounded emblem with white modern 'a' curve
export function AirtelLogo({ className = "h-5 w-5", size }: LogoProps) {
  return (
    <svg 
      viewBox="0 0 64 64" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg" 
      className={className}
      style={size ? { width: size, height: size } : undefined}
    >
      <rect width="64" height="64" rx="14" fill="#ED1C24" />
      {/* Stylized airtel cursive/curve lettermark */}
      <path 
        d="M32 18C24 18 18 24 18 32C18 40 24 46 32 46C38 46 43 42 45 37H39C38 39 35 41 32 41C27 41 23 37 23 32C23 27 27 23 32 23C36 23 39 25 41 29L46 27C43 21 38 18 32 18Z" 
        fill="white" 
      />
      <circle cx="38" cy="32" r="4.5" fill="white" />
    </svg>
  );
}

// Hutch Logo: Vibrant Orange with distinctive H pattern
export function HutchLogo({ className = "h-5 w-5", size }: LogoProps) {
  return (
    <svg 
      viewBox="0 0 64 64" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg" 
      className={className}
      style={size ? { width: size, height: size } : undefined}
    >
      <rect width="64" height="64" rx="14" fill="#FF5500" />
      {/* Clean bold white 'H' monogram */}
      <rect x="18" y="18" width="8" height="28" rx="2" fill="white" />
      <rect x="38" y="18" width="8" height="28" rx="2" fill="white" />
      <rect x="24" y="28" width="16" height="8" rx="1" fill="white" />
    </svg>
  );
}

// Helper to get logo by category string
export function getIspLogo(category?: string, size = 20) {
  switch (category?.toLowerCase()) {
    case 'slt':
      return <SltLogo size={size} />;
    case 'dialog':
      return <DialogLogo size={size} />;
    case 'mobitel':
      return <MobitelLogo size={size} />;
    case 'airtel':
      return <AirtelLogo size={size} />;
    case 'hutch':
      return <HutchLogo size={size} />;
    case 'basic':
      return (
        <div 
          style={{ width: size, height: size }} 
          className="rounded-lg bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center justify-center text-[10px] font-black"
          title="Basic Tier"
        >
          B
        </div>
      );
    case 'standard':
      return (
        <div 
          style={{ width: size, height: size }} 
          className="rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center text-[10px] font-black"
          title="Standard Tier"
        >
          S
        </div>
      );
    case 'premium':
      return (
        <div 
          style={{ width: size, height: size }} 
          className="rounded-lg bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center justify-center text-[10px] font-black"
          title="Premium Tier"
        >
          P
        </div>
      );
    case 'ultimate':
      return (
        <div 
          style={{ width: size, height: size }} 
          className="rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center text-[10px] font-black"
          title="Ultimate Tier"
        >
          U
        </div>
      );
    default:
      return (
        <div 
          style={{ width: size, height: size }} 
          className="rounded-lg bg-primary/20 flex items-center justify-center text-primary text-[10px] font-black"
        >
          V2
        </div>
      );
  }
}

// Mini Strip of all Sri Lankan ISP Logos
export function SriLankanIspStrip({ size = 16 }: { size?: number }) {
  return (
    <div className="flex items-center gap-1.5" title="Supports SLT, Dialog, Mobitel, Airtel & Hutch">
      <SltLogo size={size} />
      <DialogLogo size={size} />
      <MobitelLogo size={size} />
      <AirtelLogo size={size} />
      <HutchLogo size={size} />
    </div>
  );
}

