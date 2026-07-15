import React from 'react';

export const DayDoneIcon: React.FC<React.SVGProps<SVGSVGElement>> = ({
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
    <circle cx="15" cy="15" r="15" fill="#FF9600" />
    <path
      d="M10.5 15.5L14 19.5L21 12"
      stroke="white"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
