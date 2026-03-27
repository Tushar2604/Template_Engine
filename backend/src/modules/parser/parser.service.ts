import { Injectable, BadRequestException } from '@nestjs/common';
import * as mammoth from 'mammoth';

/* ── Resume Data structure (subset) ──────────────────────── */
interface ParsedResume {
  rawText: string;
  structured: {
    fullName: string;
    professionalTitle: string;
    contact: { email: string; phone: string; linkedin: string; location: string };
    summary: string;
    experience: Array<{ title: string; company: string; location: string; start: string; end: string; bullets: string[] }>;
    education: Array<{ degree: string; school: string; location: string; start: string; end: string }>;
    skills: string[];
  };
}

@Injectable()
export class ParserService {
  /**
   * Parse a PDF buffer into raw text.
   */
  async parsePdf(buffer: Buffer): Promise<string> {
    // Dynamic import to handle CommonJS module
    const pdfParse = (await import('pdf-parse')).default;
    const data = await pdfParse(buffer);
    return data.text;
  }

  /**
   * Parse a DOCX buffer into raw text.
   */
  async parseDocx(buffer: Buffer): Promise<string> {
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  }

  /**
   * Parse uploaded file into structured resume data.
   * Uses regex-based extraction (could be enhanced with AI/LLM).
   */
  async parseFile(file: Express.Multer.File): Promise<ParsedResume> {
    const mime = file.mimetype;
    let rawText: string;

    if (mime === 'application/pdf') {
      rawText = await this.parsePdf(file.buffer);
    } else if (
      mime === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      mime === 'application/msword'
    ) {
      rawText = await this.parseDocx(file.buffer);
    } else {
      throw new BadRequestException(`Unsupported file type: ${mime}. Upload PDF or DOCX.`);
    }

    const structured = this.extractStructuredData(rawText);
    return { rawText, structured };
  }

  /**
   * Regex-based extraction of key resume fields from raw text.
   */
  private extractStructuredData(text: string): ParsedResume['structured'] {
    const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);

    // Email
    const emailMatch = text.match(/[\w.+-]+@[\w-]+\.[\w.-]+/);
    const email = emailMatch?.[0] || '';

    // Phone
    const phoneMatch = text.match(/(\+?\d[\d\s().-]{7,}\d)/);
    const phone = phoneMatch?.[0] || '';

    // LinkedIn
    const linkedinMatch = text.match(/linkedin\.com\/in\/[\w-]+/i);
    const linkedin = linkedinMatch?.[0] || '';

    // Name — heuristic: first line that isn't a header keyword
    const headerKeywords = /^(resume|curriculum|cv|summary|experience|education|skills|contact|objective)/i;
    const nameCandidate = lines.find((l) => !headerKeywords.test(l) && l.length > 2 && l.length < 60);
    const fullName = nameCandidate || '';

    // Summary — look for "summary" or "objective" section
    const summaryIdx = lines.findIndex((l) => /^(professional\s+)?summary|^objective|^profile/i.test(l));
    let summary = '';
    if (summaryIdx >= 0) {
      const nextSectionIdx = lines.findIndex(
        (l, i) => i > summaryIdx && /^(experience|education|skills|work|employment)/i.test(l),
      );
      const end = nextSectionIdx > 0 ? nextSectionIdx : summaryIdx + 4;
      summary = lines.slice(summaryIdx + 1, end).join(' ');
    }

    // Skills — look for "skills" section
    const skillsIdx = lines.findIndex((l) => /^(technical\s+)?skills|^core\s+competencies/i.test(l));
    let skills: string[] = [];
    if (skillsIdx >= 0) {
      const nextSectionIdx = lines.findIndex(
        (l, i) => i > skillsIdx && /^(experience|education|certifications|achievements|projects|languages)/i.test(l),
      );
      const end = nextSectionIdx > 0 ? nextSectionIdx : skillsIdx + 8;
      const skillText = lines.slice(skillsIdx + 1, end).join(', ');
      skills = skillText
        .split(/[,;|•·]/)
        .map((s) => s.trim())
        .filter((s) => s.length > 1 && s.length < 50);
    }

    return {
      fullName,
      professionalTitle: '',
      contact: { email, phone, linkedin, location: '' },
      summary,
      experience: [],
      education: [],
      skills: skills.slice(0, 20),
    };
  }
}
