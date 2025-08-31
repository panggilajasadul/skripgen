import React from 'react';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
}

const Textarea: React.FC<TextareaProps> = ({ label, name, ...props }) => {
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-text-secondary mb-1">{label}</label>
      <textarea
        id={name}
        name={name}
        rows={3}
        className="w-full bg-secondary border border-border text-text-primary rounded-custom p-2.5 focus:ring-2 focus:ring-accent focus:border-primary transition-colors duration-200"
        {...props}
      ></textarea>
    </div>
  );
};

export default Textarea;