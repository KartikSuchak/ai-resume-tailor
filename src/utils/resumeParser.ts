export interface ResumeSectionItem {
  type: 'paragraph' | 'subheading' | 'bullet';
  text: string;
  subheadingInfo?: {
    role?: string;
    company?: string;
    date?: string;
  };
}

export interface ResumeSectionData {
  title: string;
  items: ResumeSectionItem[];
}

export interface StructuredResume {
  name: string;
  contact: string[];
  sections: ResumeSectionData[];
}

/**
 * Parses a standard markdown resume into a structured resume object.
 * Completely decoupled from rendering for reuse in future ATS scoring features.
 */
export const parseResumeMarkdown = (markdown: string): StructuredResume => {
  const lines = markdown.split('\n');
  const result: StructuredResume = {
    name: '',
    contact: [],
    sections: []
  };

  let currentSection: ResumeSectionData | null = null;
  let nameFound = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    if (line.startsWith('# ')) {
      result.name = line.replace('# ', '').trim();
      nameFound = true;
    } else if (line.startsWith('## ')) {
      const title = line.replace('## ', '').trim();
      currentSection = { title, items: [] };
      result.sections.push(currentSection);
    } else if (line.startsWith('### ')) {
      const headingText = line.replace('### ', '').trim();
      if (currentSection) {
        let subheadingInfo;
        if (headingText.includes('|')) {
          const parts = headingText.split('|').map(p => p.trim());
          subheadingInfo = {
            role: parts[0] || '',
            company: parts[1] || '',
            date: parts[2] || ''
          };
        }
        currentSection.items.push({
          type: 'subheading',
          text: headingText,
          subheadingInfo
        });
      }
    } else if (line.startsWith('- ') || line.startsWith('* ')) {
      const text = line.replace(/^[-*]\s+/, '').trim();
      if (currentSection) {
        currentSection.items.push({ type: 'bullet', text });
      }
    } else {
      // If name is found but no sections are created yet, it is likely contact details
      const isContactPattern = line.includes('|') || line.includes('@') || line.includes('mailto:');
      if (isContactPattern && nameFound && result.sections.length === 0) {
        const parts = line.split('|').map(p => p.trim());
        result.contact = parts;
      } else {
        if (currentSection) {
          currentSection.items.push({ type: 'paragraph', text: line });
        } else if (nameFound && result.sections.length === 0 && result.contact.length === 0) {
          result.contact = line.split('|').map(p => p.trim());
        }
      }
    }
  }

  // Fallback: If no name was found but there are elements, try using the first line
  if (!result.name && lines.length > 0) {
    const firstLine = lines.find(l => l.trim().length > 0);
    if (firstLine) {
      result.name = firstLine.replace(/^#\s*/, '').trim();
    }
  }

  return result;
};
