import React from 'react';
import { MarketResearchResult } from '../types';
import Button from './ui/Button';
import { GenerateIcon } from './icons/GenerateIcon';
import { motion } from 'framer-motion';
import Card from './ui/Card';

interface MarketResearchOutputProps {
  result: MarketResearchResult;
  onUseProduct: (productName: string) => void;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
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

const MarketResearchOutput: React.FC<MarketResearchOutputProps> = ({ result, onUseProduct }) => {
  return (
    <motion.div 
        className="space-y-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
    >
      <motion.div variants={itemVariants}>
        <Card className="p-4">
          <h3 className="font-bold text-lg mb-2 text-accent">🔥 Produk Trending</h3>
          <div className="space-y-3">
            {result.trendingProducts.map((product, index) => (
              <div key={index} className="bg-secondary p-3 rounded-md">
                <div className="flex justify-between items-start gap-2">
                    <div>
                        <p className="font-semibold text-text-primary">{product.name}</p>
                        <p className="text-xs text-text-secondary italic">Alasan: {product.reason}</p>
                    </div>
                    <Button size="sm" variant="secondary" onClick={() => onUseProduct(product.name)}>
                        <GenerateIcon className="w-4 h-4 mr-1.5" />
                        Buat Skrip
                    </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Card className="p-4">
          <h3 className="font-bold text-lg mb-2 text-accent">🎯 Masalah Utama Audiens</h3>
          <ul className="list-disc list-inside space-y-1 text-sm text-text-secondary">
            {result.audiencePainPoints.map((point, index) => (
              <li key={index}>{point}</li>
            ))}
          </ul>
        </Card>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Card className="p-4">
          <h3 className="font-bold text-lg mb-2 text-accent">🎬 Format Konten Populer</h3>
          <ul className="list-disc list-inside space-y-1 text-sm text-text-secondary">
            {result.popularContentFormats.map((format, index) => (
              <li key={index}>{format}</li>
            ))}
          </ul>
        </Card>
      </motion.div>
      
      <motion.div variants={itemVariants}>
        <Card className="p-4">
          <h3 className="font-bold text-lg mb-2 text-accent">💡 Ide "Killer Hook"</h3>
           <ul className="list-disc list-inside space-y-1 text-sm text-text-secondary">
            {result.killerHookIdeas.map((hook, index) => (
              <li key={index} className="italic">"{hook}"</li>
            ))}
          </ul>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default MarketResearchOutput;