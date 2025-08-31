import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { FormData, Script, ScriptData, BrandProfile, GeneratedScriptOutput, PersonalInsights } from '../types';
import { generateScriptVariations } from '../services/geminiService';
import {
  SCRIPT_GOALS,
  COPYWRITING_FORMULAS,
  HOOK_TYPES,
  TONES_AND_STYLES,
  CTA_STYLES,
  VIDEO_DURATIONS,
} from '../constants';

import Input from './ui/Input';
import Select from './ui/Select';
import Textarea from './ui/Textarea';
import Button from './ui/Button';
import MultiSelect from './ui/MultiSelect';
import Spinner from './ui/Spinner';
import ScriptOutput from './ScriptOutput';
import { GenerateIcon } from './icons/GenerateIcon';
import Accordion from './ui/Accordion';
import FeatureHeader from './ui/FeatureHeader';
import RateLimitModal from './RateLimitModal';
import useGenerateCounter from '../hooks/useGenerateCounter';
import { GraduationCapIcon } from './icons/GraduationCapIcon';
import { historyService } from '../services/historyService';
import { brandProfileService } from '../services/brandProfileService';

const initialFormData: FormData = {
  productName: '',
  productAdvantages: [''],
  usp: '',
  audienceProblem: '',
  targetAudience: '',
  scriptGoal: SCRIPT_GOALS[0],
  videoDuration: VIDEO_DURATIONS[0],
  copywritingFormula: COPYWRITING_FORMULAS[0],
  hookTypes: [HOOK_TYPES[0]],
  toneAndStyle: TONES_AND_STYLES[0],
  ctaStyle: CTA_STYLES[0],
  customCTA: '',
  includeVisuals: true, // Always true now
};

interface ScriptGeneratorProps {
    initialData?: Partial<FormData> | null;
    clearInitialData?: () => void;
    onGenerateSuccess: (count: number) => void;
}

const ScriptGenerator: React.FC<ScriptGeneratorProps> = ({ initialData, clearInitialData, onGenerateSuccess }) => {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [generatedContent, setGeneratedContent] = useState<GeneratedScriptOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [useBrandProfile, setUseBrandProfile] = useState(false);
  const [useMentorMode, setUseMentorMode] = useState(false);
  const [showRateLimitModal, setShowRateLimitModal] = useState(false);
  const { count, increment } = useGenerateCounter('scriptGenerator');

  // Async data
  const [brandProfile, setBrandProfile] = useState<BrandProfile | null>(null);
  const [history, setHistory] = useState<ScriptData[]>([]);

  useEffect(() => {
    const loadData = async () => {
        const [profile, userHistory] = await Promise.all([
            brandProfileService.getBrandProfile(),
            historyService.getHistory()
        ]);
        setBrandProfile(profile);
        setHistory(userHistory);
    };
    loadData();
  }, []);

  const personalInsights = useMemo(() => {
    if (!history) return null;
    const trackedScripts = history.flatMap(item => 
        item.variations.filter(v => v.performance && v.performance.sales > 0).map(v => ({...v, formData: item.formData}))
    );

    if (trackedScripts.length < 3) return null;

    const getTopPerformer = (key: 'copywritingFormula' | 'toneAndStyle' | 'hookTypes') => {
        const counts: { [item: string]: { totalSales: number; count: number } } = {};
        trackedScripts.forEach(script => {
            const items = Array.isArray(script.formData[key]) ? script.formData[key] as string[] : [script.formData[key] as string];
            items.forEach(item => {
                if (!counts[item]) counts[item] = { totalSales: 0, count: 0 };
                counts[item].totalSales += script.performance!.sales;
                counts[item].count++;
            });
        });

        const averages = Object.entries(counts).map(([name, data]) => ({ name, avg: data.totalSales / data.count }));
        if (averages.length === 0) return 'N/A';

        return averages.reduce((max, current) => current.avg > max.avg ? current : max).name;
    };

    return {
        topFormula: getTopPerformer('copywritingFormula'),
        topHook: getTopPerformer('hookTypes'),
        topTone: getTopPerformer('toneAndStyle'),
    };
  }, [history]);

  useEffect(() => {
    if (initialData) {
      setFormData(prev => ({ ...initialFormData, ...prev, ...initialData }));
      if (clearInitialData) clearInitialData();
    }
  }, [initialData, clearInitialData]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const isCheckbox = type === 'checkbox';
    setFormData(prev => ({ 
        ...prev, 
        [name]: isCheckbox ? (e.target as HTMLInputElement).checked : value 
    }));
  }, []);

  const handleAdvantageChange = (index: number, value: string) => {
    const newAdvantages = [...formData.productAdvantages];
    newAdvantages[index] = value;
    setFormData(prev => ({ ...prev, productAdvantages: newAdvantages }));
  };

  const addAdvantage = () => {
    setFormData(prev => ({ ...prev, productAdvantages: [...prev.productAdvantages, ''] }));
  };

  const removeAdvantage = (index: number) => {
    if (formData.productAdvantages.length <= 1) return;
    const newAdvantages = formData.productAdvantages.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, productAdvantages: newAdvantages }));
  };

  const generate = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setGeneratedContent(null);
    setShowRateLimitModal(false);

    const filledAdvantages = formData.productAdvantages.filter(adv => adv.trim() !== '');
    if (formData.productName.trim() === '' || filledAdvantages.length === 0) {
        setError("Nama Produk dan minimal satu Keunggulan Produk harus diisi.");
        setIsLoading(false);
        return;
    }

    const goodExamples = history.flatMap(item => item.variations).filter(variation => variation.feedback === 'good');
    const insightsForAI = useMentorMode ? personalInsights : undefined;

    try {
      const result = await generateScriptVariations(
          { ...formData, productAdvantages: filledAdvantages },
          useBrandProfile && brandProfile ? brandProfile : undefined,
          goodExamples,
          insightsForAI || undefined,
      );
      setGeneratedContent(result);
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
  }, [formData, brandProfile, useBrandProfile, history, onGenerateSuccess, increment, count, personalInsights, useMentorMode]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    generate();
  };

  const handleSaveToHistory = async (script: ScriptData) => {
    await historyService.saveScript(script);
    // Optionally refresh history state
    const userHistory = await historyService.getHistory();
    setHistory(userHistory);
  };


  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {showRateLimitModal && <RateLimitModal onClose={() => setShowRateLimitModal(false)} onRetry={generate} />}
      <FeatureHeader 
        title="Generator Script"
        description="Buat skrip video mendalam dengan kontrol penuh atas formula, hook, nada, dan CTA untuk hasil yang maksimal."
      />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-card p-6 rounded-custom shadow-custom-lg">
          <form onSubmit={handleSubmit} className="space-y-4">
            
            <div className="space-y-3">
                {brandProfile && brandProfile.toneOfVoice && (
                  <div className="flex items-center justify-between bg-primary/10 p-3 rounded-custom border border-primary/30">
                    <label htmlFor="use-brand-profile" className="flex flex-col cursor-pointer">
                        <span className="font-medium text-accent">Gunakan Brand Profile?</span>
                        <span className="text-xs text-text-secondary">AI akan menggunakan persona brand yang sudah Anda atur.</span>
                    </label>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" id="use-brand-profile" name="useBrandProfile" className="sr-only peer" checked={useBrandProfile} onChange={(e) => setUseBrandProfile(e.target.checked)} />
                        <div className="w-11 h-6 bg-secondary rounded-full peer peer-focus:ring-2 peer-focus:ring-accent/50 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>
                )}
                 <div className={`flex items-center justify-between bg-primary/10 p-3 rounded-custom border border-primary/30 transition-opacity ${!personalInsights ? 'opacity-50 cursor-not-allowed' : ''}`}>
                    <label htmlFor="use-mentor-mode" className={`flex flex-col ${personalInsights ? 'cursor-pointer' : ''}`}>
                        <span className="font-medium text-accent flex items-center gap-2"><GraduationCapIcon className="w-5 h-5"/> Gunakan Mode Mentor AI?</span>
                        <span className="text-xs text-text-secondary">
                            {personalInsights ? 'AI akan menggunakan wawasan pribadi Anda untuk hasil terbaik.' : 'Lacak kinerja min. 3 skrip untuk mengaktifkan fitur ini.'}
                        </span>
                    </label>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" id="use-mentor-mode" name="useMentorMode" className="sr-only peer" checked={useMentorMode} onChange={(e) => setUseMentorMode(e.target.checked)} disabled={!personalInsights} />
                        <div className="w-11 h-6 bg-secondary rounded-full peer peer-focus:ring-2 peer-focus:ring-accent/50 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>
            </div>


            <Accordion title="1. Detail Produk" defaultOpen>
                <div className="space-y-4 pt-4">
                    <div>
                        <Input label="Nama Produk" name="productName" value={formData.productName} onChange={handleChange} placeholder="e.g., Glowing Serum" required />
                        <p className="text-xs text-text-secondary mt-1.5 px-1">Masukkan nama produk yang ingin Anda promosikan.</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text-secondary mb-1">Keunggulan Produk</label>
                      {formData.productAdvantages.map((adv, index) => (
                          <div key={index} className="flex items-center space-x-2 mb-2">
                              <Input name={`advantage-${index}`} value={adv} onChange={(e) => handleAdvantageChange(index, e.target.value)} placeholder={`Keunggulan #${index + 1}`} className="flex-grow" />
                              <Button type="button" onClick={() => removeAdvantage(index)} variant="danger" size="sm" disabled={formData.productAdvantages.length <= 1}>-</Button>
                          </div>
                      ))}
                      <Button type="button" onClick={addAdvantage} variant="secondary" size="sm">Tambah Keunggulan</Button>
                       <p className="text-xs text-text-secondary mt-1.5 px-1">Sebutkan 1-3 poin keunggulan utama produk.</p>
                    </div>
                     <div>
                        <Textarea label="Unique Selling Proposition (USP)" name="usp" value={formData.usp} onChange={handleChange} placeholder="Apa SATU hal yang membuat produk ini BEDA dari yang lain?" />
                        <p className="text-xs text-text-secondary mt-1.5 px-1">Fokus pada satu alasan terkuat mengapa audiens harus memilih produk ini.</p>
                    </div>
                </div>
            </Accordion>

            <Accordion title="2. Tujuan & Audiens">
                <div className="space-y-4 pt-4">
                     <div>
                        <Textarea label="Masalah Utama Audiens (Opsional)" name="audienceProblem" value={formData.audienceProblem} onChange={handleChange} placeholder="e.g., Kulit kusam dan banyak bekas jerawat" />
                        <p className="text-xs text-text-secondary mt-1.5 px-1">Jelaskan 'rasa sakit' yang dialami audiens yang bisa diselesaikan produk ini.</p>
                    </div>
                    <div>
                        <Input label="Target Audiens" name="targetAudience" value={formData.targetAudience} onChange={handleChange} placeholder="e.g., Ibu rumah tangga, remaja, pelajar" />
                        <p className="text-xs text-text-secondary mt-1.5 px-1">Siapa yang Anda ingin jangkau dengan video ini?</p>
                    </div>
                    <div>
                        <Select label="Tujuan Skrip" name="scriptGoal" value={formData.scriptGoal} onChange={handleChange} options={SCRIPT_GOALS} />
                         <p className="text-xs text-text-secondary mt-1.5 px-1">Pilih tujuan akhir dari video Anda, apakah untuk menjual langsung atau membangun kesadaran.</p>
                    </div>
                    <Select label="Durasi Video" name="videoDuration" value={formData.videoDuration} onChange={handleChange} options={VIDEO_DURATIONS} />
                </div>
            </Accordion>
            
            <Accordion title="3. Gaya Skrip & CTA">
                <div className="space-y-4 pt-4">
                    <div>
                        <Select label="Formula Copywriting" name="copywritingFormula" value={formData.copywritingFormula} onChange={handleChange} options={COPYWRITING_FORMULAS} />
                        <p className="text-xs text-text-secondary mt-1.5 px-1">Pilih kerangka narasi untuk skrip Anda. AIDA dan PAS adalah yang paling populer.</p>
                    </div>
                    <div>
                        <MultiSelect label="Tipe Hook" options={HOOK_TYPES} selected={formData.hookTypes} onChange={(selected) => setFormData(prev => ({ ...prev, hookTypes: selected }))} />
                         <p className="text-xs text-text-secondary mt-1.5 px-1">Pilih 1-3 jenis hook untuk memberi inspirasi pada AI.</p>
                    </div>
                    <div>
                        <Select label="Tone & Style" name="toneAndStyle" value={formData.toneAndStyle} onChange={handleChange} options={TONES_AND_STYLES} />
                        <p className="text-xs text-text-secondary mt-1.5 px-1">Bagaimana gaya bicara yang ingin Anda gunakan dalam video?</p>
                    </div>
                    <div>
                        <Select label="Gaya CTA" name="ctaStyle" value={formData.ctaStyle} onChange={handleChange} options={CTA_STYLES} />
                        <p className="text-xs text-text-secondary mt-1.5 px-1">Pilih jenis ajakan bertindak. Ini akan diabaikan jika Anda mengisi CTA spesifik di bawah.</p>
                    </div>
                    <div>
                        <Input label="Tulis CTA Spesifik Anda (Opsional)" name="customCTA" value={formData.customCTA} onChange={handleChange} placeholder="e.g., Komen 'MAU' dan aku kirim linknya!" />
                        <p className="text-xs text-text-secondary mt-1.5 px-1">Jika diisi, AI akan menggunakan CTA ini, bukan dari gaya di atas.</p>
                    </div>
                </div>
            </Accordion>

            <div className="pt-4">
              <Button type="submit" disabled={isLoading} className="w-full justify-center">
                {isLoading ? <Spinner /> : <GenerateIcon />}
                <span className="ml-2">{isLoading ? 'Generating...' : 'Generate Script'}</span>
              </Button>
            </div>
          </form>
        </div>

        <div className="bg-card p-6 rounded-custom shadow-custom-lg">
          <h2 className="text-2xl font-bold mb-6 text-text-primary">Hasil Generate</h2>
          {isLoading && <div className="flex justify-center items-center h-full"><Spinner size="lg" /></div>}
          {error && <div className="bg-red-900/50 text-red-200 p-4 rounded-custom">{error}</div>}
          {generatedContent && <ScriptOutput 
                                killerTitle={generatedContent.killerTitle}
                                variations={generatedContent.variations} 
                                explanation={generatedContent.explanation} 
                                caption={generatedContent.caption}
                                hashtags={generatedContent.hashtags}
                                onSave={() => handleSaveToHistory({ id: '', createdAt: '', formData, variations: generatedContent.variations })} />}
           {!isLoading && !error && !generatedContent && (
              <div className="text-center text-text-secondary h-full flex flex-col justify-center items-center p-8 bg-secondary rounded-custom">
                  <GenerateIcon className="w-16 h-16 mb-4 text-border" />
                  <p className="font-semibold text-lg text-text-primary">Karya Besarmu Menanti</p>
                  <p className="text-sm">Isi form, klik generate, dan biarkan AI membuat skrip viral untukmu!</p>
              </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ScriptGenerator;