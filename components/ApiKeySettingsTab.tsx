import React, { useState, useEffect } from 'react';
import { apiKeyService } from '../services/apiKeyService';
import { useToast } from '../hooks/useToast';
import Card from './ui/Card';
import Input from './ui/Input';
import Button from './ui/Button';
import { motion } from 'framer-motion';

const maskApiKey = (key: string | null): string => {
    if (!key || key.length < 8) {
        return "Tidak valid atau terlalu pendek";
    }
    return `••••••••••••${key.slice(-4)}`;
};

const ApiKeySettingsTab: React.FC = () => {
    const [currentApiKey, setCurrentApiKey] = useState<string | null>(null);
    const [newApiKey, setNewApiKey] = useState('');
    const { addToast } = useToast();

    useEffect(() => {
        // FIX: apiKeyService.getApiKey() is async and must be awaited.
        const fetchApiKey = async () => {
            const key = await apiKeyService.getApiKey();
            setCurrentApiKey(key);
        };
        fetchApiKey();
    }, []);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newApiKey.trim()) {
            addToast("Kunci API tidak boleh kosong.", );
            return;
        }
        await apiKeyService.saveApiKey(newApiKey.trim());
        setCurrentApiKey(newApiKey.trim());
        setNewApiKey('');
        addToast("Kunci API Gemini berhasil diperbarui!");
    };
    
    const handleClear = async () => {
        if(window.confirm("Anda yakin ingin menghapus Kunci API? Semua fitur AI akan berhenti berfungsi.")) {
            // FIX: The method `clearApiKey` was missing. It has been added to the service.
            await apiKeyService.clearApiKey();
            setCurrentApiKey(null);
            addToast("Kunci API berhasil dihapus.");
        }
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Card className="p-6">
                <h3 className="font-bold text-lg mb-2">Pengaturan Kunci API Gemini</h3>
                <p className="text-sm text-text-secondary mb-6">Kelola kunci API Anda untuk mengakses fitur-fitur AI. Kunci ini disimpan dengan aman di browser Anda dan tidak dibagikan ke server kami.</p>

                <div className="bg-secondary p-4 rounded-lg mb-6">
                    <p className="text-sm font-medium text-text-secondary">Kunci API Saat Ini:</p>
                    {currentApiKey ? (
                         <div className="flex justify-between items-center">
                            <p className="font-mono text-accent text-lg">{maskApiKey(currentApiKey)}</p>
                            <Button size="sm" variant="danger" onClick={handleClear}>Hapus Kunci</Button>
                         </div>
                    ) : (
                        <p className="text-text-primary">Kunci API belum diatur.</p>
                    )}
                </div>

                <form onSubmit={handleSave} className="space-y-4">
                    <Input
                        label="Kunci API Gemini Baru"
                        type="password"
                        value={newApiKey}
                        onChange={(e) => setNewApiKey(e.target.value)}
                        placeholder="Masukkan kunci API baru Anda di sini"
                        required
                    />
                    <Button type="submit" className="w-full justify-center">
                        Simpan Kunci API
                    </Button>
                </form>
            </Card>
        </motion.div>
    );
};

export default ApiKeySettingsTab;
