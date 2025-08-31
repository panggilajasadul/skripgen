import React from 'react';
import Button from './ui/Button';
import { CopyIcon } from './icons/CopyIcon';
import { RefreshCwIcon } from './icons/RefreshCwIcon';
import { useToast } from '../hooks/useToast';
import { ReviewAngle } from '../types';
import { BulbIcon } from './icons/BulbIcon';
import { motion } from 'framer-motion';

interface AngleOutputProps {
  angles: ReviewAngle[];
  explanation: string;
  onRegenerate: () => void;
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

const AngleOutput: React.FC<AngleOutputProps> = ({ angles, explanation, onRegenerate }) => {
  const { addToast } = useToast();

  const handleCopy = (text: string, message: string) => {
    navigator.clipboard.writeText(text).then(() => {
      addToast(message);
    }, () => {
      addToast('Failed to copy.');
    });
  };

  const handleCopyAll = () => {
    const allAnglesText = angles.map(angle => (
      `Title: ${angle.title}\n` +
      `Description: ${angle.description}\n\n` +
      `Example Hook:\n${angle.exampleHook}\n\n` +
      `Example Body:\n${angle.exampleBody}\n\n` +
      `Example CTA:\n${angle.exampleCta}`
    )).join('\n\n---\n\n');
    handleCopy(allAnglesText, 'All angles copied!');
  };

  return (
    <motion.div 
        className="space-y-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
    >
        <motion.div variants={itemVariants} className="bg-secondary p-4 rounded-custom space-y-4">
            {angles.map((angle, index) => (
                <div key={index} className="border-b border-border last:border-b-0 pb-3 last:pb-0">
                    <div className="flex justify-between items-start gap-2">
                        <h4 className="font-bold text-accent text-md flex-1">{angle.title}</h4>
                        <button
                            onClick={() => {
                                const textToCopy = `Title: ${angle.title}\nDescription: ${angle.description}\n\nExample Hook:\n${angle.exampleHook}\n\nExample Body:\n${angle.exampleBody}\n\nExample CTA:\n${angle.exampleCta}`;
                                handleCopy(textToCopy, `Angle #${index + 1} copied!`);
                            }}
                            className="text-accent hover:text-primary transition-colors flex-shrink-0 text-xs font-semibold"
                            aria-label={`Copy angle ${index + 1}`}
                        >
                           Salin
                        </button>
                    </div>
                    <p className="text-sm text-text-secondary mt-1">{angle.description}</p>
                     <div className="mt-3 pt-3 border-t border-border/50 bg-background/50 p-3 rounded-md space-y-2">
                        <h5 className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Contoh Skrip</h5>
                        <div>
                            <p className="font-bold text-sm text-text-primary">Hook:</p>
                            <p className="text-sm text-text-secondary italic">"{angle.exampleHook}"</p>
                        </div>
                        <div>
                            <p className="font-bold text-sm text-text-primary">Body:</p>
                            <p className="text-sm text-text-secondary italic">"{angle.exampleBody}"</p>
                        </div>
                        <div>
                            <p className="font-bold text-sm text-text-primary">CTA:</p>
                            <p className="text-sm text-text-secondary italic">"{angle.exampleCta}"</p>
                        </div>
                    </div>
                </div>
            ))}
        </motion.div>
        
        <motion.div variants={itemVariants} className="p-3 bg-primary/10 border border-primary/20 rounded-lg text-sm flex items-start">
            <BulbIcon className="w-8 h-8 mr-3 flex-shrink-0 text-accent" />
            <div>
              <h5 className="font-bold mb-1 text-text-primary">Penjelasan AI</h5>
              <p className="text-text-secondary">{explanation}</p>
            </div>
        </motion.div>

        <motion.div variants={itemVariants} className="flex flex-wrap gap-2 pt-2">
            <Button onClick={handleCopyAll} variant="secondary">
                <CopyIcon /> Salin Semua Angle
            </Button>
            <Button onClick={onRegenerate} variant="secondary">
                <RefreshCwIcon /> Regenerate
            </Button>
        </motion.div>
    </motion.div>
  );
};

export default AngleOutput;