import React, { useState, useCallback } from 'react';
import { MarketResearchFormData, MarketResearchResult } from '../types';
import { generateMarketResearch } from '../services/geminiService';
import Input from './ui/Input';
import Button from './ui/Button';
import Spinner from './ui/Spinner';
import { GenerateIcon } from './icons/GenerateIcon';
import FeatureHeader from './ui/FeatureHeader';
import RateLimitModal from './RateLimitModal';
import useGenerateCounter from '../hooks/useGenerateCounter';
import MarketResearchOutput from './MarketResearchOutput';
import { SearchTrendingIcon } from './icons/SearchTrendingIcon';

const initialFormData: MarketResearchFormData = {
  niche: '',
};

interface MarketResearchViewProps {
    onUseProduct: (productName: string) => void;
    onGenerateSuccess: (count: number) => void;
}

const MarketResearchView: React.FC<MarketResearchViewProps> = ({ onUseProduct, onGenerateSuccess }) => {
  const [formData, setFormData] = useState<MarketResearchFormData>(initialFormData);
  const [generatedResult, setGeneratedResult] = useState<MarketResearchResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showRateLimitModal, setShowRateLimitModal] = useState(false);
  const { count, increment } = useGenerateCounter('marketResearch');

  const generate = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setGeneratedResult(null);
    setShowRateLimitModal(false);

    try {
        const result = await generateMarketResearch(formData);
        setGeneratedResult(result);
        increment();
        onGenerateSuccess(count + 1);
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
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    generate();
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {showRateLimitModal && <RateLimitModal onClose={() => setShowRateLimitModal(false)} onRetry={generate} />}
      <FeatureHeader 
        title="Riset Pasar AI"
        description="Jangan tebak-tebakan. Temukan produk viral, masalah audiens, dan format konten yang sedang tren di niche Anda."
      />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-card p-6 rounded-custom shadow-custom-lg">
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input 
              label="Niche / Kategori Produk" 
              name="niche" 
              value={formData.niche} 
              onChange={(e) => setFormData({ niche: e.target.value })} 
              placeholder="e.g., Skincare, TWS, Fashion Pria, Peralatan Dapur" 
              required 
            />
            <Button type="submit" disabled={isLoading} className="w-full justify-center">
              {isLoading ? <Spinner /> : <GenerateIcon />}
              <span className="ml-2">{isLoading ? 'Melakukan Riset...' : 'Mulai Riset Pasar'}</span>
            </Button>
          </form>
        </div>

        <div className="bg-card p-6 rounded-custom shadow-custom-lg">
          <h2 className="text-2xl font-bold mb-6 text-text-primary">Laporan Intelijen Pasar</h2>
          {isLoading && <div className="flex justify-center items-center h-full"><Spinner size="lg" /></div>}
          {error && <div className="bg-red-900/50 text-red-200 p-4 rounded-custom">{error}</div>}
          {generatedResult && <MarketResearchOutput result={generatedResult} onUseProduct={onUseProduct} />}
           {!isLoading && !error && !generatedResult && (
              <div className="text-center text-text-secondary h-full flex flex-col justify-center items-center p-8 bg-secondary rounded-custom">
                  <SearchTrendingIcon className="w-16 h-16 mb-4 text-border" />
                  <p className="font-semibold text-lg text-text-primary">Your Market Insights Await</p>
                  <p className="text-sm">Enter a niche to uncover trending products and audience secrets.</p>
              </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MarketResearchView;