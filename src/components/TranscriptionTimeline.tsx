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
        relative p-5 rounded-xl cursor-pointer transition-all duration-300
        ${isSelected
          ? darkMode
            ? 'bg-surface-800 border-l-4 border-l-primary-500 shadow-md'
            : 'bg-white border-l-4 border-l-primary-500 shadow-[0_4px_20px_-12px_rgba(0,0,0,0.1)]'
          : darkMode
            ? 'bg-surface-900 border border-surface-800 hover:border-surface-700'
            : 'bg-white border border-surface-200 hover:border-surface-300'
        }
      `}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Clock className={`w-3.5 h-3.5 ${darkMode ? 'text-surface-500' : 'text-surface-400'}`} />
          <span className={`text-xs font-medium tracking-wide ${darkMode ? 'text-surface-500' : 'text-surface-400'}`}>
            {formatTime(transcription.timestamp)}
          </span>
        </div>
        <button
          onClick={toggleExpand}
          className={`p-1.5 rounded-full hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors`}
        >
          {isExpanded ? (
            <ChevronUp className={`w-4 h-4 ${darkMode ? 'text-surface-500' : 'text-surface-400'}`} />
          ) : (
            <ChevronDown className={`w-4 h-4 ${darkMode ? 'text-surface-500' : 'text-surface-400'}`} />
          )}
        </button>
      </div>

      {/* Text Content */}
      <AnimatePresence mode="wait">
        {isExpanded ? (
          <motion.div
            key="expanded"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mb-3"
          >
            <p className={`text-base font-body leading-relaxed ${darkMode ? 'text-surface-200' : 'text-surface-700'}`}>
              {transcription.text}
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="collapsed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mb-3"
          >
            <p className={`text-base font-body leading-relaxed ${darkMode ? 'text-surface-200' : 'text-surface-700'} line-clamp-2`}>
              {transcription.text}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Keywords */}
      {transcription.keywords && transcription.keywords.length > 0 && (
        <div className="flex flex-wrap gap-x-3 gap-y-1">
          {transcription.keywords.slice(0, isExpanded ? undefined : 3).map((keyword, index) => (
            <span
              key={index}
              className="keyword-link text-xs"
            >
              {keyword}
            </span>
          ))}
          {!isExpanded && transcription.keywords.length > 3 && (
            <span className={`text-xs ${darkMode ? 'text-surface-500' : 'text-surface-400'}`}>
              +{transcription.keywords.length - 3}
            </span>
          )}
        </div>
      )}

      {/* Status Indicator */}
      <div className="absolute top-5 right-10">
        {!transcription.isAnalyzed && (
          <span className="flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-500"></span>
          </span>
        )}
        {transcription.isAnalyzed && isSelected && (
          <div className={`h-1.5 w-1.5 rounded-full ${darkMode ? 'bg-teal' : 'bg-teal'}`} />
        )}
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
      <div className={`absolute left-0 right-0 h-[1px] top-1/2 transform -translate-y-1/2 ${darkMode ? 'bg-surface-800' : 'bg-surface-100'}`} />

      {/* Timeline Content */}
      <div className="relative">
        <div className="flex gap-6 overflow-x-auto pb-4 pt-2 custom-scrollbar px-1">
          <AnimatePresence>
            {transcriptions.map((transcription) => (
              <motion.div
                key={transcription.id}
                layout
                className="min-w-[300px] max-w-[340px]"
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