import React, { useState, useCallback, useEffect } from 'react';
import { VideoGeneratorFormData } from '../types';
import { generateVideoWithAI, fetchVideoFromUri } from '../services/geminiService';
import { VIDEO_ASPECT_RATIOS, VIDEO_STYLES } from '../constants';
import Button from './ui/Button';
import Spinner from './ui/Spinner';
import Select from './ui/Select';
import { GenerateIcon } from './icons/GenerateIcon';
import { FilmIcon } from './icons/FilmIcon';
import Textarea from './ui/Textarea';
import VideoOutput from './VideoOutput';
import { ImageIcon } from './icons/ImageIcon';
import { TrashIcon } from './icons/TrashIcon';
import FeatureHeader from './ui/FeatureHeader';
import RateLimitModal from './RateLimitModal';
import useGenerateCounter from '../hooks/useGenerateCounter';

const initialFormData: VideoGeneratorFormData = {
  prompt: '',
  image: null,
  style: VIDEO_STYLES[0],
  aspectRatio: VIDEO_ASPECT_RATIOS[0],
};

const loadingMessages = [
    "Menghubungi sutradara virtual...",
    "Menyiapkan kamera virtual...",
    "Menyesuaikan pencahayaan...",
    "Aktor AI sedang mendalami karakter...",
    "Merender piksel demi piksel...",
    "Papan clapper digital berbunyi...",
    "Harap tenang di lokasi syuting!",
    "Memoles hasil akhir...",
    "Menambahkan sentuhan keajaiban film...",
    "Hampir tiba waktunya pertunjukan!",
];

interface VideoGeneratorViewProps {
    onGenerateSuccess: (count: number) => void;
}

const VideoGeneratorView: React.FC<VideoGeneratorViewProps> = ({ onGenerateSuccess }) => {
  const [formData, setFormData] = useState<VideoGeneratorFormData>(initialFormData);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentLoadingMessage, setCurrentLoadingMessage] = useState(loadingMessages[0]);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [showRateLimitModal, setShowRateLimitModal] = useState(false);
  const { count, increment } = useGenerateCounter('videoGenerator');

  useEffect(() => {
    let interval: number;
    if (isLoading) {
      interval = window.setInterval(() => {
        setCurrentLoadingMessage(prev => {
          const currentIndex = loadingMessages.indexOf(prev);
          const nextIndex = (currentIndex + 1) % loadingMessages.length;
          return loadingMessages[nextIndex];
        });
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [isLoading]);


  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);
  
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        const parts = base64String.split(',');
        if (parts.length === 2) {
            const mimeType = parts[0].split(':')[1].split(';')[0];
            const data = parts[1];
            setFormData(prev => ({...prev, image: { mimeType, data }}));
            setImagePreview(base64String);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
      setFormData(prev => ({...prev, image: null}));
      setImagePreview(null);
  }

  const generate = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setVideoUrl(null);
    setCurrentLoadingMessage(loadingMessages[0]);
    setShowRateLimitModal(false);

    if (formData.prompt.trim() === '') {
        setError("Prompt harus diisi untuk membuat video.");
        setIsLoading(false);
        return;
    }
    
    try {
        const downloadLink = await generateVideoWithAI(formData);
        if (downloadLink) {
            const videoBlob = await fetchVideoFromUri(downloadLink);
            const objectUrl = URL.createObjectURL(videoBlob);
            setVideoUrl(objectUrl);
            increment();
            onGenerateSuccess(count + 1);
        } else {
            throw new Error("Video generation failed to return a valid download link.");
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
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {showRateLimitModal && <RateLimitModal onClose={() => setShowRateLimitModal(false)} onRetry={generate} />}
      <FeatureHeader 
        title="AI Video Studio"
        description="Ubah teks atau gambar menjadi klip video pendek. Sempurna untuk visualisasi ide atau konten B-roll."
      />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-card p-6 rounded-custom shadow-custom-lg">
          <form onSubmit={handleSubmit} className="space-y-6">
            <Textarea 
              label="Prompt Video"
              name="prompt"
              value={formData.prompt}
              onChange={handleChange}
              placeholder="e.g., Kucing astronot mengambang di galaksi nebula yang berwarna-warni, sinematik 4k"
              rows={4}
              required
            />

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">Preferensi Gambar (Opsional)</label>
              {imagePreview ? (
                  <div className="relative group">
                      <img src={imagePreview} alt="Preview" className="w-full h-40 object-cover rounded-lg" />
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button type="button" variant="danger" size="sm" onClick={handleRemoveImage}>
                             <TrashIcon className="w-4 h-4 mr-1.5" /> Hapus
                          </Button>
                      </div>
                  </div>
              ) : (
                  <label htmlFor="image-upload" className="flex justify-center w-full h-32 px-4 transition bg-secondary border-2 border-border border-dashed rounded-md appearance-none cursor-pointer hover:border-primary focus:outline-none">
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
                Unggah gambar sebagai referensi visual utama. AI akan menggunakan gambar ini sebagai titik awal untuk menganimasikan video berdasarkan prompt Anda.
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select label="Rasio Aspek" name="aspectRatio" value={formData.aspectRatio} onChange={handleChange} options={VIDEO_ASPECT_RATIOS} />
              <Select label="Gaya Video" name="style" value={formData.style} onChange={handleChange} options={VIDEO_STYLES} />
            </div>
            
            <Button type="submit" disabled={isLoading} className="w-full justify-center">
              {isLoading ? <Spinner /> : <GenerateIcon />}
              <span className="ml-2">{isLoading ? 'Membuat Video...' : 'Buat Video'}</span>
            </Button>
          </form>
        </div>

        <div className="bg-card p-6 rounded-custom shadow-custom-lg">
          <h2 className="text-2xl font-bold mb-6 text-text-primary">Video yang Dihasilkan</h2>
          {isLoading && (
              <div className="text-center text-text-secondary h-full flex flex-col justify-center items-center p-8 bg-secondary rounded-custom">
                  <Spinner size="lg" />
                  <p className="font-semibold text-lg text-text-primary mt-4">AI sedang bekerja keras...</p>
                  <p className="text-sm mt-1">{currentLoadingMessage}</p>
                  <p className="text-xs text-text-secondary mt-4">(Pembuatan video bisa memakan waktu beberapa menit, harap bersabar)</p>
              </div>
          )}
          {error && <div className="bg-red-900/50 text-red-200 p-4 rounded-custom">{error}</div>}
          {videoUrl && <VideoOutput videoUrl={videoUrl} />}
           {!isLoading && !error && !videoUrl && (
              <div className="text-center text-text-secondary h-full flex flex-col justify-center items-center p-8 bg-secondary rounded-custom">
                  <FilmIcon className="w-16 h-16 mb-4 text-border" />
                  <p className="font-semibold text-lg text-text-primary">Visi Anda, Dianimasikan</p>
                  <p className="text-sm">Jelaskan sebuah adegan, dan biarkan AI menghidupkannya menjadi video.</p>
              </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoGeneratorView;