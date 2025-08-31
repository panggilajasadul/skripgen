import React, { useState, useCallback, useEffect } from 'react';
import { LinkFormData, LinkScript, BrandProfile, ScriptData } from '../types';
import { generateScriptFromLink } from '../services/geminiService';
import {
  CONTENT_STYLES,
  LINK_VIDEO_DURATIONS,
  HOOK_KILLERS,
  HOOK_FORMATS,
  CONTENT_TYPES,
} from '../constants';

import Input from './ui/Input';
import Select from './ui/Select';
import Button from './ui/Button';
import MultiSelect from './ui/MultiSelect';
import Spinner from './ui/Spinner';
import LinkScriptOutput from './LinkScriptOutput';
import { GenerateIcon } from './icons/GenerateIcon';
import { LinkIcon } from './icons/LinkIcon';
import FeatureHeader from './ui/FeatureHeader';
import RateLimitModal from './RateLimitModal';
import useGenerateCounter from '../hooks/useGenerateCounter';
import { brandProfileService } from '../services/brandProfileService';
import { useToast } from '../hooks/useToast';
import { historyService } from '../services/historyService';

const initialFormData: LinkFormData = {
  productLink: '',
  targetAudience: '',
  contentStyle: CONTENT_STYLES[0],
  videoDuration: LINK_VIDEO_DURATIONS[0],
  hookKillers: [HOOK_KILLERS[0]],
  hookFormat: HOOK_FORMATS[0],
  contentType: CONTENT_TYPES[0],
};

interface LinkScriptGeneratorProps {
    onGenerateSuccess: (count: number) => void;
}

const LinkScriptGenerator: React.FC<LinkScriptGeneratorProps> = ({ onGenerateSuccess }) => {
  const [formData, setFormData] = useState<LinkFormData>(initialFormData);
  const [generatedScript, setGeneratedScript] = useState<LinkScript | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [useBrandProfile, setUseBrandProfile] = useState(false);
  const [showRateLimitModal, setShowRateLimitModal] = useState(false);
  const { count, increment } = useGenerateCounter('linkGenerator');
  const [brandProfile, setBrandProfile] = useState<BrandProfile | null>(null);
  const { addToast } = useToast();

  useEffect(() => {
    const loadProfile = async () => {
        const profile = await brandProfileService.getBrandProfile();
        setBrandProfile(profile);
    };
    loadProfile();
  }, []);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  const generate = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setGeneratedScript(null);
    setShowRateLimitModal(false);

    if (formData.productLink.trim() === '') {
        setError("Link Produk harus diisi.");
        setIsLoading(false);
        return;
    }
    if (formData.hookKillers.length === 0) {
        setError("Pilih minimal satu Hook Killer.");
        setIsLoading(false);
        return;
    }

    try {
      const script = await generateScriptFromLink(formData, useBrandProfile && brandProfile ? brandProfile : undefined);
      setGeneratedScript(script);
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
  }, [formData, brandProfile, useBrandProfile, onGenerateSuccess, increment, count]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    generate();
  };
  
  const handleSave = async (scriptToSave: LinkScript) => {
    const scriptDataForHistory: Omit<ScriptData, 'id' | 'createdAt'> = {
        formData: {
            productName: `Link: ${formData.productLink.substring(0, 30)}...`,
            productAdvantages: [],
            usp: '',
            audienceProblem: '',
            targetAudience: formData.targetAudience,
            scriptGoal: formData.contentType,
            videoDuration: formData.videoDuration,
            copywritingFormula: 'AIDA', 
            hookTypes: formData.hookKillers,
            toneAndStyle: formData.contentStyle,
            ctaStyle: 'Custom',
            customCTA: scriptToSave.cta,
            includeVisuals: false,
        },
        variations: [{
            title: `Script for ${formData.productLink}`,
            parts: [
                { partName: 'Hook', content: scriptToSave.hook },
                { partName: 'Body', content: scriptToSave.body },
                { partName: 'CTA', content: scriptToSave.cta },
            ]
        }]
    };
    await historyService.saveScript(scriptDataForHistory);
    addToast('Script saved to history!');
  };


  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {showRateLimitModal && <RateLimitModal onClose={() => setShowRateLimitModal(false)} onRetry={generate} />}
      <FeatureHeader 
        title="Link Product to Script"
        description="Hasilkan skrip video dengan cepat hanya dengan menempelkan link produk. Sempurna untuk affiliate marketing."
      />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-card p-6 rounded-custom shadow-custom-lg">
          <form onSubmit={handleSubmit} className="space-y-6">
            {brandProfile && brandProfile.toneOfVoice && (
              <div className="flex items-center justify-between bg-primary/10 p-3 rounded-custom border border-primary/30">
                <label htmlFor="use-brand-profile-link" className="flex flex-col cursor-pointer">
                    <span className="font-medium text-accent">Gunakan Brand Profile?</span>
                    <span className="text-xs text-text-secondary">AI akan menggunakan persona brand yang sudah Anda atur.</span>
                </label>
                <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" id="use-brand-profile-link" name="useBrandProfile" className="sr-only peer" checked={useBrandProfile} onChange={(e) => setUseBrandProfile(e.target.checked)} />
                    <div className="w-11 h-6 bg-secondary rounded-full peer peer-focus:ring-2 peer-focus:ring-accent/50 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>
            )}
            <Input 
              label="Link Produk" 
              name="productLink" 
              type="url"
              value={formData.productLink} 
              onChange={handleChange} 
              placeholder="https://tokopedia.com/..." 
              required 
            />
            <Input 
              label="🎯 Siapa Targetnya?" 
              name="targetAudience"
              value={formData.targetAudience}
              onChange={handleChange}
              placeholder="e.g., Ibu rumah tangga, remaja, pegawai"
            />
            <Select label="🎭 Gaya Konten (Persona)" name="contentStyle" value={formData.contentStyle} onChange={handleChange} options={CONTENT_STYLES} />
            <div>
              <Select label="⏱ Durasi Video" name="videoDuration" value={formData.videoDuration} onChange={handleChange} options={LINK_VIDEO_DURATIONS} />
              <p className="text-xs text-text-secondary mt-1.5 px-1">
                untuk penggunaan hook kombinasi coba pake durasi 30 detik agar maksimal.
              </p>
            </div>
            <div>
              <MultiSelect label="⚡ Hook Killer (Kombinasi)" options={HOOK_KILLERS} selected={formData.hookKillers} onChange={(selected) => setFormData(prev => ({ ...prev, hookKillers: selected }))} />
              <p className="text-xs text-text-secondary mt-1.5 px-1">
                Pilih 2-3 hook untuk dikombinasikan dan lihat perbedaannya.
              </p>
            </div>
            <Select label="🧩 Format Hook" name="hookFormat" value={formData.hookFormat} onChange={handleChange} options={HOOK_FORMATS} />
            <Select label="🏷 Tipe Konten" name="contentType" value={formData.contentType} onChange={handleChange} options={CONTENT_TYPES} />
            
            <Button type="submit" disabled={isLoading} className="w-full justify-center">
              {isLoading ? <Spinner /> : <GenerateIcon />}
              <span className="ml-2">{isLoading ? 'Generating...' : 'Buatkan Script Sekarang'}</span>
            </Button>
          </form>
        </div>

        <div className="bg-card p-6 rounded-custom shadow-custom-lg">
          <h2 className="text-2xl font-bold mb-6 text-text-primary">Hasil Generate</h2>
          {isLoading && <div className="flex justify-center items-center h-full"><Spinner size="lg" /></div>}
          {error && <div className="bg-red-900/50 text-red-200 p-4 rounded-custom">{error}</div>}
          {generatedScript && <LinkScriptOutput killerTitle={generatedScript.killerTitle} script={generatedScript} onSave={() => handleSave(generatedScript)} />}
           {!isLoading && !error && !generatedScript && (
              <div className="text-center text-text-secondary h-full flex flex-col justify-center items-center p-8 bg-secondary rounded-custom">
                  <LinkIcon className="w-16 h-16 mb-4 text-border" />
                  <p className="font-semibold text-lg text-text-primary">From Link to Legend</p>
                  <p className="text-sm">Paste a product link to instantly generate a sales-driven script.</p>
              </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LinkScriptGenerator;
