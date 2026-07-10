import React from 'react';
import type { PathNodeTheme } from './tokens';
import { PATH_NODE_THEMES } from './tokens';

export interface NodeBaseProps extends React.SVGProps<SVGSVGElement> {
  theme?: PathNodeTheme;
}

export const NodeBaseNext: React.FC<NodeBaseProps> = ({
  theme = 'purple',
  className = '',
  ...props
}) => {
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
    </svg>
  );
};
