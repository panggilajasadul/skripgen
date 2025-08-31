import React, { useState, useEffect } from 'react';
import { User } from '../types';
import Card from './ui/Card';
import { ClockIcon } from './icons/ClockIcon';

interface AccountStatusProps {
  user: User;
}

const calculateRemainingTime = (expiresAt: string | null): string => {
    if (!expiresAt) return "Akses Seumur Hidup";
    
    const now = new Date();
    const expiryDate = new Date(expiresAt);
    const diff = expiryDate.getTime() - now.getTime();

    if (diff <= 0) return "Telah Kedaluwarsa";

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) {
        return `${days} hari, ${hours} jam tersisa`;
    }
    if (hours > 0) {
        return `${hours} jam, ${minutes} menit tersisa`;
    }
    return `${minutes} menit tersisa`;
};

const AccountStatus: React.FC<AccountStatusProps> = ({ user }) => {
    const [remainingTime, setRemainingTime] = useState(calculateRemainingTime(user.expiresAt));

    useEffect(() => {
        const interval = setInterval(() => {
            setRemainingTime(calculateRemainingTime(user.expiresAt));
        }, 60000); // Update every minute

        return () => clearInterval(interval);
    }, [user.expiresAt]);

    return (
        <Card className="p-4 mb-8 bg-gradient-to-r from-primary to-accent text-white shadow-lg">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-2">
                <div>
                    <p className="font-bold text-lg">Selamat Datang, {user.username}!</p>
                    <p className="text-sm opacity-90">Siap untuk membuat konten viral hari ini?</p>
                </div>
                <div className="flex items-center gap-2 bg-white/20 px-3 py-1.5 rounded-full text-sm font-medium">
                    <ClockIcon className="w-4 h-4" />
                    <span>{remainingTime}</span>
                </div>
            </div>
        </Card>
    );
};

export default AccountStatus;
