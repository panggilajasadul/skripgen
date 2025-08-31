import React, { useState } from 'react';
import { PerformanceData } from '../types';
import Modal from './ui/Modal';
import Input from './ui/Input';
import Button from './ui/Button';
import { useToast } from '../hooks/useToast';

interface PerformanceTrackerModalProps {
  scriptTitle: string;
  existingData?: PerformanceData;
  onClose: () => void;
  onSave: (data: PerformanceData) => void;
}

const PerformanceTrackerModal: React.FC<PerformanceTrackerModalProps> = ({ scriptTitle, existingData, onClose, onSave }) => {
  const [performance, setPerformance] = useState<PerformanceData>(
    existingData || { views: 0, likes: 0, sales: 0 }
  );
  const { addToast } = useToast();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPerformance(prev => ({ ...prev, [name]: Number(value) >= 0 ? Number(value) : 0 }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if(performance.views === 0 && performance.likes === 0 && performance.sales === 0) {
        addToast("Harap isi setidaknya satu metrik kinerja.", );
        return;
    }
    onSave(performance);
  };

  return (
    <Modal title={`Lacak Kinerja: ${scriptTitle}`} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <p className="text-sm text-text-secondary">Masukkan data kinerja untuk video ini untuk mendapatkan wawasan yang lebih baik.</p>
        <Input
          label="Jumlah Views"
          name="views"
          type="number"
          value={performance.views}
          onChange={handleChange}
          min="0"
        />
        <Input
          label="Jumlah Likes"
          name="likes"
          type="number"
          value={performance.likes}
          onChange={handleChange}
          min="0"
        />
        <Input
          label="Jumlah Komisi / Penjualan"
          name="sales"
          type="number"
          value={performance.sales}
          onChange={handleChange}
          min="0"
        />
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Batal
          </Button>
          <Button type="submit">
            Simpan Kinerja
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default PerformanceTrackerModal;