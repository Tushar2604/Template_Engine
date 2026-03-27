/**
 * Template registry — all 22 layout bases for gallery & bulk integration.
 * 12 original premium + 10 new Enhancv/Resume.io-inspired layouts.
 */
(function (global) {
  global.CV_TEMPLATE_REGISTRY = [
    // ── Original 12 premium layouts ──────────────────────────────────
    { id: 'jason-reed',       name: 'Jason Reed — Navy Sidebar Left',         file: 'templates/jason-reed.html',        palette: ['#1a3652','#3897f0'],        category: 'sidebar-left' },
    { id: 'aiden-williams',   name: 'Aiden Williams — Navy Sidebar Right',    file: 'templates/aiden-williams.html',    palette: ['#1a2a3a','#3498db'],        category: 'sidebar-right' },
    { id: 'brandon-hale',     name: 'Brandon Hale — Full Bleed Header',       file: 'templates/brandon-hale.html',      palette: ['#1e3a5f','#5dade2'],        category: 'banner' },
    { id: 'maeve-sage',       name: 'Maeve Delaney — Sage Accent',            file: 'templates/maeve-delaney-sage.html',palette: ['#98D8B1','#2d3748'],        category: 'sidebar-left' },
    { id: 'maeve-forest',     name: 'Maeve Delaney — Forest Green',           file: 'templates/maeve-delaney-forest.html',palette: ['#2D5A43','#A8E6CF'],      category: 'sidebar-left' },
    { id: 'mason-turner',     name: 'Mason Turner — Single Column',           file: 'templates/mason-turner.html',      palette: ['#2563eb','#111827'],        category: 'single-column' },
    { id: 'isabella-adams',   name: 'Isabella Adams — Waves Two Column',      file: 'templates/isabella-adams.html',    palette: ['#1A3B5D','#4A90E2'],        category: 'two-column' },
    { id: 'violet-rodriguez', name: 'Violet Rodriguez — Asymmetric Grid',     file: 'templates/violet-rodriguez.html',  palette: ['#3b82f6','#000000'],        category: 'two-column' },
    { id: 'elena-whitaker',   name: 'Elena Whitaker — Academic Single Column',file: 'templates/elena-whitaker.html',    palette: ['#004d4d','#000000'],        category: 'single-column' },
    { id: 'ethan-smith',      name: 'Ethan Smith — CXO Two Column',           file: 'templates/ethan-smith.html',       palette: ['#007bff','#000000'],        category: 'two-column' },
    { id: 'grace-jackson',    name: 'Grace Jackson — CTO Cyan Sidebar',       file: 'templates/grace-jackson.html',     palette: ['#00a8c5','#333333'],        category: 'sidebar-left' },
    { id: 'portfolio-pro',    name: 'Portfolio — Case Study Grid',             file: 'templates/portfolio-pro.html',     palette: ['#0f172a','#6366f1'],        category: 'two-column' },

    // ── New 10 Enhancv/Resume.io-inspired layouts ───────────────────
    { id: 'classic-executive',  name: 'Classic Executive — Serif Refined',           file: 'templates/classic-executive.html',  palette: ['#2563eb','#111827'],  category: 'single-column' },
    { id: 'modern-minimal',     name: 'Modern Minimal — Ultra Clean',                file: 'templates/modern-minimal.html',     palette: ['#2563eb','#f3f4f6'],  category: 'single-column' },
    { id: 'compact-professional',name: 'Compact Professional — Dense Two-Column',    file: 'templates/compact-professional.html',palette: ['#2563eb','#3b82f6'], category: 'two-column' },
    { id: 'creative-sidebar',   name: 'Creative Sidebar — Gradient Accent',          file: 'templates/creative-sidebar.html',   palette: ['#1a3652','#3b82f6'],  category: 'sidebar-left' },
    { id: 'timeline-modern',    name: 'Timeline Modern — Chronological',             file: 'templates/timeline-modern.html',    palette: ['#2563eb','#f3f4f6'],  category: 'single-column' },
    { id: 'card-style',         name: 'Card Style — Modern Cards',                   file: 'templates/card-style.html',         palette: ['#2563eb','#3b82f6'],  category: 'single-column' },
    { id: 'split-header',       name: 'Split Header — Name Left Contact Right',      file: 'templates/split-header.html',       palette: ['#2563eb','#111827'],  category: 'two-column' },
    { id: 'bold-header',        name: 'Bold Header — Dark Banner Executive',         file: 'templates/bold-header.html',        palette: ['#1a3652','#2563eb'],  category: 'banner' },
    { id: 'elegant-serif',      name: 'Elegant Serif — Centered Refined',            file: 'templates/elegant-serif.html',      palette: ['#2563eb','#f5f0eb'],  category: 'single-column' },
    { id: 'tech-modern',        name: 'Tech Modern — Developer Dark Sidebar',        file: 'templates/tech-modern.html',        palette: ['#0f172a','#3b82f6'],  category: 'sidebar-left' }
  ];
})(window);
