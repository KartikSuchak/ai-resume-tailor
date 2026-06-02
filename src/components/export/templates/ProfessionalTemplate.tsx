import React from 'react';
import type { StructuredResume } from '../../../utils/resumeParser';
import { renderFormattedText } from './ModernTemplate';

interface TemplateProps {
  data: StructuredResume;
}

export const ProfessionalTemplate: React.FC<TemplateProps> = ({ data }) => {
  return (
    <div 
      className="bg-white p-8 sm:p-12 text-black font-serif mx-auto text-left shadow-sm rounded-lg"
      style={{ width: '100%', maxWidth: '800px', minHeight: '1000px', boxSizing: 'border-box' }}
    >
      {/* Header */}
      <div className="text-center pb-3 mb-5 border-b border-black">
        <h1 className="text-2xl font-bold uppercase tracking-wide mb-1.5">
          {data.name || 'Your Name'}
        </h1>
        {data.contact.length > 0 && (
          <div className="text-xs text-gray-700 flex flex-wrap justify-center items-center gap-2">
            {data.contact.map((item, index) => (
              <React.Fragment key={index}>
                {index > 0 && <span className="text-gray-400 font-bold">|</span>}
                <span>{item}</span>
              </React.Fragment>
            ))}
          </div>
        )}
      </div>

      {/* Sections */}
      <div className="space-y-5">
        {data.sections.map((section, sIdx) => (
          <div key={sIdx}>
            <h2 className="text-xs font-bold uppercase tracking-wider border-b border-gray-300 pb-0.5 mb-2.5">
              {section.title}
            </h2>
            <div className="space-y-2">
              {section.items.map((item, iIdx) => {
                if (item.type === 'subheading') {
                  const info = item.subheadingInfo;
                  if (info) {
                    return (
                      <div key={iIdx} className="flex justify-between items-baseline mt-1.5">
                        <div className="text-[11px] font-bold">
                          {info.role} <span className="font-normal italic">at</span> {info.company}
                        </div>
                        {info.date && (
                          <div className="text-[10px] font-normal text-gray-800">
                            {info.date}
                          </div>
                        )}
                      </div>
                    );
                  }
                  return (
                    <h3 key={iIdx} className="text-[11px] font-bold mt-1.5">
                      {renderFormattedText(item.text)}
                    </h3>
                  );
                }

                if (item.type === 'bullet') {
                  return (
                    <ul key={iIdx} className="list-disc pl-5 text-[11px] text-gray-900 leading-normal">
                      <li className="pl-0.5">
                        {renderFormattedText(item.text)}
                      </li>
                    </ul>
                  );
                }

                return (
                  <p key={iIdx} className="text-[11px] text-gray-900 leading-normal text-justify">
                    {renderFormattedText(item.text)}
                  </p>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
