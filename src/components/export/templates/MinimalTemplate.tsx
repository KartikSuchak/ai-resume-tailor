import React from 'react';
import type { StructuredResume } from '../../../utils/resumeParser';
import { renderFormattedText } from './ModernTemplate';

interface TemplateProps {
  data: StructuredResume;
}

export const MinimalTemplate: React.FC<TemplateProps> = ({ data }) => {
  return (
    <div 
      className="bg-white p-8 sm:p-12 text-gray-900 font-sans mx-auto text-left shadow-sm rounded-lg"
      style={{ width: '100%', maxWidth: '800px', minHeight: '1000px', boxSizing: 'border-box' }}
    >
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-light tracking-tight text-gray-900 mb-2">
          {data.name || 'Your Name'}
        </h1>
        {data.contact.length > 0 && (
          <div className="text-[11px] text-gray-500 flex flex-wrap gap-x-3 gap-y-1">
            {data.contact.map((item, index) => (
              <span key={index} className="inline-block">
                {item}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Sections */}
      <div className="space-y-6">
        {data.sections.map((section, sIdx) => (
          <div key={sIdx} className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-1">
              <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                {section.title}
              </h2>
            </div>
            <div className="md:col-span-3 space-y-2">
              {section.items.map((item, iIdx) => {
                if (item.type === 'subheading') {
                  const info = item.subheadingInfo;
                  if (info) {
                    return (
                      <div key={iIdx} className="flex justify-between items-baseline mt-1">
                        <div className="text-xs font-medium text-gray-900">
                          {info.role} <span className="text-gray-400 font-light">/</span> {info.company}
                        </div>
                        {info.date && (
                          <div className="text-[10px] text-gray-400">
                            {info.date}
                          </div>
                        )}
                      </div>
                    );
                  }
                  return (
                    <h3 key={iIdx} className="text-xs font-medium text-gray-950 mt-1">
                      {renderFormattedText(item.text)}
                    </h3>
                  );
                }

                if (item.type === 'bullet') {
                  return (
                    <ul key={iIdx} className="list-disc pl-4 text-xs text-gray-600 leading-relaxed">
                      <li className="pl-0.5">
                        {renderFormattedText(item.text)}
                      </li>
                    </ul>
                  );
                }

                return (
                  <p key={iIdx} className="text-xs text-gray-600 leading-relaxed text-justify">
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
