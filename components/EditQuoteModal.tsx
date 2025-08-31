import React, { useState, useEffect } from 'react';
import { Quote } from '../types';
import Modal from './ui/Modal';
import Textarea from './ui/Textarea';
import Button from './ui/Button';

interface EditQuoteModalProps {
  quoteData: { type: 'motivational' | 'tough-love', quote: Quote | null };
  onClose: () => void;
  onSave: (type: 'motivational' | 'tough-love', quote: Quote) => void;
}

const EditQuoteModal: React.FC<EditQuoteModalProps> = ({ quoteData, onClose, onSave }) => {
  const [quoteText, setQuoteText] = useState('');

  useEffect(() => {
    if (quoteData.quote) {
      setQuoteText(quoteData.quote.quote);
    } else {
      setQuoteText('');
    }
  }, [quoteData]);

  const handleSave = () => {
    if (!quoteText.trim()) return;

    const quoteToSave: Quote = {
      id: quoteData.quote?.id || `${quoteData.type}_${Date.now()}`,
      author: 'BOS Ai',
      quote: quoteText.trim(),
    };
    
    onSave(quoteData.type, quoteToSave);
  };

  return (
    <Modal title={quoteData.quote ? 'Edit Kutipan' : 'Tambah Kutipan Baru'} onClose={onClose}>
      <div className="space-y-4">
        <Textarea
          label="Teks Kutipan"
          value={quoteText}
          onChange={(e) => setQuoteText(e.target.value)}
          rows={5}
          required
        />
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>Batal</Button>
          <Button onClick={handleSave}>Simpan Kutipan</Button>
        </div>
      </div>
    </Modal>
  );
};

export default EditQuoteModal;