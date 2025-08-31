import React from 'react';
import { motion } from 'framer-motion';
import { User } from '../types';
import { MegaphoneIcon } from './icons/MegaphoneIcon';
import Button from './ui/Button';

interface DirectMessageModalProps {
  message: NonNullable<User['directMessage']>;
  onClose: () => void;
  onLogout: () => void;
}

const DirectMessageModal: React.FC<DirectMessageModalProps> = ({ message, onClose, onLogout }) => {
  
  const handleLinkClick = () => {
    if (message.isPermanent) {
        onLogout();
    }
    // Navigation will happen via the href attribute of the <a> tag
  };
  
  return (
    <div
      className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="direct-message-title"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="relative w-full max-w-md bg-card rounded-lg shadow-xl text-center p-6 sm:p-8"
      >
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/20 mb-4">
            <MegaphoneIcon className="h-8 w-8 text-primary" />
        </div>
        
        <h2 id="direct-message-title" className="text-2xl font-bold text-text-primary">
          {message.title}
        </h2>
        <p className="mt-2 text-text-secondary whitespace-pre-wrap">
          {message.message}
        </p>
        
        <div className="mt-8 flex flex-col gap-3">
            {message.link && (
                <a href={message.link} target="_blank" rel="noopener noreferrer" onClick={handleLinkClick}>
                    <Button className="w-full justify-center">
                        Beli Disini
                    </Button>
                </a>
            )}
            {!message.isPermanent && (
                 <Button onClick={onClose} className="w-full justify-center" variant="secondary">
                    Tutup
                </Button>
            )}
        </div>
      </motion.div>
    </div>
  );
};

export default DirectMessageModal;