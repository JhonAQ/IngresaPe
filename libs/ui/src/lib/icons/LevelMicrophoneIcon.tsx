import React from 'react';
import type { LevelIconProps } from './LevelBookIcon';

export const LevelMicrophoneIcon: React.FC<LevelIconProps> = ({
  className = '',
  ...props
}) => {
  return (
    <svg
      width="24"
      height="34"
      viewBox="0 0 24 34"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 ${className}`}
      {...props}
    >
      <rect x="4.5" width="15" height="22" rx="7.5" fill="white" />
      <path
        d="M12 26C9.21523 26 6.54451 24.8411 4.57538 22.7782C2.60625 20.7153 1.5 17.9174 1.5 15L1.5 13.5M12 26C14.7848 26 17.4555 24.8411 19.4246 22.7782C21.3938 20.7153 22.5 17.9174 22.5 15L22.5 13.5M12 26L12 32M12 32L5.5 32M12 32L18.5 32"
        stroke="white"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
};
