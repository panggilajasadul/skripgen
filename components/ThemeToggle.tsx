
import React from 'react';
import useTheme from '../hooks/useTheme';
import { SunIcon } from './icons/SunIcon';
import { MoonIcon } from './icons/MoonIcon';

const ThemeToggle: React.FC = () => {
    const [theme, toggleTheme] = useTheme();
    
    return (
        <button
            onClick={toggleTheme}
            className="p-2 rounded-full bg-secondary hover:bg-gray-600 dark:hover:bg-gray-700 text-text-secondary hover:text-text-primary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:ring-primary transition-colors"
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
            {theme === 'light' ? <MoonIcon className="w-5 h-5" /> : <SunIcon className="w-5 h-5" />}
        </button>
    );
};

export default ThemeToggle;
