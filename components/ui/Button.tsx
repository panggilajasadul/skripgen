

import React from 'react';
// FIX: Import HTMLMotionProps from framer-motion for correct prop typing.
import { motion, HTMLMotionProps } from 'framer-motion';

// FIX: Changed props interface to extend from HTMLMotionProps<'button'>
// to correctly include all standard button attributes (like onClick, type, disabled, className)
// and motion props, resolving type conflicts across the app.
interface ButtonProps extends HTMLMotionProps<'button'> {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', size = 'md', className = '', ...props }) => {
  const baseClasses = "inline-flex items-center font-bold rounded-custom focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-custom-sm hover:shadow-custom-md";

  const variantClasses = {
    primary: 'bg-primary text-white hover:bg-accent focus:ring-primary',
    secondary: 'bg-secondary text-text-primary hover:bg-border focus:ring-accent',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  return (
    <motion.button
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {children}
    </motion.button>
  );
};

export default Button;
