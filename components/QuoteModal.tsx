import React from 'react';
import { motion } from 'framer-motion';
import { Quote } from '../types';
import Button from './ui/Button';
import { ChatBubbleQuoteIcon } from './icons/ChatBubbleQuoteIcon';

interface QuoteModalProps {
  quote: Quote;
  onClose: () => void;
}

const QuoteModal: React.FC<QuoteModalProps> = ({ quote, onClose }) => {
  return (
    <div
      className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="quote-title"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="relative w-full max-w-md bg-card rounded-lg shadow-xl text-center p-6 sm:p-8"
      >
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/20 mb-4">
            <ChatBubbleQuoteIcon className="h-8 w-8 text-primary" />
        </div>
        
        <h2 id="quote-title" className="text-2xl font-bold text-text-primary">
          Dari {quote.author}
        </h2>
        <p className="mt-2 text-text-secondary italic">
          "{quote.quote}"
        </p>
        
        <div className="mt-8">
            <Button onClick={onClose} className="w-full justify-center" variant="primary">
                Siap bos
            </Button>
        </div>

      </motion.div>
    </div>
  );
};

export default QuoteModal;