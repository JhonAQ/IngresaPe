import React, { useId } from 'react';
import { PATH_NODE_THEMES } from '../path-node/tokens';
import type { LevelIconProps } from './LevelBookIcon';

export const LevelVideoIcon: React.FC<LevelIconProps> = ({
  theme = 'purple',
  className = '',
  ...props
}) => {
  const maskId = useId();
  const colors = PATH_NODE_THEMES[theme];

  return (
    <svg
      width="33"
      height="26"
      viewBox="0 0 33 26"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 ${className}`}
      {...props}
    >
      <path
        d="M18.3401 15.7677C16.9208 15.0166 16.9208 12.9834 18.3401 12.2323L30.0645 6.02732C31.3965 5.32238 33 6.28799 33 7.79502L33 20.205C33 21.712 31.3965 22.6776 30.0645 21.9727L18.3401 15.7677Z"
        fill={colors.medium}
      />
      <rect y="3" width="24" height="23" rx="5" fill={colors.medium} />
      <path
        d="M18.3401 12.7677C16.9208 12.0166 16.9208 9.98344 18.3401 9.2323L30.0645 3.02732C31.3965 2.32238 33 3.28799 33 4.79502L33 17.205C33 18.712 31.3965 19.6776 30.0645 18.9727L18.3401 12.7677Z"
        fill="white"
      />
      <mask
        id={maskId}
        style={{ maskType: 'alpha' }}
        maskUnits="userSpaceOnUse"
        x="17"
        y="2"
        width="16"
        height="18"
      >
        <path
          d="M18.3401 12.7677C16.9208 12.0166 16.9208 9.98344 18.3401 9.2323L30.0645 3.02732C31.3965 2.32238 33 3.28799 33 4.79502L33 17.205C33 18.712 31.3965 19.6776 30.0645 18.9727L18.3401 12.7677Z"
          fill="white"
        />
      </mask>
      <g mask={`url(#${maskId})`}>
        <rect x="21" y="3" width="6" height="16" fill={colors.ice} />
      </g>
      <rect width="24" height="23" rx="5" fill="white" />
    </svg>
  );
};
