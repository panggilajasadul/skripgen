import React, { useState, useCallback } from 'react';
import { AngleGeneratorFormData, ReviewAngle } from '../types';
import { generateReviewAngles } from '../services/geminiService';
import Input from './ui/Input';
import Button from './ui/Button';
import Spinner from './ui/Spinner';
import AngleOutput from './AngleOutput';
import { GenerateIcon } from './icons/GenerateIcon';
import { CompassIcon } from './icons/CompassIcon';
import Textarea from './ui/Textarea';
import FeatureHeader from './ui/FeatureHeader';
import RateLimitModal from './RateLimitModal';
import useGenerateCounter from '../hooks/useGenerateCounter';

const initialFormData: AngleGeneratorFormData = {
  product: '',
  benefit: '',
  audience: '',
};

interface AngleGeneratorViewProps {
    onGenerateSuccess: (count: number) => void;
}

const AngleGeneratorView: React.FC<AngleGeneratorViewProps> = ({ onGenerateSuccess }) => {
  const [formData, setFormData] = useState<AngleGeneratorFormData>(initialFormData);
  const [generatedContent, setGeneratedContent] = useState<{ angles: ReviewAngle[], explanation: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showRateLimitModal, setShowRateLimitModal] = useState(false);
  const { count, increment } = useGenerateCounter('angleGenerator');

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
        const result = await generateReviewAngles(formData);
        if (result && result.angles) {
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
        title="Angle Generator"
        description="Jangan biarkan kontenmu monoton. Temukan 5+ sudut pandang review yang unik dan kreatif untuk produk Anda."
      />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-card p-6 rounded-custom shadow-custom-lg">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Input 
                label="Nama Produk / Link" 
                name="product" 
                value={formData.product} 
                onChange={handleChange} 
                placeholder="e.g., TWS Pro Max 5" 
                required 
              />
              <p className="text-xs text-text-secondary mt-1.5 px-1">
                Masukkan nama produk atau link untuk mendapatkan angle review yang kreatif.
              </p>
            </div>
            <Textarea 
              label="Benefit/Fitur Utama (Opsional)" 
              name="benefit"
              value={formData.benefit}
              onChange={handleChange}
              placeholder="e.g., Active noise cancelling, daya tahan baterai 24 jam"
            />
            <Input 
              label="Target Audiens (Opsional)" 
              name="audience"
              value={formData.audience}
              onChange={handleChange}
              placeholder="e.g., Mahasiswa, pekerja kantoran, traveler"
            />
            
            <Button type="submit" disabled={isLoading} className="w-full justify-center">
              {isLoading ? <Spinner /> : <GenerateIcon />}
              <span className="ml-2">{isLoading ? 'Generating...' : 'Generate Angles'}</span>
            </Button>
          </form>
        </div>

        <div className="bg-card p-6 rounded-custom shadow-custom-lg">
          <h2 className="text-2xl font-bold mb-6 text-text-primary">Generated Angles</h2>
          {isLoading && <div className="flex justify-center items-center h-full"><Spinner size="lg" /></div>}
          {error && <div className="bg-red-900/50 text-red-200 p-4 rounded-custom">{error}</div>}
          {generatedContent && <AngleOutput angles={generatedContent.angles} explanation={generatedContent.explanation} onRegenerate={generate} />}
           {!isLoading && !error && !generatedContent && (
              <div className="text-center text-text-secondary h-full flex flex-col justify-center items-center p-8 bg-secondary rounded-custom">
                  <CompassIcon className="w-16 h-16 mb-4 text-border" />
                  <p className="font-semibold text-lg text-text-primary">Find Your North Star</p>
                  <p className="text-sm">Generate creative review angles that make your content stand out.</p>
              </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AngleGeneratorView;