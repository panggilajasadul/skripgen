import React, { useState } from 'react';
import { jsPDF } from 'jspdf';
import { LinkScript } from '../types';
import Button from './ui/Button';
import { CopyIcon } from './icons/CopyIcon';
import { PdfIcon } from './icons/PdfIcon';
import { useToast } from '../hooks/useToast';
import { BulbIcon } from './icons/BulbIcon';
import { WhatsappIcon } from './icons/WhatsappIcon';
import { SaveIcon } from './icons/SaveIcon';
import { motion } from 'framer-motion';
import VoiceoverModal from './VoiceoverModal';
import { SoundWaveIcon } from './icons/SoundWaveIcon';

interface LinkScriptOutputProps {
  killerTitle: string;
  script: LinkScript;
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

const LinkScriptOutput: React.FC<LinkScriptOutputProps> = ({ killerTitle, script, onSave }) => {
  const { addToast } = useToast();
  const [isVoiceoverModalOpen, setIsVoiceoverModalOpen] = useState(false);
  const sceneCueRegex = /\(Rekomendasi Scene:.*?\)/g;

  const renderPartContent = (content: string) => {
    const parts = content.split(sceneCueRegex);
    const cues = content.match(sceneCueRegex) || [];

    return (
      <div className="whitespace-pre-wrap text-text-primary">
        {parts.map((part, index) => (
          <React.Fragment key={index}>
            {part.trim()}
            {cues[index] && <SceneCue text={cues[index]} />}
          </React.Fragment>
        ))}
      </div>
    );
  };
  
  const getFullScriptText = (script: LinkScript): string => {
    return `${script.hook}\n\n${script.body}\n\n${script.cta}`;
  };

  const handleCopyAll = () => {
    let fullText = `Judul Killer: ${killerTitle}\n\n`;
    fullText += `HOOK:\n${script.hook}\n\n`;
    fullText += `BODY:\n${script.body}\n\n`;
    fullText += `CTA:\n${script.cta}\n\n`;

    fullText += "\n--- CAPTION ---\n";
    fullText += `${script.caption}\n\n`;
    
    fullText += "\n--- HASHTAGS ---\n";
    fullText += `${script.hashtags}`;

    navigator.clipboard.writeText(fullText.trim()).then(() => {
      addToast('Semua info (skrip, caption, hashtag) berhasil disalin!');
    }, () => {
      addToast('Gagal menyalin.');
    });
  };

  const handleDownloadPdf = () => {
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
        if (y + requiredHeight > 280) {
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
    y += sectionSpacing;

    addTextWithWrap("SKRIP", true, 12);
    y += sectionSpacing / 2;
    
    addTextWithWrap("HOOK:", true);
    y += 2;
    addTextWithWrap(script.hook);
    y += sectionSpacing / 2;

    addTextWithWrap("BODY:", true);
    y += 2;
    addTextWithWrap(script.body);
    y += sectionSpacing / 2;

    addTextWithWrap("CTA:", true);
    y += 2;
    addTextWithWrap(script.cta);
    y += sectionSpacing;
    
    // Caption
    addTextWithWrap("CAPTION", true, 12);
    y += sectionSpacing / 2;
    addTextWithWrap(script.caption);
    y += sectionSpacing;

    // Hashtags
    addTextWithWrap("HASHTAGS", true, 12);
    y += sectionSpacing / 2;
    addTextWithWrap(script.hashtags);
    
    // --- FOOTER on all pages ---
    const pageCount = doc.internal.pages.length;
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        const pageHeight = doc.internal.pageSize.height;
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text('Aplikasi pembuat skrip konten affiliasi SkripGen 3.0 bisa diorder di Shopee @smokervibes.id', doc.internal.pageSize.getWidth() / 2, pageHeight - 10, { align: 'center' });
    }

    doc.save('scriptgen_link_script_lengkap.pdf');
    addToast('PDF lengkap berhasil diunduh!');
  };
  
  const handleShare = () => {
    let fullText = `*Generated Video Script ("SkripGen 3.0")*\n\n`;
    fullText += `*JUDUL KILLER:*\n${killerTitle}\n\n`;
    fullText += `*HOOK:*\n${script.hook}\n\n`;
    fullText += `*BODY:*\n${script.body}\n\n`;
    fullText += `*CTA:*\n${script.cta}\n\n`;

    fullText += "\n*--- CAPTION ---*\n";
    fullText += `${script.caption}\n\n`;

    fullText += "\n*--- HASHTAGS ---*\n";
    fullText += `${script.hashtags}\n\n`;

    fullText += `_Aplikasi pembuat skrip konten affiliasi SkripGen 3.0 bisa diorder di Shopee @smokervibes.id_`;


    const encodedText = encodeURIComponent(fullText.trim());
    const url = `https://wa.me/?text=${encodedText}`;
    window.open(url, '_blank', 'noopener,noreferrer');
    addToast('Membuka WhatsApp untuk berbagi...');
  };

  return (
    <motion.div 
        className="space-y-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
    >
        {isVoiceoverModalOpen && (
            <VoiceoverModal 
                scriptText={getFullScriptText(script)}
                onClose={() => setIsVoiceoverModalOpen(false)} 
            />
        )}
        <div className="mb-4">
            <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider">Judul Killer</h3>
            <p className="text-xl font-semibold text-accent bg-secondary p-3 rounded-md">{killerTitle}</p>
        </div>
        <div className="bg-secondary p-4 rounded-custom space-y-4">
            <div className="space-y-3 text-sm">
                <div>
                    <p className="font-semibold text-text-secondary uppercase">Hook</p>
                    {renderPartContent(script.hook)}
                </div>
                <div>
                    <p className="font-semibold text-text-secondary uppercase">Body</p>
                    {renderPartContent(script.body)}
                </div>
                <div>
                    <p className="font-semibold text-text-secondary uppercase">CTA</p>
                    {renderPartContent(script.cta)}
                </div>
            </div>
        </div>
        
        <div className="space-y-4 mb-4">
              <div>
                  <h4 className="font-bold text-text-primary uppercase tracking-wider text-sm mb-1">Caption</h4>
                  <p className="text-sm text-text-secondary bg-secondary p-3 rounded-md whitespace-pre-wrap">{script.caption}</p>
              </div>
              <div>
                  <h4 className="font-bold text-text-primary uppercase tracking-wider text-sm mb-1">Hashtags</h4>
                  <p className="text-sm text-accent bg-secondary p-3 rounded-md whitespace-pre-wrap">{script.hashtags}</p>
              </div>
        </div>

        {script.explanation && (
          <div className="p-3 bg-primary/10 border border-primary/20 rounded-lg text-sm flex items-start">
            <BulbIcon className="w-8 h-8 mr-3 flex-shrink-0 text-accent" />
            <div>
              <h5 className="font-bold mb-1 text-text-primary">Penjelasan AI</h5>
              <p className="text-text-secondary">{script.explanation}</p>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:justify-between gap-3 pt-2 border-t border-border">
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
                    <WhatsappIcon /> Share to WA
                </Button>
            </div>
            <Button onClick={onSave} className="w-full sm:w-auto" size="sm">
                <SaveIcon /> Save to History
            </Button>
        </div>
    </motion.div>
  );
};

export default LinkScriptOutput;