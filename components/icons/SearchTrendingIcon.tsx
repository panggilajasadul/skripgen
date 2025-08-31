import React from 'react';

export const SearchTrendingIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
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
    <path d="m14 14-4 4" />
    <path d="M10 10l4 4" />
    <path d="M17 17l4 4" />
    <path d="M11 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" />
    <path d="m21 11-6-6" />
  </svg>
);