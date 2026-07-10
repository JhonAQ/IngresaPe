import React from 'react';
import { PATH_NODE_THEMES } from '../path-node/tokens';
import type { LevelIconProps } from './LevelBookIcon';

export const LevelHeadphonesIcon: React.FC<LevelIconProps> = ({
  theme = 'purple',
  className = '',
  ...props
}) => {
  const colors = PATH_NODE_THEMES[theme];

  return (
    <svg
      width="36"
      height="35"
      viewBox="0 0 36 35"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 ${className}`}
      {...props}
    >
      <path
        d="M1.5 25V18C1.5 13.6239 3.23839 9.42709 6.33274 6.33274C9.42709 3.23839 13.6239 1.5 18 1.5C22.3761 1.5 26.5729 3.23839 29.6673 6.33274C32.7616 9.42709 34.5 13.6239 34.5 18V25"
        stroke="white"
        strokeWidth="3"
      />
      <ellipse cx="7" cy="24.5" rx="7" ry="8" fill="white" />
      <ellipse cx="29" cy="24.5" rx="7" ry="8" fill="white" />
      <path
        d="M26.5 19V30"
        stroke={colors.medium}
        strokeWidth="9"
        strokeLinecap="round"
      />
      <path
        d="M9.5 19V30"
        stroke={colors.medium}
        strokeWidth="9"
        strokeLinecap="round"
      />
      <path
        d="M10.5 18.5V21.5"
        stroke={colors.darkShine}
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      <path
        d="M27 18.5V21.5"
        stroke={colors.darkShine}
        strokeWidth="3.5"
        strokeLinecap="round"
      />
    </svg>
  );
};
