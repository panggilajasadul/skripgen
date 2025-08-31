import React, { useState } from 'react';
import { jsPDF } from 'jspdf';
import { Script } from '../types';
import Button from './ui/Button';
import { CopyIcon } from './icons/CopyIcon';
import { SaveIcon } from './icons/SaveIcon';
import { useToast } from '../hooks/useToast';
import { GenerateIcon } from './icons/GenerateIcon';
import { BulbIcon } from './icons/BulbIcon';
import { PdfIcon } from './icons/PdfIcon';
import { WhatsappIcon } from './icons/WhatsappIcon';
import { motion, AnimatePresence } from 'framer-motion';
import VoiceoverModal from './VoiceoverModal';
import { SoundWaveIcon } from './icons/SoundWaveIcon';

interface ScriptOutputProps {
  killerTitle: string;
  variations: Script[];
  explanation: string;
  caption: string;
  hashtags: string;
  onSave: () => void;
}

const SceneCue: React.FC<{ text: string }> = ({ text }) => {
    const sceneText = text.replace(/^\(Rekomendasi Scene:|\)$/g, '').trim();
    return (
        <div className="mt-2 bg-primary/10 p-3 rounded-custom border border-primary/20">
            <p className="text-sm text-accent italic"><span className="font-semibold">Scene:</span> {sceneText}</p>
        </div>
    );
};


const ScriptOutput: React.FC<ScriptOutputProps> = ({ killerTitle, variations, explanation, caption, hashtags, onSave }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [isVoiceoverModalOpen, setIsVoiceoverModalOpen] = useState(false);
  const { addToast } = useToast();

  const activeScript = variations[activeTab];
  const sceneCueRegex = /\(Rekomendasi Scene:.*?\)/g;

  const getFullScriptText = (script: Script | undefined): string => {
    if (!script) return "";
    return script.parts.map(part => part.content).join('\n\n');
  };

  const handleCopyAll = () => {
    if (!activeScript) return;
    let fullText = `Judul Killer: ${killerTitle}\n\n`;
    fullText += `Judul Variasi: ${activeScript.title}\n\n`;
    
    activeScript.parts.forEach(part => {
        fullText += `${part.partName.toUpperCase()}:\n${part.content}\n\n`;
    });
    
    fullText += "\n--- CAPTION ---\n";
    fullText += `${caption}\n\n`;
    
    fullText += "\n--- HASHTAGS ---\n";
    fullText += `${hashtags}`;

    navigator.clipboard.writeText(fullText.trim()).then(() => {
      addToast('Semua info berhasil disalin!');
    }, () => {
      addToast('Gagal menyalin.');
    });
  };

  const handleDownloadPdf = () => {
    if (!activeScript) return;
    const doc = new jsPDF();
    const margin = 14;
    const maxWidth = 180;
    let y = 15;
    const lineSpacing = 6;
    const sectionSpacing = 10;

    const addTextWithWrap = (text: string, isBold = false, size = 11) => {
        doc.setFontSize(size);
        doc.setFont(undefined, isBold ? 'bold' : 'normal');
        const lines = doc.splitTextToSize(text, maxWidth);
        const requiredHeight = lines.length * lineSpacing;
        if (y + requiredHeight > 280) { // 297mm page height, 280 is a safe margin
            doc.addPage();
            y = 20;
        }
        doc.text(lines, margin, y);
        y += requiredHeight;
    };

    // --- HEADER ---
    doc.setFontSize(14);
    doc.text('Generated Video Script ("SkripGen 3.0")', doc.internal.pageSize.getWidth() / 2, y, { align: 'center' });
    y += 15;

    // --- CONTENT ---
    addTextWithWrap(`Judul Killer: ${killerTitle}`, true, 12);
    y += sectionSpacing / 2;
    addTextWithWrap(`Judul Variasi: ${activeScript.title}`, false, 12);
    y += sectionSpacing;

    doc.setLineWidth(0.5);
    doc.line(margin, y - 5, maxWidth + margin, y - 5);

    // Script Parts
    addTextWithWrap("SKRIP", true, 12);
    y += sectionSpacing / 2;
    activeScript.parts.forEach(part => {
        addTextWithWrap(`${part.partName.toUpperCase()}:`, true);
        y += 2; // less space
        addTextWithWrap(part.content);
        y += sectionSpacing / 2;
    });

    // Caption
    addTextWithWrap("CAPTION", true, 12);
    y += sectionSpacing / 2;
    addTextWithWrap(caption);
    y += sectionSpacing;

    // Hashtags
    addTextWithWrap("HASHTAGS", true, 12);
    y += sectionSpacing / 2;
    addTextWithWrap(hashtags);

    // --- FOOTER on all pages ---
    const pageCount = doc.internal.pages.length;
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        const pageHeight = doc.internal.pageSize.height;
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text('Aplikasi pembuat skrip konten affiliasi SkripGen 3.0 bisa diorder di Shopee @smokervibes.id', doc.internal.pageSize.getWidth() / 2, pageHeight - 10, { align: 'center' });
    }

    doc.save(`${killerTitle.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 50)}.pdf`);
    addToast('PDF lengkap berhasil diunduh!');
  };


  const handleShare = () => {
    if (!activeScript) return;
    let fullText = `*Generated Video Script ("SkripGen 3.0")*\n\n`;
    fullText += `*JUDUL KILLER:*\n${killerTitle}\n\n`;
    fullText += `*JUDUL VARIASI:*\n${activeScript.title}\n\n`;

    activeScript.parts.forEach(part => {
        fullText += `*${part.partName.toUpperCase()}*:\n${part.content}\n\n`;
    });
    
    fullText += "\n*--- CAPTION ---*\n";
    fullText += `${caption}\n\n`;
    
    fullText += "\n*--- HASHTAGS ---*\n";
    fullText += `${hashtags}\n\n`;

    fullText += `_Aplikasi pembuat skrip konten affiliasi SkripGen 3.0 bisa diorder di Shopee @smokervibes.id_`;
    
    const encodedText = encodeURIComponent(fullText.trim());
    const url = `https://wa.me/?text=${encodedText}`;
    window.open(url, '_blank', 'noopener,noreferrer');
    addToast('Membuka WhatsApp untuk berbagi...');
  };
  
  const renderPartContent = (content: string) => {
    const parts = content.split(sceneCueRegex);
    const cues = content.match(sceneCueRegex) || [];

    return (
      <div className="whitespace-pre-wrap text-text-secondary">
        {parts.map((part, index) => (
          <React.Fragment key={index}>
            {part.trim()}
            {cues[index] && <SceneCue text={cues[index]} />}
          </React.Fragment>
        ))}
      </div>
    );
  };

  if (!variations || variations.length === 0) {
     return (
        <div className="text-center text-text-secondary h-full flex flex-col justify-center items-center p-8 bg-secondary rounded-custom">
            <GenerateIcon className="w-16 h-16 mb-4 text-border" />
            <p className="font-semibold text-lg text-text-primary">Your Masterpiece Awaits</p>
            <p className="text-sm">Fill the form, click generate, and let the AI craft your viral script!</p>
        </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
      {isVoiceoverModalOpen && activeScript && (
          <VoiceoverModal 
              scriptText={getFullScriptText(activeScript)}
              onClose={() => setIsVoiceoverModalOpen(false)} 
          />
      )}
      <div className="mb-4">
        <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider">Judul Killer</h3>
        <p className="text-xl font-semibold text-accent bg-secondary p-3 rounded-md">{killerTitle}</p>
      </div>
      <div className="flex border-b border-border mb-4">
        {variations.map((_, index) => (
          <button
            key={index}
            onClick={() => setActiveTab(index)}
            className={`px-4 py-2 font-semibold text-sm transition-colors duration-200 relative ${
              activeTab === index
                ? 'text-primary'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            Variation {index + 1}
             {activeTab === index && (
                <motion.div
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                  layoutId="underline"
                />
              )}
          </button>
        ))}
      </div>
      
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          <div className="space-y-4">
              {activeScript ? (
                  <>
                      <h3 className="text-xl font-bold text-accent">{activeScript.title}</h3>
                      {activeScript.parts.map((part, index) => (
                        <div key={index}>
                          <h4 className="font-bold text-text-primary uppercase tracking-wider text-sm">{part.partName}</h4>
                          {renderPartContent(part.content)}
                        </div>
                      ))}
                  </>
              ) : <p>No script selected.</p>}
          </div>

          <div className="mt-6 pt-4 border-t border-border">
            <div className="space-y-4 mb-4">
              <div>
                  <h4 className="font-bold text-text-primary uppercase tracking-wider text-sm mb-1">Caption</h4>
                  <p className="text-sm text-text-secondary bg-secondary p-3 rounded-md whitespace-pre-wrap">{caption}</p>
              </div>
              <div>
                  <h4 className="font-bold text-text-primary uppercase tracking-wider text-sm mb-1">Hashtags</h4>
                  <p className="text-sm text-accent bg-secondary p-3 rounded-md whitespace-pre-wrap">{hashtags}</p>
              </div>
            </div>

            <div className="p-3 bg-primary/10 border border-primary/20 rounded-lg text-sm flex items-start mb-4">
              <BulbIcon className="w-8 h-8 mr-3 flex-shrink-0 text-accent" />
              <div>
                <h5 className="font-bold mb-1 text-text-primary">Penjelasan AI</h5>
                <p className="text-text-secondary">{explanation}</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:justify-between gap-3">
                <div className="flex flex-wrap gap-2">
                    <Button onClick={handleCopyAll} variant="primary" size="sm" className="shadow-lg shadow-primary/30">
                      <CopyIcon /> Salin Semua
                    </Button>
                    <Button onClick={() => setIsVoiceoverModalOpen(true)} variant="secondary" size="sm">
                      <SoundWaveIcon /> Voiceover AI
                    </Button>
                    <Button onClick={handleDownloadPdf} variant="secondary" size="sm">
                      <PdfIcon /> Download PDF
                    </Button>
                     <Button onClick={handleShare} variant="secondary" size="sm">
                      <WhatsappIcon /> Share
                    </Button>
                </div>
                <Button onClick={onSave} size="sm" className="w-full sm:w-auto">
                  <SaveIcon /> Save to History
                </Button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
};

export default ScriptOutput;