import React from 'react';

export const NewsIcon = ({
  className,
  ...props
}: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 28 28"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`shrink-0 ${className || ''}`}
    {...props}
  >
    {/* Documento / constancia con esquina doblada */}
    <path
      d="M3.5 4.5C3.5 3.39543 4.39543 2.5 5.5 2.5H17.5L24.5 9.5V23.5C24.5 24.6046 23.6046 25.5 22.5 25.5H5.5C4.39543 25.5 3.5 24.6046 3.5 23.5V4.5Z"
      fill="#F2F0EC"
      stroke="#9B0F1C"
      strokeWidth="2"
    />
    {/* Esquina doblada */}
    <path
      d="M17.5 2.5V7.5C17.5 8.60457 18.3954 9.5 19.5 9.5H24.5L17.5 2.5Z"
      fill="#E8E4DD"
      stroke="#9B0F1C"
      strokeWidth="2"
    />
    {/* Líneas de texto */}
    <rect x="7" y="12" width="14" height="2" rx="1" fill="#9B0F1C" />
    <rect x="7" y="16" width="10" height="2" rx="1" fill="#8B8F98" />
    <rect x="7" y="20" width="12" height="2" rx="1" fill="#8B8F98" />
    {/* Sello circular */}
    <circle cx="20" cy="17" r="5" fill="#9B0F1C" />
    <circle cx="20" cy="17" r="3" fill="#F2F0EC" />
    <path
      d="M18.2 16.3V18.7H19.1V17.6H20.5V18.7H21.4V16.3H20.5V17.2H19.1V16.3H18.2Z"
      fill="#9B0F1C"
    />
  </svg>
);
