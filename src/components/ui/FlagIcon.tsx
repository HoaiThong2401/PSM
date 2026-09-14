import React from 'react';

interface FlagIconProps {
  country: 'vn' | 'en';
  className?: string;
}

export const FlagIcon: React.FC<FlagIconProps> = ({ country, className = 'w-4 h-3' }) => {
  if (country === 'vn') {
    return (
      <svg
        viewBox="0 0 30 20"
        className={`inline-block rounded-xs shadow-xs shrink-0 overflow-hidden ${className}`}
        aria-label="Vietnam Flag"
      >
        {/* Red Background */}
        <rect width="30" height="20" fill="#DA251D" />
        {/* Yellow 5-point star centered at (15, 10), outer radius 6, inner radius ~2.29 */}
        <polygon
          fill="#FFFF00"
          points="
            15,4.0
            16.76,9.43
            22.47,9.43
            17.85,12.78
            19.61,18.21
            15,14.86
            10.39,18.21
            12.15,12.78
            7.53,9.43
            13.24,9.43
          "
        />
      </svg>
    );
  }

  // UK Flag (Union Jack)
  return (
    <svg
      viewBox="0 0 60 40"
      className={`inline-block rounded-xs shadow-xs shrink-0 overflow-hidden ${className}`}
      aria-label="UK Flag"
    >
      <clipPath id="uk-clip">
        <rect width="60" height="40" rx="1" />
      </clipPath>
      <g clipPath="url(#uk-clip)">
        {/* Navy blue background */}
        <rect width="60" height="40" fill="#012169" />
        {/* White diagonals */}
        <path d="M0 0 L60 40 M60 0 L0 40" stroke="#FFFFFF" strokeWidth="8" />
        {/* Red diagonals */}
        <path d="M0 0 L60 40" stroke="#C8102E" strokeWidth="4" />
        <path d="M60 0 L0 40" stroke="#C8102E" strokeWidth="4" />
        {/* White cross */}
        <path d="M30 0 v40 M0 20 h60" stroke="#FFFFFF" strokeWidth="12" />
        {/* Red cross */}
        <path d="M30 0 v40 M0 20 h60" stroke="#C8102E" strokeWidth="7" />
      </g>
    </svg>
  );
};
