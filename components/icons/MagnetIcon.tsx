import React from 'react';

export const MagnetIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M14.5 14.5L18 18" />
    <path d="M12 12L2 2" />
    <path d="M8 16L12 12" />
    <path d="M6 18C4.5 16.5 4.5 14.5 6 13L13 6C14.5 4.5 16.5 4.5 18 6L18 6C19.5 7.5 19.5 9.5 18 11L11 18C9.5 19.5 7.5 19.5 6 18L6 18Z" />
    <path d="M2 2L6 6" />
    <path d="M18 18L22 22" />
  </svg>
);
