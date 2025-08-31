import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

const Input: React.FC<InputProps> = ({ label, name, className = '', ...props }) => {
  return (
    <div className="w-full">
      {label && <label htmlFor={name} className="block text-sm font-medium text-text-secondary mb-1">{label}</label>}
      <input
        id={name}
        name={name}
        className={`w-full bg-secondary border border-border text-text-primary rounded-custom p-2.5 focus:ring-2 focus:ring-accent focus:border-primary transition-colors duration-200 ${className}`}
        {...props}
      />
    </div>
  );
};

export default Input;