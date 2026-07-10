import React, { useId } from 'react';
import { PATH_NODE_THEMES, GOLD_STAR } from './tokens';

export const NodeBaseGold: React.FC<React.SVGProps<SVGSVGElement>> = ({
  className = '',
  ...props
}) => {
  const maskId = useId();
  const colors = PATH_NODE_THEMES.gold;

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
        x="7"
        y="5"
        width="58"
        height="48"
      >
        <ellipse cx="36" cy="29" rx="29" ry="24" fill="#D9D9D9" />
      </mask>
      <g mask={`url(#${maskId})`}>
        <path d="M45 3L9 41.5L-8.5 21L16 -2L45 3Z" fill={colors.light} />
        <path d="M59 3L16 50L30.5 59L68.5 18L59 3Z" fill={colors.light} />
      </g>
      <path
        d="M33.2665 15.0453C34.33 12.6933 37.67 12.6933 38.7335 15.0453L40.9554 19.959C41.4018 20.9462 42.3458 21.616 43.425 21.7114L48.7515 22.1819C51.4147 22.4171 52.4631 25.7555 50.4126 27.4711L46.6082 30.6541C45.7372 31.3828 45.3524 32.5408 45.6139 33.6459L46.7621 38.4978C47.3649 41.045 44.6444 43.0885 42.3659 41.8L37.4767 39.0351C36.5604 38.5169 35.4396 38.5169 34.5233 39.0351L29.6341 41.8C27.3556 43.0885 24.6351 41.045 25.2379 38.4978L26.3861 33.6459C26.6476 32.5408 26.2628 31.3828 25.3918 30.6541L21.5874 27.4711C19.5369 25.7555 20.5853 22.4171 23.2485 22.1819L28.575 21.7114C29.6542 21.616 30.5982 20.9462 31.0446 19.959L33.2665 15.0453Z"
        fill={GOLD_STAR}
      />
    </svg>
  );
};
