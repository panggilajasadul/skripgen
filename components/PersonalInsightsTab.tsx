import React, { useMemo } from 'react';
import { ScriptData, PerformanceData } from '../types';
import Card from './ui/Card';
import { motion } from 'framer-motion';
import { SparklesIcon } from './icons/SparklesIcon';
import FeatureHeader from './ui/FeatureHeader';

interface PersonalInsightsTabProps {
    history: ScriptData[];
}

interface Insight {
    formula: { [key: string]: { totalSales: number; count: number; avgSales: number } };
    hook: { [key: string]: { totalSales: number; count: number; avgSales: number } };
    tone: { [key: string]: { totalSales: number; count: number; avgSales: number } };
}

const InsightCard: React.FC<{ title: string; value: string; description: string }> = ({ title, value, description }) => (
    <Card className="p-4 bg-secondary flex flex-col">
        <h4 className="text-sm text-text-secondary font-medium">{title}</h4>
        <p className="text-2xl font-bold text-accent mt-1 flex-grow">{value}</p>
        <p className="text-xs text-text-secondary mt-2">{description}</p>
    </Card>
);

const PersonalInsightsTab: React.FC<PersonalInsightsTabProps> = ({ history }) => {
    const insights = useMemo(() => {
        const data: Insight = { formula: {}, hook: {}, tone: {} };
        let totalTrackedScripts = 0;

        history.forEach(item => {
            item.variations.forEach(variation => {
                if (variation.performance && variation.performance.sales > 0) {
                    totalTrackedScripts++;
                    const sales = variation.performance.sales;
                    const formula = item.formData.copywritingFormula;
                    const tone = item.formData.toneAndStyle;
                    const hooks = item.formData.hookTypes;

                    // Aggregate by formula
                    if (!data.formula[formula]) data.formula[formula] = { totalSales: 0, count: 0, avgSales: 0 };
                    data.formula[formula].totalSales += sales;
                    data.formula[formula].count++;

                    // Aggregate by tone
                    if (!data.tone[tone]) data.tone[tone] = { totalSales: 0, count: 0, avgSales: 0 };
                    data.tone[tone].totalSales += sales;
                    data.tone[tone].count++;

                    // Aggregate by hook
                    hooks.forEach(hook => {
                        if (!data.hook[hook]) data.hook[hook] = { totalSales: 0, count: 0, avgSales: 0 };
                        data.hook[hook].totalSales += sales;
                        data.hook[hook].count++;
                    });
                }
            });
        });
        
        // Calculate averages
        Object.values(data.formula).forEach(val => val.avgSales = val.totalSales / val.count);
        Object.values(data.hook).forEach(val => val.avgSales = val.totalSales / val.count);
        Object.values(data.tone).forEach(val => val.avgSales = val.totalSales / val.count);

        const findTopPerformer = (category: 'formula' | 'hook' | 'tone') => {
             const items = Object.entries(data[category]);
             if (items.length === 0) return { name: 'N/A', avgSales: 0 };
             return items.reduce((top, current) => current[1].avgSales > top.avgSales ? { name: current[0], avgSales: current[1].avgSales } : top, { name: items[0][0], avgSales: items[0][1].avgSales });
        };

        return {
            topFormula: findTopPerformer('formula'),
            topHook: findTopPerformer('hook'),
            topTone: findTopPerformer('tone'),
            totalTrackedScripts,
        };

    }, [history]);

    if (insights.totalTrackedScripts === 0) {
        return (
            <div>
                 <FeatureHeader 
                    title="Wawasan Pribadi Anda"
                    description="Temukan pola kemenangan dari konten Anda. Lacak kinerja skrip Anda di halaman Riwayat untuk memulai."
                />
                <div className="text-center p-8 bg-secondary rounded-lg">
                    <p className="text-text-secondary">Belum ada data kinerja untuk dianalisis.</p>
                    <p className="text-sm mt-2">Buka halaman 'Riwayat Script' dan gunakan tombol 'Lacak Kinerja' pada skrip yang sudah Anda posting.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <FeatureHeader 
                title="Wawasan Pribadi Anda"
                description={`Berikut adalah analisis dari ${insights.totalTrackedScripts} skrip yang Anda lacak. Gunakan data ini untuk membuat konten yang lebih baik.`}
            />
            <motion.div 
                className="grid grid-cols-1 md:grid-cols-3 gap-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, transition: { staggerChildren: 0.1 } }}
            >
                <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
                    <InsightCard 
                        title="Formula Paling Cuan" 
                        value={insights.topFormula.name} 
                        description={`Rata-rata menghasilkan ${insights.topFormula.avgSales.toLocaleString()} penjualan per video.`}
                    />
                </motion.div>
                <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
                     <InsightCard 
                        title="Hook Paling Efektif" 
                        value={insights.topHook.name} 
                        description={`Rata-rata menghasilkan ${insights.topHook.avgSales.toLocaleString()} penjualan per video.`}
                    />
                </motion.div>
                <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
                     <InsightCard 
                        title="Gaya Bicara Paling Disukai" 
                        value={insights.topTone.name} 
                        description={`Rata-rata menghasilkan ${insights.topTone.avgSales.toLocaleString()} penjualan per video.`}
                    />
                </motion.div>
            </motion.div>
        </div>
    );
};

export default PersonalInsightsTab;