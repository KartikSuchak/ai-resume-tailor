// Scratch script to test the parser implementation

const parseResumeMarkdown = (markdown) => {
  const lines = markdown.split('\n');
  const result = {
    name: '',
    contact: [],
    sections: []
  };

  let currentSection = null;
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

  if (!result.name && lines.length > 0) {
    const firstLine = lines.find(l => l.trim().length > 0);
    if (firstLine) {
      result.name = firstLine.replace(/^#\s*/, '').trim();
    }
  }

  return result;
};

// Sample markdown resume representing the typical output format of the AI
const sampleMarkdown = `
# KARTIK SUCHAK
kartik.suchak@example.com | 123-456-7890 | linkedin.com/in/kartiksuchak

## SUMMARY
Highly motivated software engineer with experience in React, TypeScript, and Firebase.

## EXPERIENCE
### Software Engineer | Google | 2024 - Present
- Built scalable web applications using React and Tailwind CSS.
- Improved application performance by 40% through code splitting and optimization.

### Frontend Developer | Startup | 2022 - 2024
- Designed and implemented customer-facing dashboards.

## EDUCATION
### Bachelor of Science in Computer Science | XYZ University | 2018 - 2022
`;

console.log("=== PARSER OUTPUT ===");
console.log(JSON.stringify(parseResumeMarkdown(sampleMarkdown), null, 2));
console.log("=====================");
