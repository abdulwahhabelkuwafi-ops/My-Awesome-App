
import React from 'react';
import { AILogoIcon } from './icons';

export const Header: React.FC = () => {
    return (
        <header className="w-full bg-secondary shadow-md">
            <div className="container mx-auto p-4 flex items-center">
                <AILogoIcon className="w-10 h-10 text-brand mr-3" />
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-light">
                    CT Scan AI Analyst
                </h1>
            </div>
        </header>
    );
}
