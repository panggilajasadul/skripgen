
import React from 'react';

export const BulbIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
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
        <path d="M15.09 16.05A6.49 6.49 0 0 1 8.95 9.91a6.5 6.5 0 0 1 6.14-5.91A6.5 6.5 0 0 1 21 9.91a6.49 6.49 0 0 1-5.91 6.14Z"></path>
        <path d="M12 21a2 2 0 0 0 2-2v-1a2 2 0 0 0-4 0v1a2 2 0 0 0 2 2Z"></path>
        <path d="M8.5 12.5a2 2 0 0 0-2 2v1a2 2 0 0 0 4 0v-1a2 2 0 0 0-2-2Z"></path>
        <path d="M12 6.5A2.5 2.5 0 0 0 9.5 9a2.5 2.5 0 0 0 5 0A2.5 2.5 0 0 0 12 6.5Z"></path>
    </svg>
);
