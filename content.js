(() => {
  'use strict';

  // ─── State ──────────────────────────────────────────────────────────
  let overlayVisible = false;
  let activeTab = 'structure';
  let sections = [
    { id: crypto.randomUUID(), label: 'Role', value: '', placeholder: 'Describe the target audience...' },
    { id: crypto.randomUUID(), label: 'Context', value: '', placeholder: 'e.g. Professional, Friendly, Witty...' },
  ];
  let dragSrcIndex = null;

  // ─── Preset Labels ─────────────────────────────────────────────────
  const PRESET_LABELS = [
    'ROLE', 'CONTEXT', 'TASK', 'GOAL', 'TONE', 'FORMAT',
    'LENGTH', 'AUDIENCE', 'STYLE', 'CONSTRAINTS', 'EXAMPLES',
    'INPUT', 'OUTPUT', 'INSTRUCTIONS', 'PERSONA', 'SCENARIO',
    'TOPIC', 'KEYWORDS', 'LANGUAGE', 'PERSPECTIVE', 'RULES',
    'BACKGROUND', 'REQUIREMENTS', 'STEPS', 'CRITERIA', 'AVOID', 'INCLUDE', 'EXCLUDE', 'LIMIT'
  ];

  // ─── Label Descriptions (for info tooltip) ───────────────────────────
  const LABEL_DESCRIPTIONS = {
    ROLE: 'Define who the AI should act as (e.g. expert, teacher, developer)',
    CONTEXT: 'Provide background information or situation details',
    TASK: 'Describe the specific task or action to perform',
    GOAL: 'State the desired outcome or objective',
    TONE: 'Set the communication style (e.g. formal, casual, witty)',
    FORMAT: 'Specify the output format (e.g. list, table, essay)',
    LENGTH: 'Define the expected length or word count',
    AUDIENCE: 'Describe who will read or use the output',
    STYLE: 'Set the writing or response style',
    CONSTRAINTS: 'List any limitations or restrictions to follow',
    EXAMPLES: 'Provide sample inputs/outputs for reference',
    INPUT: 'Paste or describe the data/content to process',
    OUTPUT: 'Describe the expected result or deliverable',
    INSTRUCTIONS: 'Step-by-step directions for the AI to follow',
    PERSONA: 'Define a specific character or personality to adopt',
    SCENARIO: 'Describe a hypothetical situation or use case',
    TOPIC: 'Specify the main subject or theme',
    KEYWORDS: 'List important words or phrases to include',
    LANGUAGE: 'Specify the programming or natural language',
    PERSPECTIVE: 'Define the viewpoint or angle to approach from',
    RULES: 'Set hard rules the AI must not break',
    BACKGROUND: 'Provide relevant history or prerequisite knowledge',
    REQUIREMENTS: 'List must-have features or conditions',
    STEPS: 'Break down the task into ordered steps',
    CRITERIA: 'Define success metrics or evaluation standards',
    AVOID: 'List things to exclude or stay away from',
    INCLUDE: 'List things that must be present in the output',
    EXCLUDE: 'Specify content or patterns to omit',
    LIMIT: 'Set boundaries on scope, length, or complexity',
  };

  // ─── Prompt Templates ──────────────────────────────────────────────
  const PROMPT_TEMPLATES = [
    {
      name: 'Code Generation',
      icon: '💻',
      desc: 'Generate code with clear specs',
      sections: [
        { label: 'ROLE', placeholder: 'e.g. Senior Python Developer' },
        { label: 'TASK', placeholder: 'What code to write...' },
        { label: 'LANGUAGE', placeholder: 'e.g. Python, JavaScript, TypeScript...' },
        { label: 'REQUIREMENTS', placeholder: 'Functional requirements...' },
        { label: 'CONSTRAINTS', placeholder: 'e.g. No external libraries, must be async...' },
        { label: 'OUTPUT', placeholder: 'e.g. Clean, commented code with examples' },
      ],
    },
    {
      name: 'Debugging',
      icon: '🔧',
      desc: 'Diagnose and fix code issues',
      sections: [
        { label: 'ROLE', placeholder: 'e.g. Debugging Expert' },
        { label: 'CONTEXT', placeholder: 'What the code is supposed to do...' },
        { label: 'INPUT', placeholder: 'Paste the buggy code...' },
        { label: 'STEPS', placeholder: 'Steps to reproduce the issue...' },
        { label: 'CONSTRAINTS', placeholder: 'e.g. Don\'t change the API signature...' },
        { label: 'OUTPUT', placeholder: 'e.g. Fixed code + explanation of the bug' },
      ],
    },
    {
      name: 'Learning & Explanation',
      icon: '📚',
      desc: 'Understand concepts deeply',
      sections: [
        { label: 'ROLE', placeholder: 'e.g. Expert Teacher, Tutor' },
        { label: 'TOPIC', placeholder: 'What to learn or explain...' },
        { label: 'AUDIENCE', placeholder: 'e.g. Beginner, Intermediate, Expert' },
        { label: 'STYLE', placeholder: 'e.g. Step-by-step, Analogy-based, Visual...' },
        { label: 'INCLUDE', placeholder: 'e.g. Examples, diagrams, quizzes...' },
        { label: 'LENGTH', placeholder: 'e.g. Detailed, Brief overview...' },
      ],
    },
    {
      name: 'Content Writing',
      icon: '✍️',
      desc: 'Blog posts, articles, essays',
      sections: [
        { label: 'ROLE', placeholder: 'e.g. SEO Content Writer' },
        { label: 'TOPIC', placeholder: 'What to write about...' },
        { label: 'AUDIENCE', placeholder: 'Who is reading this...' },
        { label: 'TONE', placeholder: 'e.g. Professional, Casual, Persuasive...' },
        { label: 'FORMAT', placeholder: 'e.g. Blog post with headings, listicle...' },
        { label: 'LENGTH', placeholder: 'e.g. 800 words, 3 paragraphs...' },
        { label: 'KEYWORDS', placeholder: 'SEO keywords to include...' },
      ],
    },
    {
      name: 'Email Drafting',
      icon: '✉️',
      desc: 'Professional or casual emails',
      sections: [
        { label: 'ROLE', placeholder: 'e.g. Business Professional' },
        { label: 'CONTEXT', placeholder: 'What is this email about...' },
        { label: 'AUDIENCE', placeholder: 'Who are you emailing...' },
        { label: 'TONE', placeholder: 'e.g. Formal, Friendly, Urgent...' },
        { label: 'INCLUDE', placeholder: 'Key points to mention...' },
        { label: 'LENGTH', placeholder: 'e.g. Short and concise, Detailed...' },
      ],
    },
    {
      name: 'Marketing Copy',
      icon: '📣',
      desc: 'Ads, landing pages, social posts',
      sections: [
        { label: 'ROLE', placeholder: 'e.g. Marketing Copywriter' },
        { label: 'TASK', placeholder: 'e.g. Write a landing page headline...' },
        { label: 'AUDIENCE', placeholder: 'Target demographic...' },
        { label: 'TONE', placeholder: 'e.g. Bold, Inspiring, Playful...' },
        { label: 'GOAL', placeholder: 'e.g. Drive sign-ups, increase CTR...' },
        { label: 'CONSTRAINTS', placeholder: 'e.g. Max 150 characters, include CTA...' },
      ],
    },
    {
      name: 'Data Analysis',
      icon: '📊',
      desc: 'Analyze and interpret data',
      sections: [
        { label: 'ROLE', placeholder: 'e.g. Data Analyst, Statistician' },
        { label: 'CONTEXT', placeholder: 'Background on the dataset...' },
        { label: 'INPUT', placeholder: 'Describe or paste the data...' },
        { label: 'TASK', placeholder: 'What analysis to perform...' },
        { label: 'OUTPUT', placeholder: 'e.g. Charts, summary, insights...' },
        { label: 'FORMAT', placeholder: 'e.g. Table, bullet points, report...' },
      ],
    },
    {
      name: 'UI/UX Design',
      icon: '🎨',
      desc: 'Design briefs and feedback',
      sections: [
        { label: 'ROLE', placeholder: 'e.g. Senior UI/UX Designer' },
        { label: 'TASK', placeholder: 'What to design or review...' },
        { label: 'AUDIENCE', placeholder: 'End users of the product...' },
        { label: 'STYLE', placeholder: 'e.g. Minimal, Material Design, Glassmorphism...' },
        { label: 'CONSTRAINTS', placeholder: 'e.g. Mobile-first, WCAG accessible...' },
        { label: 'INCLUDE', placeholder: 'e.g. Color palette, typography, layout...' },
      ],
    },
    {
      name: 'Interview Prep',
      icon: '🎯',
      desc: 'Practice questions and answers',
      sections: [
        { label: 'ROLE', placeholder: 'e.g. Tech Interview Coach' },
        { label: 'TOPIC', placeholder: 'e.g. React, System Design, Behavioral...' },
        { label: 'CONTEXT', placeholder: 'e.g. FAANG interview, Mid-level position...' },
        { label: 'FORMAT', placeholder: 'e.g. Question + detailed answer' },
        { label: 'CONSTRAINTS', placeholder: 'e.g. 5 questions, increasing difficulty...' },
        { label: 'INCLUDE', placeholder: 'e.g. Follow-up questions, tips...' },
      ],
    },
    {
      name: 'Summarization',
      icon: '📋',
      desc: 'Summarize documents and text',
      sections: [
        { label: 'ROLE', placeholder: 'e.g. Research Assistant' },
        { label: 'INPUT', placeholder: 'Paste text to summarize...' },
        { label: 'FORMAT', placeholder: 'e.g. Bullet points, paragraph, TL;DR...' },
        { label: 'LENGTH', placeholder: 'e.g. 3 sentences, 100 words...' },
        { label: 'INCLUDE', placeholder: 'e.g. Key takeaways, action items...' },
      ],
    },
    {
      name: 'Translation',
      icon: '🌐',
      desc: 'Translate with context awareness',
      sections: [
        { label: 'ROLE', placeholder: 'e.g. Professional Translator' },
        { label: 'INPUT', placeholder: 'Text to translate...' },
        { label: 'LANGUAGE', placeholder: 'e.g. English to Spanish' },
        { label: 'TONE', placeholder: 'e.g. Formal, Conversational, Literary...' },
        { label: 'CONTEXT', placeholder: 'Who is the translation for...' },
        { label: 'AVOID', placeholder: 'e.g. Literal translations, slang...' },
      ],
    },
    {
      name: 'Brainstorming',
      icon: '💡',
      desc: 'Generate ideas and solutions',
      sections: [
        { label: 'ROLE', placeholder: 'e.g. Creative Strategist' },
        { label: 'TOPIC', placeholder: 'What to brainstorm about...' },
        { label: 'GOAL', placeholder: 'What are you trying to achieve...' },
        { label: 'CONSTRAINTS', placeholder: 'e.g. Budget, time, tech stack...' },
        { label: 'FORMAT', placeholder: 'e.g. 10 ideas with pros/cons...' },
        { label: 'PERSPECTIVE', placeholder: 'e.g. User-centric, business-first...' },
      ],
    },
  ];

  // ─── SVG Icons ─────────────────────────────────────────────────────
  const ICONS = {
    grip: `<svg width="10" height="14" viewBox="0 0 10 14" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><circle cx="2" cy="1.5" r="1.5"/><circle cx="8" cy="1.5" r="1.5"/><circle cx="2" cy="7" r="1.5"/><circle cx="8" cy="7" r="1.5"/><circle cx="2" cy="12.5" r="1.5"/><circle cx="8" cy="12.5" r="1.5"/></svg>`,
    trash: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>`,
    chevronDown: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg>`,
    merge: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14"/><path d="M5 12l7-7 7 7"/></svg>`,
    copy: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>`,
    send: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>`,
    toggle: `<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="5" rx="1.5"/><rect x="3" y="10" width="18" height="5" rx="1.5"/><rect x="3" y="17" width="18" height="5" rx="1.5"/></svg>`,
    reset: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 1 3 7"/><polyline points="3 22 3 16 9 16"/></svg>`,
    newDoc: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/></svg>`,
  };

  // ─── Shadow DOM Host ───────────────────────────────────────────────
  const host = document.createElement('div');
  host.id = 'promptdeck-host';
  host.style.cssText = 'position:fixed;top:0;left:0;width:0;height:0;z-index:99999;pointer-events:none;';
  document.body.appendChild(host);
  const shadow = host.attachShadow({ mode: 'open' });

  // ─── Styles ────────────────────────────────────────────────────────
  const style = document.createElement('style');
  style.textContent = `
    :host { all: initial; }
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    ::-webkit-scrollbar { width: 5px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: rgba(255,255,255,.15); border-radius: 3px; }

    .overlay-enter { animation: slideUp .28s cubic-bezier(.16,1,.3,1) forwards; }
    .overlay-exit  { animation: slideDown .2s cubic-bezier(.7,0,.84,0) forwards; }
    @keyframes slideUp {
      from { transform: translateX(-50%) translateY(100%); opacity: 0; }
      to   { transform: translateX(-50%) translateY(0); opacity: 1; }
    }
    @keyframes slideDown {
      from { transform: translateX(-50%) translateY(0); opacity: 1; }
      to   { transform: translateX(-50%) translateY(100%); opacity: 0; }
    }

    /* ── Overlay shell ── */
    .pd-overlay {
      position: fixed;
      bottom: 0;
      left: 60%;
      transform: translateX(-50%);
      width: 830px;
      max-width: 96vw;
      height: 540px;
      display: none;
      flex-direction: column;
      background: #2d2d3a;
      border-radius: 18px 18px 0 0;
      border: 1px solid rgba(255,255,255,.08);
      border-bottom: none;
      box-shadow: 0 -16px 60px rgba(0,0,0,.6);
      color: #e0e0e0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 13px;
      pointer-events: auto;
      overflow: hidden;
    }

    /* ── Drag pill ── */
    .pd-drag-handle {
      display: flex;
      justify-content: center;
      padding: 12px 0 6px;
      cursor: grab;
      flex-shrink: 0;
    }
    .pd-drag-handle-bar {
      width: 44px; height: 4px;
      border-radius: 2px;
      background: rgba(255,255,255,.2);
    }

    /* ── Tabs ── */
    .pd-tabs-row {
      display: flex;
      align-items: center;
      border-bottom: 1px solid rgba(255,255,255,.08);
      padding: 0 20px;
      flex-shrink: 0;
    }
    .pd-tab {
      position: relative;
      padding: 10px 16px 12px;
      font-size: 13px;
      font-weight: 500;
      color: rgba(255,255,255,.45);
      background: transparent;
      border: none;
      border-bottom: 2px solid transparent;
      margin-bottom: -1px;
      cursor: pointer;
      transition: color .15s;
      font-family: inherit;
      white-space: nowrap;
    }
    .pd-tab.active { color: #fff; border-bottom-color: #3b82f6; }
    .pd-tab:hover:not(.active) { color: rgba(255,255,255,.7); }
    .pd-tabs-right { margin-left: auto; display: flex; align-items: center; gap: 2px; }
    .pd-header-icon-btn {
      background: transparent;
      border: none;
      color: rgba(255,255,255,.4);
      cursor: pointer;
      padding: 6px;
      display: flex;
      align-items: center;
      border-radius: 6px;
      transition: background .15s, color .15s;
      position: relative;
    }
    .pd-header-icon-btn:hover { background: rgba(255,255,255,.08); color: #fff; }
    .pd-header-icon-btn .pd-tooltip {
      display: none;
      position: absolute;
      bottom: -28px;
      left: 50%;
      transform: translateX(-50%);
      background: #111;
      color: #ccc;
      font-size: 10px;
      padding: 3px 8px;
      border-radius: 4px;
      white-space: nowrap;
      pointer-events: none;
    }
    .pd-header-icon-btn:hover .pd-tooltip { display: block; }

    /* ── Reset menu ── */
    .pd-reset-menu {
      display: none;
      position: absolute;
      top: 100%;
      right: 0;
      margin-top: 4px;
      background: #2a2a36;
      border: 1px solid rgba(255,255,255,.12);
      border-radius: 8px;
      box-shadow: 0 8px 24px rgba(0,0,0,.5);
      overflow: hidden;
      z-index: 10;
      min-width: 170px;
    }
    .pd-reset-menu.open { display: block; }
    .pd-reset-menu-item {
      display: flex;
      align-items: center;
      gap: 8px;
      width: 100%;
      padding: 9px 14px;
      background: transparent;
      border: none;
      color: #ccc;
      font-size: 12px;
      font-family: inherit;
      cursor: pointer;
      transition: background .1s;
      text-align: left;
    }
    .pd-reset-menu-item:hover { background: rgba(255,255,255,.08); color: #fff; }
    .pd-reset-menu-item svg { flex-shrink: 0; }

    /* ── Body scroll area ── */
    .pd-body {
      flex: 1;
      overflow-y: auto;
      padding: 20px 24px;
    }
    .pd-body.hidden { display: none; }

    /* ── Sections list ── */
    .pd-sections { display: flex; flex-direction: column; gap: 24px; }

    /* ── Single section row ── */
    .pd-section-row {
      display: flex;
      gap: 14px;
    }

    /* Left gutter: grip + trash stacked */
    .pd-left-icons {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      padding-top: 1px;
      width: 16px;
      flex-shrink: 0;
    }
    .pd-grip {
      cursor: grab;
      color: rgba(255,255,255,.30);
      display: flex;
      transition: color .15s;
      user-select: none;
    }
    .pd-grip:hover { color: rgba(255,255,255,.6); }
    .pd-delete-btn {
      background: transparent;
      border: none;
      cursor: pointer;
      color: rgba(255,255,255,.28);
      padding: 0;
      display: flex;
      align-items: center;
      transition: color .15s;
    }
    .pd-delete-btn:hover { color: #f87171; }

    /* Right content area */
    .pd-section-content {
      flex: 1;
      min-width: 0;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .pd-section-title-row {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .pd-label {
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.07em;
      color: #3b82f6;
      text-transform: uppercase;
      white-space: nowrap;
      background: transparent;
      border: none;
      outline: none;
      font-family: inherit;
      padding: 0;
      field-sizing: content;
      min-width: 2ch;
    }
    .pd-label::placeholder { color: rgba(59,130,246,.4); }
    .pd-title-divider {
      flex: 1;
      height: 1px;
      background: rgba(255,255,255,.1);
    }

    /* ── Autocomplete dropdown ── */
    .pd-label-wrapper {
      position: relative;
      display: flex;
      align-items: center;
      gap: 2px;
    }
    .pd-autocomplete {
      display: none;
      position: absolute;
      top: 100%;
      left: 0;
      margin-top: 4px;
      min-width: 180px;
      max-height: 180px;
      overflow-y: auto;
      background: #262630;
      border: 1px solid rgba(255,255,255,.12);
      border-radius: 8px;
      box-shadow: 0 8px 24px rgba(0,0,0,.5);
      z-index: 20;
      padding: 4px;
    }
    .pd-autocomplete.open { display: block; }
    .pd-autocomplete-item {
      display: block;
      width: 100%;
      padding: 7px 10px;
      background: transparent;
      border: none;
      color: #bbb;
      font-size: 11px;
      font-weight: 600;
      font-family: inherit;
      letter-spacing: 0.06em;
      text-align: left;
      cursor: pointer;
      border-radius: 5px;
      transition: background .1s, color .1s;
    }
    .pd-autocomplete-item:hover, .pd-autocomplete-item.active { background: rgba(59,130,246,.15); color: #fff; }
    .pd-autocomplete-item .pd-match { color: #3b82f6; }

    .pd-autocomplete::-webkit-scrollbar { width: 4px; }
    .pd-autocomplete::-webkit-scrollbar-thumb { background: rgba(255,255,255,.15); border-radius: 2px; }

    /* ── Info icon ── */
    .pd-info-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 16px;
      height: 16px;
      border-radius: 50%;
      border: 1px solid rgba(255,255,255,.15);
      background: transparent;
      color: rgba(255,255,255,.3);
      cursor: help;
      padding: 0;
      flex-shrink: 0;
      position: relative;
      font-size: 9px;
      font-weight: 700;
      font-family: inherit;
      transition: color .15s, border-color .15s;
    }
    .pd-info-btn:hover { color: #3b82f6; border-color: rgba(59,130,246,.5); }
    .pd-info-tip {
      display: none;
      position: absolute;
      top: calc(100% + 6px);
      left: 50%;
      transform: translateX(-50%);
      background: #1a1a24;
      color: #ccc;
      font-size: 11px;
      font-weight: 400;
      padding: 6px 10px;
      border-radius: 6px;
      border: 1px solid rgba(255,255,255,.1);
      max-width: 260px;
      white-space: normal;
      line-height: 1.4;
      pointer-events: none;
      z-index: 30;
      box-shadow: 0 4px 16px rgba(0,0,0,.5);
    }
    .pd-info-btn:hover .pd-info-tip { display: block; }
    .pd-textarea {
      width: 100%;
      min-height: 80px;
      background: rgba(0,0,0,.22);
      border: 1px solid rgba(255,255,255,.1);
      border-radius: 8px;
      padding: 12px 14px;
      color: #e0e0e0;
      font-size: 13px;
      font-family: inherit;
      resize: vertical;
      line-height: 1.55;
      transition: border-color .15s;
    }
    .pd-textarea:focus { outline: none; border-color: rgba(59,130,246,.6); }
    .pd-textarea::placeholder { color: rgba(255,255,255,.25); }

    /* ── Add Section ── */
    .pd-add-btn {
      width: 100%;
      padding: 10px;
      margin-top: 4px;
      border-radius: 10px;
      border: 1px dashed rgba(255,255,255,.15);
      background: transparent;
      color: rgba(255,255,255,.3);
      font-size: 13px;
      font-weight: 500;
      font-family: inherit;
      cursor: pointer;
      transition: border-color .2s, color .2s;
    }
    .pd-add-btn:hover { border-color: #3b82f6; color: #3b82f6; }

    .pd-placeholder { text-align: center; padding: 48px 0; color: rgba(255,255,255,.25); font-size: 13px; }

    /* ── Library ── */
    .pd-library-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
    }
    .pd-template-card {
      background: rgba(0,0,0,.18);
      border: 1px solid rgba(255,255,255,.08);
      border-radius: 10px;
      padding: 14px 16px;
      cursor: default;
      transition: border-color .15s;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .pd-template-card:hover { border-color: rgba(255,255,255,.18); }
    .pd-template-header {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .pd-template-icon {
      font-size: 20px;
      line-height: 1;
      width: 28px;
      text-align: center;
    }
    .pd-template-info { flex: 1; min-width: 0; }
    .pd-template-name {
      font-size: 13px;
      font-weight: 600;
      color: #e8e8e8;
    }
    .pd-template-desc {
      font-size: 11px;
      color: rgba(255,255,255,.4);
      margin-top: 1px;
    }
    .pd-template-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 4px;
    }
    .pd-template-tag {
      font-size: 9px;
      font-weight: 600;
      letter-spacing: .06em;
      color: rgba(59,130,246,.8);
      background: rgba(59,130,246,.1);
      padding: 2px 7px;
      border-radius: 4px;
    }
    .pd-template-use-btn {
      width: 100%;
      padding: 7px;
      border-radius: 7px;
      border: 1px solid rgba(59,130,246,.3);
      background: rgba(59,130,246,.08);
      color: #3b82f6;
      font-size: 11px;
      font-weight: 600;
      font-family: inherit;
      cursor: pointer;
      transition: background .15s, border-color .15s;
      letter-spacing: .02em;
    }
    .pd-template-use-btn:hover { background: rgba(59,130,246,.2); border-color: #3b82f6; }

    /* ── History ── */
    .pd-history-list { display: flex; flex-direction: column; gap: 10px; }
    .pd-history-card {
      background: rgba(0,0,0,.18);
      border: 1px solid rgba(255,255,255,.08);
      border-radius: 10px;
      padding: 12px 14px;
      display: flex;
      flex-direction: column;
      gap: 8px;
      transition: border-color .15s;
    }
    .pd-history-card:hover { border-color: rgba(255,255,255,.18); }
    .pd-history-top {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .pd-history-time {
      font-size: 11px;
      color: rgba(255,255,255,.35);
    }
    .pd-history-actions {
      display: flex;
      gap: 6px;
    }
    .pd-history-use-btn {
      padding: 4px 10px;
      border-radius: 5px;
      border: 1px solid rgba(59,130,246,.3);
      background: rgba(59,130,246,.08);
      color: #3b82f6;
      font-size: 10px;
      font-weight: 600;
      font-family: inherit;
      cursor: pointer;
      transition: background .15s;
    }
    .pd-history-use-btn:hover { background: rgba(59,130,246,.2); }
    .pd-history-del-btn {
      padding: 4px 8px;
      border-radius: 5px;
      border: 1px solid rgba(255,255,255,.08);
      background: transparent;
      color: rgba(255,255,255,.3);
      font-size: 10px;
      font-weight: 600;
      font-family: inherit;
      cursor: pointer;
      transition: color .15s, border-color .15s;
    }
    .pd-history-del-btn:hover { color: #f87171; border-color: rgba(248,113,113,.3); }
    .pd-history-tags { display: flex; flex-wrap: wrap; gap: 4px; }
    .pd-history-tag {
      font-size: 9px;
      font-weight: 600;
      letter-spacing: .06em;
      color: rgba(255,255,255,.5);
      background: rgba(255,255,255,.06);
      padding: 2px 7px;
      border-radius: 4px;
    }
    .pd-history-preview {
      font-size: 11px;
      color: rgba(255,255,255,.3);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .pd-history-empty { text-align: center; padding: 48px 0; color: rgba(255,255,255,.25); font-size: 13px; }

    /* ── Search bar ── */
    .pd-search-bar {
      width: 100%;
      padding: 9px 12px;
      background: rgba(0,0,0,.22);
      border: 1px solid rgba(255,255,255,.1);
      border-radius: 8px;
      color: #ddd;
      font-size: 12px;
      font-family: inherit;
      outline: none;
      margin-bottom: 12px;
      transition: border-color .15s;
      box-sizing: border-box;
    }
    .pd-search-bar:focus { border-color: rgba(59,130,246,.5); }
    .pd-search-bar::placeholder { color: rgba(255,255,255,.25); }

    /* ── Footer ── */
    .pd-footer {
      flex-shrink: 0;
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 12px 20px 18px;
      border-top: 1px solid rgba(255,255,255,.07);
    }
    .pd-merge-btn {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      background: #3b82f6;
      border: none;
      color: #fff;
      font-weight: 600;
      font-size: 14px;
      font-family: inherit;
      padding: 13px 0;
      border-radius: 12px;
      cursor: pointer;
      transition: background .15s;
      letter-spacing: .01em;
    }
    .pd-merge-btn:hover { background: #2563eb; }
    .pd-copy-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 46px;
      height: 46px;
      border-radius: 11px;
      background: rgba(255,255,255,.07);
      border: 1px solid rgba(255,255,255,.1);
      color: rgba(255,255,255,.5);
      cursor: pointer;
      transition: background .15s, color .15s;
    }
    .pd-copy-btn:hover { background: rgba(255,255,255,.14); color: #fff; }
    .pd-send-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 46px;
      height: 46px;
      border-radius: 11px;
      background: #22c55e;
      border: none;
      color: #fff;
      cursor: pointer;
      transition: background .15s;
    }
    .pd-send-btn:hover { background: #16a34a; }
  `;
  shadow.appendChild(style);

  // ─── Overlay HTML ──────────────────────────────────────────────────
  const overlay = document.createElement('div');
  overlay.innerHTML = `
    <div class="pd-overlay" id="pd-overlay">
      <div class="pd-drag-handle"><div class="pd-drag-handle-bar"></div></div>
      <div class="pd-tabs-row">
        <button class="pd-tab active" data-tab="structure">Structure Builder</button>
        <button class="pd-tab" data-tab="library">Prompt Library</button>
        <button class="pd-tab" data-tab="history">History</button>
        <div class="pd-tabs-right">
          <div style="position:relative">
            <button class="pd-header-icon-btn" id="pd-reset-toggle" title="Reset">
              ${ICONS.reset}
              <span class="pd-tooltip">Reset</span>
            </button>
            <div class="pd-reset-menu" id="pd-reset-menu">
              <button class="pd-reset-menu-item" id="pd-clear-values">${ICONS.reset} Clear All Values</button>
              <button class="pd-reset-menu-item" id="pd-new-structure">${ICONS.newDoc} New Structure</button>
            </div>
          </div>
          <button class="pd-header-icon-btn" id="pd-close" title="Close">
            ${ICONS.chevronDown}
            <span class="pd-tooltip">Close</span>
          </button>
        </div>
      </div>

      <div class="pd-body" id="pd-tab-structure"></div>
      <div class="pd-body hidden" id="pd-tab-library"></div>
      <div class="pd-body hidden" id="pd-tab-history"></div>

      <div class="pd-footer">
        <button class="pd-merge-btn" id="pd-merge">
          ${ICONS.merge}
          Merge &amp; Insert to Chat
        </button>
        <button class="pd-copy-btn" id="pd-copy" title="Copy to clipboard">${ICONS.copy}</button>
        <button class="pd-send-btn" id="pd-send" title="Insert & Send">${ICONS.send}</button>
      </div>
    </div>
  `;
  shadow.appendChild(overlay);

  // ─── Render Library ──────────────────────────────────────────────────
  let librarySearchQuery = '';

  function renderLibrary() {
    const container = shadow.getElementById('pd-tab-library');
    if (!container) return;

    const q = librarySearchQuery.toLowerCase();
    const filtered = PROMPT_TEMPLATES.map((tmpl, i) => ({ tmpl, i })).filter(({ tmpl }) => {
      if (!q) return true;
      return tmpl.name.toLowerCase().includes(q)
        || tmpl.desc.toLowerCase().includes(q)
        || tmpl.sections.some(s => s.label.toLowerCase().includes(q));
    });

    let html = `<input class="pd-search-bar" id="pd-library-search" type="text" placeholder="Search templates..." value="${librarySearchQuery}" />`;

    if (filtered.length === 0) {
      html += '<p class="pd-placeholder">No templates match your search.</p>';
    } else {
      html += '<div class="pd-library-grid">';
      filtered.forEach(({ tmpl, i }) => {
        const tags = tmpl.sections.map(s => `<span class="pd-template-tag">${s.label}</span>`).join('');
        html += `
          <div class="pd-template-card">
            <div class="pd-template-header">
              <span class="pd-template-icon">${tmpl.icon}</span>
              <div class="pd-template-info">
                <div class="pd-template-name">${tmpl.name}</div>
                <div class="pd-template-desc">${tmpl.desc}</div>
              </div>
            </div>
            <div class="pd-template-tags">${tags}</div>
            <button class="pd-template-use-btn" data-tmpl-idx="${i}">Use Template</button>
          </div>`;
      });
      html += '</div>';
    }
    container.innerHTML = html;

    // Bind search
    const searchInput = container.querySelector('#pd-library-search');
    searchInput?.addEventListener('input', () => {
      librarySearchQuery = searchInput.value;
      renderLibrary();
      // Refocus and restore cursor
      const newInput = container.querySelector('#pd-library-search');
      if (newInput) {
        newInput.focus();
        newInput.selectionStart = newInput.selectionEnd = newInput.value.length;
      }
    });

    // Bind use buttons
    container.querySelectorAll('.pd-template-use-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.dataset.tmplIdx, 10);
        const tmpl = PROMPT_TEMPLATES[idx];
        if (!tmpl) return;
        sections = tmpl.sections.map(s => ({
          id: crypto.randomUUID(),
          label: s.label,
          value: '',
          placeholder: s.placeholder,
        }));
        switchTab('structure');
        renderSections();
      });
    });
  }
  renderLibrary();

  // ─── History (localStorage) ────────────────────────────────────────
  const HISTORY_KEY = 'promptdeck_history';

  function getHistory() {
    try {
      return JSON.parse(localStorage.getItem(HISTORY_KEY)) || [];
    } catch { return []; }
  }

  function saveToHistory() {
    const filled = sections.filter(s => s.value.trim());
    if (filled.length === 0) return;
    const entry = {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      sections: sections.map(s => ({ label: s.label, value: s.value, placeholder: s.placeholder || '' })),
    };
    const history = getHistory();
    history.unshift(entry);
    // Keep max 50 entries
    if (history.length > 50) history.length = 50;
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  }

  let historySearchQuery = '';

  function renderHistory() {
    const container = shadow.getElementById('pd-tab-history');
    if (!container) return;
    const history = getHistory();

    if (history.length === 0) {
      container.innerHTML = '<p class="pd-history-empty">No history yet. Merge or send a prompt to save it here.</p>';
      return;
    }

    const q = historySearchQuery.toLowerCase();
    const filtered = history.map((entry, i) => ({ entry, i })).filter(({ entry }) => {
      if (!q) return true;
      return entry.sections.some(s =>
        s.label.toLowerCase().includes(q) || s.value.toLowerCase().includes(q)
      );
    });

    let html = `<input class="pd-search-bar" id="pd-history-search" type="text" placeholder="Search history..." value="${historySearchQuery}" />`;

    if (filtered.length === 0) {
      html += '<p class="pd-placeholder">No history entries match your search.</p>';
    } else {
      html += '<div class="pd-history-list">';
      filtered.forEach(({ entry, i }) => {
        const date = new Date(entry.timestamp);
        const timeStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ' ' + date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        const tags = entry.sections.map(s => `<span class="pd-history-tag">${s.label}</span>`).join('');
        const preview = entry.sections.filter(s => s.value.trim()).map(s => s.value.trim()).join(' • ').slice(0, 120);
        html += `
          <div class="pd-history-card">
            <div class="pd-history-top">
              <span class="pd-history-time">${timeStr}</span>
              <div class="pd-history-actions">
                <button class="pd-history-use-btn" data-hist-idx="${i}">Use in Builder</button>
                <button class="pd-history-del-btn" data-hist-idx="${i}">✕</button>
              </div>
            </div>
            <div class="pd-history-tags">${tags}</div>
            ${preview ? `<div class="pd-history-preview">${preview}…</div>` : ''}
          </div>`;
      });
      html += '</div>';
    }
    container.innerHTML = html;

    // Bind search
    const searchInput = container.querySelector('#pd-history-search');
    searchInput?.addEventListener('input', () => {
      historySearchQuery = searchInput.value;
      renderHistory();
      const newInput = container.querySelector('#pd-history-search');
      if (newInput) {
        newInput.focus();
        newInput.selectionStart = newInput.selectionEnd = newInput.value.length;
      }
    });

    // Bind use buttons
    container.querySelectorAll('.pd-history-use-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.dataset.histIdx, 10);
        const entry = getHistory()[idx];
        if (!entry) return;
        sections = entry.sections.map(s => ({
          id: crypto.randomUUID(),
          label: s.label,
          value: s.value,
          placeholder: s.placeholder || 'Enter details...',
        }));
        switchTab('structure');
        renderSections();
      });
    });

    // Bind delete buttons
    container.querySelectorAll('.pd-history-del-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.dataset.histIdx, 10);
        const history = getHistory();
        history.splice(idx, 1);
        localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
        renderHistory();
      });
    });
  }
  renderHistory();

  // ─── Render Sections ───────────────────────────────────────────────
  function renderSections() {
    const container = shadow.getElementById('pd-tab-structure');
    if (!container) return;

    let html = '<div class="pd-sections">';
    sections.forEach((sec, i) => {
      html += `
        <div class="pd-section-row" draggable="true" data-idx="${i}">
          <div class="pd-left-icons">
            <span class="pd-grip" title="Drag">${ICONS.grip}</span>
            <button class="pd-delete-btn" data-idx="${i}" title="Remove">${ICONS.trash}</button>
          </div>
          <div class="pd-section-content">
            <div class="pd-section-title-row">
              <div class="pd-label-wrapper">
                <input class="pd-label" type="text" value="${sec.label}" placeholder="SECTION NAME" data-idx="${i}" spellcheck="false" autocomplete="off" />
                ${LABEL_DESCRIPTIONS[sec.label.toUpperCase()] ? `<button class="pd-info-btn" type="button">i<span class="pd-info-tip">${LABEL_DESCRIPTIONS[sec.label.toUpperCase()]}</span></button>` : ''}
                <div class="pd-autocomplete" data-for="${i}"></div>
              </div>
              <div class="pd-title-divider"></div>
            </div>
            <textarea class="pd-textarea"
              placeholder="${sec.placeholder || 'Enter details...'}"
              data-id="${sec.id}">${sec.value}</textarea>
          </div>
        </div>`;
    });
    html += '</div><button class="pd-add-btn" id="pd-add-section">+ Add Section</button>';
    container.innerHTML = html;
    bindSectionEvents(container);
  }

  // ─── Section Events ────────────────────────────────────────────────
  function bindSectionEvents(container) {
    container.querySelectorAll('.pd-textarea').forEach(ta => {
      ta.addEventListener('input', () => {
        const sec = sections.find(s => s.id === ta.dataset.id);
        if (sec) sec.value = ta.value;
      });
    });

    container.querySelectorAll('.pd-delete-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        sections.splice(parseInt(btn.dataset.idx, 10), 1);
        renderSections();
      });
    });

    container.querySelectorAll('.pd-section-row').forEach(row => {
      row.addEventListener('dragstart', e => {
        dragSrcIndex = parseInt(row.dataset.idx, 10);
        row.style.opacity = '0.4';
        e.dataTransfer.effectAllowed = 'move';
      });
      row.addEventListener('dragend', () => { row.style.opacity = '1'; });
      row.addEventListener('dragover', e => { e.preventDefault(); row.style.background = 'rgba(59,130,246,.06)'; });
      row.addEventListener('dragleave', () => { row.style.background = ''; });
      row.addEventListener('drop', e => {
        e.preventDefault();
        row.style.background = '';
        const targetIdx = parseInt(row.dataset.idx, 10);
        if (dragSrcIndex !== null && dragSrcIndex !== targetIdx) {
          const [moved] = sections.splice(dragSrcIndex, 1);
          sections.splice(targetIdx, 0, moved);
          renderSections();
        }
        dragSrcIndex = null;
      });
    });

    // Label input sync + autocomplete
    container.querySelectorAll('.pd-label').forEach(inp => {
      const idx = parseInt(inp.dataset.idx, 10);
      const dropdown = container.querySelector(`.pd-autocomplete[data-for="${idx}"]`);
      const wrapper = inp.closest('.pd-label-wrapper');

      // Dynamically update the info button based on current label
      function updateInfoButton() {
        const existing = wrapper.querySelector('.pd-info-btn');
        if (existing) existing.remove();
        const label = (inp.value || '').toUpperCase();
        const desc = LABEL_DESCRIPTIONS[label];
        if (desc) {
          const btn = document.createElement('button');
          btn.className = 'pd-info-btn';
          btn.type = 'button';
          btn.innerHTML = `i<span class="pd-info-tip">${desc}</span>`;
          wrapper.insertBefore(btn, dropdown);
        }
      }

      function showSuggestions(filter) {
        if (!dropdown) return;
        const q = filter.toUpperCase();
        const used = new Set(sections.map(s => s.label.toUpperCase()));
        const matches = PRESET_LABELS.filter(l => !used.has(l) && (q === '' || l.includes(q)));
        if (matches.length === 0) {
          dropdown.classList.remove('open');
          return;
        }
        dropdown.innerHTML = matches.map(label => {
          // Highlight matching portion
          const i = label.indexOf(q);
          let html;
          if (q && i >= 0) {
            html = label.slice(0, i) + `<span class="pd-match">${label.slice(i, i + q.length)}</span>` + label.slice(i + q.length);
          } else {
            html = label;
          }
          return `<button class="pd-autocomplete-item" data-value="${label}">${html}</button>`;
        }).join('');
        dropdown.classList.add('open');

        // Bind click on each item
        dropdown.querySelectorAll('.pd-autocomplete-item').forEach(item => {
          item.addEventListener('mousedown', e => {
            e.preventDefault(); // prevent blur
            inp.value = item.dataset.value;
            if (sections[idx]) sections[idx].label = item.dataset.value;
            dropdown.classList.remove('open');
            updateInfoButton();
          });
        });
      }

      inp.addEventListener('focus', () => showSuggestions(inp.value));
      inp.addEventListener('input', () => {
        if (sections[idx]) sections[idx].label = inp.value.toUpperCase();
        showSuggestions(inp.value);
        updateInfoButton();
      });
      inp.addEventListener('blur', () => {
        // Small delay to allow mousedown on items to fire
        setTimeout(() => {
          dropdown?.classList.remove('open');
          if (sections[idx] && !sections[idx].label.trim()) {
            sections[idx].label = 'UNTITLED';
            inp.value = 'UNTITLED';
          }
          updateInfoButton();
        }, 150);
      });
    });

    const addBtn = container.querySelector('#pd-add-section');
    if (addBtn) {
      addBtn.addEventListener('click', () => {
        sections.push({
          id: crypto.randomUUID(),
          label: '',
          value: '',
          placeholder: 'Enter details for this section...',
        });
        renderSections();
        // Focus the new label input
        const labels = shadow.querySelectorAll('.pd-label');
        const last = labels[labels.length - 1];
        if (last) {
          last.focus();
          // Scroll it into view
          last.closest('.pd-section-row')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      });
    }
  }

  // ─── Merge / Inject ────────────────────────────────────────────────
  function assembleMergedPrompt() {
    return sections
      .filter(s => s.value.trim())
      .map(s => `### ${s.label}:\n${s.value.trim()}`)
      .join('\n\n');
  }

  function injectIntoChatGPT(text) {
    const el = document.querySelector('#prompt-textarea');
    if (!el) return;
    if (el.tagName === 'TEXTAREA' || el.tagName === 'INPUT') {
      const setter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value')?.set
        || Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set;
      if (setter) setter.call(el, text); else el.value = text;
      el.dispatchEvent(new Event('input', { bubbles: true }));
    } else {
      el.focus();
      el.innerHTML = '';
      const p = document.createElement('p');
      p.textContent = text;
      el.appendChild(p);
      el.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'insertText' }));
    }
  }

  // ─── Show / Hide ───────────────────────────────────────────────────
  function showOverlay() {
    const el = shadow.getElementById('pd-overlay');
    if (!el) return;
    el.style.display = 'flex';
    el.classList.remove('overlay-exit');
    el.classList.add('overlay-enter');
    overlayVisible = true;
    toggleBtn.style.display = 'none';
    renderSections();
    switchTab(activeTab);
  }
  function hideOverlay() {
    const el = shadow.getElementById('pd-overlay');
    if (!el) return;
    el.classList.remove('overlay-enter');
    el.classList.add('overlay-exit');
    el.addEventListener('animationend', () => { el.style.display = 'none'; }, { once: true });
    overlayVisible = false;
    toggleBtn.style.display = 'flex';
    positionToggle();
  }
  function toggleOverlay() { overlayVisible ? hideOverlay() : showOverlay(); }

  // ─── Tab Switching ─────────────────────────────────────────────────
  function switchTab(tab) {
    activeTab = tab;
    shadow.querySelectorAll('.pd-tab').forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
    ['structure', 'library', 'history'].forEach(t => {
      const p = shadow.getElementById(`pd-tab-${t}`);
      if (p) { if (t === tab) p.classList.remove('hidden'); else p.classList.add('hidden'); }
    });
    if (tab === 'history') renderHistory();
  }

  // ─── Bind Overlay Events ───────────────────────────────────────────
  shadow.querySelectorAll('.pd-tab').forEach(b => b.addEventListener('click', () => switchTab(b.dataset.tab)));
  shadow.getElementById('pd-close')?.addEventListener('click', hideOverlay);

  // Reset menu toggle
  const resetToggle = shadow.getElementById('pd-reset-toggle');
  const resetMenu = shadow.getElementById('pd-reset-menu');
  resetToggle?.addEventListener('click', (e) => {
    e.stopPropagation();
    resetMenu.classList.toggle('open');
  });
  // Close menu when clicking elsewhere
  shadow.addEventListener('click', () => resetMenu?.classList.remove('open'));

  // Clear all values (keep labels and sections)
  shadow.getElementById('pd-clear-values')?.addEventListener('click', () => {
    sections.forEach(s => { s.value = ''; });
    renderSections();
    resetMenu?.classList.remove('open');
  });

  // New structure (reset to defaults)
  shadow.getElementById('pd-new-structure')?.addEventListener('click', () => {
    sections = [];
    renderSections();
    resetMenu?.classList.remove('open');
  });
  shadow.getElementById('pd-merge')?.addEventListener('click', () => {
    const text = assembleMergedPrompt();
    if (!text) return;
    saveToHistory();
    injectIntoChatGPT(text);
    hideOverlay();
  });
  shadow.getElementById('pd-copy')?.addEventListener('click', () => {
    const text = assembleMergedPrompt();
    if (text) navigator.clipboard.writeText(text).catch(() => { });
  });
  shadow.getElementById('pd-send')?.addEventListener('click', () => {
    const text = assembleMergedPrompt();
    if (!text) return;
    saveToHistory();
    injectIntoChatGPT(text);
    hideOverlay();
    // Click ChatGPT's send button after a short delay so React processes the input
    setTimeout(() => {
      const sendBtn = document.querySelector('[data-testid="send-button"]')
        || document.querySelector('button[aria-label="Send prompt"]')
        || document.querySelector('form button[type="submit"]');
      if (sendBtn) sendBtn.click();
    }, 200);
  });

  // ─── Toggle Button ─────────────────────────────────────────────────
  const toggleBtn = document.createElement('button');
  toggleBtn.innerHTML = ICONS.toggle;
  toggleBtn.title = 'PromptDeck';
  toggleBtn.style.cssText = `
    position:fixed;width:36px;height:36px;border-radius:50%;border:none;
    background:transparent;color:#b4b4b4;cursor:pointer;
    display:none;align-items:center;justify-content:center;
    z-index:99998;pointer-events:auto;padding:0;
    transition:background .15s,color .15s;
  `;
  toggleBtn.addEventListener('mouseenter', () => { toggleBtn.style.background = 'rgba(255,255,255,.1)'; toggleBtn.style.color = '#e5e5e5'; });
  toggleBtn.addEventListener('mouseleave', () => { toggleBtn.style.background = 'transparent'; toggleBtn.style.color = '#b4b4b4'; });
  toggleBtn.addEventListener('click', e => { e.preventDefault(); e.stopPropagation(); toggleOverlay(); });
  shadow.appendChild(toggleBtn);

  // ─── Position Toggle ───────────────────────────────────────────────
  let lastRectKey = '';
  function positionToggle() {
    if (overlayVisible) return;
    const ta = document.querySelector('#prompt-textarea');
    if (!ta) { toggleBtn.style.display = 'none'; return; }
    const fc = ta.closest('form') || ta.closest('[class*="composer"]') || ta.parentElement?.parentElement?.parentElement;
    if (!fc) { toggleBtn.style.display = 'none'; return; }
    const r = fc.getBoundingClientRect();
    const key = `${r.top},${r.right},${r.bottom},${r.left}`;
    if (key !== lastRectKey) {
      lastRectKey = key;
      toggleBtn.style.display = 'flex';
      toggleBtn.style.top = (r.bottom - 44) + 'px';
      toggleBtn.style.left = (r.right - 130) + 'px';
    } else if (toggleBtn.style.display === 'none') {
      toggleBtn.style.display = 'flex';
    }
  }

  function rafLoop() { positionToggle(); requestAnimationFrame(rafLoop); }
  setTimeout(() => requestAnimationFrame(rafLoop), 500);
})();
