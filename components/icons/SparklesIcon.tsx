
import React from 'react';

export const SparklesIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
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
    <path d="m22 2-2.5 5-5-2.5L17 10Z"></path>
    <path d="m2 22 2.5-5 5 2.5L7 14Z"></path>
    <path d="m17 14-2.5 5-5-2.5L12 22Z"></path>
    <path d="m7 10 2.5-5 5 2.5L12 2Z"></path>
  </svg>
);
