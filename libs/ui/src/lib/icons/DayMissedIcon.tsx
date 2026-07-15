import React from 'react';

export const DayMissedIcon: React.FC<React.SVGProps<SVGSVGElement>> = ({
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
    <circle cx="15" cy="15" r="14" fill="#CBD5E1" />
    <path
      d="M11 11L19 19M19 11L11 19"
      stroke="#64748B"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
