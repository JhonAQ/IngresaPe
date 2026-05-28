import React from 'react';

export const DuoTicket = ({ className = 'w-8 h-8' }) => (
  <svg viewBox="0 0 100 100" className={className}>
    <defs>
      <mask id="ticket-mask">
        <rect x="10" y="25" width="80" height="50" rx="8" fill="white" />
        <circle cx="10" cy="50" r="10" fill="black" />
        <circle cx="90" cy="50" r="10" fill="black" />
      </mask>
      <mask id="shadow-mask">
        <rect x="10" y="30" width="80" height="50" rx="8" fill="white" />
        <circle cx="10" cy="55" r="10" fill="black" />
        <circle cx="90" cy="55" r="10" fill="black" />
      </mask>
    </defs>
    <rect
      x="10"
      y="30"
      width="80"
      height="50"
      rx="8"
      fill="#cc9f00"
      mask="url(#shadow-mask)"
    />
    <rect
      x="10"
      y="25"
      width="80"
      height="50"
      rx="8"
      fill="#ffc800"
      mask="url(#ticket-mask)"
    />
    <line
      x1="30"
      y1="28"
      x2="30"
      y2="72"
      stroke="#e69500"
      strokeWidth="4"
      strokeDasharray="4 4"
      strokeLinecap="round"
      mask="url(#ticket-mask)"
    />
    <line
      x1="70"
      y1="28"
      x2="70"
      y2="72"
      stroke="#e69500"
      strokeWidth="4"
      strokeDasharray="4 4"
      strokeLinecap="round"
      mask="url(#ticket-mask)"
    />
    <polygon
      points="50,38 53,45 61,45 55,50 57,58 50,53 43,58 45,50 39,45 47,45"
      fill="#ffffff"
    />
    <path
      d="M 20 30 L 80 30"
      stroke="#ffffff"
      strokeWidth="3"
      strokeLinecap="round"
      opacity="0.6"
      mask="url(#ticket-mask)"
    />
  </svg>
);

export const ChunkyArcade = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
    <rect x="15" y="20" width="70" height="75" rx="12" fill="#a568cc" />
    <rect x="15" y="10" width="70" height="75" rx="12" fill="#ce82ff" />
    <rect x="25" y="20" width="50" height="35" rx="6" fill="#3c3c3c" />
    <path
      d="M 25 26 C 25 22 28 20 32 20 L 75 20 L 50 55 L 25 55 Z"
      fill="#1cb0f6"
      opacity="0.9"
    />
    <path d="M 35 20 L 55 55 L 75 55 L 75 20 Z" fill="#1899d6" opacity="0.9" />
    <path d="M 30 20 L 45 45 L 65 20" fill="#ffffff" opacity="0.3" />
    <polygon points="15,60 85,60 90,75 10,75" fill="#a568cc" />
    <circle cx="35" cy="65" r="8" fill="#3c3c3c" />
    <line
      x1="35"
      y1="65"
      x2="30"
      y2="45"
      stroke="#e5e5e5"
      strokeWidth="4"
      strokeLinecap="round"
    />
    <circle cx="30" cy="45" r="7" fill="#ff4b4b" />
    <circle cx="28" cy="43" r="2" fill="#ffffff" />
    <circle cx="60" cy="65" r="5" fill="#ffc800" />
    <circle cx="75" cy="68" r="5" fill="#58cc02" />
    <rect x="42" y="70" width="16" height="4" rx="2" fill="#3c3c3c" />
    <rect x="48" y="68" width="4" height="6" fill="#ffc800" />
  </svg>
);

export const ChunkyHeart = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-sm">
    <path
      d="M 50 95 L 15 55 C 5 45 5 25 20 15 C 30 10 40 15 50 25 C 60 15 70 10 80 15 C 95 25 95 45 85 55 Z"
      fill="#df2b2b"
    />
    <path
      d="M 50 85 L 15 45 C 5 35 5 15 20 5 C 30 0 40 5 50 15 C 60 5 70 0 80 5 C 95 15 95 35 85 45 Z"
      fill="#ff4b4b"
    />
    <path
      d="M 22 15 C 30 8 42 12 48 20"
      stroke="#ffffff"
      strokeWidth="5"
      strokeLinecap="round"
      fill="none"
      opacity="0.5"
    />
    <path
      d="M 35 35 L 65 35 L 65 50 C 65 60 50 70 50 70 C 50 70 35 60 35 50 Z"
      fill="#ffffff"
      opacity="0.9"
    />
    <path
      d="M 50 40 L 50 60 M 40 50 L 60 50"
      stroke="#ff4b4b"
      strokeWidth="5"
      strokeLinecap="round"
    />
  </svg>
);

export const ChunkyTimer = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-sm">
    <rect x="38" y="5" width="24" height="15" rx="4" fill="#1899d6" />
    <rect x="40" y="2" width="20" height="12" rx="4" fill="#1cb0f6" />
    <path
      d="M 25 20 L 15 10"
      stroke="#1899d6"
      strokeWidth="8"
      strokeLinecap="round"
    />
    <path
      d="M 75 20 L 85 10"
      stroke="#1899d6"
      strokeWidth="8"
      strokeLinecap="round"
    />
    <circle cx="50" cy="55" r="40" fill="#1899d6" />
    <circle cx="50" cy="50" r="40" fill="#1cb0f6" />
    <circle cx="50" cy="50" r="30" fill="#ffffff" />
    <path
      d="M 55 25 L 35 50 L 50 50 L 45 75 L 65 50 L 50 50 Z"
      fill="#ffc800"
    />
    <path
      d="M 20 40 A 30 30 0 0 1 40 20"
      stroke="#ffffff"
      strokeWidth="6"
      strokeLinecap="round"
      fill="none"
      opacity="0.5"
    />
  </svg>
);
