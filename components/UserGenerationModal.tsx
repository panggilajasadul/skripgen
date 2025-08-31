import React, { useState } from 'react';
import Modal from './ui/Modal';
import Input from './ui/Input';
import Button from './ui/Button';
import { User } from '../types';

interface UserGenerationModalProps {
  onClose: () => void;
  onGenerate: (users: User[]) => void;
}

const UserGenerationModal: React.FC<UserGenerationModalProps> = ({ onClose, onGenerate }) => {
  const [count, setCount] = useState(10);
  const [prefix, setPrefix] = useState('user');
  const [duration, setDuration] = useState(30);

  const handleGenerate = () => {
    const newUsers: User[] = [];
    for (let i = 0; i < count; i++) {
      const randomSuffix = Math.random().toString(36).substring(2, 8);
      const username = `${prefix}-${randomSuffix}`;
      const password = Math.random().toString(36).substring(2, 10);
      const newUser: User = {
        id: Date.now().toString() + i,
        username,
        password,
        role: 'user',
        status: 'active',
        expiresAt: null,
        durationDays: duration,
        createdAt: new Date().toISOString(),
        lastLogin: null,
        scriptsGenerated: 0,
        loginHistory: [],
        isSuspicious: false,
        uniqueDeviceCountLast30Days: 0,
        directMessage: null,
      };
      newUsers.push(newUser);
    }
    onGenerate(newUsers);
    onClose();
  };

  return (
    <Modal title="Generate Pengguna Baru" onClose={onClose}>
      <div className="space-y-4">
        <p className="text-sm text-text-secondary">Buat beberapa akun pengguna baru secara massal.</p>
        <Input label="Jumlah Pengguna" type="number" value={count} onChange={e => setCount(parseInt(e.target.value, 10))} min="1" max="100" />
        <Input label="Prefix Username" value={prefix} onChange={e => setPrefix(e.target.value)} placeholder="e.g., 'user' or 'member'" />
        <Input label="Durasi Akun (hari)" type="number" value={duration} onChange={e => setDuration(parseInt(e.target.value, 10))} min="1" />
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="secondary" onClick={onClose}>Batal</Button>
          <Button onClick={handleGenerate}>Generate</Button>
        </div>
      </div>
    </Modal>
  );
};

export default UserGenerationModal;