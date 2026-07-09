'use client';

import React from 'react';

// ============================================================================
// Chunky Cauldron Icon (Duolingo style, for MinigameCard)
// ============================================================================
export const ChunkyPotion = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-sm">
    {/* Cauldron body shadow */}
    <ellipse cx="50" cy="82" rx="30" ry="8" fill="#3a6e01" />
    <path
      d="M 20 50 Q 20 85 50 85 Q 80 85 80 50 L 80 45 L 20 45 Z"
      fill="#458a02"
    />
    {/* Cauldron body */}
    <path
      d="M 20 45 Q 20 80 50 80 Q 80 80 80 45 L 80 40 L 20 40 Z"
      fill="#58cc02"
    />
    {/* Rim */}
    <rect x="15" y="37" width="70" height="8" rx="4" fill="#458a02" />
    <rect x="15" y="34" width="70" height="8" rx="4" fill="#6be612" />
    {/* Liquid surface */}
    <ellipse cx="50" cy="45" rx="25" ry="6" fill="#a7f06a" opacity="0.7" />
    {/* Bubble 1 */}
    <circle cx="38" cy="50" r="4" fill="#a7f06a" opacity="0.8">
      <animate
        attributeName="cy"
        values="55;42;55"
        dur="2s"
        repeatCount="indefinite"
      />
      <animate
        attributeName="opacity"
        values="0.8;0.3;0.8"
        dur="2s"
        repeatCount="indefinite"
      />
    </circle>
    {/* Bubble 2 */}
    <circle cx="55" cy="48" r="3" fill="#d4ff9e" opacity="0.6">
      <animate
        attributeName="cy"
        values="52;38;52"
        dur="1.5s"
        repeatCount="indefinite"
      />
      <animate
        attributeName="opacity"
        values="0.6;0.2;0.6"
        dur="1.5s"
        repeatCount="indefinite"
      />
    </circle>
    {/* Bubble 3 */}
    <circle cx="47" cy="46" r="2.5" fill="#ffffff" opacity="0.5">
      <animate
        attributeName="cy"
        values="50;35;50"
        dur="1.8s"
        repeatCount="indefinite"
      />
    </circle>
    {/* Sparkle */}
    <polygon
      points="50,20 52,26 58,26 53,30 55,36 50,32 45,36 47,30 42,26 48,26"
      fill="#ffc800"
    >
      <animate
        attributeName="opacity"
        values="1;0.3;1"
        dur="1.2s"
        repeatCount="indefinite"
      />
    </polygon>
    {/* Handle left */}
    <path
      d="M 20 42 Q 10 42 10 52 Q 10 62 20 60"
      stroke="#458a02"
      strokeWidth="5"
      fill="none"
      strokeLinecap="round"
    />
    {/* Handle right */}
    <path
      d="M 80 42 Q 90 42 90 52 Q 90 62 80 60"
      stroke="#458a02"
      strokeWidth="5"
      fill="none"
      strokeLinecap="round"
    />
    {/* Shine on body */}
    <path
      d="M 28 48 Q 30 55 32 62"
      stroke="#ffffff"
      strokeWidth="3"
      strokeLinecap="round"
      fill="none"
      opacity="0.4"
    />
  </svg>
);

// ============================================================================
// Animated Cauldron (for gameplay screen, larger and more detailed)
// ============================================================================
export const AlchemyCauldronSVG = ({
  bubbleIntensity = 'idle',
}: {
  bubbleIntensity?: 'idle' | 'active' | 'error' | 'success';
}) => {
  const liquidColor =
    bubbleIntensity === 'error'
      ? '#ff6b6b'
      : bubbleIntensity === 'success'
        ? '#a7f06a'
        : '#7ce63e';

  const bubbleColor =
    bubbleIntensity === 'error'
      ? '#ff9999'
      : bubbleIntensity === 'success'
        ? '#d4ff9e'
        : '#b8f574';

  const glowColor =
    bubbleIntensity === 'success'
      ? '#58cc02'
      : bubbleIntensity === 'error'
        ? '#ff4b4b'
        : 'transparent';

  return (
    <svg viewBox="0 0 200 180" className="w-full h-full">
      {/* Glow */}
      {bubbleIntensity !== 'idle' && (
        <ellipse cx="100" cy="100" rx="80" ry="60" fill={glowColor} opacity="0.15">
          <animate
            attributeName="opacity"
            values="0.15;0.25;0.15"
            dur="0.8s"
            repeatCount="indefinite"
          />
        </ellipse>
      )}

      {/* Cauldron shadow */}
      <ellipse cx="100" cy="158" rx="55" ry="12" fill="rgba(0,0,0,0.1)" />

      {/* Cauldron body */}
      <path
        d="M 35 85 Q 35 155 100 155 Q 165 155 165 85 L 165 78 L 35 78 Z"
        fill="#4b4b4b"
      />
      <path
        d="M 35 80 Q 35 150 100 150 Q 165 150 165 80 L 165 73 L 35 73 Z"
        fill="#5c5c5c"
      />

      {/* Rim */}
      <rect x="28" y="68" width="144" height="12" rx="6" fill="#4b4b4b" />
      <rect x="28" y="65" width="144" height="12" rx="6" fill="#6b6b6b" />

      {/* Liquid */}
      <ellipse cx="100" cy="83" rx="50" ry="12" fill={liquidColor} opacity="0.9">
        <animate
          attributeName="ry"
          values="12;14;12"
          dur="2s"
          repeatCount="indefinite"
        />
      </ellipse>

      {/* Bubbles */}
      <circle cx="80" cy="90" r="6" fill={bubbleColor} opacity="0.7">
        <animate
          attributeName="cy"
          values="95;70;95"
          dur={bubbleIntensity === 'active' ? '1s' : '2.5s'}
          repeatCount="indefinite"
        />
        <animate
          attributeName="opacity"
          values="0.7;0.2;0.7"
          dur={bubbleIntensity === 'active' ? '1s' : '2.5s'}
          repeatCount="indefinite"
        />
      </circle>
      <circle cx="110" cy="88" r="4" fill={bubbleColor} opacity="0.5">
        <animate
          attributeName="cy"
          values="92;65;92"
          dur={bubbleIntensity === 'active' ? '0.8s' : '2s'}
          repeatCount="indefinite"
        />
        <animate
          attributeName="opacity"
          values="0.5;0.1;0.5"
          dur={bubbleIntensity === 'active' ? '0.8s' : '2s'}
          repeatCount="indefinite"
        />
      </circle>
      <circle cx="95" cy="85" r="3" fill="#ffffff" opacity="0.4">
        <animate
          attributeName="cy"
          values="90;60;90"
          dur={bubbleIntensity === 'active' ? '1.2s' : '1.8s'}
          repeatCount="indefinite"
        />
      </circle>

      {/* Handles */}
      <path
        d="M 35 78 Q 18 78 18 98 Q 18 118 35 115"
        stroke="#4b4b4b"
        strokeWidth="8"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M 165 78 Q 182 78 182 98 Q 182 118 165 115"
        stroke="#4b4b4b"
        strokeWidth="8"
        fill="none"
        strokeLinecap="round"
      />

      {/* Shine */}
      <path
        d="M 50 88 Q 55 105 58 120"
        stroke="#ffffff"
        strokeWidth="4"
        strokeLinecap="round"
        fill="none"
        opacity="0.25"
      />

      {/* Legs */}
      <rect x="55" y="148" width="8" height="18" rx="3" fill="#3c3c3c" />
      <rect x="137" y="148" width="8" height="18" rx="3" fill="#3c3c3c" />
    </svg>
  );
};

// ============================================================================
// Sparkle Star (for formula reveal animation)
// ============================================================================
export const SparkleStar = ({
  className = 'w-6 h-6',
  color = '#ffc800',
}: {
  className?: string;
  color?: string;
}) => (
  <svg viewBox="0 0 24 24" className={className}>
    <polygon
      points="12,2 14,9 21,9 15,14 17,21 12,17 7,21 9,14 3,9 10,9"
      fill={color}
    />
  </svg>
);

// ============================================================================
// Heart icon for lives display
// ============================================================================
export const AlchemyHeart = ({
  filled = true,
  className = 'w-7 h-7',
}: {
  filled?: boolean;
  className?: string;
}) => (
  <svg viewBox="0 0 24 24" className={className}>
    <path
      d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
      fill={filled ? '#ff4b4b' : '#e5e5e5'}
      stroke={filled ? '#df2b2b' : '#cfcfcf'}
      strokeWidth="1"
    />
  </svg>
);
