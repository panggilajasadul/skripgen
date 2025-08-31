import React from 'react';
import Button from './ui/Button';
import { CopyIcon } from './icons/CopyIcon';
import { RefreshCwIcon } from './icons/RefreshCwIcon';
import { useToast } from '../hooks/useToast';
import { BulbIcon } from './icons/BulbIcon';
import { motion } from 'framer-motion';

interface HookOutputProps {
  hooks: string[];
  explanation: string;
  onRegenerate: () => void;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const itemVariants = {
  hidden: { x: -20, opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
  },
};


const HookOutput: React.FC<HookOutputProps> = ({ hooks, explanation, onRegenerate }) => {
  const { addToast } = useToast();

  const handleCopy = (text: string, message: string) => {
    navigator.clipboard.writeText(text).then(() => {
      addToast(message);
    }, () => {
      addToast('Failed to copy.');
    });
  };

  const handleCopyAll = () => {
    const allHooksText = hooks.map((hook, index) => `${index + 1}. ${hook}`).join('\n');
    handleCopy(allHooksText, 'All 10 hooks copied!');
  };

  return (
    <motion.div 
        className="space-y-4"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
    >
        <motion.div variants={containerVariants} className="bg-secondary p-4 rounded-custom space-y-2">
            <ol className="list-decimal list-inside space-y-3 text-sm text-text-primary">
                {hooks.map((hook, index) => (
                    <motion.li 
                        key={index} 
                        variants={itemVariants}
                        className="flex items-start justify-between gap-2"
                    >
                        <span className="flex-1">{hook}</span>
                        <button
                            onClick={() => handleCopy(hook, `Hook #${index + 1} copied!`)}
                            className="text-accent hover:text-primary transition-colors flex-shrink-0 text-xs font-semibold"
                            aria-label={`Copy hook ${index + 1}`}
                        >
                           Salin
                        </button>
                    </motion.li>
                ))}
            </ol>
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
                <CopyIcon /> Salin Semua Hook
            </Button>
            <Button onClick={onRegenerate} variant="secondary">
                <RefreshCwIcon /> Regenerate
            </Button>
        </motion.div>
    </motion.div>
  );
};

export default HookOutput;