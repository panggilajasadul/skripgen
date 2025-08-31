import React, { ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XIcon } from '../icons/XIcon';
import Card from './Card';

interface ModalProps {
  children: ReactNode;
  title: string;
  onClose: () => void;
}

const Modal: React.FC<ModalProps> = ({ children, title, onClose }) => {
  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
        aria-labelledby="modal-title"
        role="dialog"
        aria-modal="true"
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0"
          onClick={onClose}
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-lg"
        >
          <Card className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 id="modal-title" className="text-xl font-bold">{title}</h2>
              <button onClick={onClose} className="p-1 rounded-full hover:bg-secondary">
                <XIcon />
              </button>
            </div>
            {children}
          </Card>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default Modal;
