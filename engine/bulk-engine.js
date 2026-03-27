/**
 * Enhanced Bulk CV Generator
 * ──────────────────────────────────────────────────────────────
 * 20 layout bases × 15 color themes × optional font/spacing
 * overrides = 300 base templates (up to 900+ with font combos).
 *
 * Each output HTML file:
 *   • embeds resume JSON in <script id="cv-embedded-data">
 *   • injects a <style id="cv-bulk-theme"> with CSS custom props
 *   • optionally overrides font-family via a second style block
 *   • references ../engine/binder.js for offline use from ZIP
 */
(function (global) {
  // ── 20 layout bases (10 original + 10 new) ────────────────────
  var BULK_LAYOUTS = [
    // Original layouts
    { id: 'jason-reed',         file: 'templates/jason-reed.html' },
    { id: 'aiden-williams',     file: 'templates/aiden-williams.html' },
    { id: 'brandon-hale',       file: 'templates/brandon-hale.html' },
    { id: 'maeve-sage',         file: 'templates/maeve-delaney-sage.html' },
    { id: 'mason-turner',       file: 'templates/mason-turner.html' },
    { id: 'isabella-adams',     file: 'templates/isabella-adams.html' },
    { id: 'violet-rodriguez',   file: 'templates/violet-rodriguez.html' },
    { id: 'elena-whitaker',     file: 'templates/elena-whitaker.html' },
    { id: 'ethan-smith',        file: 'templates/ethan-smith.html' },
    { id: 'grace-jackson',      file: 'templates/grace-jackson.html' },
    // New Enhancv/Resume.io inspired layouts
    { id: 'classic-executive',  file: 'templates/classic-executive.html' },
    { id: 'modern-minimal',     file: 'templates/modern-minimal.html' },
    { id: 'compact-professional', file: 'templates/compact-professional.html' },
    { id: 'creative-sidebar',   file: 'templates/creative-sidebar.html' },
    { id: 'timeline-modern',    file: 'templates/timeline-modern.html' },
    { id: 'card-style',         file: 'templates/card-style.html' },
    { id: 'split-header',       file: 'templates/split-header.html' },
    { id: 'bold-header',        file: 'templates/bold-header.html' },
    { id: 'elegant-serif',      file: 'templates/elegant-serif.html' },
    { id: 'tech-modern',        file: 'templates/tech-modern.html' }
  ];

  // ── 15 color theme presets ─────────────────────────────────────
  var BULK_PRESETS = [
    // Original 10
    { id: 'horizon',   name: 'Horizon Blue',    sidebar: '#1e3a5f', accent: '#2563eb', accent2: '#3b82f6', muted: '#6b7280', teal: '#0f766e', cyan: '#0891b2', ink: '#111827' },
    { id: 'clinical',  name: 'Clinical Azure',  sidebar: '#1a3652', accent: '#007bff', accent2: '#5dade2', muted: '#757575', teal: '#004d4d', cyan: '#00a8c5', ink: '#000000' },
    { id: 'indigo',    name: 'Deep Indigo',     sidebar: '#312e81', accent: '#4f46e5', accent2: '#818cf8', muted: '#64748b', teal: '#134e4a', cyan: '#06b6d4', ink: '#0f172a' },
    { id: 'rose',      name: 'Rose Executive',  sidebar: '#9f1239', accent: '#e11d48', accent2: '#fb7185', muted: '#78716c', teal: '#9d174d', cyan: '#f43f5e', ink: '#1c1917' },
    { id: 'amber',     name: 'Amber Ops',       sidebar: '#78350f', accent: '#d97706', accent2: '#fbbf24', muted: '#78716c', teal: '#b45309', cyan: '#eab308', ink: '#292524' },
    { id: 'emerald',   name: 'Emerald',         sidebar: '#064e3b', accent: '#059669', accent2: '#34d399', muted: '#6b7280', teal: '#047857', cyan: '#10b981', ink: '#022c22' },
    { id: 'violet',    name: 'Violet',          sidebar: '#4c1d95', accent: '#7c3aed', accent2: '#a78bfa', muted: '#71717a', teal: '#5b21b6', cyan: '#8b5cf6', ink: '#18181b' },
    { id: 'slate',     name: 'Slate Pro',       sidebar: '#1e293b', accent: '#475569', accent2: '#94a3b8', muted: '#64748b', teal: '#334155', cyan: '#64748b', ink: '#0f172a' },
    { id: 'teal',      name: 'Teal Academic',   sidebar: '#115e59', accent: '#0d9488', accent2: '#2dd4bf', muted: '#57534e', teal: '#0f766e', cyan: '#14b8a6', ink: '#1c1917' },
    { id: 'crimson',   name: 'Crimson',         sidebar: '#7f1d1d', accent: '#dc2626', accent2: '#f87171', muted: '#737373', teal: '#991b1b', cyan: '#ef4444', ink: '#171717' },
    // 5 NEW themes
    { id: 'ocean',     name: 'Ocean Depths',    sidebar: '#0c4a6e', accent: '#0284c7', accent2: '#38bdf8', muted: '#64748b', teal: '#155e75', cyan: '#22d3ee', ink: '#0f172a' },
    { id: 'forest',    name: 'Forest Canopy',   sidebar: '#14532d', accent: '#16a34a', accent2: '#4ade80', muted: '#6b7280', teal: '#166534', cyan: '#22c55e', ink: '#052e16' },
    { id: 'plum',      name: 'Plum Premium',    sidebar: '#581c87', accent: '#9333ea', accent2: '#c084fc', muted: '#71717a', teal: '#6b21a8', cyan: '#a855f7', ink: '#1e1b4b' },
    { id: 'copper',    name: 'Copper Warm',     sidebar: '#7c2d12', accent: '#ea580c', accent2: '#fb923c', muted: '#78716c', teal: '#9a3412', cyan: '#f97316', ink: '#1c1917' },
    { id: 'midnight',  name: 'Midnight Blue',   sidebar: '#172554', accent: '#2563eb', accent2: '#60a5fa', muted: '#64748b', teal: '#1e3a8a', cyan: '#3b82f6', ink: '#0f172a' }
  ];

  // ── 5 font families for variation ──────────────────────────────
  var BULK_FONTS = [
    { id: 'inter',       name: 'Inter',           css: "Inter, system-ui, sans-serif",                                                     import: '' },
    { id: 'roboto',      name: 'Roboto',          css: "Roboto, system-ui, sans-serif",                                                    import: "https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap" },
    { id: 'poppins',     name: 'Poppins',         css: "Poppins, system-ui, sans-serif",                                                   import: "https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" },
    { id: 'lato',        name: 'Lato',            css: "Lato, system-ui, sans-serif",                                                      import: "https://fonts.googleapis.com/css2?family=Lato:wght@300;400;700;900&display=swap" },
    { id: 'source-sans', name: 'Source Sans 3',   css: "'Source Sans 3', system-ui, sans-serif",                                            import: "https://fonts.googleapis.com/css2?family=Source+Sans+3:wght@300;400;600;700&display=swap" }
  ];

  // ── 3 spacing variants ─────────────────────────────────────────
  var BULK_SPACING = [
    { id: 'compact',  name: 'Compact',  scale: 0.85 },
    { id: 'normal',   name: 'Normal',   scale: 1.0  },
    { id: 'spacious', name: 'Spacious', scale: 1.15 }
  ];

  // ── Helpers ────────────────────────────────────────────────────
  function buildThemeCss(p) {
    return ':root{' +
      '--t-sidebar:' + p.sidebar + ';' +
      '--t-accent:' + p.accent + ';' +
      '--t-muted:' + p.muted + ';' +
      '--t-accent-2:' + p.accent2 + ';' +
      '--t-teal:' + p.teal + ';' +
      '--t-cyan:' + p.cyan + ';' +
      '--t-ink:' + p.ink + ';}';
  }

  function buildFontCss(font) {
    return 'body{font-family:' + font.css + '!important;}';
  }

  function buildSpacingCss(spacing) {
    if (spacing.scale === 1.0) return '';
    var factor = spacing.scale;
    return '.sheet{padding:' + (28 * factor) + 'px ' + (28 * factor) + 'px!important;}' +
           '.sec,.main-sec,.sb-sec{margin-bottom:' + (20 * factor) + 'px!important;}' +
           '.exp,.exp-block{margin-bottom:' + (16 * factor) + 'px!important;}';
  }

  function injectTheme(html, preset) {
    var css = '<style id="cv-bulk-theme">' + buildThemeCss(preset) + '</style>';
    if (/<style id="cv-bulk-theme">[\s\S]*?<\/style>/.test(html)) {
      return html.replace(/<style id="cv-bulk-theme">[\s\S]*?<\/style>/, css);
    }
    return html.replace(/<head([^>]*)>/i, '<head$1>' + css);
  }

  function injectFont(html, font) {
    var css = '<style id="cv-bulk-font">' + buildFontCss(font) + '</style>';
    if (font.import) {
      css = '<link rel="stylesheet" href="' + font.import + '" />' + css;
    }
    if (/<style id="cv-bulk-font">[\s\S]*?<\/style>/.test(html)) {
      html = html.replace(/<style id="cv-bulk-font">[\s\S]*?<\/style>/, '');
    }
    return html.replace(/<\/head>/i, css + '</head>');
  }

  function injectSpacing(html, spacing) {
    var css = buildSpacingCss(spacing);
    if (!css) return html;
    var tag = '<style id="cv-bulk-spacing">' + css + '</style>';
    return html.replace(/<\/head>/i, tag + '</head>');
  }

  function injectEmbeddedData(html, jsonObj) {
    var raw = JSON.stringify(jsonObj);
    var safe = raw.replace(/</g, '\\u003c');
    var clos = '</' + 'script>';
    var tag = '<script type="application/json" id="cv-embedded-data">' + safe + clos;
    return html.replace(/<\/head>/i, tag + '</head>');
  }

  function pad(n, w) {
    var s = String(n);
    while (s.length < w) s = '0' + s;
    return s;
  }

  // ── Expose globals ─────────────────────────────────────────────
  global.CV_BULK_LAYOUTS  = BULK_LAYOUTS;
  global.CV_BULK_PRESETS  = BULK_PRESETS;
  global.CV_BULK_FONTS    = BULK_FONTS;
  global.CV_BULK_SPACING  = BULK_SPACING;

  // Default total: 20 layouts × 15 themes = 300
  global.CV_BULK_TOTAL      = BULK_LAYOUTS.length * BULK_PRESETS.length;
  // Extended total: 20 × 15 × 5 fonts = 1500 (when font mode on)
  global.CV_BULK_TOTAL_FULL = BULK_LAYOUTS.length * BULK_PRESETS.length * BULK_FONTS.length;

  global.cvBulkBuildThemeCss   = buildThemeCss;
  global.cvBulkInjectTheme     = injectTheme;
  global.cvBulkInjectEmbeddedData = injectEmbeddedData;

  /**
   * Generate template files.
   * @param {object} options
   * @param {boolean} [options.includeFonts=false]   – multiply by 5 font families
   * @param {boolean} [options.includeSpacing=false]  – multiply by 3 spacing variants
   * @param {function(number,string):void} [options.onProgress]
   * @returns {Promise<{ name: string, html: string }[]>}
   */
  global.cvBulkGenerateFiles = async function (options) {
    options = options || {};
    var onProgress = options.onProgress || function () {};
    var dataUrl    = options.dataUrl || 'data/sample-resume.json';
    var incFonts   = !!options.includeFonts;
    var incSpacing = !!options.includeSpacing;

    var fonts   = incFonts   ? BULK_FONTS   : [BULK_FONTS[0]];   // default: Inter only
    var spacing = incSpacing ? BULK_SPACING  : [BULK_SPACING[1]]; // default: normal only

    var resumeRes = await fetch(dataUrl);
    var resume    = await resumeRes.json();
    var cache     = {};
    var out       = [];
    var counter   = 0;

    var total = BULK_LAYOUTS.length * BULK_PRESETS.length * fonts.length * spacing.length;

    for (var li = 0; li < BULK_LAYOUTS.length; li++) {
      var layout = BULK_LAYOUTS[li];
      if (!cache[layout.file]) {
        var resp = await fetch(layout.file);
        cache[layout.file] = await resp.text();
      }
      for (var pi = 0; pi < BULK_PRESETS.length; pi++) {
        for (var fi = 0; fi < fonts.length; fi++) {
          for (var si = 0; si < spacing.length; si++) {
            var preset  = BULK_PRESETS[pi];
            var font    = fonts[fi];
            var space   = spacing[si];
            var html    = cache[layout.file];

            html = injectTheme(html, preset);
            if (incFonts)   html = injectFont(html, font);
            if (incSpacing) html = injectSpacing(html, space);
            html = injectEmbeddedData(html, resume);

            counter++;
            var suffix = layout.id + '-' + preset.id;
            if (incFonts)   suffix += '-' + font.id;
            if (incSpacing) suffix += '-' + space.id;
            var name = 'cv-' + pad(counter, 4) + '-' + suffix + '.html';

            out.push({ name: name, html: html });
            onProgress(counter, name);
          }
        }
      }
    }
    return out;
  };

  /**
   * Build a ZIP blob with generated templates.
   * @param {object} options — same as cvBulkGenerateFiles; requires options.JSZip
   */
  global.cvBulkBuildZipBlob = async function (options) {
    var JSZip = options.JSZip;
    if (!JSZip) throw new Error('cvBulkBuildZipBlob: pass options.JSZip');
    var files = await global.cvBulkGenerateFiles(options);
    var zip = new JSZip();
    var binderText = await fetch('engine/binder.js').then(function (r) { return r.text(); });
    zip.file('engine/binder.js', binderText);
    files.forEach(function (f) {
      zip.file('export/' + f.name, f.html);
    });
    return zip.generateAsync({ type: 'blob' });
  };
})(window);
