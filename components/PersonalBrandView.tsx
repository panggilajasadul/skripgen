import React, { useState, useEffect } from 'react';
import { BrandProfile, ScriptData, PersonalBrandView as ViewType } from '../types';
import PersonalInsightsTab from './PersonalInsightsTab';
import { motion } from 'framer-motion';
import { BrandProfileIcon } from './icons/BrandProfileIcon';
import { ChartBarIcon } from './icons/ChartBarIcon';
import Input from './ui/Input';
import Textarea from './ui/Textarea';
import Button from './ui/Button';
import Card from './ui/Card';
import { useToast } from '../hooks/useToast';
import FeatureHeader from './ui/FeatureHeader';
import { brandProfileService } from '../services/brandProfileService';
import Spinner from './ui/Spinner';
import { historyService } from '../services/historyService';

const BrandProfileForm: React.FC = () => {
  const [formData, setFormData] = useState<BrandProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { addToast } = useToast();

  useEffect(() => {
    const loadProfile = async () => {
        setIsLoading(true);
        const profile = await brandProfileService.getBrandProfile();
        setFormData(profile || { personaType: 'user', brandName: '', brandDescription: '', toneOfVoice: '', forbiddenWords: '', mainAudience: '' });
        setIsLoading(false);
    };
    loadProfile();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => prev ? { ...prev, [name]: value } : null);
  };
  
  const handlePersonaTypeChange = (type: 'user' | 'brand') => {
      setFormData(prev => prev ? {...prev, personaType: type} : null);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData) return;
    setIsLoading(true);
    await brandProfileService.saveBrandProfile(formData);
    addToast('Brand Profile saved successfully!');
    setIsLoading(false);
  };

  if (isLoading || !formData) {
      return <div className="flex justify-center items-center h-64"><Spinner size="lg" /></div>;
  }

  return (
    <div>
      <FeatureHeader 
        title="Profil Persona"
        description="Atur persona AI Anda sekali, dan semua skrip yang dihasilkan akan konsisten dengan gaya bicara Anda."
      />
      <Card>
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">Tipe Persona</label>
                <div className="flex rounded-lg bg-secondary p-1">
                    <button
                        type="button"
                        onClick={() => handlePersonaTypeChange('user')}
                        className={`w-full py-2 px-4 rounded-md text-sm font-semibold transition-colors duration-200 ${formData.personaType === 'user' ? 'bg-primary text-white shadow-sm' : 'text-text-secondary hover:bg-border'}`}
                    >
                        User / Creator
                    </button>
                    <button
                        type="button"
                        onClick={() => handlePersonaTypeChange('brand')}
                        className={`w-full py-2 px-4 rounded-md text-sm font-semibold transition-colors duration-200 ${formData.personaType === 'brand' ? 'bg-primary text-white shadow-sm' : 'text-text-secondary hover:bg-border'}`}
                    >
                        Brand / Company
                    </button>
                </div>
                 <p className="text-xs text-text-secondary mt-2 px-1">
                    {formData.personaType === 'user' 
                        ? "AI akan bertindak sebagai seorang content creator/affiliate yang sedang me-review produk."
                        : "AI akan bertindak sebagai suara resmi dari brand Anda."
                    }
                </p>
            </div>
          
          <Input 
            label={formData.personaType === 'user' ? 'Nama Channel / Kreator' : 'Nama Brand'}
            name="brandName"
            value={formData.brandName}
            onChange={handleChange}
            placeholder={formData.personaType === 'user' ? "e.g., Racunnya Jeng Ipul" : "e.g., Skincare Mantul"}
          />
          <Textarea
            label={formData.personaType === 'user' ? 'Deskripsi Singkat Channel / Diri Anda' : 'Deskripsi Singkat Brand'}
            name="brandDescription"
            value={formData.brandDescription}
            onChange={handleChange}
            placeholder={formData.personaType === 'user' ? "e.g., Seorang ibu rumah tangga yang suka share tips & racun produk murah." : "e.g., Brand skincare lokal yang fokus pada bahan alami untuk kulit sensitif."}
          />
          <Textarea
            label={formData.personaType === 'user' ? 'Gaya Bicara / Tone of Voice WAJIB' : 'Tone of Voice Brand WAJIB'}
            name="toneOfVoice"
            value={formData.toneOfVoice}
            onChange={handleChange}
            placeholder="e.g., Friendly, informatif seperti teman baik, sedikit lucu, dan menghindari bahasa yang terlalu teknis."
            required
          />
          <Input
            label="Kata-kata yang Dilarang (pisahkan dengan koma)"
            name="forbiddenWords"
            value={formData.forbiddenWords}
            onChange={handleChange}
            placeholder="e.g., guys, kalian, jangan lupa"
          />
          <Input
            label="Target Audiens Utama"
            name="mainAudience"
            value={formData.mainAudience}
            onChange={handleChange}
            placeholder="e.g., Wanita karir usia 25-35 tahun yang peduli pada perawatan kulit."
          />
          <div className="flex justify-end">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save Profile'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

const PersonalBrandView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ViewType>('profile');
  // FIX: Added state to fetch and hold history data for the PersonalInsightsTab.
  const [history, setHistory] = useState<ScriptData[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);

  useEffect(() => {
    async function loadHistory() {
      setIsLoadingHistory(true);
      const userHistory = await historyService.getHistory();
      setHistory(userHistory);
      setIsLoadingHistory(false);
    }
    loadHistory();
  }, []);


  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <div className="flex border-b border-border">
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex items-center gap-2 px-4 py-2 font-semibold text-sm transition-colors duration-200 relative ${activeTab === 'profile' ? 'text-primary' : 'text-text-secondary hover:text-text-primary'}`}
          >
            <BrandProfileIcon className="w-5 h-5"/> Profil Persona
            {activeTab === 'profile' && <motion.div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" layoutId="personal-brand-tab" />}
          </button>
          <button
            onClick={() => setActiveTab('insights')}
            className={`flex items-center gap-2 px-4 py-2 font-semibold text-sm transition-colors duration-200 relative ${activeTab === 'insights' ? 'text-primary' : 'text-text-secondary hover:text-text-primary'}`}
          >
            <ChartBarIcon className="w-5 h-5"/> Wawasan Saya
            {activeTab === 'insights' && <motion.div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" layoutId="personal-brand-tab" />}
          </button>
        </div>
      </div>

      <div>
        {activeTab === 'profile' ? (
          <BrandProfileForm />
        ) : (
// FIX: Passed the fetched `history` data to `PersonalInsightsTab` to satisfy its required props.
          isLoadingHistory ? <div className="flex justify-center p-8"><Spinner size="lg" /></div> : <PersonalInsightsTab history={history} />
        )}
      </div>
    </div>
  );
};


export default PersonalBrandView;
