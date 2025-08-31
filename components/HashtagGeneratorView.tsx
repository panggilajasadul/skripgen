import React, { useState, useCallback } from 'react';
import { HashtagGeneratorFormData, HashtagCategory } from '../types';
import { generateHashtags } from '../services/geminiService';
import Input from './ui/Input';
import Button from './ui/Button';
import Spinner from './ui/Spinner';
import HashtagOutput from './HashtagOutput';
import { GenerateIcon } from './icons/GenerateIcon';
import { HashtagIcon } from './icons/HashtagIcon';
import FeatureHeader from './ui/FeatureHeader';
import RateLimitModal from './RateLimitModal';
import useGenerateCounter from '../hooks/useGenerateCounter';

const initialFormData: HashtagGeneratorFormData = {
  productTopic: '',
  audience: '',
};

interface HashtagGeneratorViewProps {
    onGenerateSuccess: (count: number) => void;
}

const HashtagGeneratorView: React.FC<HashtagGeneratorViewProps> = ({ onGenerateSuccess }) => {
  const [formData, setFormData] = useState<HashtagGeneratorFormData>(initialFormData);
  const [generatedContent, setGeneratedContent] = useState<{ categories: HashtagCategory[], explanation: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showRateLimitModal, setShowRateLimitModal] = useState(false);
  const { count, increment } = useGenerateCounter('hashtagGenerator');

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  const generate = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setGeneratedContent(null);
    setShowRateLimitModal(false);

    if (formData.productTopic.trim() === '') {
        setError("Produk/Topik harus diisi.");
        setIsLoading(false);
        return;
    }
    
    try {
        const result = await generateHashtags(formData);
        if (result && result.categories) {
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
        title="Hashtag Generator"
        description="Maksimalkan jangkauan videomu. Dapatkan set hashtag yang relevan dan strategis untuk audiens yang tepat."
      />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-card p-6 rounded-custom shadow-custom-lg">
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input 
              label="Produk / Topik Video" 
              name="productTopic" 
              value={formData.productTopic} 
              onChange={handleChange} 
              placeholder="e.g., Serum pencerah wajah, review TWS" 
              required 
            />
            <Input 
              label="Target Audiens (Opsional)" 
              name="audience"
              value={formData.audience}
              onChange={handleChange}
              placeholder="e.g., Pelajar, pekerja kantoran, ibu rumah tangga"
            />
            
            <Button type="submit" disabled={isLoading} className="w-full justify-center">
              {isLoading ? <Spinner /> : <GenerateIcon />}
              <span className="ml-2">{isLoading ? 'Generating...' : 'Generate Hashtags'}</span>
            </Button>
          </form>
        </div>

        <div className="bg-card p-6 rounded-custom shadow-custom-lg">
          <h2 className="text-2xl font-bold mb-6 text-text-primary">Generated Hashtags</h2>
          {isLoading && <div className="flex justify-center items-center h-full"><Spinner size="lg" /></div>}
          {error && <div className="bg-red-900/50 text-red-200 p-4 rounded-custom">{error}</div>}
          {generatedContent && <HashtagOutput categories={generatedContent.categories} explanation={generatedContent.explanation} onRegenerate={generate} />}
           {!isLoading && !error && !generatedContent && (
              <div className="text-center text-text-secondary h-full flex flex-col justify-center items-center p-8 bg-secondary rounded-custom">
                  <HashtagIcon className="w-16 h-16 mb-4 text-border" />
                  <p className="font-semibold text-lg text-text-primary">Unlock Your Reach</p>
                  <p className="text-sm">Generate strategic hashtags to boost your video's discoverability.</p>
              </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HashtagGeneratorView;