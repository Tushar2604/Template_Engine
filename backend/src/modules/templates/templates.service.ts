import { Injectable } from '@nestjs/common';
import { composeBulkFromBases } from './bulk-composition';

/* ── Shared types (mirrored from frontend engine) ──────── */
export interface TemplateColors {
  primary: string; secondary: string; text: string;
  background: string; accent?: string; muted?: string; sidebar?: string;
}

export interface TemplateSchema {
  id: string;
  baseId?: string;
  name: string;
  category?: string;
  family?: string;
  styleTags?: string[];
  layoutSignature?: string;
  configHash?: string;
  atsSafe?: boolean;
  presentation?: Record<string, unknown>;
  layout: 'single-column' | 'two-column-left' | 'two-column-right';
  zones: Record<string, string[]>;
  style: {
    fontFamily: string;
    fontSize: { h1: string; h2: string; body: string; small: string };
    colors: TemplateColors;
    spacing: 'compact' | 'normal' | 'spacious';
    headerStyle: string;
  };
  rules: { maxExperienceItems: number; maxProjects: number; maxSkills: number; truncateText: boolean; showPhoto: boolean };
  skillsVariant?: string;
  languagesVariant?: string;
}

/* ── Color Palettes ──────────────────────────────────────── */
const PALETTES: Record<string, TemplateColors> = {
  horizon:   { primary: '#2563eb', secondary: '#3b82f6', text: '#111827', background: '#fff', accent: '#2563eb', muted: '#6b7280', sidebar: '#1e3a5f' },
  clinical:  { primary: '#007bff', secondary: '#5dade2', text: '#000000', background: '#fff', accent: '#007bff', muted: '#757575', sidebar: '#1a3652' },
  indigo:    { primary: '#4f46e5', secondary: '#818cf8', text: '#0f172a', background: '#fff', accent: '#4f46e5', muted: '#64748b', sidebar: '#312e81' },
  rose:      { primary: '#e11d48', secondary: '#fb7185', text: '#1c1917', background: '#fff', accent: '#e11d48', muted: '#78716c', sidebar: '#9f1239' },
  amber:     { primary: '#d97706', secondary: '#fbbf24', text: '#292524', background: '#fff', accent: '#d97706', muted: '#78716c', sidebar: '#78350f' },
  emerald:   { primary: '#059669', secondary: '#34d399', text: '#022c22', background: '#fff', accent: '#059669', muted: '#6b7280', sidebar: '#064e3b' },
  violet:    { primary: '#7c3aed', secondary: '#a78bfa', text: '#18181b', background: '#fff', accent: '#7c3aed', muted: '#71717a', sidebar: '#4c1d95' },
  slate:     { primary: '#475569', secondary: '#94a3b8', text: '#0f172a', background: '#fff', accent: '#475569', muted: '#64748b', sidebar: '#1e293b' },
  teal:      { primary: '#0d9488', secondary: '#2dd4bf', text: '#1c1917', background: '#fff', accent: '#0d9488', muted: '#57534e', sidebar: '#115e59' },
  crimson:   { primary: '#dc2626', secondary: '#f87171', text: '#171717', background: '#fff', accent: '#dc2626', muted: '#737373', sidebar: '#7f1d1d' },
  ocean:     { primary: '#0284c7', secondary: '#38bdf8', text: '#0f172a', background: '#fff', accent: '#0284c7', muted: '#64748b', sidebar: '#0c4a6e' },
  forest:    { primary: '#16a34a', secondary: '#4ade80', text: '#052e16', background: '#fff', accent: '#16a34a', muted: '#6b7280', sidebar: '#14532d' },
  plum:      { primary: '#9333ea', secondary: '#c084fc', text: '#1e1b4b', background: '#fff', accent: '#9333ea', muted: '#71717a', sidebar: '#581c87' },
  copper:    { primary: '#ea580c', secondary: '#fb923c', text: '#1c1917', background: '#fff', accent: '#ea580c', muted: '#78716c', sidebar: '#7c2d12' },
  midnight:  { primary: '#2563eb', secondary: '#60a5fa', text: '#0f172a', background: '#fff', accent: '#2563eb', muted: '#64748b', sidebar: '#172554' },
};

const FONTS: Record<string, string> = {
  inter:       'Inter, system-ui, sans-serif',
  roboto:      'Roboto, system-ui, sans-serif',
  poppins:     'Poppins, system-ui, sans-serif',
  lato:        'Lato, system-ui, sans-serif',
  sourceSans:  "'Source Sans 3', system-ui, sans-serif",
  playfair:    "'Playfair Display', Georgia, serif",
  raleway:     'Raleway, system-ui, sans-serif',
  montserrat:  'Montserrat, system-ui, sans-serif',
  jetbrains:   "'JetBrains Mono', monospace",
};

const FONT_SIZES = {
  compact:  { h1: '1.5rem', h2: '0.72rem', body: '0.74rem', small: '0.64rem' },
  normal:   { h1: '1.8rem', h2: '0.78rem', body: '0.8rem',  small: '0.68rem' },
  spacious: { h1: '2.1rem', h2: '0.85rem', body: '0.84rem', small: '0.72rem' },
};

/* ── Base Templates ──────────────────────────────────────── */
function makeSchema(
  id: string, name: string, cat: string,
  layout: TemplateSchema['layout'], header: string,
  palette: string, font: string,
  zones: Record<string, string[]>,
  opts: Partial<Pick<TemplateSchema, 'skillsVariant' | 'languagesVariant'> & { showPhoto: boolean }> = {},
): TemplateSchema {
  return {
    id, name, category: cat, layout, zones,
    style: {
      fontFamily: FONTS[font] || FONTS.inter,
      fontSize: FONT_SIZES.normal,
      colors: PALETTES[palette] || PALETTES.horizon,
      spacing: 'normal',
      headerStyle: header,
    },
    rules: { maxExperienceItems: 4, maxProjects: 3, maxSkills: 12, truncateText: false, showPhoto: opts.showPhoto ?? false },
    skillsVariant: opts.skillsVariant || 'pills',
    languagesVariant: opts.languagesVariant || 'dots',
  };
}

const BASE_TEMPLATES: TemplateSchema[] = [
  makeSchema('jason-reed', 'Jason Reed — Navy Sidebar Left', 'sidebar-left', 'two-column-left', 'sidebar', 'horizon', 'inter',
    { sidebar: ['header'], left: ['skills','achievements','certifications','languages'], right: ['summary','experience','education'] }, { skillsVariant: 'grid' }),
  makeSchema('aiden-williams', 'Aiden Williams — Navy Sidebar Right', 'sidebar-right', 'two-column-right', 'left', 'clinical', 'inter',
    { header: ['header'], left: ['summary','experience','education'], right: ['skills','achievements','certifications','languages'] }, { languagesVariant: 'bars' }),
  makeSchema('brandon-hale', 'Brandon Hale — Full Bleed Header', 'banner', 'two-column-left', 'banner', 'clinical', 'inter',
    { header: ['header'], left: ['experience','education'], right: ['summary','skills','achievements','certifications'] }, { showPhoto: true, languagesVariant: 'bars' }),
  makeSchema('maeve-sage', 'Maeve Delaney — Sage', 'sidebar-left', 'two-column-left', 'sidebar', 'emerald', 'inter',
    { sidebar: ['header'], left: ['skills','languages','certifications'], right: ['summary','experience','education','achievements'] }, { languagesVariant: 'bars' }),
  makeSchema('maeve-forest', 'Maeve Delaney — Forest', 'sidebar-left', 'two-column-left', 'sidebar', 'forest', 'inter',
    { sidebar: ['header'], left: ['skills','languages','certifications'], right: ['summary','experience','education','achievements'] }, { languagesVariant: 'bars' }),
  makeSchema('mason-turner', 'Mason Turner — Single Column', 'single-column', 'single-column', 'left', 'horizon', 'inter',
    { header: ['header'], full: ['summary','experience','education','skills','achievements'] }),
  makeSchema('isabella-adams', 'Isabella Adams — Waves', 'two-column', 'two-column-left', 'banner', 'ocean', 'inter',
    { header: ['header'], left: ['experience','education'], right: ['summary','skills','achievements','certifications','languages'] }, { showPhoto: true, skillsVariant: 'grid', languagesVariant: 'bars' }),
  makeSchema('violet-rodriguez', 'Violet Rodriguez — Asymmetric', 'two-column', 'two-column-left', 'banner', 'indigo', 'inter',
    { header: ['header'], left: ['experience','education','projects'], right: ['summary','skills','achievements','languages'] }),
  makeSchema('elena-whitaker', 'Elena Whitaker — Academic', 'single-column', 'single-column', 'center', 'teal', 'inter',
    { header: ['header'], full: ['summary','experience','education','skills','certifications','achievements'] }, { skillsVariant: 'inline', languagesVariant: 'text' }),
  makeSchema('ethan-smith', 'Ethan Smith — CXO', 'two-column', 'two-column-left', 'banner', 'horizon', 'inter',
    { header: ['header'], left: ['experience','education'], right: ['summary','skills','achievements','certifications'] }, { skillsVariant: 'grid' }),
  makeSchema('grace-jackson', 'Grace Jackson — CTO Cyan', 'sidebar-left', 'two-column-left', 'sidebar', 'teal', 'inter',
    { sidebar: ['header'], left: ['skills','languages','certifications'], right: ['summary','experience','education','achievements','projects'] }, { showPhoto: true, skillsVariant: 'bars', languagesVariant: 'bars' }),
  makeSchema('portfolio-pro', 'Portfolio — Case Study', 'two-column', 'two-column-left', 'banner', 'midnight', 'inter',
    { header: ['header'], left: ['experience','projects'], right: ['summary','skills','education','achievements'] }),
  makeSchema('classic-executive', 'Classic Executive', 'single-column', 'single-column', 'center', 'horizon', 'playfair',
    { header: ['header'], full: ['summary','experience','education','skills','certifications','achievements'] }, { skillsVariant: 'inline', languagesVariant: 'text' }),
  makeSchema('modern-minimal', 'Modern Minimal', 'single-column', 'single-column', 'left', 'slate', 'inter',
    { header: ['header'], full: ['summary','experience','education','skills','achievements'] }),
  makeSchema('compact-professional', 'Compact Professional', 'two-column', 'two-column-left', 'split', 'horizon', 'inter',
    { header: ['header'], left: ['experience','education'], right: ['summary','skills','achievements','certifications','languages'] }, { skillsVariant: 'grid', languagesVariant: 'bars' }),
  makeSchema('creative-sidebar', 'Creative Sidebar', 'sidebar-left', 'two-column-left', 'sidebar', 'indigo', 'raleway',
    { sidebar: ['header'], left: ['skills','languages','achievements'], right: ['summary','experience','education','certifications'] }, { showPhoto: true, languagesVariant: 'bars' }),
  makeSchema('timeline-modern', 'Timeline Modern', 'single-column', 'single-column', 'banner', 'horizon', 'inter',
    { header: ['header'], full: ['summary','experience','education','skills','achievements','languages'] }, { languagesVariant: 'bars' }),
  makeSchema('card-style', 'Card Style', 'single-column', 'single-column', 'banner', 'indigo', 'poppins',
    { header: ['header'], full: ['summary','experience','education','skills','achievements','certifications','languages'] }, { showPhoto: true }),
  makeSchema('split-header', 'Split Header', 'two-column', 'two-column-left', 'split', 'horizon', 'montserrat',
    { header: ['header'], left: ['experience','education'], right: ['skills','achievements','certifications','languages'] }, { skillsVariant: 'grid', languagesVariant: 'bars' }),
  makeSchema('bold-header', 'Bold Header', 'banner', 'single-column', 'banner', 'midnight', 'inter',
    { header: ['header'], full: ['summary','experience','skills','education','achievements','certifications','languages'] }),
  makeSchema('elegant-serif', 'Elegant Serif', 'single-column', 'single-column', 'center', 'horizon', 'playfair',
    { header: ['header'], full: ['summary','experience','education','skills','achievements','languages'] }, { skillsVariant: 'inline', languagesVariant: 'text' }),
  makeSchema('tech-modern', 'Tech Modern', 'sidebar-left', 'two-column-left', 'sidebar', 'midnight', 'jetbrains',
    { sidebar: ['header'], left: ['skills','languages','achievements'], right: ['summary','experience','education','projects'] }, { languagesVariant: 'bars' }),
];

@Injectable()
export class TemplatesService {
  private templates = new Map<string, TemplateSchema>();

  constructor() {
    BASE_TEMPLATES.forEach((t) => this.templates.set(t.id, t));
  }

  findAll(): TemplateSchema[] {
    return Array.from(this.templates.values());
  }

  findById(id: string): TemplateSchema | undefined {
    return this.templates.get(id);
  }

  findByCategory(category: string): TemplateSchema[] {
    return this.findAll().filter((t) => t.category === category);
  }

  /**
   * Multi-family composition: structural variants (zones, typography, presentation),
   * deduped without palette-only clones. Mirrors frontend bulk engine.
   */
  generateBulk(options?: { targetCount?: number }): TemplateSchema[] {
    const target = Math.min(300, Math.max(100, options?.targetCount ?? 120));
    return composeBulkFromBases(
      BASE_TEMPLATES as unknown as import('./bulk-composition').BulkTemplateSchema[],
      PALETTES,
      FONTS,
      FONT_SIZES,
      target,
    ) as TemplateSchema[];
  }
}
