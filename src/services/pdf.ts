import * as pdfjsLib from 'pdfjs-dist';

// Set up worker source using Vite's ?url asset loader to ensure it works correctly in-browser and inside production builds.
import pdfWorker from 'pdfjs-dist/build/pdf.worker.mjs?url';
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

/**
 * Extracts raw text from a PDF file page-by-page.
 * Handles the extraction entirely client-side for maximum speed and privacy.
 * 
 * @param file - The PDF File object selected by the user.
 * @returns A promise that resolves to the combined raw text of the PDF.
 */
export const extractTextFromPDF = async (file: File): Promise<string> => {
  try {
    // Read file as ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();

    // Load the PDF document
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;

    let fullText = '';

    // Iterate page-by-page and extract text
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      
      let lastY: number | null = null;
      let pageText = '';

      for (const item of textContent.items) {
        if ('str' in item) {
          // item is of type TextItem
          // Handle line breaks by comparing vertical positions (transform[5] represents y-coordinate)
          if (lastY !== null && item.transform[5] !== lastY) {
            pageText += '\n';
          }
          pageText += item.str;
          lastY = item.transform[5];
        }
      }

      fullText += pageText + '\n\n';
    }

    // Clean up excessive blank lines and preserve spacing reasonably
    const cleanedText = fullText
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

    return cleanedText.trim();
  } catch (error) {
    console.error('Error during PDF text extraction:', error);
    throw new Error('Failed to parse PDF file. Ensure the file is not corrupted or password-protected.');
  }
};
