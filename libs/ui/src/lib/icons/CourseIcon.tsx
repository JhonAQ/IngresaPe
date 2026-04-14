import React from 'react';

export const CourseIcon: React.FC<React.SVGProps<SVGSVGElement>> = ({
  className = '',
  ...props
}) => {
  return (
    <svg
      width="46"
      height="46"
      viewBox="0 0 46 46"
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 ${className}`}
      {...props}
    >
      <title>stories</title>
      <g stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
        <g>
          <path
            d="M39.513 11.226h3.034c.751 0 1.36.608 1.36 1.36v23.666a2.04 2.04 0 0 1-2.04 2.04H27.49a.68.68 0 0 0-.68.68v.5a1.18 1.18 0 0 1-1.18 1.179h-5.351a1.18 1.18 0 0 1-1.18-1.18v-.5a.68.68 0 0 0-.68-.68H4.04A2.04 2.04 0 0 1 2 36.252V12.587c0-.752.609-1.36 1.36-1.36h2.705"
            stroke="#1CB0F6"
            strokeWidth="2.27"
            fill="#1CB0F6"
            strokeLinejoin="round"
          />
          <path
            d="M37.92 32.838H27.388c-2.066 0-3.802 1.354-4.294 3.187h-.28c-.491-1.833-2.227-3.187-4.293-3.187H7.987a1.36 1.36 0 0 1-1.36-1.36V8.36c0-.751.608-1.36 1.36-1.36H18.52c2.449 0 4.434 1.903 4.434 4.25 0-2.347 1.985-4.25 4.433-4.25h10.534c.75 0 1.36.609 1.36 1.36v23.118a1.36 1.36 0 0 1-1.36 1.36z"
            stroke="#E8F7FF"
            strokeWidth="2.27"
            fill="#E8F7FF"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M22.954 9.648v27.194"
            strokeOpacity=".22"
            stroke="#1CB0F6"
            strokeWidth="2.27"
            strokeLinecap="round"
          />
          <path
            stroke="#F34848"
            strokeWidth="2"
            fill="#F34848"
            strokeLinejoin="round"
            d="M10.635 6h5.632v11.21l-2.773-2.402-2.859 2.402z"
          />
        </g>
      </g>
    </svg>
  );
};
