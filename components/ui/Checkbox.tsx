import React from 'react';

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

const Checkbox: React.FC<CheckboxProps> = ({ label, ...props }) => {
  return (
    <label className="flex items-center space-x-2 cursor-pointer">
      <input
        type="checkbox"
        className="form-checkbox h-4 w-4 rounded bg-secondary border-border text-primary focus:ring-2 focus:ring-offset-0 focus:ring-accent/50"
        {...props}
      />
      {label && <span className="text-sm text-text-secondary">{label}</span>}
    </label>
  );
};

export default Checkbox;