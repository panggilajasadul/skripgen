import React from 'react';

interface FeatureHeaderProps {
  title: string;
  description: string;
}

const FeatureHeader: React.FC<FeatureHeaderProps> = ({ title, description }) => {
  return (
    <div className="mb-8">
      <h2 className="text-3xl font-bold text-text-primary">{title}</h2>
      <p className="text-text-secondary mt-1">{description}</p>
    </div>
  );
};

export default FeatureHeader;