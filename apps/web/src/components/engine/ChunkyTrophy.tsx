import React from 'react';

interface ChunkyTrophyProps {
  className?: string;
}

export const ChunkyTrophy: React.FC<ChunkyTrophyProps> = ({
  className = 'w-32 h-32',
}) => (
  <svg viewBox="0 0 100 100" className={`drop-shadow-xl ${className}`}>
    {/* Asas del trofeo */}
    <path
      d="M 25 30 C 10 30 10 50 25 55"
      fill="none"
      stroke="#e5a900"
      strokeWidth="8"
      strokeLinecap="round"
    />
    <path
      d="M 75 30 C 90 30 90 50 75 55"
      fill="none"
      stroke="#e5a900"
      strokeWidth="8"
      strokeLinecap="round"
    />
    <path
      d="M 25 30 C 10 30 10 50 25 55"
      fill="none"
      stroke="#ffc800"
      strokeWidth="8"
      strokeLinecap="round"
      transform="translate(0, -3)"
    />
    <path
      d="M 75 30 C 90 30 90 50 75 55"
      fill="none"
      stroke="#ffc800"
      strokeWidth="8"
      strokeLinecap="round"
      transform="translate(0, -3)"
    />

    {/* Base */}
    <rect x="35" y="75" width="30" height="15" rx="4" fill="#e5a900" />
    <rect x="35" y="72" width="30" height="15" rx="4" fill="#ffc800" />
    <path d="M 40 72 L 60 72 L 60 87 L 40 87 Z" fill="#ffe066" opacity="0.6" />

    {/* Copa Central */}
    <path d="M 20 15 L 80 15 L 75 50 C 70 70 30 70 25 50 Z" fill="#e5a900" />
    <path d="M 20 12 L 80 12 L 75 47 C 70 67 30 67 25 47 Z" fill="#ffc800" />

    {/* Brillos y reflejos de la copa */}
    <path
      d="M 30 20 L 45 60"
      stroke="#ffffff"
      strokeWidth="6"
      strokeLinecap="round"
      opacity="0.5"
    />
    <ellipse cx="50" cy="12" rx="30" ry="5" fill="#ffe066" />
    <ellipse cx="50" cy="12" rx="24" ry="2" fill="#ffffff" opacity="0.8" />

    {/* Estrella central */}
    <polygon
      points="50,30 53,38 61,38 55,43 57,51 50,46 43,51 45,43 39,38 47,38"
      fill="#ffffff"
    />
  </svg>
);
