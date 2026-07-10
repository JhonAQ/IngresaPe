import React from 'react';
import { GREY } from './tokens';

export const NodeBaseUnavailable: React.FC<React.SVGProps<SVGSVGElement>> = ({
  className = '',
  ...props
}) => {
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
      <ellipse cx="35.5" cy="36" rx="35.5" ry="29" fill={GREY[4]} />
      <ellipse cx="35.5" cy="29" rx="35.5" ry="29" fill={GREY[6]} />
    </svg>
  );
};
