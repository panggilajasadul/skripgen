import React, { useState, useMemo, useEffect } from 'react';
import { PerformanceData, ScriptData, Script } from '../types';
import Card from './ui/Card';
import Input from './ui/Input';
import Button from './ui/Button';
import { ThumbsUpIcon } from './icons/ThumbsUpIcon';
import { ThumbsDownIcon } from './icons/ThumbsDownIcon';
import FeatureHeader from './ui/FeatureHeader';
import { motion, AnimatePresence } from 'framer-motion';
import { ChartBarIcon } from './icons/ChartBarIcon';
import PerformanceTrackerModal from './PerformanceTrackerModal';
import { useToast } from '../hooks/useToast';
import { historyService } from '../services/historyService';
import Spinner from './ui/Spinner';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
  },
  exit: {
    opacity: 0,
    x: -50,
    transition: { duration: 0.3 }
  }
};

const PerformanceStat: React.FC<{ label: string; value: number }> = ({ label, value }) => (
    <div className="text-center bg-background p-2 rounded-md">
        <p className="text-xs font-medium text-text-secondary">{label}</p>
        <p className="text-lg font-bold text-accent">{value.toLocaleString()}</p>
    </div>
);

const HistoryView: React.FC = () => {
  const [history, setHistory] = useState<ScriptData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [trackingScript, setTrackingScript] = useState<{ scriptId: string; variationIndex: number; script: Script } | null>(null);
  const { addToast } = useToast();

  useEffect(() => {
    const loadHistory = async () => {
        setIsLoading(true);
        const userHistory = await historyService.getHistory();
        setHistory(userHistory);
        setIsLoading(false);
    };
    loadHistory();
  }, []);

  const filteredHistory = useMemo(() => {
    if (!filter) return history;
    return history.filter(item => 
      item.formData.productName.toLowerCase().includes(filter.toLowerCase()) ||
      item.variations.some(v => v.title.toLowerCase().includes(filter.toLowerCase()))
    );
  }, [history, filter]);

  const handleDelete = async (id: string) => {
    if(window.confirm('Are you sure you want to delete this script?')) {
        await historyService.deleteScript(id);
        setHistory(prev => prev.filter(item => item.id !== id));
        addToast('Script deleted!');
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedId(prevId => (prevId === id ? null : id));
  };
  
  const handleFeedback = async (scriptId: string, variationIndex: number, feedback: 'good' | 'bad') => {
    const item = history.find(item => item.id === scriptId);
    if (!item) return;

    const newVariations = [...item.variations];
    const currentFeedback = newVariations[variationIndex].feedback;
    newVariations[variationIndex].feedback = currentFeedback === feedback ? undefined : feedback;
    
    await historyService.updateScriptVariations(scriptId, newVariations);
    setHistory(prev => prev.map(h => h.id === scriptId ? {...h, variations: newVariations} : h));
  };

  const handleSavePerformance = async (scriptId: string, variationIndex: number, performanceData: PerformanceData) => {
    const item = history.find(item => item.id === scriptId);
    if (!item) return;

    const newVariations = [...item.variations];
    newVariations[variationIndex].performance = performanceData;

    await historyService.updateScriptVariations(scriptId, newVariations);
    setHistory(prev => prev.map(h => h.id === scriptId ? {...h, variations: newVariations} : h));
    addToast('Kinerja berhasil dilacak!');
    setTrackingScript(null);
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-64"><Spinner size="lg" /></div>;
  }

  return (
    <div className="max-w-7xl mx-auto">
      {trackingScript && (
        <PerformanceTrackerModal
          scriptTitle={trackingScript.script.title}
          existingData={trackingScript.script.performance}
          onClose={() => setTrackingScript(null)}
          onSave={(data) => handleSavePerformance(trackingScript.scriptId, trackingScript.variationIndex, data)}
        />
      )}
      <FeatureHeader 
        title="Riwayat Script"
        description="Lihat, kelola, dan lacak kinerja semua skrip yang pernah Anda simpan."
      />
      
      <div className="mb-6">
        <Input 
          placeholder="Cari berdasarkan nama produk atau judul..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
      </div>

      {filteredHistory.length === 0 ? (
        <p className="text-text-secondary text-center">Tidak ada skrip yang ditemukan di riwayat Anda.</p>
      ) : (
        <motion.div 
            className="space-y-4"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            <AnimatePresence>
              {filteredHistory.map(item => (
                <motion.div
                    key={item.id}
                    variants={itemVariants}
                    exit="exit"
                    layout
                >
                    <Card className="p-4 overflow-hidden">
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="text-xl font-bold text-accent">{item.formData.productName}</h3>
                            <p className="text-sm text-text-secondary">
                                {item.variations[0].title}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                                Disimpan pada: {new Date(item.createdAt).toLocaleDateString()}
                            </p>
                        </div>
                        <div className="flex space-x-2">
                            <Button onClick={() => toggleExpand(item.id)} variant="secondary" size="sm">
                                {expandedId === item.id ? 'Tutup' : 'Lihat'}
                            </Button>
                            <Button onClick={() => handleDelete(item.id)} variant="danger" size="sm">
                                Hapus
                            </Button>
                        </div>
                    </div>
                    <AnimatePresence>
                    {expandedId === item.id && (
                        <motion.div
                            key="content"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                            className="mt-4 border-t border-secondary pt-4 space-y-4"
                        >
                            {item.variations.map((script, index) => (
                                <div key={index} className="bg-secondary p-3 rounded-lg">
                                    <div className="flex justify-between items-start mb-2">
                                        <h4 className="font-bold text-text-primary flex-1">Variasi {index + 1}: {script.title}</h4>
                                        <div className="flex items-center space-x-2 flex-shrink-0 ml-4">
                                            <button
                                                onClick={() => handleFeedback(item.id, index, 'good')}
                                                className={`p-1.5 rounded-full transition-colors ${script.feedback === 'good' ? 'bg-green-500/20 text-green-400' : 'hover:bg-gray-700'}`}
                                                aria-label="Mark as good"
                                            >
                                                <ThumbsUpIcon className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleFeedback(item.id, index, 'bad')}
                                                className={`p-1.5 rounded-full transition-colors ${script.feedback === 'bad' ? 'bg-red-500/20 text-red-400' : 'hover:bg-gray-700'}`}
                                                aria-label="Mark as bad"
                                            >
                                                <ThumbsDownIcon className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="text-sm text-text-secondary mt-2">
                                        {script.parts.map((part, partIndex) => (
                                            <p key={partIndex} className="mb-1 whitespace-pre-wrap">
                                                <strong className="text-text-primary">{part.partName.toUpperCase()}:</strong> {part.content}
                                            </p>
                                        ))}
                                    </div>
                                    <div className="mt-4 pt-3 border-t border-border space-y-3">
                                        {script.performance ? (
                                             <div className="grid grid-cols-3 gap-2">
                                                <PerformanceStat label="Views" value={script.performance.views} />
                                                <PerformanceStat label="Likes" value={script.performance.likes} />
                                                <PerformanceStat label="Sales" value={script.performance.sales} />
                                            </div>
                                        ) : null}
                                        <Button onClick={() => setTrackingScript({ scriptId: item.id, variationIndex: index, script })} variant="secondary" size="sm" className="w-full justify-center">
                                            <ChartBarIcon className="w-4 h-4 mr-2" />
                                            {script.performance ? 'Edit Kinerja' : 'Lacak Kinerja'}
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </motion.div>
                    )}
                    </AnimatePresence>
                    </Card>
                </motion.div>
              ))}
            </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
};

export default HistoryView;