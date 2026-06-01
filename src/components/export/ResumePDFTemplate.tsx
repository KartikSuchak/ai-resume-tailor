import React from 'react';
import ReactMarkdown from 'react-markdown';

interface ResumePDFTemplateProps {
  content: string;
}

/**
 * A recruiter-ready, ATS-optimized, high-fidelity A4 resume template.
 * COMPLETELY ISOLATED from Tailwind v4 OKLCH color space declarations to prevent html2canvas crashes.
 * Uses strict HEX/RGB inline styles for all colors, backgrounds, and borders.
 */
export const ResumePDFTemplate: React.FC<ResumePDFTemplateProps> = ({ content }) => {
  return (
    <div
      id="resume-pdf-template"
      className="font-serif leading-relaxed w-[794px] min-h-[1123px] p-12 mx-auto box-border text-left"
      style={{
        width: '794px', // A4 Page standard at 96 DPI
        minHeight: '1123px',
        boxSizing: 'border-box',
        backgroundColor: '#ffffff', // Explicit HEX background
        color: '#111827', // Explicit HEX dark gray text
      }}
    >
      <div className="max-w-none text-left">
        <ReactMarkdown
          components={{
            // Heading 1: Candidate Name / Top Title
            h1: ({ children }) => {
              return (
                <h1 
                  className="text-3xl font-extrabold font-sans text-center tracking-tight uppercase pb-2 mb-4 mt-2"
                  style={{
                    color: '#030712',
                    borderBottom: '2px solid #030712'
                  }}
                >
                  {children}
                </h1>
              );
            },
            // Heading 2: Sections (e.g. WORK EXPERIENCE)
            h2: ({ children }) => {
              return (
                <h2 
                  className="text-sm font-bold font-sans pb-1 mt-6 mb-3 tracking-widest uppercase first:mt-2"
                  style={{
                    color: '#111827',
                    borderBottom: '1px solid #9ca3af'
                  }}
                >
                  {children}
                </h2>
              );
            },
            // Heading 3: Job Role Header (e.g. Software Engineer | Google | 2024)
            h3: ({ children }) => {
              const text = String(children);
              if (text.includes('|')) {
                const parts = text.split('|').map(p => p.trim());
                return (
                  <h3 
                    className="text-[13px] font-bold font-sans flex justify-between items-center mt-3.5 mb-1.5"
                    style={{ color: '#111827' }}
                  >
                    <span>
                      <span style={{ fontWeight: 700 }}>{parts[0]}</span>
                      <span className="font-normal" style={{ color: '#4b5563', margin: '0 4px' }}>at</span>
                      <span style={{ fontWeight: 700 }}>{parts[1]}</span>
                    </span>
                    {parts[2] && (
                      <span className="text-[12px] font-medium font-sans" style={{ color: '#6b7280' }}>
                        {parts[2]}
                      </span>
                    )}
                  </h3>
                );
              }
              return (
                <h3 
                  className="text-[13px] font-bold font-sans mt-3.5 mb-1.5"
                  style={{ color: '#111827' }}
                >
                  {children}
                </h3>
              );
            },
            // Paragraphs / Metadata Text Blocks
            p: ({ children }) => {
              const text = String(children);
              // Contact details header row detection (Name | Link | Phone)
              if (text.includes('|') && text.length < 150 && !text.includes('\n')) {
                return (
                  <div 
                    className="text-[12px] text-center font-sans tracking-wide space-x-2 mb-6"
                    style={{ color: '#4b5563' }}
                  >
                    {text.split('|').map((item, index, arr) => (
                      <React.Fragment key={index}>
                        <span>{item.trim()}</span>
                        {index < arr.length - 1 && (
                          <span style={{ color: '#9ca3af', fontWeight: 'bold', margin: '0 4px' }}>•</span>
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                );
              }
              return (
                <p 
                  className="text-[12px] leading-relaxed font-serif mb-2 text-justify"
                  style={{ color: '#374151' }}
                >
                  {children}
                </p>
              );
            },
            // Bullet Points Unordered List structure
            ul: ({ children }) => {
              return (
                <ul className="list-disc pl-5 mb-3 space-y-1.5">
                  {children}
                </ul>
              );
            },
            li: ({ children }) => {
              return (
                <li 
                  className="text-[12px] leading-relaxed font-serif pl-0.5"
                  style={{ color: '#374151' }}
                >
                  {children}
                </li>
              );
            },
            // Strong / Bolded nodes
            strong: ({ children }) => {
              return (
                <strong 
                  className="font-bold font-sans"
                  style={{ color: '#030712' }}
                >
                  {children}
                </strong>
              );
            },
            // Blockquotes
            blockquote: ({ children }) => {
              return (
                <blockquote 
                  className="pl-4 py-1 italic rounded-r my-4 font-serif"
                  style={{
                    borderLeft: '3px solid #4f46e5',
                    backgroundColor: 'rgba(79, 70, 229, 0.05)',
                    color: '#4b5563'
                  }}
                >
                  {children}
                </blockquote>
              );
            },
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    </div>
  );
};
