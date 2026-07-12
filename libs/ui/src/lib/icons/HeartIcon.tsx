import React from 'react';

export const HeartIcon: React.FC<React.SVGProps<SVGSVGElement>> = ({
  className = '',
  ...props
}) => (
  <svg
    width="29"
    height="25"
    viewBox="0 0 29 25"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`w-6 h-6 shrink-0 ${className}`}
    {...props}
  >
    <path
      d="M1 8.67925C1 11.2722 2.31423 13.5649 4.32688 14.9554L12.9105 22.4445C13.9302 23.3342 15.4537 23.3224 16.4594 22.4168L25.092 14.6451C26.8662 13.2371 28 11.0877 28 8.67925C28 4.43814 24.4839 1 20.1464 1C17.9299 1 15.928 1.89774 14.5 3.34164C13.072 1.89774 11.0701 1 8.85369 1C4.51622 1 1 4.43814 1 8.67925Z"
      fill="#FF4B4B"
      stroke="white"
      strokeWidth="2"
    />
    <path
      opacity="0.3"
      fillRule="evenodd"
      clipRule="evenodd"
      d="M8.53477 11.9895C10.2687 11.9895 11.6744 10.5424 11.6744 8.75727C11.6744 6.97214 10.2687 5.52509 8.53477 5.52509C6.80088 5.52509 5.39526 6.97214 5.39526 8.75727C5.39526 10.5424 6.80088 11.9895 8.53477 11.9895Z"
      fill="white"
    />
  </svg>
);

HeartIcon.displayName = 'HeartIcon';
