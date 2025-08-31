import React from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: string[];
}

const Select: React.FC<SelectProps> = ({ label, name, options, ...props }) => {
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-text-secondary mb-1">{label}</label>
      <select
        id={name}
        name={name}
        className="w-full bg-secondary border border-border text-text-primary rounded-custom p-2.5 focus:ring-2 focus:ring-accent focus:border-primary transition-colors duration-200"
        {...props}
      >
        {options.map(option => (
          <option key={option} value={option}>{option}</option>
        ))}
      </select>
    </div>
  );
};

export default Select;