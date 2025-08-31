
import React from 'react';
import { ContentPlan, ContentPlanDay } from '../types';
import Accordion from './ui/Accordion';
import { BulbIcon } from './icons/BulbIcon';
import Button from './ui/Button';
import { GenerateIcon } from './icons/GenerateIcon';
import { motion } from 'framer-motion';

interface ContentPlannerOutputProps {
  plan: ContentPlan;
  onUseDay: (dayData: ContentPlanDay) => void;
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


const ContentPlannerOutput: React.FC<ContentPlannerOutputProps> = ({ plan, onUseDay }) => {
  return (
    <motion.div 
        className="space-y-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
    >
      <motion.div variants={itemVariants} className="p-4 bg-primary/10 border border-primary/20 rounded-lg text-sm flex items-start">
        <BulbIcon className="w-10 h-10 mr-3 flex-shrink-0 text-accent" />
        <div>
          <h5 className="font-bold mb-1 text-text-primary">Alasan Strategi Keseluruhan</h5>
          <p className="text-text-secondary">{plan.overallStrategy}</p>
        </div>
      </motion.div>

      <motion.div variants={containerVariants}>
        {plan.dailyPlan.map((day, index) => (
          <motion.div key={day.day} variants={itemVariants}>
            <Accordion title={`Hari ${day.day}: ${day.theme}`} defaultOpen={index === 0}>
              <div className="space-y-4 pt-4 px-2">
                <div className="text-sm">
                  <p className="font-semibold text-text-secondary">Angle:</p>
                  <p className="text-text-primary">{day.angle}</p>
                </div>
                <div className="text-sm">
                  <p className="font-semibold text-text-secondary">Ide Hook:</p>
                  <p className="text-text-primary italic">"{day.hookIdea}"</p>
                </div>
                <div className="text-sm">
                  <p className="font-semibold text-text-secondary">CTA:</p>
                  <p className="text-text-primary">{day.cta}</p>
                </div>
                <div className="mt-4 pt-4 border-t border-border">
                    <Button onClick={() => onUseDay(day)} size="sm" className="w-full justify-center">
                        <GenerateIcon className="w-4 h-4 mr-2" />
                        Buatkan Skrip untuk Hari Ini
                    </Button>
                </div>
              </div>
            </Accordion>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
};

export default ContentPlannerOutput;
