import React, { useState } from 'react';
import { User } from '../types';
import Modal from './ui/Modal';
import Input from './ui/Input';
import Button from './ui/Button';

interface UserEditModalProps {
    user: User;
    onClose: () => void;
    onSave: (user: User) => Promise<void>;
}

const UserEditModal: React.FC<UserEditModalProps> = ({ user, onClose, onSave }) => {
    const [username, setUsername] = useState(user.username);
    const [password, setPassword] = useState('');
    const [expiresAt, setExpiresAt] = useState(user.expiresAt ? user.expiresAt.split('T')[0] : '');
    const [isLoading, setIsLoading] = useState(false);

    const handleSave = async () => {
        setIsLoading(true);
        const updatedUser: User = {
            ...user,
            username,
            expiresAt: expiresAt ? new Date(expiresAt).toISOString() : null,
        };
        if (password.trim()) {
            updatedUser.password = password.trim();
        }
        await onSave(updatedUser);
        setIsLoading(false);
    };

    return (
        <Modal title={`Edit Pengguna: ${user.username}`} onClose={onClose}>
            <div className="space-y-4">
                <Input
                    label="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                />
                <Input
                    label="Password Baru (opsional)"
                    type="text"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Kosongkan jika tidak ingin mengubah"
                />
                <Input
                    label="Tanggal Kedaluwarsa"
                    type="date"
                    value={expiresAt}
                    onChange={(e) => setExpiresAt(e.target.value)}
                />
                <p className="text-xs text-text-secondary px-1">
                    Kosongkan tanggal untuk memberikan akses seumur hidup.
                </p>
                <div className="flex justify-end gap-2 pt-2">
                    <Button variant="secondary" onClick={onClose} disabled={isLoading}>Batal</Button>
                    <Button onClick={handleSave} disabled={isLoading}>
                        {isLoading ? 'Menyimpan...' : 'Simpan Perubahan'}
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

export default UserEditModal;