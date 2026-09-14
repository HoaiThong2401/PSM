import React from 'react';

interface FlagIconProps {
  country: 'vn' | 'en';
  className?: string;
}

export const FlagIcon: React.FC<FlagIconProps> = ({ country, className = 'w-4 h-3' }) => {
  if (country === 'vn') {
    return (
      <svg
        viewBox="0 0 300 200"
        className={`inline-block align-middle rounded-[2px] shadow-xs shrink-0 ${className}`}
        aria-label="Vietnam Flag"
      >
        {/* Red Background */}
        <rect width="300" height="200" fill="#DA251D" />
        {/* Yellow 5-point star centered at (150, 100), R=60 */}
        <polygon
          fill="#FFFF00"
          points="
            150,40
            163.47,81.45
            207.06,81.45
            171.80,107.08
            185.27,148.54
            150,122.92
            114.73,148.54
            128.20,107.08
            92.94,81.45
            136.53,81.45
          "
        />
      </svg>
    );
  }

  // UK Flag (Union Jack)
  return (
    <svg
      viewBox="0 0 600 400"
      className={`inline-block align-middle rounded-[2px] shadow-xs shrink-0 ${className}`}
      aria-label="UK Flag"
    >
      {/* Navy blue background */}
      <rect width="600" height="400" fill="#012169" />
      {/* White diagonals */}
      <path d="M0 0 L600 400 M600 0 L0 400" stroke="#FFFFFF" strokeWidth="80" />
      {/* Red diagonals */}
      <path d="M0 0 L600 400" stroke="#C8102E" strokeWidth="40" />
      <path d="M600 0 L0 400" stroke="#C8102E" strokeWidth="40" />
      {/* White cross */}
      <path d="M300 0 v400 M0 200 h600" stroke="#FFFFFF" strokeWidth="120" />
      {/* Red cross */}
      <path d="M300 0 v400 M0 200 h600" stroke="#C8102E" strokeWidth="70" />
    </svg>
  );
};
