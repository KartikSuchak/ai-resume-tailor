import jsPDF from 'jspdf';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import type { Root } from 'mdast';

interface TemplateStyle {
  fontName: 'helvetica' | 'times' | 'courier';
  margins: { top: number; bottom: number; left: number; right: number };
  colors: {
    name: [number, number, number];
    contact: [number, number, number];
    h2: [number, number, number];
    h3: [number, number, number];
    body: [number, number, number];
    line: [number, number, number] | null;
  };
  fontSizes: {
    name: number;
    contact: number;
    h2: number;
    h3: number;
    body: number;
  };
  uppercaseH2: boolean;
  uppercaseName: boolean;
  h2HasBottomBorder: boolean;
  alignHeader: 'left' | 'center';
  lineSpacing: {
    name: number;
    contact: number;
    h2: number;
    h3: number;
    body: number;
    sectionGap: number;
  };
}

const TEMPLATE_STYLES: Record<string, TemplateStyle> = {
  modern: {
    fontName: 'helvetica',
    margins: { top: 15, bottom: 15, left: 15, right: 15 },
    colors: {
      name: [30, 58, 138], // Indigo-900: #1e3a8a
      contact: [75, 85, 99], // Gray-600: #4b5563
      h2: [37, 99, 235], // Blue-600: #2563eb
      h3: [17, 24, 39], // Gray-900: #111827
      body: [55, 65, 81], // Gray-700: #374151
      line: [224, 231, 255] // Indigo-100: #e0e7ff
    },
    fontSizes: {
      name: 22,
      contact: 9,
      h2: 12,
      h3: 10.5,
      body: 9.5
    },
    uppercaseH2: true,
    uppercaseName: true,
    h2HasBottomBorder: true,
    alignHeader: 'center',
    lineSpacing: {
      name: 10,
      contact: 5,
      h2: 7,
      h3: 5.5,
      body: 5,
      sectionGap: 6
    }
  },
  professional: {
    fontName: 'times',
    margins: { top: 20, bottom: 20, left: 20, right: 20 },
    colors: {
      name: [0, 0, 0], // Pure Black
      contact: [31, 41, 55], // Gray-800
      h2: [0, 0, 0],
      h3: [0, 0, 0],
      body: [0, 0, 0],
      line: [0, 0, 0]
    },
    fontSizes: {
      name: 24,
      contact: 10,
      h2: 13,
      h3: 11,
      body: 10
    },
    uppercaseH2: true,
    uppercaseName: true,
    h2HasBottomBorder: true,
    alignHeader: 'center',
    lineSpacing: {
      name: 11,
      contact: 5,
      h2: 8,
      h3: 6,
      body: 5.5,
      sectionGap: 7
    }
  },
  minimal: {
    fontName: 'helvetica',
    margins: { top: 20, bottom: 20, left: 20, right: 20 },
    colors: {
      name: [17, 24, 39], // Gray-900: #111827
      contact: [107, 114, 128], // Gray-500: #6b7280
      h2: [156, 163, 175], // Gray-400: #9ca3af (subtle metadata style)
      h3: [17, 24, 39],
      body: [55, 65, 81],
      line: null
    },
    fontSizes: {
      name: 22,
      contact: 9,
      h2: 10,
      h3: 10,
      body: 9.5
    },
    uppercaseH2: true,
    uppercaseName: false,
    h2HasBottomBorder: false,
    alignHeader: 'left',
    lineSpacing: {
      name: 9,
      contact: 5,
      h2: 7,
      h3: 5.5,
      body: 5,
      sectionGap: 8
    }
  }
};

/**
 * Exports a structured resume to a professional vector PDF natively.
 * Guarantees crisp text quality, 100% ATS readability, and clean multi-page pagination.
 */
export const exportResumeToPDF = async (
  markdownContent: string,
  filename: string,
  templateName: 'modern' | 'professional' | 'minimal' = 'modern'
): Promise<void> => {
  console.log(`[PDF EXPORT] Initializing vector export with template: "${templateName}"...`);
  console.log('[PDF] Resume length:', markdownContent.length);
  
  const style = TEMPLATE_STYLES[templateName] || TEMPLATE_STYLES.modern;
  
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageHeight = 297;
  const pageWidth = 210;
  const margins = style.margins;
  const fontName = style.fontName;
  const colors = style.colors;
  const sizes = style.fontSizes;
  const spacing = style.lineSpacing;
  
  const printWidth = pageWidth - margins.left - margins.right;
  let y = margins.top;

  // Helper: check page boundaries and page breaks
  const checkPageBreak = (neededHeight: number) => {
    if (y + neededHeight > pageHeight - margins.bottom) {
      pdf.addPage();
      y = margins.top;
      return true;
    }
    return false;
  };

  // Intentionally mirrors current UI preview semantics:
  // `ReactMarkdown` is used without plugins in both workspace and export modal preview.
  const processor = unified().use(remarkParse);
  const tree = processor.parse(markdownContent) as Root;

  const nodeToText = (node: any): string => {
    if (!node) return '';
    if (node.type === 'text') return String(node.value ?? '');
    if (node.type === 'inlineCode' || node.type === 'code') return String(node.value ?? '');
    if (node.type === 'break') return '\n';
    if (Array.isArray(node.children)) return node.children.map(nodeToText).join('');
    return '';
  };

  const normalizeInline = (text: string) => text.replace(/\s+/g, ' ').trim();

  const isContactLine = (text: string) => {
    const t = text.trim();
    if (!t) return false;
    // mirrors ResumePDFTemplate heuristic: short, single-line, pipe-separated contact row
    return t.includes('|') && t.length < 150 && !t.includes('\n');
  };

  const renderLine = (text: string, x: number, align: 'left' | 'center' | 'right' = 'left') => {
    if (!text) return;
    if (align === 'center') pdf.text(text, pageWidth / 2, y, { align: 'center' });
    else if (align === 'right') pdf.text(text, x, y, { align: 'right' });
    else pdf.text(text, x, y);
  };

  let headerRendered = false;
  let contactRendered = false;

  // Render name + (optional) contact line from markdown, without requiring strict section formats.
  // We treat the first H1 as the candidate name, and the first short pipe-separated paragraph as contact.
  for (let i = 0; i < tree.children.length; i++) {
    const node: any = tree.children[i];

    if (!headerRendered && node.type === 'heading' && node.depth === 1) {
      const rawName = normalizeInline(nodeToText(node));
      if (rawName) {
        pdf.setFont(fontName, 'bold');
        pdf.setFontSize(sizes.name);
        pdf.setTextColor(colors.name[0], colors.name[1], colors.name[2]);

        const displayName = style.uppercaseName ? rawName.toUpperCase() : rawName;
        if (style.alignHeader === 'center') renderLine(displayName, margins.left, 'center');
        else renderLine(displayName, margins.left, 'left');
        y += spacing.name;
        headerRendered = true;
      }
      continue;
    }

    if (headerRendered && !contactRendered && node.type === 'paragraph') {
      const paraText = normalizeInline(nodeToText(node));
      if (isContactLine(paraText)) {
        pdf.setFont(fontName, 'normal');
        pdf.setFontSize(sizes.contact);
        pdf.setTextColor(colors.contact[0], colors.contact[1], colors.contact[2]);

        const separator = templateName === 'professional' ? ' | ' : ' • ';
        const contactText = paraText
          .split('|')
          .map((p: string) => p.trim())
          .filter(Boolean)
          .join(separator);

        if (style.alignHeader === 'center') renderLine(contactText, margins.left, 'center');
        else renderLine(contactText, margins.left, 'left');
        y += spacing.contact;
        contactRendered = true;
        continue;
      }
    }
  }

  // Draw separator for center headers
  if (templateName === 'modern' || templateName === 'professional') {
    y += 1.5;
    pdf.setDrawColor(colors.line ? colors.line[0] : 0, colors.line ? colors.line[1] : 0, colors.line ? colors.line[2] : 0);
    pdf.setLineWidth(templateName === 'professional' ? 0.4 : 0.6);
    pdf.line(margins.left, y, pageWidth - margins.right, y);
    y += 4;
  } else {
    y += 5; // spacing for minimal style
  }

  const renderParagraph = (text: string) => {
    const cleanText = normalizeInline(text);
    if (!cleanText) return;

    const textLines = pdf.splitTextToSize(cleanText, printWidth);
    for (let l = 0; l < textLines.length; l++) {
      checkPageBreak(spacing.body);
      pdf.setFont(fontName, 'normal');
      pdf.setFontSize(sizes.body);
      pdf.setTextColor(colors.body[0], colors.body[1], colors.body[2]);
      pdf.text(textLines[l], margins.left, y);
      y += spacing.body;
    }
    y += 1.5;
  };

  const renderBulletItem = (text: string) => {
    const cleanText = normalizeInline(text);
    if (!cleanText) return;

    const textLines = pdf.splitTextToSize(cleanText, printWidth - 5);
    for (let l = 0; l < textLines.length; l++) {
      checkPageBreak(spacing.body);
      pdf.setFont(fontName, 'normal');
      pdf.setFontSize(sizes.body);
      pdf.setTextColor(colors.body[0], colors.body[1], colors.body[2]);
      if (l === 0) pdf.text('\u2022', margins.left + 1.5, y);
      pdf.text(textLines[l], margins.left + 5, y);
      y += spacing.body;
    }
    y += 1;
  };

  const renderHeading2 = (title: string) => {
    const t = normalizeInline(title);
    if (!t) return;

    checkPageBreak(spacing.h2 + 8);
    pdf.setFont(fontName, 'bold');
    pdf.setFontSize(sizes.h2);
    pdf.setTextColor(colors.h2[0], colors.h2[1], colors.h2[2]);

    const sectionTitle = style.uppercaseH2 ? t.toUpperCase() : t;
    pdf.text(sectionTitle, margins.left, y);

    if (style.h2HasBottomBorder && colors.line) {
      y += 1.5;
      pdf.setDrawColor(colors.line[0], colors.line[1], colors.line[2]);
      pdf.setLineWidth(0.3);
      pdf.line(margins.left, y, pageWidth - margins.right, y);
      y += spacing.h2;
    } else {
      y += spacing.h2 + 1;
    }
  };

  const renderHeading3 = (text: string) => {
    const t = normalizeInline(text);
    if (!t) return;

    checkPageBreak(spacing.h3 + 3);
    pdf.setFont(fontName, 'bold');
    pdf.setFontSize(sizes.h3);
    pdf.setTextColor(colors.h3[0], colors.h3[1], colors.h3[2]);

    if (t.includes('|')) {
      const parts = t.split('|').map(p => p.trim());
      const left = [parts[0], parts[1]].filter(Boolean).join(' at ');
      const right = parts[2];

      pdf.text(left, margins.left, y);
      if (right) {
        pdf.setFont(fontName, 'normal');
        pdf.setFontSize(sizes.body);
        pdf.setTextColor(colors.contact[0], colors.contact[1], colors.contact[2]);
        pdf.text(right, pageWidth - margins.right, y, { align: 'right' });
      }
      y += spacing.h3;
      return;
    }

    pdf.text(t, margins.left, y);
    y += spacing.h3;
  };

  const renderList = (listNode: any) => {
    if (!Array.isArray(listNode.children)) return;
    for (const item of listNode.children) {
      // listItem -> usually contains paragraph(s) or nested lists
      if (!item) continue;
      if (Array.isArray(item.children)) {
        for (const child of item.children) {
          if (!child) continue;
          if (child.type === 'list') renderList(child);
          else renderBulletItem(nodeToText(child));
        }
      } else {
        renderBulletItem(nodeToText(item));
      }
    }
  };

  // Render full markdown body, excluding the already-consumed header nodes (H1 and contact line).
  let skippedHeader = false;
  let skippedContact = false;

  for (let i = 0; i < tree.children.length; i++) {
    const node: any = tree.children[i];

    if (!skippedHeader && node.type === 'heading' && node.depth === 1) {
      skippedHeader = true;
      continue;
    }

    if (skippedHeader && !skippedContact && node.type === 'paragraph') {
      const paraText = normalizeInline(nodeToText(node));
      if (isContactLine(paraText)) {
        skippedContact = true;
        continue;
      }
    }

    if (node.type === 'heading' && node.depth === 2) {
      renderHeading2(nodeToText(node));
      continue;
    }

    if (node.type === 'heading' && node.depth === 3) {
      renderHeading3(nodeToText(node));
      continue;
    }

    if (node.type === 'heading') {
      // Depth 4+ (or unusual) -> render like a bold paragraph
      renderHeading3(nodeToText(node));
      continue;
    }

    if (node.type === 'list') {
      renderList(node);
      y += spacing.sectionGap;
      continue;
    }

    if (node.type === 'thematicBreak') {
      checkPageBreak(5);
      pdf.setDrawColor(colors.line ? colors.line[0] : 0, colors.line ? colors.line[1] : 0, colors.line ? colors.line[2] : 0);
      pdf.setLineWidth(0.3);
      pdf.line(margins.left, y, pageWidth - margins.right, y);
      y += 5;
      continue;
    }

    if (node.type === 'paragraph' || node.type === 'blockquote' || node.type === 'code') {
      renderParagraph(nodeToText(node));
      continue;
    }

    // Fallback: try rendering any text-y node.
    const fallbackText = normalizeInline(nodeToText(node));
    if (fallbackText) renderParagraph(fallbackText);
  }

  // Trigger PDF file download in browser
  const sanitizedFilename = filename.trim().replace(/\.pdf$/i, '').replace(/\s+/g, '_') || 'Tailored_Resume';
  console.log('[PDF] Pages generated:', pdf.getNumberOfPages());
  console.log(`[PDF EXPORT] Downloading vector PDF: "${sanitizedFilename}.pdf"...`);
  pdf.save(`${sanitizedFilename}.pdf`);
};
