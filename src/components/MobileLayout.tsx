import React from 'react';
import { MobileCarousel } from './MobileCarousel';

interface MobileLayoutProps {
  darkMode: boolean;
  keywordPanel: React.ReactNode;
  analysisPanel: React.ReactNode;
  sourcesPanel: React.ReactNode;
}

export const MobileLayout: React.FC<MobileLayoutProps> = ({
  darkMode,
  keywordPanel,
  analysisPanel,
  sourcesPanel,
}) => {
  const panels = [
    {
      id: 'keywords',
      title: 'Keyword Bank',
      content: keywordPanel,
    },
    {
      id: 'analysis',
      title: 'Analysis',
      content: analysisPanel,
    },
    {
      id: 'sources',
      title: 'Sources',
      content: sourcesPanel,
    },
  ];

  return (
    <div className="h-[calc(100vh-24rem)]">
      <MobileCarousel
        panels={panels}
        darkMode={darkMode}
      />
    </div>
  );
};