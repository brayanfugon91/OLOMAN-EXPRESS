import React from 'react';

interface OlomanLogoProps {
  className?: string;
  variant?: 'light' | 'dark' | 'color';
}

export const OlomanLogo: React.FC<OlomanLogoProps> = ({ 
  className = "h-14 w-auto", 
  variant = "color" 
}) => {
  // Brand colors defined in the uploaded image
  // Upper rust/red: #A82D13 (used in "ENVÍOS", bottom swoosh)
  // Middle teal/blue: #2E819F (used in "OLOMÁN EXPRESS", top swoosh)
  // Lower orange: #E9501B (used in "INTERNATIONAL LOGISTICS")

  const rustColor = variant === 'dark' ? '#FF6B00' : '#A82D13';
  const tealColor = variant === 'dark' ? '#4FA7C7' : '#2E819F';
  const orangeColor = variant === 'dark' ? '#FF823A' : '#E9501B';

  return (
    <div className={`inline-block ${className}`} id="oloman-express-brand-logo">
      <svg 
        viewBox="0 0 540 160" 
        width="100%" 
        height="100%" 
        xmlns="http://www.w3.org/2000/svg"
        className="select-none overflow-visible"
      >
        {/* ENVÍOS (Upper text) */}
        <text 
          x="10" 
          y="62" 
          fontFamily='"Inter", "Arial Black", "Impact", sans-serif' 
          fontWeight="900" 
          fontSize="68" 
          fill={rustColor} 
          letterSpacing="1"
          style={{ transform: 'scaleY(0.95)' }}
        >
          ENVÍOS
        </text>

        {/* OLOMÁN EXPRESS (Middle/Main text) */}
        <text 
          x="8" 
          y="114" 
          fontFamily='"Inter", "Arial Black", "Impact", sans-serif' 
          fontWeight="900" 
          fontSize="51" 
          fill={tealColor} 
          letterSpacing="-1.5"
          style={{ transform: 'scaleY(0.95)' }}
        >
          OLOMÁN EXPRESS
        </text>

        {/* INTERNATIONAL LOGISTICS (Lower subtext) */}
        <text 
          x="95" 
          y="148" 
          fontFamily='"Inter", "Arial", sans-serif' 
          fontWeight="800" 
          fontSize="17.5" 
          fill={orangeColor} 
          letterSpacing="4.5"
        >
          INTERNATIONAL LOGISTICS
        </text>

        {/* Dynamic crescent sweep on the right */}
        {/* Teal Upper Swoosh */}
        <path 
          d="M 315,48 C 410,48 510,55 510,88 Q 480,74 315,48 Z" 
          fill={tealColor} 
        />
        <path 
          d="M 510,88 C 510,88 470,88 440,88 C 452,82 485,76 510,88"
          fill={tealColor}
        />
        {/* Red/Rust Lower Swoosh */}
        <path 
          d="M 320,126 C 410,126 510,119 510,88 Q 480,102 320,126 Z" 
          fill={rustColor} 
        />

        {/* Seamless Swoosh Accent connecting and swirling */}
        <path
          d="M 310,48 C 430,48 535,54 535,88 C 535,110 470,124 320,126 C 450,122 523,108 523,88 C 523,66 430,52 310,48 Z"
          fill="url(#swooshGradient)"
          opacity="0.15"
        />

        <defs>
          <linearGradient id="swooshGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={tealColor} />
            <stop offset="100%" stopColor={rustColor} />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
};
