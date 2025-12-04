import { GoogleGenAI, Modality } from "@google/genai";
import type { AnalysisResult } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable is not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const parseBase64 = (base64String: string) => {
  const match = base64String.match(/data:(.*);base64,(.*)/);
  if (!match) {
    throw new Error("Invalid base64 string format");
  }
  const mimeType = match[1];
  const data = match[2];
  return { mimeType, data };
};

const detectBlur = async (mimeType: string, data: string): Promise<boolean> => {
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: {
      parts: [
        {
          inlineData: { mimeType, data },
        },
        {
          text: "Analyze the quality of this chest CT scan image. Is it blurry, low-contrast, or contain motion artifacts that would hinder diagnosis? Respond with only one word: 'YES' if it has quality issues, or 'NO' if it is clear.",
        },
      ],
    },
  });

  const text = response.text.trim().toUpperCase();
  if (text !== 'YES' && text !== 'NO') {
      console.warn(`Unexpected response from blur detection: ${text}. Assuming not blurry.`);
      return false;
  }
  return text === 'YES';
};

const correctImage = async (mimeType: string, data: string): Promise<string> => {
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        {
          inlineData: { mimeType, data },
        },
        {
          text: "This is a blurry / low-quality chest CT scan. Generate a new version of this image that is de-blurred, with enhanced contrast and sharpness, suitable for medical diagnosis. Do not add any text or artifacts. The output should be only the corrected image.",
        },
      ],
    },
    config: {
      responseModalities: [Modality.IMAGE],
    },
  });

  const imagePart = response.candidates?.[0]?.content?.parts[0];
  if (imagePart && imagePart.inlineData) {
    return `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`;
  }
  throw new Error("Failed to correct image.");
};

const diagnoseImage = async (mimeType: string, data: string): Promise<string> => {
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-pro', // Using a more powerful model for diagnosis
    contents: {
      parts: [
        {
          inlineData: { mimeType, data },
        },
        {
          text: `You are a radiology assistant AI. Analyze the provided chest CT scan image. Provide a detailed analysis based on visible information. Structure your response in markdown format with the following sections:

### Overall Impression
(A brief summary of the findings.)

### Potential Pneumonia Indicators
(Detail any findings suggestive of pneumonia, such as consolidations, ground-glass opacities, or infiltrates. If none, state 'No clear indicators of pneumonia identified.')

### Potential COVID-19 Indicators
(Detail any findings commonly associated with COVID-19, such as bilateral, peripheral ground-glass opacities. If none, state 'No specific indicators of COVID-19 identified.')

### Image Quality & Technical Analysis
(Analyze the image for any defects. This includes, but is not limited to:
- **Patient Motion:** Mention any blurring or ghosting artifacts indicative of patient movement.
- **Technician Errors:** Comment on potential issues like incorrect patient positioning or centering.
- **Technical Parameters:** Assess if parameters like slice thickness, noise levels, or contrast seem appropriate for a diagnostic chest CT. Note any visible artifacts like beam hardening or streak artifacts. If the image quality is good, state that.)

**Disclaimer:** This is an AI-generated analysis and is for informational purposes only. It is not a substitute for a diagnosis by a qualified medical professional.`
        },
      ],
    },
  });
  return response.text;
};

export const analyzeCTScan = async (
  base64Image: string,
  updateStatus: (status: string) => void
): Promise<AnalysisResult> => {
  const { mimeType, data } = parseBase64(base64Image);
  
  updateStatus("Analyzing image quality...");
  const isBlurry = await detectBlur(mimeType, data);
  
  let imageToDiagnose = base64Image;
  let correctedImage: string | null = null;
  
  if (isBlurry) {
    updateStatus("Image is blurry. Applying correction...");
    correctedImage = await correctImage(mimeType, data);
    imageToDiagnose = correctedImage;
  }
  
  updateStatus("Performing diagnostic analysis...");
  const { mimeType: diagMime, data: diagData } = parseBase64(imageToDiagnose);
  const diagnosis = await diagnoseImage(diagMime, diagData);
  
  updateStatus("Analysis complete.");
  
  return {
    isBlurry,
    correctedImage,
    diagnosis,
  };
};