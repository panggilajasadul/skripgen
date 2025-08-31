import React from 'react';
import Button from './ui/Button';
import { DownloadIcon } from './icons/DownloadIcon';
import { useToast } from '../hooks/useToast';
import { motion } from 'framer-motion';

interface VideoOutputProps {
  videoUrl: string; // This should be a blob URL
}

const VideoOutput: React.FC<VideoOutputProps> = ({ videoUrl }) => {
  const { addToast } = useToast();

  const handleDownload = () => {
    addToast('Video download initiated!');
  };

  return (
    <motion.div 
        className="space-y-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
    >
      <div className="bg-secondary p-2 rounded-custom">
        <video
          controls
          src={videoUrl}
          className="w-full rounded-md"
          aria-label="Generated AI video"
        >
          Your browser does not support the video tag.
        </video>
      </div>

      <div className="flex flex-wrap gap-2">
        <a href={videoUrl} download={`scriptgen-video-${Date.now()}.mp4`}>
          <Button onClick={handleDownload} variant="secondary">
            <DownloadIcon /> Download Video
          </Button>
        </a>
      </div>
    </motion.div>
  );
};

export default VideoOutput;