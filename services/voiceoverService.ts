import { VoiceOption } from '../types';

export const VOICE_OPTIONS: VoiceOption[] = [
    { id: 'female-energetic', name: 'Wanita - Ceria & Enerjik', description: 'Suara wanita muda yang bersemangat, cocok untuk konten yang fun dan engaging.' },
    { id: 'male-professional', name: 'Pria - Profesional & Meyakinkan', description: 'Suara pria dewasa yang dalam dan jelas, cocok untuk konten edukasi atau review teknis.' },
    { id: 'female-calm', name: 'Wanita - Santai & Seperti Teman', description: 'Suara wanita yang tenang dan ramah, cocok untuk storytelling atau konten soft-selling.' },
];

class VoiceoverService {
    private synth: SpeechSynthesis;
    private voices: SpeechSynthesisVoice[] = [];

    constructor() {
        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
            this.synth = window.speechSynthesis;
            // The voices list is loaded asynchronously.
            this.loadVoices();
            if (this.synth.onvoiceschanged !== undefined) {
                this.synth.onvoiceschanged = this.loadVoices;
            }
        } else {
            this.synth = {} as SpeechSynthesis; // To satisfy typescript, methods will check for real synth
            console.error("Web Speech API is not supported in this browser.");
        }
    }

    private loadVoices = () => {
        if (this.synth.getVoices) {
            this.voices = this.synth.getVoices();
        }
    }

    speak(text: string, voiceId: string): Promise<void> {
        return new Promise((resolve, reject) => {
            if (!this.synth || !this.synth.speak) {
                return reject(new Error("Fitur voiceover tidak didukung di browser ini."));
            }

            if (this.synth.speaking) {
                this.synth.cancel(); // Stop any previous speech
            }

            const utterance = new SpeechSynthesisUtterance(text);
            
            utterance.onend = () => resolve();
            utterance.onerror = (event) => reject(new Error(`Gagal membuat voiceover: ${event.error}`));

            // Find the best matching voice
            const targetGender = voiceId.includes('female') ? 'female' : 'male';
            
            // Prioritize Indonesian voices
            let selectedVoice = this.voices.find(voice => voice.lang.startsWith('id') && voice.name.toLowerCase().includes(targetGender));
            
            if (!selectedVoice) {
                selectedVoice = this.voices.find(voice => voice.lang.startsWith('id'));
            }
            
            if (selectedVoice) {
                utterance.voice = selectedVoice;
            }

            // Adjust pitch and rate based on style
            if(voiceId.includes('energetic')) {
                utterance.rate = 1.2;
                utterance.pitch = 1.1;
            } else if (voiceId.includes('calm')) {
                utterance.rate = 0.9;
                utterance.pitch = 0.9;
            }

            this.synth.speak(utterance);
        });
    }
    
    stop() {
        if (this.synth && this.synth.speaking) {
            this.synth.cancel();
        }
    }
}

export const voiceoverService = new VoiceoverService();
