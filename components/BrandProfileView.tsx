import React, { useState, useEffect } from 'react';
import { BrandProfile } from '../types';
import Input from './ui/Input';
import Textarea from './ui/Textarea';
import Button from './ui/Button';
import Card from './ui/Card';
import { useToast } from '../hooks/useToast';
import FeatureHeader from './ui/FeatureHeader';

interface BrandProfileViewProps {
  brandProfile: BrandProfile;
  setBrandProfile: React.Dispatch<React.SetStateAction<BrandProfile>>;
}

const BrandProfileView: React.FC<BrandProfileViewProps> = ({ brandProfile, setBrandProfile }) => {
  const [formData, setFormData] = useState<BrandProfile>(brandProfile);
  const { addToast } = useToast();

  useEffect(() => {
    setFormData(prev => ({ ...{personaType: 'user'}, ...prev, ...brandProfile }));
  }, [brandProfile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handlePersonaTypeChange = (type: 'user' | 'brand') => {
      setFormData(prev => ({...prev, personaType: type}));
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setBrandProfile(formData);
    addToast('Brand Profile saved successfully!');
  };

  return (
    <div className="max-w-4xl mx-auto">
      <FeatureHeader 
        title="Personal Brand"
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
            <Button type="submit">
              Save Profile
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default BrandProfileView;