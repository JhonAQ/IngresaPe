import React from 'react';

export const DayNotYetIcon: React.FC<React.SVGProps<SVGSVGElement>> = ({
  className = 'w-8 h-8',
  ...props
}) => (
  <svg
    viewBox="0 0 30 30"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    {...props}
  >
    <circle cx="15" cy="15" r="14" fill="#E5E5E5" />
  </svg>
);
