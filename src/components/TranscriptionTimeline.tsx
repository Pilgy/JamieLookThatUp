import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, ChevronDown, ChevronUp } from 'lucide-react';

interface Transcription {
  id: string;
  text: string;
  timestamp: string;
  isAnalyzed: boolean;
  keywords?: string[];
}

interface TranscriptionBlockProps {
  transcription: Transcription;
  isSelected: boolean;
  darkMode: boolean;
  onClick: () => void;
}

const TranscriptionBlock: React.FC<TranscriptionBlockProps> = ({
  transcription,
  isSelected,
  darkMode,
  onClick,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const toggleExpand = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  return (
    <motion.div
      layout
      onClick={onClick}
      className={`
        relative p-4 rounded-lg cursor-pointer transition-all
        ${isSelected
          ? darkMode
            ? 'bg-blue-900 ring-2 ring-blue-500'
            : 'bg-blue-50 ring-2 ring-blue-300'
          : transcription.isAnalyzed
          ? darkMode
            ? 'bg-green-900/20'
            : 'bg-green-50'
          : darkMode
          ? 'bg-gray-700'
          : 'bg-gray-50'
        }
        hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200
      `}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Clock className={`w-4 h-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
          <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            {formatTime(transcription.timestamp)}
          </span>
        </div>
        <button
          onClick={toggleExpand}
          className={`p-1 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors`}
        >
          {isExpanded ? (
            <ChevronUp className={`w-4 h-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
          ) : (
            <ChevronDown className={`w-4 h-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
          )}
        </button>
      </div>

      {/* Keywords */}
      {transcription.keywords && transcription.keywords.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {transcription.keywords.slice(0, isExpanded ? undefined : 2).map((keyword, index) => (
            <span
              key={index}
              className={`
                text-xs px-2 py-0.5 rounded-full
                ${darkMode
                  ? 'bg-accent-from/20 text-accent-from'
                  : 'bg-accent-from/10 text-accent-from'}
              `}
            >
              {keyword}
            </span>
          ))}
          {!isExpanded && transcription.keywords.length > 2 && (
            <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              +{transcription.keywords.length - 2}
            </span>
          )}
        </div>
      )}

      {/* Text Content */}
      <AnimatePresence mode="wait">
        {isExpanded ? (
          <motion.div
            key="expanded"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <p className={`text-sm ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
              {transcription.text}
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="collapsed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <p className={`text-sm ${darkMode ? 'text-gray-200' : 'text-gray-800'} line-clamp-2`}>
              {transcription.text}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Status Indicator */}
      <div className="absolute bottom-2 right-2">
        <span
          className={`text-xs ${
            transcription.isAnalyzed
              ? darkMode
                ? 'text-green-300'
                : 'text-green-600'
              : darkMode
              ? 'text-gray-400'
              : 'text-gray-500'
          }`}
        >
          {transcription.isAnalyzed ? '✓ Analyzed' : 'Processing...'}
        </span>
      </div>
    </motion.div>
  );
};

interface TranscriptionTimelineProps {
  transcriptions: Transcription[];
  selectedId: string | null;
  darkMode: boolean;
  onSelect: (id: string) => void;
}

export const TranscriptionTimeline: React.FC<TranscriptionTimelineProps> = ({
  transcriptions,
  selectedId,
  darkMode,
  onSelect,
}) => {
  return (
    <div className="relative">
      {/* Timeline Line */}
      <div className="absolute left-0 right-0 h-0.5 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-accent-from via-accent-via to-accent-to opacity-20" />
      
      {/* Timeline Content */}
      <div className="relative">
        <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
          <AnimatePresence>
            {transcriptions.map((transcription) => (
              <motion.div
                key={transcription.id}
                layout
                className="min-w-[280px] max-w-[320px]"
              >
                <TranscriptionBlock
                  transcription={transcription}
                  isSelected={selectedId === transcription.id}
                  darkMode={darkMode}
                  onClick={() => onSelect(transcription.id)}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};