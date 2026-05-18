import { createWorker } from 'tesseract.js';

/**
 * Extracts raw text from an image file using Tesseract.js client-side OCR.
 * Supports PNG, JPG, JPEG, and WEBP documents fully in the browser.
 * 
 * @param file - The Image File object selected by the user.
 * @param onProgress - A callback to report real-time OCR progress percent (0 - 100).
 * @returns A promise that resolves to the extracted and formatted raw text.
 */
export const extractTextFromImage = async (
  file: File,
  onProgress?: (percent: number) => void
): Promise<string> => {
  // Initialize worker with language and logger to capture progress
  const worker = await createWorker('eng', 1, {
    logger: (m: any) => {
      if (m.status === 'recognizing text' && onProgress) {
        onProgress(Math.round(m.progress * 100));
      }
    }
  });

  try {
    // Perform character recognition
    const { data: { text } } = await worker.recognize(file);
    
    // Clean up excessive blank lines and preserve spacing reasonably
    const cleanedText = text
      .split('\n')
      .map(line => line.trim())
      .filter((line, index, arr) => {
        // Remove consecutive duplicate empty lines
        if (line === '' && arr[index - 1] === '') {
          return false;
        }
        return true;
      })
      .join('\n');

    await worker.terminate();
    return cleanedText.trim();
  } catch (error) {
    await worker.terminate();
    console.error('Error during OCR text extraction:', error);
    throw new Error('OCR recognition failed. Ensure the image is clear and contains readable text.');
  }
};
