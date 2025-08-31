import React, { useState, useCallback } from 'react';
import { ImageStudioFormData, EditedImageOutput } from '../types';
import { editImageWithAI } from '../services/geminiService';
import Button from './ui/Button';
import Spinner from './ui/Spinner';
import { GenerateIcon } from './icons/GenerateIcon';
import Textarea from './ui/Textarea';
import FeatureHeader from './ui/FeatureHeader';
import RateLimitModal from './RateLimitModal';
import useGenerateCounter from '../hooks/useGenerateCounter';
import { ImageIcon } from './icons/ImageIcon';
import { TrashIcon } from './icons/TrashIcon';
import { ImageEditIcon } from './icons/ImageEditIcon';
import ImageOutput from './ImageOutput';

const initialFormData: Omit<ImageStudioFormData, 'image'> = {
  prompt: '',
};

interface ImageStudioViewProps {
    onGenerateSuccess: (count: number) => void;
}

const ImageStudioView: React.FC<ImageStudioViewProps> = ({ onGenerateSuccess }) => {
  const [prompt, setPrompt] = useState(initialFormData.prompt);
  const [image, setImage] = useState<{ mimeType: string; data: string } | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [generatedOutput, setGeneratedOutput] = useState<EditedImageOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showRateLimitModal, setShowRateLimitModal] = useState(false);
  const { count, increment } = useGenerateCounter('imageStudio');

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 4 * 1024 * 1024) { // 4MB limit
          setError("Ukuran file tidak boleh melebihi 4MB.");
          return;
      }
      setError(null);
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        const parts = base64String.split(',');
        if (parts.length === 2) {
            const mimeType = parts[0].split(':')[1].split(';')[0];
            const data = parts[1];
            setImage({ mimeType, data });
            setImagePreview(base64String);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
      setImage(null);
      setImagePreview(null);
  }

  const generate = useCallback(async () => {
    if (!image) {
      setError("Harap unggah gambar terlebih dahulu.");
      return;
    }
    if (!prompt.trim()) {
      setError("Harap masukkan perintah untuk mengedit gambar.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setGeneratedOutput(null);
    setShowRateLimitModal(false);

    try {
        const result = await editImageWithAI({ image, prompt });
        setGeneratedOutput(result);
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
  }, [image, prompt, onGenerateSuccess, increment, count]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    generate();
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {showRateLimitModal && <RateLimitModal onClose={() => setShowRateLimitModal(false)} onRetry={generate} />}
      <FeatureHeader 
        title="AI Image Studio"
        description="Edit gambar dengan perintah. Ganti background, tambahkan teks, atau perbaiki warna secara instan."
      />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-card p-6 rounded-custom shadow-custom-lg">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">1. Unggah Gambar</label>
              {imagePreview ? (
                  <div className="relative group">
                      <img src={imagePreview} alt="Preview" className="w-full h-64 object-contain rounded-lg bg-secondary" />
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button type="button" variant="danger" size="sm" onClick={handleRemoveImage}>
                             <TrashIcon className="w-4 h-4 mr-1.5" /> Ganti Gambar
                          </Button>
                      </div>
                  </div>
              ) : (
                  <label htmlFor="image-upload" className="flex justify-center w-full h-48 px-4 transition bg-secondary border-2 border-border border-dashed rounded-md appearance-none cursor-pointer hover:border-primary focus:outline-none">
                      <span className="flex items-center space-x-2">
                          <ImageIcon className="w-6 h-6 text-text-secondary" />
                          <span className="font-medium text-text-secondary">
                              Letakkan gambar di sini atau <span className="text-accent">cari</span>
                          </span>
                      </span>
                      <input id="image-upload" type="file" name="image" accept="image/png, image/jpeg, image/webp" onChange={handleImageChange} className="hidden" />
                  </label>
              )}
               <p className="text-xs text-text-secondary mt-1.5 px-1">
                Ukuran file maksimal 4MB.
              </p>
            </div>

            <Textarea 
              label="2. Berikan Perintah Edit"
              name="prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Contoh: ganti background jadi pemandangan pantai, tambahkan teks 'DISKON 50%' di pojok atas, buat warna gambar ini lebih tajam"
              rows={4}
              required
            />
            
            <Button type="submit" disabled={isLoading || !image} className="w-full justify-center">
              {isLoading ? <Spinner /> : <GenerateIcon />}
              <span className="ml-2">{isLoading ? 'Mengedit Gambar...' : 'Edit dengan AI'}</span>
            </Button>
          </form>
        </div>

        <div className="bg-card p-6 rounded-custom shadow-custom-lg">
          <h2 className="text-2xl font-bold mb-6 text-text-primary">Hasil Edit</h2>
          {isLoading && (
              <div className="text-center text-text-secondary h-full flex flex-col justify-center items-center p-8 bg-secondary rounded-custom">
                  <Spinner size="lg" />
                  <p className="font-semibold text-lg text-text-primary mt-4">AI sedang melukis...</p>
              </div>
          )}
          {error && <div className="bg-red-900/50 text-red-200 p-4 rounded-custom">{error}</div>}
          {generatedOutput && <ImageOutput output={generatedOutput} />}
           {!isLoading && !error && !generatedOutput && (
              <div className="text-center text-text-secondary h-full flex flex-col justify-center items-center p-8 bg-secondary rounded-custom">
                  <ImageEditIcon className="w-16 h-16 mb-4 text-border" />
                  <p className="font-semibold text-lg text-text-primary">Kanvas Ajaib Anda</p>
                  <p className="text-sm">Unggah gambar dan berikan perintah untuk melihat keajaiban.</p>
              </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageStudioView;