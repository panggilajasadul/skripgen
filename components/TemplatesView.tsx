import React, { useState, useEffect } from 'react';
import { Template } from '../types';
import { templateService } from '../services/templateService';
import Card from './ui/Card';
import Button from './ui/Button';
import FeatureHeader from './ui/FeatureHeader';
import { motion } from 'framer-motion';
import Spinner from './ui/Spinner';

interface TemplatesViewProps {
  onUseTemplate: (template: Template) => void;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
  },
};

const TemplatesView: React.FC<TemplatesViewProps> = ({ onUseTemplate }) => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadTemplates = async () => {
        setIsLoading(true);
        const fetchedTemplates = await templateService.getTemplates();
        setTemplates(fetchedTemplates);
        setIsLoading(false);
    };
    loadTemplates();
  }, []);

  if (isLoading) {
    return <div className="flex justify-center items-center h-64"><Spinner size="lg" /></div>;
  }

  return (
    <div className="max-w-7xl mx-auto">
      <FeatureHeader 
        title="Template Library"
        description="Mulai dengan cepat menggunakan template skrip yang sudah terbukti untuk berbagai niche populer."
      />
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {templates.map(template => (
          <Card key={template.id} className="flex flex-col">
            <motion.div 
              className="p-6 flex-grow"
              variants={itemVariants}
            >
              <span className="inline-block bg-primary/20 text-accent text-xs font-semibold px-2 py-1 rounded-full mb-2">
                {template.niche}
              </span>
              <h3 className="text-xl font-bold text-text-primary mb-2">{template.title}</h3>
              <p className="text-text-secondary text-sm">{template.description}</p>
            </motion.div>
            <motion.div 
              className="bg-secondary p-4 rounded-b-lg"
              variants={itemVariants}
            >
                <Button onClick={() => onUseTemplate(template)} className="w-full justify-center">
                    Gunakan Template
                </Button>
            </motion.div>
          </Card>
        ))}
      </motion.div>
    </div>
  );
};

export default TemplatesView;