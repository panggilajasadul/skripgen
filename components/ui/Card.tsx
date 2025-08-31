import React from 'react';
import { motion } from 'framer-motion';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ children, className = '' }) => {
  return (
    <motion.div className={`bg-card rounded-custom shadow-custom-lg transition-shadow duration-300 ${className}`}>
      {children}
    </motion.div>
  );
};

export default Card;