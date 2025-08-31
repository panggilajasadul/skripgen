import React from 'react';
import { ContentIntelligenceData } from '../types';
import Card from './ui/Card';
import { motion } from 'framer-motion';
import { SparklesIcon } from './icons/SparklesIcon';

interface ContentIntelligenceTabProps {
    data: ContentIntelligenceData;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
  },
};

const InsightCard: React.FC<{ title: string; value: string; }> = ({ title, value }) => (
    <Card className="p-4 bg-secondary">
        <h4 className="text-sm text-text-secondary font-medium">{title}</h4>
        <p className="text-2xl font-bold text-accent">{value}</p>
    </Card>
);

const ContentIntelligenceTab: React.FC<ContentIntelligenceTabProps> = ({ data }) => {
    return (
        <motion.div 
            className="space-y-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            <motion.div variants={itemVariants}>
                <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg text-sm flex items-start">
                    <SparklesIcon className="w-10 h-10 mr-3 flex-shrink-0 text-accent" />
                    <div>
                        <h5 className="font-bold mb-1 text-text-primary">Intelijen Konten</h5>
                        <p className="text-text-secondary">Dashboard ini menganalisis skrip yang diberi feedback positif oleh pengguna untuk menemukan pola kemenangan secara otomatis. Gunakan wawasan ini untuk membuat konten yang lebih baik.</p>
                    </div>
                </div>
            </motion.div>

            <motion.div 
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                variants={containerVariants}
            >
                <motion.div variants={itemVariants}>
                    <InsightCard title="Formula Paling Sukses" value={data.mostSuccessfulFormula} />
                </motion.div>
                <motion.div variants={itemVariants}>
                    <InsightCard title="Tipe Hook Paling Efektif" value={data.mostSuccessfulHookType} />
                </motion.div>
                <motion.div variants={itemVariants}>
                    <InsightCard title="Tone Paling Disukai" value={data.mostSuccessfulTone} />
                </motion.div>
            </motion.div>
            
            <motion.div variants={itemVariants}>
                <Card className="p-4">
                    <h4 className="font-bold mb-2 text-text-primary">Popularitas Niche</h4>
                    <div className="space-y-2">
                        {data.nichePopularity.sort((a, b) => b.count - a.count).map(niche => (
                            <div key={niche.name}>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="font-medium text-text-primary">{niche.name}</span>
                                    <span className="text-text-secondary">{niche.count} skrip</span>
                                </div>
                                <div className="w-full bg-secondary rounded-full h-2.5">
                                    <div 
                                        className="bg-accent h-2.5 rounded-full" 
                                        style={{width: `${(niche.count / Math.max(...data.nichePopularity.map(n => n.count))) * 100}%`}}
                                    ></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            </motion.div>
        </motion.div>
    );
};

export default ContentIntelligenceTab;