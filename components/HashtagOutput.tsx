import React from 'react';
import Button from './ui/Button';
import { CopyIcon } from './icons/CopyIcon';
import { RefreshCwIcon } from './icons/RefreshCwIcon';
import { useToast } from '../hooks/useToast';
import { HashtagCategory } from '../types';
import { BulbIcon } from './icons/BulbIcon';
import { motion } from 'framer-motion';

interface HashtagOutputProps {
  categories: HashtagCategory[];
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

const HashtagOutput: React.FC<HashtagOutputProps> = ({ categories, explanation, onRegenerate }) => {
  const { addToast } = useToast();

  const handleCopy = (hashtags: string[], categoryName: string) => {
    const textToCopy = hashtags.join(' ');
    navigator.clipboard.writeText(textToCopy).then(() => {
      addToast(`Hashtags for "${categoryName}" copied!`);
    }, () => {
      addToast('Failed to copy hashtags.');
    });
  };
  
  const handleCopyAll = () => {
      const allHashtags = categories.flatMap(cat => cat.hashtags).join(' ');
      navigator.clipboard.writeText(allHashtags).then(() => {
        addToast(`All hashtags copied!`);
      }, () => {
        addToast('Failed to copy hashtags.');
      });
  }

  return (
    <motion.div 
        className="space-y-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
    >
        <motion.div className="space-y-4" variants={containerVariants}>
            {categories.map((category, index) => (
                <motion.div key={index} variants={itemVariants} className="bg-secondary p-4 rounded-custom">
                    <div className="flex justify-between items-center mb-2">
                        <h4 className="font-bold text-accent text-md">{category.categoryName}</h4>
                        <Button
                            onClick={() => handleCopy(category.hashtags, category.categoryName)}
                            variant="secondary"
                            size="sm"
                        >
                           <CopyIcon className="mr-1.5 w-4 h-4" /> Salin
                        </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {category.hashtags.map((tag, tagIndex) => (
                            <span key={tagIndex} className="bg-primary/20 text-accent text-xs font-medium px-2 py-1 rounded-full">
                                {tag}
                            </span>
                        ))}
                    </div>
                </motion.div>
            ))}
        </motion.div>

        <motion.div variants={itemVariants} className="p-3 bg-primary/10 border border-primary/20 rounded-lg text-sm flex items-start">
            <BulbIcon className="w-8 h-8 mr-3 flex-shrink-0 text-accent" />
            <div>
              <h5 className="font-bold mb-1 text-text-primary">Penjelasan AI</h5>
              <p className="text-text-secondary">{explanation}</p>
            </div>
        </motion.div>

        <motion.div variants={itemVariants} className="flex flex-wrap gap-2 pt-2 border-t border-border">
            <Button onClick={handleCopyAll} variant="primary">
                <CopyIcon /> Salin Semua
            </Button>
            <Button onClick={onRegenerate} variant="secondary">
                <RefreshCwIcon /> Regenerate
            </Button>
        </motion.div>
    </motion.div>
  );
};

export default HashtagOutput;