import React from 'react';
import { User } from '../types';
import Modal from './ui/Modal';
import Button from './ui/Button';
import { useToast } from '../hooks/useToast';
import { CopyIcon } from './icons/CopyIcon';
import { DownloadIcon } from './icons/DownloadIcon';

interface GeneratedUsersModalProps {
  users: User[];
  onClose: () => void;
}

const GeneratedUsersModal: React.FC<GeneratedUsersModalProps> = ({ users, onClose }) => {
  const { addToast } = useToast();

  const getDurationText = (user: User) => {
    if (user.durationDays === null) {
      return 'Lifetime';
    }
    return `${user.durationDays} hari`;
  };

  const formatUsersForText = () => {
    return users.map(u => `username = ${u.username}\npassword = ${u.password}\ndurasi = ${getDurationText(u)}`).join('\n\n');
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(formatUsersForText());
    addToast('Kredensial berhasil disalin!');
  };

  const handleDownload = () => {
    const text = formatUsersForText();
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `generated_users_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    addToast('Kredensial berhasil diunduh!');
  };

  return (
    <Modal title={`${users.length} Pengguna Baru Dibuat`} onClose={onClose}>
      <div className="space-y-4">
        <p className="text-sm text-text-secondary">Berikut adalah detail login untuk pengguna yang baru dibuat. Salin atau unduh informasi ini sebelum menutup jendela.</p>
        <div className="max-h-60 overflow-y-auto bg-secondary p-4 rounded-lg space-y-4">
          {users.map(user => (
            <div key={user.id} className="text-sm border-b border-border pb-2 last:border-b-0 last:pb-0">
              <p><span className="font-semibold text-text-secondary">Username:</span> <span className="font-mono text-text-primary">{user.username}</span></p>
              <p><span className="font-semibold text-text-secondary">Password:</span> <span className="font-mono text-text-primary">{user.password}</span></p>
              <p><span className="font-semibold text-text-secondary">Durasi:</span> <span className="font-mono text-text-primary">{getDurationText(user)}</span></p>
            </div>
          ))}
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <Button onClick={handleCopy} variant="secondary" className="w-full justify-center"><CopyIcon /> Salin Semua</Button>
          <Button onClick={handleDownload} variant="secondary" className="w-full justify-center"><DownloadIcon /> Download .txt</Button>
        </div>
      </div>
    </Modal>
  );
};

export default GeneratedUsersModal;