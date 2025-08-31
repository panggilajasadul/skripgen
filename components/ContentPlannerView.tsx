

import React, { useState, useCallback } from 'react';
import { ContentPlannerFormData, ContentPlan, ContentPlanDay } from '../types';
import { generateContentPlan } from '../services/geminiService';
import Input from './ui/Input';
import Button from './ui/Button';
import Spinner from './ui/Spinner';
import { GenerateIcon } from './icons/GenerateIcon';
import Textarea from './ui/Textarea';
import FeatureHeader from './ui/FeatureHeader';
import Select from './ui/Select';
import { CalendarIcon } from './icons/CalendarIcon';
import ContentPlannerOutput from './ContentPlannerOutput';
import RateLimitModal from './RateLimitModal';
import useGenerateCounter from '../hooks/useGenerateCounter';

const initialFormData: ContentPlannerFormData = {
  productName: '',
  campaignGoal: '',
  campaignDuration: '3 hari',
  targetAudience: '',
  usp: '',
};

interface ContentPlannerViewProps {
    onUseContentPlanDay: (dayData: ContentPlanDay, productName: string) => void;
    onGenerateSuccess: (count: number) => void;
}

const ContentPlannerView: React.FC<ContentPlannerViewProps> = ({ onUseContentPlanDay, onGenerateSuccess }) => {
  const [formData, setFormData] = useState<ContentPlannerFormData>(initialFormData);
  const [generatedPlan, setGeneratedPlan] = useState<ContentPlan | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showRateLimitModal, setShowRateLimitModal] = useState(false);
  const { count, increment } = useGenerateCounter('contentPlanner');

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  const generate = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setGeneratedPlan(null);
    setShowRateLimitModal(false);

    try {
        const result = await generateContentPlan(formData);
        setGeneratedPlan(result);
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
        title="Perencana Konten AI"
        description="Stop pusing mikirin ide. Masukkan produk, dan AI akan membuatkan jadwal konten strategis untuk beberapa hari ke depan."
      />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-card p-6 rounded-custom shadow-custom-lg">
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input 
              label="Nama Produk" 
              name="productName" 
              value={formData.productName} 
              onChange={handleChange} 
              placeholder="e.g., Serum Pencerah Wajah" 
              required 
            />
            <Textarea 
              label="Tujuan Utama Kampanye" 
              name="campaignGoal"
              value={formData.campaignGoal}
              onChange={handleChange}
              placeholder="e.g., Meningkatkan penjualan sebesar 20% selama promo 12.12"
              required
            />
             <Textarea 
              label="Unique Selling Proposition (USP)" 
              name="usp"
              value={formData.usp}
              onChange={handleChange}
              placeholder="e.g., Satu-satunya serum dengan 10% Niacinamide dan Ekstrak Mutiara Jeju"
              required
            />
             <Input 
              label="Target Audiens" 
              name="targetAudience"
              value={formData.targetAudience}
              onChange={handleChange}
              placeholder="e.g., Wanita usia 20-30 tahun dengan masalah kulit kusam"
              required
            />
            <Select 
              label="Durasi Kampanye" 
              name="campaignDuration" 
              value={formData.campaignDuration} 
              onChange={handleChange} 
              options={['3 hari', '5 hari', '7 hari']} 
            />
            
            <Button type="submit" disabled={isLoading} className="w-full justify-center">
              {isLoading ? <Spinner /> : <GenerateIcon />}
              <span className="ml-2">{isLoading ? 'Generating Plan...' : 'Buatkan Rencana Konten'}</span>
            </Button>
          </form>
        </div>

        <div className="bg-card p-6 rounded-custom shadow-custom-lg">
          <h2 className="text-2xl font-bold mb-6 text-text-primary">Rencana Konten Anda</h2>
          {isLoading && <div className="flex justify-center items-center h-full"><Spinner size="lg" /></div>}
          {error && <div className="bg-red-900/50 text-red-200 p-4 rounded-custom">{error}</div>}
          {generatedPlan && <ContentPlannerOutput plan={generatedPlan} onUseDay={(day) => onUseContentPlanDay(day, formData.productName)} />}
           {!isLoading && !error && !generatedPlan && (
              <div className="text-center text-text-secondary h-full flex flex-col justify-center items-center p-8 bg-secondary rounded-custom">
                  <CalendarIcon className="w-16 h-16 mb-4 text-border" />
                  <p className="font-semibold text-lg text-text-primary">Your Content Strategy Awaits</p>
                  <p className="text-sm">Fill in the campaign details to get a day-by-day strategic content plan.</p>
              </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContentPlannerView;