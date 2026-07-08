import React from 'react';

interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export default function Logo({ className = '', showText = true, size = 'md' }: LogoProps) {
  const iconSizes = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-14 h-14',
    xl: 'w-20 h-20'
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-4xl',
    xl: 'text-6xl'
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Carga del Logo desde la carpeta public */}
      <div className={`${iconSizes[size]} relative shrink-0`}>
        <img
          src="/logo.svg"
          alt="MantechPro Logo"
          className="w-full h-full object-contain drop-shadow-[0_0_15px_rgba(93,60,254,0.4)]"
          onError={(e) => {
            // Fallback en caso de que no encuentre el archivo
            e.currentTarget.src = "data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><rect width=%22100%22 height=%22100%22 rx=%2220%22 fill=%22%23121317%22/><path d=%22M20 75V35L50 60L80 35V75%22 stroke=%22%235d3cfe%22 stroke-width=%2212%22 stroke-linecap=%22round%22 stroke-linejoin=%22round%22 fill=%22none%22/><circle cx=%2250%22 cy=%2220%22 r=%226%22 fill=%22%2352ffac%22/></svg>";
          }}
        />
      </div>

      {showText && (
        <div className="flex items-center gap-3">
          <span className={`${textSizes[size]} font-black tracking-tighter text-white`}>
            Mantech<span className="text-[#5d3cfe]">Pro</span>
          </span>
          <div className="bg-[#52ffac]/10 border border-[#52ffac]/20 px-3 py-1 rounded-lg shadow-[0_0_10px_rgba(82,255,172,0.1)]">
            <span className="text-[10px] font-black text-[#52ffac] uppercase tracking-[0.2em]">PANAMÁ</span>
          </div>
        </div>
      )}
    </div>
  );
}
