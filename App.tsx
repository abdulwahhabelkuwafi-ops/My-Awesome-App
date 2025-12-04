
import React, { useState, useCallback } from 'react';
import { ImageUploader } from './components/ImageUploader';
import { ResultDisplay } from './components/ResultDisplay';
import { Disclaimer } from './components/Disclaimer';
import { Spinner } from './components/Spinner';
import { analyzeCTScan } from './services/geminiService';
import { fileToBase64 } from './utils/imageUtils';
import type { AnalysisResult } from './types';
import { Header } from './components/Header';
import { ErrorDisplay } from './components/ErrorDisplay';

const App: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingStatus, setLoadingStatus] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const handleImageSelect = useCallback((file: File) => {
    setSelectedFile(file);
    setAnalysisResult(null);
    setError(null);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleAnalyzeClick = async () => {
    if (!selectedFile) return;

    setIsLoading(true);
    setError(null);
    setAnalysisResult(null);
    
    try {
      const base64Image = await fileToBase64(selectedFile);
      const result = await analyzeCTScan(base64Image, setLoadingStatus);
      setAnalysisResult(result);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred during analysis.');
    } finally {
      setIsLoading(false);
      setLoadingStatus('');
    }
  };
  
  const resetState = () => {
    setSelectedFile(null);
    setImagePreview(null);
    setAnalysisResult(null);
    setError(null);
    setIsLoading(false);
  }

  return (
    <div className="min-h-screen bg-primary text-light flex flex-col">
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex flex-col items-center justify-center z-50">
          <Spinner />
          <p className="text-xl mt-4 text-brand">{loadingStatus}</p>
        </div>
      )}

      <Header />
      <main className="flex-grow container mx-auto p-4 md:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-secondary p-6 rounded-lg shadow-lg flex flex-col">
            <h2 className="text-2xl font-bold mb-4 text-brand">1. Upload CT Scan</h2>
            <ImageUploader 
              onImageSelect={handleImageSelect}
              imagePreviewUrl={imagePreview}
              isProcessing={isLoading}
            />
             <div className="mt-auto pt-4">
              {imagePreview ? (
                <div className="flex space-x-4">
                  <button
                    onClick={handleAnalyzeClick}
                    disabled={isLoading}
                    className="w-full bg-brand hover:bg-sky-400 text-primary font-bold py-3 px-4 rounded-lg transition duration-300 disabled:bg-gray-500 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {isLoading ? 'Analyzing...' : 'Analyze Image'}
                  </button>
                  <button
                    onClick={resetState}
                    disabled={isLoading}
                    className="w-full bg-accent hover:bg-highlight text-light font-bold py-3 px-4 rounded-lg transition duration-300 disabled:bg-gray-500"
                  >
                    Clear
                  </button>
                </div>
              ) : (
                 <div className="w-full bg-gray-600 text-gray-400 font-bold py-3 px-4 rounded-lg text-center">
                    Upload an image to start
                 </div>
              )}
            </div>
          </div>
          
          <div className="bg-secondary p-6 rounded-lg shadow-lg flex flex-col">
            <h2 className="text-2xl font-bold mb-4 text-brand">2. AI Analysis</h2>
            {error && <ErrorDisplay message={error} />}
            <ResultDisplay result={analysisResult} originalImage={imagePreview} />
          </div>
        </div>
      </main>
      <Disclaimer />
    </div>
  );
};

export default App;
