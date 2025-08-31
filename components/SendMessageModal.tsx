import React, { useState } from 'react';
import { User } from '../types';
import Modal from './ui/Modal';
import Input from './ui/Input';
import Textarea from './ui/Textarea';
import Checkbox from './ui/Checkbox';
import Button from './ui/Button';
import { useToast } from '../hooks/useToast';

interface SendMessageModalProps {
  user: User;
  onClose: () => void;
  onSend: (message: User['directMessage']) => void;
}

const SendMessageModal: React.FC<SendMessageModalProps> = ({ user, onClose, onSend }) => {
  const [title, setTitle] = useState(user.directMessage?.title || '');
  const [message, setMessage] = useState(user.directMessage?.message || '');
  const [link, setLink] = useState(user.directMessage?.link || '');
  const [isPermanent, setIsPermanent] = useState(user.directMessage?.isPermanent || false);
  const { addToast } = useToast();

  const handleSubmit = () => {
    if (!title.trim() || !message.trim()) {
      addToast('Judul dan Pesan tidak boleh kosong.');
      return;
    }
    
    const messageData: NonNullable<User['directMessage']> = {
      id: user.directMessage?.id || Date.now().toString(),
      title,
      message,
      link,
      isPermanent,
    };

    onSend(messageData);
  };
  
  const handleClearMessage = () => {
    onSend(null);
  };

  return (
    <Modal title={`Kirim Pesan ke ${user.username}`} onClose={onClose}>
      <div className="space-y-4">
        <Input label="Judul Pesan" value={title} onChange={e => setTitle(e.target.value)} placeholder="Peringatan Akun" required />
        <Textarea label="Isi Pesan" value={message} onChange={e => setMessage(e.target.value)} rows={4} placeholder="Akun Anda terdeteksi..." required />
        <Input label="Link Tombol (Opsional)" value={link} onChange={e => setLink(e.target.value)} placeholder="https://shopee.co.id/..." />
        <Checkbox label="Pesan Permanen (tidak bisa ditutup user)" checked={isPermanent} onChange={e => setIsPermanent(e.target.checked)} />

        <div className="flex justify-between items-center pt-2">
          <Button variant="danger" onClick={handleClearMessage}>Hapus Pesan</Button>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={onClose}>Batal</Button>
            <Button onClick={handleSubmit}>Kirim Pesan</Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default SendMessageModal;
