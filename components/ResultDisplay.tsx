
import React from 'react';
import type { AnalysisResult } from '../types';
import { AILogoIcon } from './icons';

interface ResultDisplayProps {
  result: AnalysisResult | null;
  originalImage: string | null;
}

const MarkdownRenderer: React.FC<{ text: string }> = ({ text }) => {
  return (
    <div className="space-y-2 text-sm md:text-base">
      {text.split('\n').map((line, index) => {
        if (line.startsWith('### ')) {
          return (
            <h3 key={index} className="text-xl font-semibold mt-4 mb-2 text-brand">
              {line.substring(4)}
            </h3>
          );
        }
        if (line.startsWith('**')) {
          return (
            <p key={index} className="mt-4 font-bold text-highlight">
              {line.replace(/\*\*/g, '')}
            </p>
          );
        }
        if (line.trim() === '') {
          return <br key={index} />;
        }
        return <p key={index}>{line}</p>;
      })}
    </div>
  );
};

export const ResultDisplay: React.FC<ResultDisplayProps> = ({ result, originalImage }) => {
  if (!result) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center text-accent">
        <AILogoIcon className="w-24 h-24 mb-4" />
        <p className="text-lg font-medium">Your analysis results will appear here.</p>
        <p className="text-sm">Upload an image and click "Analyze" to begin.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 overflow-y-auto h-full pr-2">
      {result.isBlurry && result.correctedImage && originalImage && (
        <div>
          <h3 className="text-xl font-semibold mb-3 text-brand">Image Quality Correction</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="text-center">
              <p className="font-medium mb-2">Original</p>
              <img src={originalImage} alt="Original CT Scan" className="rounded-lg w-full" />
            </div>
            <div className="text-center">
              <p className="font-medium mb-2">AI Corrected</p>
              <img src={result.correctedImage} alt="Corrected CT Scan" className="rounded-lg w-full" />
            </div>
          </div>
        </div>
      )}
      <div className="bg-primary p-4 rounded-lg">
        <MarkdownRenderer text={result.diagnosis} />
      </div>
    </div>
  );
};
