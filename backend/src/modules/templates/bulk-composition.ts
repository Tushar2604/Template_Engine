/**
 * Structural bulk composition (mirrors frontend engine).
 * Kept standalone to avoid importing the Next.js app.
 */

export interface BulkTemplateColors {
  primary: string;
  secondary: string;
  text: string;
  background: string;
  accent?: string;
  muted?: string;
  sidebar?: string;
}

export interface BulkTemplateSchema {
  id: string;
  baseId?: string;
  name: string;
  category?: string;
  family?: string;
  styleTags?: string[];
  layoutSignature?: string;
  configHash?: string;
  atsSafe?: boolean;
  presentation?: BulkPresentation;
  layout: 'single-column' | 'two-column-left' | 'two-column-right';
  zones: Record<string, string[]>;
  style: {
    fontFamily: string;
    fontSize: { h1: string; h2: string; body: string; small: string };
    colors: BulkTemplateColors;
    spacing: 'compact' | 'normal' | 'spacious';
    headerStyle: string;
  };
  rules: { maxExperienceItems: number; maxProjects: number; maxSkills: number; truncateText: boolean; showPhoto: boolean };
  skillsVariant?: string;
  languagesVariant?: string;
}

export interface BulkPresentation {
  experienceStyle: 'classic' | 'timeline';
  educationStyle: 'compact' | 'detailed';
  projectStyle: 'inline' | 'cards';
  contactPlacement: 'default' | 'emphasized' | 'minimal';
  summaryPlacement: 'default' | 'prominent';
  accentBehavior: 'underline' | 'rule' | 'none';
  cardStyle: 'none' | 'soft' | 'hard';
}

type LayoutType = BulkTemplateSchema['layout'];
type HeaderStyle = string;
type FontKey = string;
type SpacingOption = 'compact' | 'normal' | 'spacious';

const SAFE_HEADERS: Record<LayoutType, string[]> = {
  'single-column': ['center', 'left', 'banner', 'sidebar', 'split'],
  'two-column-left': ['banner', 'split', 'sidebar', 'left', 'center'],
  'two-column-right': ['banner', 'split', 'left', 'center', 'sidebar'],
};

const FONT_CYCLE: FontKey[] = [
  'inter', 'roboto', 'poppins', 'lato', 'playfair', 'montserrat', 'raleway', 'jetbrains', 'sourceSans',
];

const SPACING_CYCLE: SpacingOption[] = ['compact', 'normal', 'spacious'];
const SKILLS_CYCLE = ['pills', 'grid', 'inline', 'bars'] as const;
const LANG_CYCLE = ['dots', 'bars', 'text'] as const;

const PALETTE_CYCLE = [
  'horizon', 'indigo', 'teal', 'emerald', 'midnight', 'ocean', 'violet', 'clinical', 'slate', 'amber',
  'forest', 'plum', 'copper', 'crimson', 'rose',
] as const;

function mulberry32(seed: number): () => number {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function stableZonesKey(zones: Record<string, string[]>): string {
  return Object.keys(zones)
    .sort()
    .map((k) => `${k}:${(zones[k] || []).join(',')}`)
    .join(';');
}

function fnv1a(input: string): string {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0).toString(36);
}

function seedFromString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (Math.imul(h, 31) + s.charCodeAt(i)) | 0;
  return h >>> 0;
}

function shuffle<T>(arr: T[], rng: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function permuteZones(base: Record<string, string[]>, rng: () => number): Record<string, string[]> {
  const out: Record<string, string[]> = {};
  Object.keys(base).forEach((key) => {
    const list = base[key];
    if (!list?.length) return;
    const heads = list.filter((x) => x === 'header');
    const rest = list.filter((x) => x !== 'header');
    out[key] = [...heads, ...shuffle(rest, rng)];
  });
  return out;
}

function hybridNudge(
  layout: LayoutType,
  zones: Record<string, string[]>,
  nudgeIdx: number,
): Record<string, string[]> {
  if (layout !== 'two-column-left' && layout !== 'two-column-right') return zones;
  const z = {
    ...zones,
    left: zones.left ? [...zones.left] : undefined,
    right: zones.right ? [...zones.right] : undefined,
  };
  const left = z.left?.filter((x) => x !== 'header') || [];
  const right = z.right?.filter((x) => x !== 'header') || [];
  if (left.length > 1 && right.length > 0 && nudgeIdx % 4 === 0) {
    const item = left.pop();
    if (item) right.unshift(item);
  } else if (right.length > 1 && left.length > 0 && nudgeIdx % 4 === 2) {
    const item = right.pop();
    if (item) left.unshift(item);
  }
  if (z.left) z.left = [...(zones.left?.filter((x) => x === 'header') || []), ...left];
  if (z.right) z.right = [...(zones.right?.filter((x) => x === 'header') || []), ...right];
  const out: Record<string, string[]> = { ...zones };
  if (z.left) out.left = z.left;
  if (z.right) out.right = z.right;
  return out;
}

function pickHeaderSafe(layout: LayoutType, baseHeader: string, attempt: number): string {
  const allowed = SAFE_HEADERS[layout] || [baseHeader];
  return allowed[(attempt + seedFromString(layout + baseHeader)) % allowed.length];
}

function presentationFor(attempt: number): BulkPresentation {
  const EXP = ['classic', 'timeline'] as const;
  const EDU = ['compact', 'detailed'] as const;
  const PROJ = ['inline', 'cards'] as const;
  const CONTACT = ['default', 'emphasized', 'minimal'] as const;
  const SUM = ['default', 'prominent'] as const;
  const ACC = ['underline', 'rule', 'none'] as const;
  const CARD = ['none', 'soft', 'hard'] as const;
  return {
    experienceStyle: EXP[attempt % 2],
    educationStyle: EDU[(attempt >> 2) % 2],
    projectStyle: PROJ[(attempt >> 4) % 2],
    contactPlacement: CONTACT[(attempt >> 5) % 3],
    summaryPlacement: SUM[(attempt >> 6) % 2],
    accentBehavior: ACC[(attempt >> 7) % 3],
    cardStyle: CARD[(attempt >> 8) % 3],
  };
}

function inferFamily(t: BulkTemplateSchema): string {
  const cat = t.category || '';
  if (cat.includes('sidebar')) return 'Dual-column · sidebar accent';
  if (cat === 'single-column' || t.layout === 'single-column') return 'Single-column narrative';
  if (cat === 'executive' || cat === 'banner') return 'Executive / banner lead';
  if (cat === 'academic' || cat === 'reference') return 'Academic & credential-forward';
  if (cat === 'tech') return 'Tech & product';
  if (t.layout === 'two-column-right') return 'Dual-column · right rail';
  if (t.layout === 'two-column-left') return 'Dual-column · structured main';
  return 'Professional hybrid';
}

function styleTags(layout: LayoutType, presentation: BulkPresentation, headerStyle: string, ats: boolean): string[] {
  const tags = [
    layout.replace(/-/g, ' '),
    `header:${headerStyle}`,
    `${presentation.experienceStyle} experience`,
    `${presentation.cardStyle} sections`,
  ];
  if (ats) tags.push('ATS-first');
  return tags;
}

function structuralSignature(parts: {
  shellId: string;
  zones: Record<string, string[]>;
  headerStyle: string;
  skills: string;
  lang: string;
  font: string;
  spacing: string;
  presentation: BulkPresentation;
}): string {
  return [
    parts.shellId,
    stableZonesKey(parts.zones),
    parts.headerStyle,
    parts.skills,
    parts.lang,
    parts.font,
    parts.spacing,
    parts.presentation.experienceStyle,
    parts.presentation.educationStyle,
    parts.presentation.projectStyle,
    parts.presentation.contactPlacement,
    parts.presentation.summaryPlacement,
    parts.presentation.accentBehavior,
    parts.presentation.cardStyle,
  ].join('|');
}

export function composeBulkFromBases(
  allBases: BulkTemplateSchema[],
  palettes: Record<string, BulkTemplateColors>,
  fonts: Record<string, string>,
  fontSizes: Record<SpacingOption, { h1: string; h2: string; body: string; small: string }>,
  targetCount = 120,
): BulkTemplateSchema[] {
  const target = Math.min(300, Math.max(10, targetCount));
  const seenStructural = new Set<string>();
  const results: BulkTemplateSchema[] = [];
  if (!allBases.length) return results;

  let attempt = 0;
  const maxAttempts = 250000;
  const n = allBases.length;

  while (results.length < target && attempt < maxAttempts) {
    attempt++;
    const base = allBases[(attempt - 1) % n];
    const shellIdx = Math.floor((attempt - 1) / n);

    const rng = mulberry32((attempt * 9973) ^ seedFromString(base.id));
    let zones = permuteZones(base.zones, rng);
    zones = hybridNudge(base.layout, zones, shellIdx + attempt);

    const headerStyle = pickHeaderSafe(base.layout, base.style.headerStyle, shellIdx + attempt);
    const font = FONT_CYCLE[(shellIdx + attempt) % FONT_CYCLE.length];
    const spacing = SPACING_CYCLE[(shellIdx * 2 + attempt) % SPACING_CYCLE.length];
    const skillsVariant = SKILLS_CYCLE[(shellIdx + attempt * 3) % SKILLS_CYCLE.length];
    const languagesVariant = LANG_CYCLE[(shellIdx * 5 + attempt) % LANG_CYCLE.length];
    const presentation = presentationFor(shellIdx + attempt * 11);

    const struct = structuralSignature({
      shellId: base.id,
      zones,
      headerStyle,
      skills: skillsVariant,
      lang: languagesVariant,
      font,
      spacing,
      presentation,
    });

    if (seenStructural.has(struct)) continue;
    seenStructural.add(struct);

    const paletteKey = PALETTE_CYCLE[results.length % PALETTE_CYCLE.length];
    const palette = palettes[paletteKey] || palettes['horizon'];
    const configHash = fnv1a(struct + '|' + paletteKey).slice(0, 11);
    const family = inferFamily(base);
    const ats =
      base.layout === 'single-column' &&
      (headerStyle === 'left' || headerStyle === 'center' || headerStyle === 'split') &&
      presentation.cardStyle === 'none';
    const tags = styleTags(base.layout, presentation, headerStyle, ats);

    results.push({
      ...base,
      id: `bulk-${configHash}`,
      baseId: base.id,
      name: `${base.name.split('·')[0].trim()} · ${family.split('·')[0].trim()} · ${tags[2]}`,
      family,
      styleTags: tags,
      layoutSignature: stableZonesKey(zones) + '|' + base.layout + '|' + headerStyle,
      configHash,
      atsSafe: ats,
      presentation,
      zones,
      style: {
        ...base.style,
        headerStyle,
        fontFamily: fonts[font] || fonts['inter'] || 'Inter, system-ui, sans-serif',
        fontSize: fontSizes[spacing],
        colors: { ...palette },
        spacing,
      },
      skillsVariant,
      languagesVariant,
      rules: { ...base.rules },
    });
  }

  return results;
}
