import React from 'react';
import type { StructuredResume } from '../../../utils/resumeParser';

interface TemplateProps {
  data: StructuredResume;
}

export const renderFormattedText = (text: string) => {
  const parts = text.split('**');
  return parts.map((part, index) => {
    if (index % 2 === 1) {
      return <strong key={index} className="font-semibold text-gray-950">{part}</strong>;
    }
    return part;
  });
};

export const ModernTemplate: React.FC<TemplateProps> = ({ data }) => {
  return (
    <div 
      className="bg-white p-8 sm:p-12 text-gray-800 font-sans mx-auto text-left shadow-sm rounded-lg"
      style={{ width: '100%', maxWidth: '800px', minHeight: '1000px', boxSizing: 'border-box' }}
    >
      {/* Header */}
      <div className="text-center border-b-2 border-indigo-600 pb-4 mb-6">
        <h1 className="text-3xl font-extrabold text-indigo-900 uppercase tracking-tight mb-2">
          {data.name || 'Your Name'}
        </h1>
        {data.contact.length > 0 && (
          <div className="text-xs text-gray-600 flex flex-wrap justify-center items-center gap-2">
            {data.contact.map((item, index) => (
              <React.Fragment key={index}>
                {index > 0 && <span className="text-indigo-400 font-bold">•</span>}
                <span>{item}</span>
              </React.Fragment>
            ))}
          </div>
        )}
      </div>

      {/* Sections */}
      <div className="space-y-6">
        {data.sections.map((section, sIdx) => (
          <div key={sIdx}>
            <h2 className="text-sm font-bold text-indigo-600 uppercase tracking-wider border-b border-indigo-100 pb-1 mb-3">
              {section.title}
            </h2>
            <div className="space-y-3.5">
              {section.items.map((item, iIdx) => {
                if (item.type === 'subheading') {
                  const info = item.subheadingInfo;
                  if (info) {
                    return (
                      <div key={iIdx} className="flex justify-between items-baseline mt-2">
                        <div className="text-xs font-bold text-gray-900">
                          {info.role} <span className="text-gray-400 font-normal">at</span> {info.company}
                        </div>
                        {info.date && (
                          <div className="text-[11px] font-medium text-gray-500">
                            {info.date}
                          </div>
                        )}
                      </div>
                    );
                  }
                  return (
                    <h3 key={iIdx} className="text-xs font-bold text-gray-900 mt-2">
                      {renderFormattedText(item.text)}
                    </h3>
                  );
                }

                if (item.type === 'bullet') {
                  return (
                    <ul key={iIdx} className="list-disc pl-5 text-xs text-gray-700 leading-relaxed">
                      <li className="pl-1">
                        {renderFormattedText(item.text)}
                      </li>
                    </ul>
                  );
                }

                return (
                  <p key={iIdx} className="text-xs text-gray-700 leading-relaxed text-justify">
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
