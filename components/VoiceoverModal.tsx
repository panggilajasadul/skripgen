import React, { useState, useEffect } from 'react';
import Modal from './ui/Modal';
import Button from './ui/Button';
import { voiceoverService, VOICE_OPTIONS } from '../services/voiceoverService';
import { VoiceOption } from '../types';
import { useToast } from '../hooks/useToast';
import { SoundWaveIcon } from './icons/SoundWaveIcon';
import { BlockIcon } from './icons/BlockIcon';
import { DownloadIcon } from './icons/DownloadIcon';

interface VoiceoverModalProps {
  scriptText: string;
  onClose: () => void;
}

const VoiceoverModal: React.FC<VoiceoverModalProps> = ({ scriptText, onClose }) => {
  const [selectedVoice, setSelectedVoice] = useState<VoiceOption>(VOICE_OPTIONS[0]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { addToast } = useToast();

  useEffect(() => {
    // Cleanup function to stop speech when the modal is closed
    return () => {
      voiceoverService.stop();
    };
  }, []);

  const handlePlay = async () => {
    setIsSpeaking(true);
    setError(null);

    try {
      await voiceoverService.speak(scriptText, selectedVoice.id);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Gagal memutar voiceover.';
      setError(errorMessage);
      addToast(errorMessage);
    } finally {
      setIsSpeaking(false);
    }
  };

  const handleStop = () => {
    voiceoverService.stop();
    setIsSpeaking(false);
  };

  return (
    <Modal title="Buat Voiceover AI" onClose={onClose}>
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-2">Pilih Suara</label>
          <div className="space-y-3">
            {VOICE_OPTIONS.map((option) => (
              <div
                key={option.id}
                onClick={() => !isSpeaking && setSelectedVoice(option)}
                className={`p-4 border rounded-lg transition-all duration-200 ${
                  selectedVoice.id === option.id
                    ? 'border-primary ring-2 ring-primary bg-primary/10'
                    : 'border-border'
                } ${isSpeaking ? 'cursor-not-allowed opacity-60' : 'cursor-pointer hover:border-accent'}`}
              >
                <p className="font-semibold text-text-primary">{option.name}</p>
                <p className="text-xs text-text-secondary">{option.description}</p>
              </div>
            ))}
          </div>
        </div>

        {error && <p className="text-red-500 text-sm text-center">{error}</p>}

        <div className="pt-4 border-t border-border space-y-3">
           <div className="flex gap-2">
                {isSpeaking ? (
                  <Button onClick={handleStop} disabled={!isSpeaking} className="w-full justify-center" variant="danger">
                    <BlockIcon className="w-5 h-5" />
                    <span className="ml-2">Stop Voiceover</span>
                  </Button>
                ) : (
                  <Button onClick={handlePlay} disabled={isSpeaking} className="w-full justify-center">
                    <SoundWaveIcon />
                    <span className="ml-2">Mainkan Voiceover</span>
                  </Button>
                )}
                 <Button disabled={true} className="w-full justify-center" variant="secondary" title="Pengunduhan tidak didukung oleh TTS browser">
                    <DownloadIcon />
                    <span className="ml-2">Download</span>
                </Button>
           </div>
            <p className="text-xs text-center text-text-secondary">
              Fitur 'Mainkan' menggunakan text-to-speech bawaan browser Anda. Kualitas suara dapat bervariasi.
              <br/>
              Pengunduhan tidak didukung oleh fitur ini.
            </p>
        </div>
      </div>
    </Modal>
  );
};

export default VoiceoverModal;
