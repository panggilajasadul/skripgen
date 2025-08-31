import React from 'react';
import { motion } from 'framer-motion';
import { ClockIcon } from './icons/ClockIcon';
import Button from './ui/Button';

interface RateLimitModalProps {
  onClose: () => void;
  onRetry: () => void;
}

const RateLimitModal: React.FC<RateLimitModalProps> = ({ onClose, onRetry }) => {
  return (
    <div
      className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="ratelimit-title"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="relative w-full max-w-md bg-card rounded-lg shadow-xl text-center p-6 sm:p-8"
      >
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/20 mb-4">
            <ClockIcon className="h-8 w-8 text-primary" />
        </div>
        
        <h2 id="ratelimit-title" className="text-2xl font-bold text-text-primary">
          Server AI Sedang Sibuk
        </h2>
        <p className="mt-2 text-text-secondary">
          Tenang, ini bukan galat. Karena banyak yang menggunakan, Anda hanya perlu menunggu sejenak. Silakan coba lagi.
        </p>
        
        <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <Button onClick={onClose} className="w-full justify-center" variant="secondary">
                Tutup
            </Button>
            <Button onClick={onRetry} className="w-full justify-center" variant="primary">
                Coba Generate Lagi
            </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default RateLimitModal;