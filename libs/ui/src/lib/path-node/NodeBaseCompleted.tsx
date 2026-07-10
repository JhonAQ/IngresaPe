import React, { useId } from 'react';
import type { NodeBaseProps } from './NodeBaseNext';
import { PATH_NODE_THEMES } from './tokens';

export const NodeBaseCompleted: React.FC<NodeBaseProps> = ({
  theme = 'purple',
  className = '',
  ...props
}) => {
  const maskId = useId();
  const colors = PATH_NODE_THEMES[theme];

  return (
    <svg
      width="71"
      height="65"
      viewBox="0 0 71 65"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 ${className}`}
      {...props}
    >
      <ellipse cx="35.5" cy="36" rx="35.5" ry="29" fill={colors.medium} />
      <ellipse cx="35.5" cy="29" rx="35.5" ry="29" fill={colors.base} />
      <mask
        id={maskId}
        style={{ maskType: 'alpha' }}
        maskUnits="userSpaceOnUse"
        x="6"
        y="5"
        width="58"
        height="48"
      >
        <ellipse cx="35" cy="29" rx="29" ry="24" fill="#D9D9D9" />
      </mask>
      <g mask={`url(#${maskId})`}>
        <path d="M44 3L8 41.5L-9.5 21L15 -2L44 3Z" fill={colors.light} />
        <path d="M58 3L15 50L29.5 59L67.5 18L58 3Z" fill={colors.light} />
      </g>
    </svg>
  );
};
