
import React from 'react';

export const GenerateIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
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
    <path d="M12 2a10 10 0 0 0-3.91 19.34L12 22l3.91-1.66A10 10 0 0 0 12 2z"></path>
    <path d="m14.5 9.5-3-3-3 3"></path>
    <path d="M11.5 14.5v-5"></path>
  </svg>
);
