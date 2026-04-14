import React from 'react';

export const SimulacroIcon = ({
  className,
  ...props
}: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 23 30"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`shrink-0 ${className || ''}`}
    {...props}
  >
    <rect width="22.5" height="30" rx="2" fill="#FFF5F5" />
    <rect y="15" width="22.5" height="7.5" fill="#FFA1A1" />
    <path
      d="M0 2C0 0.89543 0.895431 0 2 0H20.5C21.6046 0 22.5 0.895431 22.5 2V7.5H0V2Z"
      fill="#FFA1A1"
    />
    <circle cx="11.25" cy="11.25" r="2.67857" fill="#FFE3E3" />
    <circle cx="11.25" cy="18.75" r="2.67857" fill="#FFE3E3" />
    <circle cx="11.25" cy="3.74998" r="2.67857" fill="#8B8B8B" />
    <circle cx="11.25" cy="26.25" r="2.67857" fill="#FFE3E3" />
    <circle cx="4.82139" cy="11.25" r="2.67857" fill="#FFE3E3" />
    <circle cx="4.82139" cy="18.75" r="2.67857" fill="#FFE3E3" />
    <circle cx="4.82139" cy="3.74998" r="2.67857" fill="#FFE3E3" />
    <circle cx="4.82139" cy="26.25" r="2.67857" fill="#8B8B8B" />
    <circle cx="17.6786" cy="11.25" r="2.67857" fill="#8B8B8B" />
    <circle cx="17.6786" cy="18.75" r="2.67857" fill="#8B8B8B" />
    <circle cx="17.6786" cy="3.74998" r="2.67857" fill="#FFE3E3" />
    <circle cx="17.6786" cy="26.25" r="2.67857" fill="#FFE3E3" />
  </svg>
);
