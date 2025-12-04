
import React from 'react';
import { WarningIcon } from './icons';

export const Disclaimer: React.FC = () => {
  return (
    <footer className="w-full bg-secondary mt-auto">
      <div className="container mx-auto p-4 flex items-center justify-center text-center text-sm text-yellow-300 border-t-2 border-yellow-500">
        <WarningIcon className="w-8 h-8 mr-3 flex-shrink-0" />
        <p>
          <strong>Disclaimer:</strong> This is a technology demonstration and is <strong>not a medical device.</strong> The analysis provided is AI-generated and should not be used for actual medical diagnosis, treatment, or decision-making. Always consult a qualified healthcare professional for any medical concerns.
        </p>
      </div>
    </footer>
  );
};
