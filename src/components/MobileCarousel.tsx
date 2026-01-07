import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSwipeable } from 'react-swipeable';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Panel {
  id: string;
  title: string;
  content: React.ReactNode;
}

interface MobileCarouselProps {
  panels: Panel[];
  darkMode: boolean;
}

export const MobileCarousel: React.FC<MobileCarouselProps> = ({ panels, darkMode }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0
    })
  };

  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => paginate(1),
    onSwipedRight: () => paginate(-1),
    preventScrollOnSwipe: true,
    trackMouse: true
  });

  const paginate = (newDirection: number) => {
    let newIndex = currentIndex + newDirection;

    if (newIndex < 0) {
      newIndex = panels.length - 1;
    } else if (newIndex >= panels.length) {
      newIndex = 0;
    }

    setDirection(newDirection);
    setCurrentIndex(newIndex);
  };

  return (
    <div className="relative h-full">
      {/* Navigation Dots */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-20 flex gap-2">
        {panels.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              setDirection(index > currentIndex ? 1 : -1);
              setCurrentIndex(index);
            }}
            className={`w-2 h-2 rounded-full transition-colors ${index === currentIndex
                ? darkMode
                  ? 'bg-white'
                  : 'bg-gray-800'
                : darkMode
                  ? 'bg-gray-600'
                  : 'bg-gray-300'
              }`}
          />
        ))}
      </div>

      {/* Navigation Buttons */}
      <button
        onClick={() => paginate(-1)}
        className={`absolute left-2 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full ${darkMode
            ? 'bg-gray-800 text-gray-200'
            : 'bg-white text-gray-800'
          } shadow-lg`}
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      <button
        onClick={() => paginate(1)}
        className={`absolute right-2 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full ${darkMode
            ? 'bg-gray-800 text-gray-200'
            : 'bg-white text-gray-800'
          } shadow-lg`}
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Panel Title */}
      <div className={`absolute top-0 left-0 right-0 p-4 z-10 ${darkMode ? 'bg-gray-800' : 'bg-white'
        } border-b border-gray-700`}>
        <h2 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-900'
          }`}>
          {panels[currentIndex].title}
        </h2>
      </div>

      {/* Carousel Content */}
      <div
        {...swipeHandlers}
        className="h-full pt-16 overflow-hidden touch-pan-y"
      >
        <AnimatePresence
          initial={false}
          custom={direction}
        >
          <motion.div
            key={currentIndex}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 }
            }}
            className="absolute inset-0 pt-16"
          >
            {panels[currentIndex].content}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};