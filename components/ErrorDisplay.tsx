
import React from 'react';
import { WarningIcon } from './icons';

interface ErrorDisplayProps {
    message: string;
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ message }) => {
    return (
        <div className="bg-red-900 border border-red-600 text-red-100 px-4 py-3 rounded-lg relative mb-4" role="alert">
            <div className="flex items-center">
                <WarningIcon className="w-6 h-6 mr-3 text-red-300"/>
                <div>
                    <strong className="font-bold">Analysis Failed: </strong>
                    <span className="block sm:inline">{message}</span>
                </div>
            </div>
        </div>
    );
};
