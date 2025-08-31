import React, { useState, useCallback } from 'react';
import { HookGeneratorFormData } from '../types';
import { generateHooksWithAI } from '../services/geminiService';
import { HOOK_CATEGORIES } from '../constants';
import Input from './ui/Input';
import Select from './ui/Select';
import Button from './ui/Button';
import Spinner from './ui/Spinner';
import HookOutput from './HookOutput';
import { GenerateIcon } from './icons/GenerateIcon';
import { MagnetIcon } from './icons/MagnetIcon';
import FeatureHeader from './ui/FeatureHeader';
import RateLimitModal from './RateLimitModal';
import useGenerateCounter from '../hooks/useGenerateCounter';

const initialFormData: HookGeneratorFormData = {
  product: '',
  benefit: '',
  category: HOOK_CATEGORIES[0],
};

interface HookGeneratorViewProps {
    onGenerateSuccess: (count: number) => void;
}

const HookGeneratorView: React.FC<HookGeneratorViewProps> = ({ onGenerateSuccess }) => {
  const [formData, setFormData] = useState<HookGeneratorFormData>(initialFormData);
  const [generatedContent, setGeneratedContent] = useState<{ hooks: string[], explanation: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showRateLimitModal, setShowRateLimitModal] = useState(false);
  const { count, increment } = useGenerateCounter('hookGenerator');

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  const generate = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setGeneratedContent(null);
    setShowRateLimitModal(false);

    if (formData.product.trim() === '') {
        setError("Produk harus diisi.");
        setIsLoading(false);
        return;
    }
    
    try {
        const result = await generateHooksWithAI(formData);
        if (result && result.hooks) {
          setGeneratedContent(result);
          increment();
          onGenerateSuccess(count + 1);
        } else {
          throw new Error("Received an invalid response from the AI.");
        }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      if (errorMessage.includes("Server AI sedang sibuk")) {
        setShowRateLimitModal(true);
      } else {
        setError(errorMessage);
      }
    } finally {
        setIsLoading(false);
    }
  }, [formData, onGenerateSuccess, increment, count]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    generate();
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {showRateLimitModal && <RateLimitModal onClose={() => setShowRateLimitModal(false)} onRetry={generate} />}
      <FeatureHeader 
        title="Hook Generator"
        description="Atasi kebuntuan di 3 detik pertama. Hasilkan 10+ variasi hook yang menarik perhatian untuk produk apa pun."
      />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-card p-6 rounded-custom shadow-custom-lg">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Input 
                label="Produk" 
                name="product" 
                value={formData.product} 
                onChange={handleChange} 
                placeholder="e.g., Tripod 170 cm + lampu" 
                required 
              />
              <p className="text-xs text-text-secondary mt-1.5 px-1">
                Anda juga bisa langsung memasukkan link produk di sini.
              </p>
            </div>
            <Input 
              label="Benefit/Fitur (isi agar hasil maksimal)" 
              name="benefit"
              value={formData.benefit}
              onChange={handleChange}
              placeholder="e.g., Bisa atur warna & level cahaya"
            />
            <Select label="Kategori Hook" name="category" value={formData.category} onChange={handleChange} options={HOOK_CATEGORIES} />
            
            <Button type="submit" disabled={isLoading} className="w-full justify-center">
              {isLoading ? <Spinner /> : <GenerateIcon />}
              <span className="ml-2">{isLoading ? 'Generating...' : 'Generate Hook'}</span>
            </Button>
          </form>
        </div>

        <div className="bg-card p-6 rounded-custom shadow-custom-lg">
          <h2 className="text-2xl font-bold mb-6 text-text-primary">Generated Hooks</h2>
          {isLoading && <div className="flex justify-center items-center h-full"><Spinner size="lg" /></div>}
          {error && <div className="bg-red-900/50 text-red-200 p-4 rounded-custom">{error}</div>}
          {generatedContent && <HookOutput hooks={generatedContent.hooks} explanation={generatedContent.explanation} onRegenerate={generate} />}
           {!isLoading && !error && !generatedContent && (
              <div className="text-center text-text-secondary h-full flex flex-col justify-center items-center p-8 bg-secondary rounded-custom">
                  <MagnetIcon className="w-16 h-16 mb-4 text-border" />
                  <p className="font-semibold text-lg text-text-primary">Instant Hook Magnet</p>
                  <p className="text-sm">Generate 10 scroll-stopping hooks in seconds.</p>
              </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HookGeneratorView;