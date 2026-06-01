import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

/**
 * Renders an HTML element to a professional, high-DPI PDF file.
 * Solves "Attempting to parse an unsupported color function oklch" completely
 * by cloning and rendering inside a clean, sandboxed iframe.
 * The iframe contains standard, high-fidelity styles with strict HEX colors.
 * 
 * @param elementId - The ID of the DOM element rendering the resume.
 * @param filename - The target filename for the downloaded PDF file.
 */
export const exportResumeToPDF = async (elementId: string, filename: string): Promise<void> => {
  console.log(`[PDF EXPORT] Initializing isolated export pipeline for element: "${elementId}"...`);
  
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`[PDF EXPORT] Critical Error: Element with ID "${elementId}" not found in DOM.`);
    throw new Error('Target resume container not found. Please try again.');
  }

  // Create a clean, sandboxed iframe completely detached from application variables
  console.log('[PDF EXPORT] Constructing isolated sandboxed iframe...');
  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.top = '0';
  iframe.style.left = '0';
  iframe.style.width = '794px';
  iframe.style.height = '1123px';
  iframe.style.zIndex = '-9999';
  iframe.style.visibility = 'hidden';
  iframe.style.pointerEvents = 'none';
  document.body.appendChild(iframe);

  try {
    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!iframeDoc) {
      throw new Error('Failed to mount isolated iframe document context.');
    }

    // Write a clean HTML document. Spacings and layouts map exactly to our template design
    console.log('[PDF EXPORT] Writing isolated document and export-safe styles to sandboxed frame...');
    iframeDoc.open();
    iframeDoc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            /* Pure, standard CSS rules with strict HEX colors. Completely detached from Tailwind v4 custom variables */
            body {
              margin: 0;
              padding: 0;
              background-color: #ffffff;
              color: #111827;
              font-family: 'Times New Roman', Times, serif;
              font-size: 12px;
              line-height: 1.5;
            }
            .export-container {
              width: 794px;
              min-height: 1123px;
              padding: 48px;
              box-sizing: border-box;
              background-color: #ffffff;
            }
            h1 {
              font-size: 24px;
              font-weight: 800;
              text-align: center;
              text-transform: uppercase;
              margin-top: 8px;
              margin-bottom: 12px;
              padding-bottom: 8px;
              color: #030712;
              border-bottom: 2px solid #030712;
              font-family: Arial, Helvetica, sans-serif;
            }
            h2 {
              font-size: 13px;
              font-weight: 700;
              text-transform: uppercase;
              margin-top: 24px;
              margin-bottom: 12px;
              padding-bottom: 4px;
              letter-spacing: 0.1em;
              color: #111827;
              border-bottom: 1px solid #9ca3af;
              font-family: Arial, Helvetica, sans-serif;
            }
            h3 {
              font-size: 12px;
              font-weight: 700;
              margin-top: 14px;
              margin-bottom: 6px;
              color: #111827;
              font-family: Arial, Helvetica, sans-serif;
            }
            p {
              font-size: 11px;
              margin-top: 0;
              margin-bottom: 8px;
              color: #374151;
              text-align: justify;
            }
            ul {
              margin-top: 0;
              margin-bottom: 10px;
              padding-left: 20px;
              list-style-type: disc;
            }
            li {
              font-size: 11px;
              margin-bottom: 4px;
              color: #374151;
            }
            strong {
              font-weight: 700;
              color: #030712;
              font-family: Arial, Helvetica, sans-serif;
            }
            blockquote {
              margin: 16px 0;
              padding: 8px 16px;
              border-left: 3px solid #4f46e5;
              background-color: #f5f3ff;
              color: #4b5563;
              font-style: italic;
            }
            /* Flex layout helpers to preserve headers and role metadata */
            .flex {
              display: flex;
            }
            .justify-between {
              justify-content: space-between;
            }
            .items-center {
              align-items: center;
            }
            .text-center {
              text-align: center;
            }
            .space-x-2 > * + * {
              margin-left: 8px;
            }
            .mb-6 {
              margin-bottom: 24px;
            }
            .font-sans {
              font-family: Arial, Helvetica, sans-serif;
            }
            .font-serif {
              font-family: 'Times New Roman', Times, serif;
            }
            .font-normal {
              font-weight: 400;
            }
            .text-gray-600 {
              color: #4b5563;
            }
            .text-gray-500 {
              color: #6b7280;
            }
            .tracking-wide {
              letter-spacing: 0.05em;
            }
            .bullet-sep {
              color: #9ca3af;
              font-weight: bold;
              margin: 0 4px;
            }
          </style>
        </head>
        <body>
          <div class="export-container">${element.innerHTML}</div>
        </body>
      </html>
    `);
    iframeDoc.close();

    console.log('[PDF EXPORT] Waiting for layout calculations inside iframe...');
    // A small delay ensures the iframe document handles font alignments and paints the canvas
    await new Promise(resolve => setTimeout(resolve, 500));

    const targetElement = iframeDoc.querySelector('.export-container') as HTMLElement;
    if (!targetElement) {
      throw new Error('Failed to resolve export-container target within iframe.');
    }

    console.log(`[PDF EXPORT] Target container verified. Height: ${targetElement.offsetHeight}px. Triggering html2canvas...`);
    
    // Generate high-resolution canvas to keep typography sharp in print
    const canvas = await html2canvas(targetElement, {
      scale: 2, // Double resolution for ultra-sharp fonts
      useCORS: true,
      allowTaint: false, // Prevents insecure operation security errors
      backgroundColor: '#ffffff',
      logging: true,
      imageTimeout: 15000,
    });

    console.log(`[PDF EXPORT] Canvas compiled successfully. Dimensions: ${canvas.width}x${canvas.height}px.`);

    console.log('[PDF EXPORT] Extracting image data URL...');
    const imgData = canvas.toDataURL('image/png');

    console.log('[PDF EXPORT] Initializing A4 jsPDF instance...');
    // A4 Dimensions: 210mm x 297mm
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgWidth = 210;
    const pageHeight = 297;
    
    // Maintain layout aspect ratio
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    console.log(`[PDF EXPORT] Calculated PDF page dimensions. Target width: ${imgWidth}mm, height: ${imgHeight}mm.`);
    
    let heightLeft = imgHeight;
    let position = 0;

    console.log('[PDF EXPORT] Printing Page 1 to PDF...');
    // Render first page
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
    heightLeft -= pageHeight;

    let pageNum = 1;
    // Handle overflow across multiple A4 pages
    while (heightLeft > 0) {
      pageNum++;
      console.log(`[PDF EXPORT] Layout overflow detected. Printing Page ${pageNum} to PDF...`);
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
      heightLeft -= pageHeight;
    }

    console.log(`[PDF EXPORT] Completed pagination rendering. Total PDF pages generated: ${pageNum}.`);

    // Save with sanitized dynamic filename
    const cleanFilename = filename.trim().replace(/\s+/g, '_') || 'Tailored_Resume';
    console.log(`[PDF EXPORT] Initiating browser download: ${cleanFilename}.pdf...`);
    pdf.save(`${cleanFilename}.pdf`);
    
    console.log('[PDF EXPORT] Export pipeline completed successfully.');
  } catch (error: any) {
    console.error('[PDF EXPORT] Critical failure in export pipeline:', error);
    throw new Error(`Failed to generate high-fidelity PDF. Details: ${error.message || error}`);
  } finally {
    console.log('[PDF EXPORT] Cleaning up isolated iframe resource...');
    if (iframe.parentNode) {
      iframe.parentNode.removeChild(iframe);
    }
  }
};
