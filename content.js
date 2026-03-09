(() => {
  'use strict';

  // ─── State ──────────────────────────────────────────────────────────
  let overlayVisible = false;
  let activeTab = 'structure';
  let sections = [
    { id: crypto.randomUUID(), label: 'Role', value: '', placeholder: 'mentione the role of ai, e.g. act as a senior python developer', priority: 'required' },
    { id: crypto.randomUUID(), label: 'Context', value: '', placeholder: 'Provide the context of the task, e.g. i want to write an email to my boss requesting a promotion', priority: 'recommended' },
  ];
  let dragSrcIndex = null;
  let activeTemplateName = null;
  let templateModified = false;

  // ─── Preset Labels ─────────────────────────────────────────────────
  const PRESET_LABELS = [
    'ROLE', 'CONTEXT', 'TASK', 'GOAL', 'TONE', 'FORMAT',
    'LENGTH', 'AUDIENCE', 'STYLE', 'CONSTRAINTS', 'EXAMPLES',
    'INPUT', 'OUTPUT', 'INSTRUCTIONS', 'PERSONA', 'SCENARIO',
    'TOPIC', 'KEYWORDS', 'LANGUAGE', 'PERSPECTIVE', 'RULES',
    'BACKGROUND', 'REQUIREMENTS', 'STEPS', 'CRITERIA', 'AVOID',
    'INCLUDE', 'EXCLUDE', 'LIMIT', 'DIFFICULTY', 'TEACHING METHOD',
    'DEPTH', 'RECIPIENT', 'PURPOSE', 'KEY POINTS', 'PRODUCT',
    'CALL TO ACTION', 'TARGET USERS', 'DESIGN STYLE', 'PLATFORM',
    'DATA SOURCE', 'METRICS', 'FOCUS AREAS', 'SUBJECT AREA',
    'EXPERIENCE LEVEL', 'QUESTION TYPE', 'SCOPE', 'SOURCE LANGUAGE',
    'TARGET LANGUAGE', 'ERROR DETAILS', 'RESEARCH QUESTION',
    'HYPOTHESIS', 'SOURCES', 'METHODOLOGY', 'CODE QUALITY',
    'REVIEW FOCUS', 'ENDPOINTS', 'AUTHENTICATION', 'FEATURES',
    'BENEFITS', 'CHANNEL', 'HASHTAGS', 'POSITION', 'SKILLS',
    'ACHIEVEMENTS', 'GENRE', 'CHARACTERS', 'SETTING', 'DATABASE',
    'SCHEMA', 'QUERY TYPE', 'RESPONSE FORMAT',
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
    DIFFICULTY: 'Set the complexity level (Beginner, Intermediate, Expert)',
    'TEACHING METHOD': 'How to explain concepts (step-by-step, analogies, visual)',
    DEPTH: 'How deep to go (overview, detailed, comprehensive)',
    RECIPIENT: 'Who will receive this (specific person, team, client)',
    PURPOSE: 'The reason or intent behind the request',
    'KEY POINTS': 'Critical information that must be communicated',
    PRODUCT: 'The product or service being promoted or discussed',
    'CALL TO ACTION': 'What action the reader should take',
    'TARGET USERS': 'The end users of the product or feature',
    'DESIGN STYLE': 'Visual style (Minimal, Material, Glassmorphism, etc.)',
    PLATFORM: 'Target platform (Web, iOS, Android, Desktop)',
    'DATA SOURCE': 'Where the data comes from or its format',
    METRICS: 'Key metrics or KPIs to analyze or report on',
    'FOCUS AREAS': 'Specific aspects to concentrate on',
    'SUBJECT AREA': 'The technical or knowledge domain',
    'EXPERIENCE LEVEL': 'Candidate experience level (Junior, Mid, Senior)',
    'QUESTION TYPE': 'Type of questions (Behavioral, Technical, System Design)',
    SCOPE: 'Boundaries of what to include or cover',
    'SOURCE LANGUAGE': 'The language to translate from',
    'TARGET LANGUAGE': 'The language to translate to',
    'ERROR DETAILS': 'Describe the error message, stack trace, or unexpected behavior',
    'RESEARCH QUESTION': 'The core question your research seeks to answer',
    HYPOTHESIS: 'Your initial assumption or expected finding',
    SOURCES: 'Types of sources to reference (academic papers, surveys, etc.)',
    METHODOLOGY: 'How the research should be conducted (qualitative, quantitative, etc.)',
    'CODE QUALITY': 'Aspects to evaluate (readability, performance, security, etc.)',
    'REVIEW FOCUS': 'What specifically to review (logic, patterns, edge cases, etc.)',
    ENDPOINTS: 'API routes or endpoints to document or design',
    AUTHENTICATION: 'Auth methods and requirements (OAuth, API key, JWT, etc.)',
    FEATURES: 'Key features to highlight or describe',
    BENEFITS: 'Value proposition or advantages for the audience',
    CHANNEL: 'Social platform (Twitter, LinkedIn, Instagram, TikTok, etc.)',
    HASHTAGS: 'Relevant hashtags or trending topics to incorporate',
    POSITION: 'Job title or role being applied for',
    SKILLS: 'Key skills and competencies to highlight',
    ACHIEVEMENTS: 'Notable accomplishments or results to showcase',
    GENRE: 'Creative writing genre (Sci-fi, Fantasy, Thriller, Romance, etc.)',
    CHARACTERS: 'Main characters, their traits, and motivations',
    SETTING: 'Time period, location, and world-building details',
    DATABASE: 'Database system (PostgreSQL, MySQL, MongoDB, etc.)',
    SCHEMA: 'Table structures, relationships, and data types',
    'QUERY TYPE': 'Type of query (SELECT, JOIN, Aggregation, Subquery, etc.)',
    'RESPONSE FORMAT': 'How the API response should be structured (JSON, XML, etc.)',
  };

  // ─── Prompt Templates ──────────────────────────────────────────────
  const PROMPT_TEMPLATES = [
    {
      name: 'Code Generation',
      icon: '💻',
      desc: 'Generate code with clear specs',
      sections: [
        { label: 'ROLE', placeholder: 'e.g. Senior Python Developer', priority: 'required' },
        { label: 'TASK', placeholder: 'What code to write...', priority: 'required' },
        { label: 'LANGUAGE', placeholder: 'e.g. Python, JavaScript, TypeScript...', priority: 'required' },
        { label: 'REQUIREMENTS', placeholder: 'Functional requirements...', priority: 'recommended' },
        { label: 'CONSTRAINTS', placeholder: 'e.g. No external libraries, must be async...', priority: 'optional' },
        { label: 'OUTPUT', placeholder: 'e.g. Clean, commented code with examples', priority: 'recommended' },
      ],
    },
    {
      name: 'Debugging',
      icon: '🔧',
      desc: 'Diagnose and fix code issues',
      sections: [
        { label: 'ROLE', placeholder: 'e.g. Debugging Expert', priority: 'recommended' },
        { label: 'CONTEXT', placeholder: 'What the code is supposed to do...', priority: 'required' },
        { label: 'INPUT', placeholder: 'Paste the buggy code...', priority: 'required' },
        { label: 'ERROR DETAILS', placeholder: 'Error message, stack trace, or unexpected behavior...', priority: 'required' },
        { label: 'STEPS', placeholder: 'Steps to reproduce the issue...', priority: 'recommended' },
        { label: 'OUTPUT', placeholder: 'e.g. Fixed code + root cause explanation', priority: 'optional' },
      ],
    },
    {
      name: 'Learning & Explanation',
      icon: '📚',
      desc: 'Understand concepts deeply',
      sections: [
        { label: 'ROLE', placeholder: 'e.g. Expert Teacher, Professor, Mentor', priority: 'recommended' },
        { label: 'TOPIC', placeholder: 'What concept or subject to learn...', priority: 'required' },
        { label: 'DIFFICULTY', placeholder: 'e.g. Beginner, Intermediate, Expert...', priority: 'required' },
        { label: 'TEACHING METHOD', placeholder: 'e.g. Step-by-step, Analogy-based, Socratic...', priority: 'recommended' },
        { label: 'INCLUDE', placeholder: 'e.g. Real-world examples, diagrams, practice problems...', priority: 'optional' },
        { label: 'DEPTH', placeholder: 'e.g. Quick overview, Detailed with subtopics, Comprehensive...', priority: 'recommended' },
      ],
    },
    {
      name: 'Content Writing',
      icon: '✍️',
      desc: 'Blog posts, articles, essays',
      sections: [
        { label: 'ROLE', placeholder: 'e.g. SEO Content Writer, Technical Blogger', priority: 'recommended' },
        { label: 'TOPIC', placeholder: 'What to write about...', priority: 'required' },
        { label: 'AUDIENCE', placeholder: 'e.g. Tech enthusiasts, Small business owners...', priority: 'required' },
        { label: 'TONE', placeholder: 'e.g. Professional, Casual, Persuasive...', priority: 'required' },
        { label: 'FORMAT', placeholder: 'e.g. Blog post with headings, Listicle, How-to guide...', priority: 'recommended' },
        { label: 'LENGTH', placeholder: 'e.g. 800 words, 3 paragraphs...', priority: 'optional' },
        { label: 'KEYWORDS', placeholder: 'SEO keywords to include...', priority: 'optional' },
      ],
    },
    {
      name: 'Email Drafting',
      icon: '✉️',
      desc: 'Professional or casual emails',
      sections: [
        { label: 'ROLE', placeholder: 'e.g. Business Professional, HR Manager', priority: 'optional' },
        { label: 'PURPOSE', placeholder: 'Why you are writing this email...', priority: 'required' },
        { label: 'RECIPIENT', placeholder: 'e.g. Client, Manager, Team, Job applicant...', priority: 'required' },
        { label: 'TONE', placeholder: 'e.g. Formal, Friendly, Urgent, Apologetic...', priority: 'required' },
        { label: 'KEY POINTS', placeholder: 'Main things to communicate...', priority: 'recommended' },
        { label: 'LENGTH', placeholder: 'e.g. Short and concise, Detailed...', priority: 'optional' },
      ],
    },
    {
      name: 'Marketing Copy',
      icon: '📣',
      desc: 'Ads, landing pages, social posts',
      sections: [
        { label: 'ROLE', placeholder: 'e.g. Marketing Copywriter, Growth Hacker', priority: 'recommended' },
        { label: 'PRODUCT', placeholder: 'Product or service to promote...', priority: 'required' },
        { label: 'AUDIENCE', placeholder: 'Target demographic (age, interests, pain points)...', priority: 'required' },
        { label: 'TONE', placeholder: 'e.g. Bold, Inspiring, Playful, Urgent...', priority: 'recommended' },
        { label: 'CALL TO ACTION', placeholder: 'e.g. Sign up now, Learn more, Buy today...', priority: 'required' },
        { label: 'CONSTRAINTS', placeholder: 'e.g. Max 150 characters, include CTA, platform limits...', priority: 'optional' },
      ],
    },
    {
      name: 'Data Analysis',
      icon: '📊',
      desc: 'Analyze and interpret data',
      sections: [
        { label: 'ROLE', placeholder: 'e.g. Data Analyst, Business Intelligence Expert', priority: 'recommended' },
        { label: 'DATA SOURCE', placeholder: 'Describe dataset, source, or paste data...', priority: 'required' },
        { label: 'TASK', placeholder: 'What analysis to perform...', priority: 'required' },
        { label: 'METRICS', placeholder: 'Key metrics or KPIs to focus on...', priority: 'recommended' },
        { label: 'OUTPUT', placeholder: 'e.g. Charts, summary table, insights report...', priority: 'recommended' },
        { label: 'FORMAT', placeholder: 'e.g. Table, bullet points, executive report...', priority: 'optional' },
      ],
    },
    {
      name: 'UI/UX Design',
      icon: '🎨',
      desc: 'Design briefs and feedback',
      sections: [
        { label: 'ROLE', placeholder: 'e.g. Senior UI/UX Designer, Product Designer', priority: 'recommended' },
        { label: 'TASK', placeholder: 'What to design, review, or critique...', priority: 'required' },
        { label: 'TARGET USERS', placeholder: 'Who will use this product (e.g. developers, shoppers)...', priority: 'required' },
        { label: 'DESIGN STYLE', placeholder: 'e.g. Minimal, Material Design, Glassmorphism, Brutalist...', priority: 'recommended' },
        { label: 'PLATFORM', placeholder: 'e.g. Mobile iOS, Web desktop, Responsive, Android...', priority: 'recommended' },
        { label: 'CONSTRAINTS', placeholder: 'e.g. WCAG accessible, max 3 colors, must use brand kit...', priority: 'optional' },
      ],
    },
    {
      name: 'Interview Prep',
      icon: '🎯',
      desc: 'Practice questions and answers',
      sections: [
        { label: 'ROLE', placeholder: 'e.g. Tech Interview Coach, Hiring Manager', priority: 'recommended' },
        { label: 'SUBJECT AREA', placeholder: 'e.g. React, System Design, AWS, Behavioral...', priority: 'required' },
        { label: 'EXPERIENCE LEVEL', placeholder: 'e.g. Junior (0-2 yrs), Mid (3-5 yrs), Senior (5+)...', priority: 'required' },
        { label: 'QUESTION TYPE', placeholder: 'e.g. Coding, System Design, Behavioral, Take-home...', priority: 'required' },
        { label: 'DIFFICULTY', placeholder: 'e.g. Easy, Medium, Hard, Mixed progression...', priority: 'recommended' },
        { label: 'FORMAT', placeholder: 'e.g. Question + Model Answer + Follow-ups', priority: 'optional' },
      ],
    },
    {
      name: 'Summarization',
      icon: '📋',
      desc: 'Summarize documents and text',
      sections: [
        { label: 'ROLE', placeholder: 'e.g. Research Assistant, Executive Summarizer', priority: 'optional' },
        { label: 'INPUT', placeholder: 'Paste text or article to summarize...', priority: 'required' },
        { label: 'SCOPE', placeholder: 'e.g. Full document, Chapter 3 only, Key findings...', priority: 'recommended' },
        { label: 'FORMAT', placeholder: 'e.g. Bullet points, Paragraph, TL;DR, Executive brief...', priority: 'recommended' },
        { label: 'LENGTH', placeholder: 'e.g. 3 sentences, 100 words, 1 page...', priority: 'required' },
        { label: 'FOCUS AREAS', placeholder: 'e.g. Key takeaways, action items, statistics...', priority: 'optional' },
      ],
    },
    {
      name: 'Translation',
      icon: '🌐',
      desc: 'Translate with context awareness',
      sections: [
        { label: 'ROLE', placeholder: 'e.g. Professional Translator, Localization Expert', priority: 'optional' },
        { label: 'INPUT', placeholder: 'Text to translate...', priority: 'required' },
        { label: 'SOURCE LANGUAGE', placeholder: 'e.g. English, French, Japanese...', priority: 'required' },
        { label: 'TARGET LANGUAGE', placeholder: 'e.g. Spanish, German, Mandarin...', priority: 'required' },
        { label: 'TONE', placeholder: 'e.g. Formal, Conversational, Literary, Technical...', priority: 'recommended' },
        { label: 'CONTEXT', placeholder: 'e.g. Legal document, casual chat, marketing copy...', priority: 'recommended' },
        { label: 'AVOID', placeholder: 'e.g. Literal translations, regional slang...', priority: 'optional' },
      ],
    },
    {
      name: 'Brainstorming',
      icon: '💡',
      desc: 'Generate ideas and solutions',
      sections: [
        { label: 'ROLE', placeholder: 'e.g. Creative Strategist, Innovation Lead', priority: 'optional' },
        { label: 'TOPIC', placeholder: 'What to brainstorm about...', priority: 'required' },
        { label: 'GOAL', placeholder: 'What outcome are you aiming for...', priority: 'required' },
        { label: 'CONSTRAINTS', placeholder: 'e.g. Budget, timeline, tech stack, team size...', priority: 'recommended' },
        { label: 'FORMAT', placeholder: 'e.g. 10 ideas with pros/cons, Mind map, Ranked list...', priority: 'optional' },
        { label: 'PERSPECTIVE', placeholder: 'e.g. User-centric, Business-first, Technical feasibility...', priority: 'optional' },
      ],
    },
    {
      name: 'Research & Analysis',
      icon: '🔬',
      desc: 'Deep dive into any topic',
      sections: [
        { label: 'ROLE', placeholder: 'e.g. Research Analyst, Academic Researcher', priority: 'recommended' },
        { label: 'RESEARCH QUESTION', placeholder: 'The core question to investigate...', priority: 'required' },
        { label: 'SCOPE', placeholder: 'e.g. Last 5 years, US market only, B2B SaaS...', priority: 'required' },
        { label: 'METHODOLOGY', placeholder: 'e.g. Literature review, Comparative analysis, Case study...', priority: 'recommended' },
        { label: 'SOURCES', placeholder: 'e.g. Academic papers, industry reports, surveys...', priority: 'optional' },
        { label: 'FORMAT', placeholder: 'e.g. Report with sections, Annotated bibliography...', priority: 'recommended' },
      ],
    },
    {
      name: 'Code Review',
      icon: '🔍',
      desc: 'Review code for quality & issues',
      sections: [
        { label: 'ROLE', placeholder: 'e.g. Senior Code Reviewer, Tech Lead', priority: 'recommended' },
        { label: 'INPUT', placeholder: 'Paste the code to review...', priority: 'required' },
        { label: 'LANGUAGE', placeholder: 'e.g. JavaScript, Python, Go...', priority: 'required' },
        { label: 'REVIEW FOCUS', placeholder: 'e.g. Security, performance, readability, design patterns...', priority: 'required' },
        { label: 'CODE QUALITY', placeholder: 'e.g. Check naming, error handling, test coverage...', priority: 'recommended' },
        { label: 'OUTPUT', placeholder: 'e.g. Inline comments, severity ratings, refactored code...', priority: 'optional' },
      ],
    },
    {
      name: 'API Documentation',
      icon: '📡',
      desc: 'Document APIs clearly',
      sections: [
        { label: 'ROLE', placeholder: 'e.g. Technical Writer, API Documentation Specialist', priority: 'optional' },
        { label: 'ENDPOINTS', placeholder: 'e.g. GET /users, POST /auth/login...', priority: 'required' },
        { label: 'AUTHENTICATION', placeholder: 'e.g. Bearer token, API key, OAuth 2.0...', priority: 'required' },
        { label: 'RESPONSE FORMAT', placeholder: 'e.g. JSON with status codes, error objects...', priority: 'recommended' },
        { label: 'EXAMPLES', placeholder: 'e.g. Include request/response samples...', priority: 'recommended' },
        { label: 'FORMAT', placeholder: 'e.g. OpenAPI spec, Markdown tables, README style...', priority: 'optional' },
      ],
    },
    {
      name: 'Product Description',
      icon: '🛠️',
      desc: 'E-commerce & product listings',
      sections: [
        { label: 'ROLE', placeholder: 'e.g. E-commerce Copywriter, Product Marketer', priority: 'optional' },
        { label: 'PRODUCT', placeholder: 'Product name and category...', priority: 'required' },
        { label: 'FEATURES', placeholder: 'Key features and specifications...', priority: 'required' },
        { label: 'BENEFITS', placeholder: 'How it solves user problems or adds value...', priority: 'required' },
        { label: 'AUDIENCE', placeholder: 'Target buyer persona...', priority: 'recommended' },
        { label: 'TONE', placeholder: 'e.g. Premium, Friendly, Technical, Minimalist...', priority: 'recommended' },
        { label: 'KEYWORDS', placeholder: 'SEO keywords for discoverability...', priority: 'optional' },
      ],
    },
    {
      name: 'Social Media',
      icon: '📱',
      desc: 'Posts, threads & captions',
      sections: [
        { label: 'ROLE', placeholder: 'e.g. Social Media Manager, Content Creator', priority: 'optional' },
        { label: 'CHANNEL', placeholder: 'e.g. Twitter/X, LinkedIn, Instagram, TikTok...', priority: 'required' },
        { label: 'TOPIC', placeholder: 'What the post is about...', priority: 'required' },
        { label: 'TONE', placeholder: 'e.g. Casual, Professional, Humorous, Thought-leader...', priority: 'recommended' },
        { label: 'CALL TO ACTION', placeholder: 'e.g. Follow, Comment, Share, Visit link...', priority: 'recommended' },
        { label: 'HASHTAGS', placeholder: 'Relevant hashtags to include...', priority: 'optional' },
        { label: 'CONSTRAINTS', placeholder: 'e.g. Max 280 chars, carousel of 5, include emoji...', priority: 'optional' },
      ],
    },
    {
      name: 'Resume & Cover Letter',
      icon: '📄',
      desc: 'Job applications & profiles',
      sections: [
        { label: 'ROLE', placeholder: 'e.g. Career Coach, Resume Expert', priority: 'optional' },
        { label: 'POSITION', placeholder: 'Job title you are applying for...', priority: 'required' },
        { label: 'SKILLS', placeholder: 'Key skills and technologies to highlight...', priority: 'required' },
        { label: 'EXPERIENCE LEVEL', placeholder: 'e.g. Fresh graduate, 3 years, Senior (8+ yrs)...', priority: 'required' },
        { label: 'ACHIEVEMENTS', placeholder: 'Notable results, metrics, or accomplishments...', priority: 'recommended' },
        { label: 'TONE', placeholder: 'e.g. Confident, Professional, Conversational...', priority: 'recommended' },
        { label: 'FORMAT', placeholder: 'e.g. ATS-friendly, One-page, Creative layout...', priority: 'optional' },
      ],
    },
    {
      name: 'Creative Writing',
      icon: '📜',
      desc: 'Stories, scripts & narratives',
      sections: [
        { label: 'ROLE', placeholder: 'e.g. Novelist, Screenwriter, Storyteller', priority: 'optional' },
        { label: 'GENRE', placeholder: 'e.g. Sci-fi, Fantasy, Thriller, Romance, Horror...', priority: 'required' },
        { label: 'CHARACTERS', placeholder: 'Main characters, their traits, and arcs...', priority: 'required' },
        { label: 'SETTING', placeholder: 'Time period, location, world-building details...', priority: 'required' },
        { label: 'TONE', placeholder: 'e.g. Dark, Whimsical, Suspenseful, Poetic...', priority: 'recommended' },
        { label: 'FORMAT', placeholder: 'e.g. Short story, Chapter 1, Screenplay, Dialogue...', priority: 'recommended' },
        { label: 'LENGTH', placeholder: 'e.g. 1000 words, 3 pages, One scene...', priority: 'optional' },
      ],
    },
    {
      name: 'SQL & Database',
      icon: '🗄️',
      desc: 'Write queries & design schemas',
      sections: [
        { label: 'ROLE', placeholder: 'e.g. Database Engineer, SQL Expert', priority: 'optional' },
        { label: 'DATABASE', placeholder: 'e.g. PostgreSQL, MySQL, MongoDB, SQLite...', priority: 'required' },
        { label: 'TASK', placeholder: 'What query or schema to create...', priority: 'required' },
        { label: 'SCHEMA', placeholder: 'Tables, columns, relationships involved...', priority: 'required' },
        { label: 'QUERY TYPE', placeholder: 'e.g. SELECT with JOINs, Aggregation, Window function...', priority: 'recommended' },
        { label: 'CONSTRAINTS', placeholder: 'e.g. Must be optimized, avoid subqueries, use indexes...', priority: 'optional' },
        { label: 'OUTPUT', placeholder: 'e.g. Query + explanation + sample data...', priority: 'optional' },
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
      flex-direction: column;
      gap: 10px;
      position: relative;
    }

    /* Right-aligned hover controls */
    .pd-section-controls {
      display: flex;
      align-items: center;
      gap: 6px;
      opacity: 0;
      transition: opacity .2s ease;
    }
    .pd-section-row:hover .pd-section-controls, 
    .pd-section-controls:focus-within {
      opacity: 1;
    }
    .pd-grip {
      cursor: grab;
      color: rgba(255,255,255,.30);
      display: flex;
      padding: 4px;
      border-radius: 4px;
      transition: color .15s, background .15s;
    }
    .pd-grip:hover { color: rgba(255,255,255,.8); background: rgba(255,255,255,.1); }
    .pd-delete-btn {
      background: transparent;
      border: none;
      cursor: pointer;
      color: rgba(255,255,255,.30);
      display: flex;
      align-items: center;
      padding: 4px;
      border-radius: 4px;
      transition: color .15s, background .15s;
    }
    .pd-delete-btn:hover { color: #f87171; background: rgba(248,113,113,.1); }
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

    /* ── Priority badges ── */
    .pd-priority {
      display: inline-flex;
      align-items: center;
      font-size: 9px;
      font-weight: 600;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      padding: 2px 7px;
      border-radius: 4px;
      flex-shrink: 0;
      line-height: 1;
      white-space: nowrap;
    }
    .pd-priority.required {
      background: linear-gradient(135deg, rgba(239,68,68,.18), rgba(239,68,68,.08));
      color: #f87171;
      border: 1px solid rgba(239,68,68,.25);
    }
    .pd-priority.recommended {
      background: linear-gradient(135deg, rgba(245,158,11,.15), rgba(245,158,11,.06));
      color: #fbbf24;
      border: 1px solid rgba(245,158,11,.2);
    }
    .pd-priority.optional {
      background: rgba(255,255,255,.04);
      color: rgba(255,255,255,.3);
      border: 1px solid rgba(255,255,255,.08);
    }
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
      padding: 14px 16px;
      display: flex;
      flex-direction: column;
      gap: 10px;
      transition: border-color .15s, box-shadow .15s;
    }
    .pd-history-card:hover { border-color: rgba(59,130,246,.25); box-shadow: 0 0 12px rgba(59,130,246,.06); }
    .pd-history-top {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .pd-history-meta {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .pd-history-tmpl-name {
      font-size: 12px;
      font-weight: 600;
      color: rgba(255,255,255,.75);
    }
    .pd-history-time {
      font-size: 10px;
      color: rgba(255,255,255,.25);
    }
    .pd-history-stats {
      font-size: 10px;
      color: rgba(255,255,255,.2);
      padding: 2px 6px;
      background: rgba(255,255,255,.04);
      border-radius: 3px;
    }
    .pd-history-actions {
      display: flex;
      gap: 6px;
    }
    .pd-history-use-btn {
      padding: 5px 12px;
      border-radius: 6px;
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
      padding: 5px 8px;
      border-radius: 6px;
      border: 1px solid rgba(255,255,255,.08);
      background: transparent;
      color: rgba(255,255,255,.25);
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
      color: rgba(255,255,255,.45);
      background: rgba(255,255,255,.06);
      padding: 2px 7px;
      border-radius: 4px;
    }
    .pd-history-tag.filled {
      color: rgba(59,130,246,.7);
      background: rgba(59,130,246,.08);
    }
    .pd-history-body { display: flex; flex-direction: column; gap: 4px; }
    .pd-history-preview-line {
      font-size: 11px;
      color: rgba(255,255,255,.3);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      line-height: 1.4;
    }
    .pd-history-preview-label {
      color: rgba(255,255,255,.45);
      font-weight: 600;
      font-size: 10px;
    }
    .pd-history-empty { text-align: center; padding: 48px 0; color: rgba(255,255,255,.25); font-size: 13px; }

    /* ── Template Banner ── */
    .pd-template-banner {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 12px;
      margin-bottom: 10px;
      background: linear-gradient(135deg, rgba(59,130,246,.08), rgba(59,130,246,.03));
      border: 1px solid rgba(59,130,246,.15);
      border-radius: 8px;
      font-size: 12px;
      color: rgba(255,255,255,.6);
    }
    .pd-template-banner-icon { font-size: 14px; }
    .pd-template-banner-name {
      font-weight: 600;
      color: #60a5fa;
    }
    .pd-template-banner-badge {
      font-size: 9px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: .04em;
      padding: 2px 6px;
      border-radius: 3px;
      background: rgba(245,158,11,.12);
      color: #fbbf24;
      border: 1px solid rgba(245,158,11,.2);
    }

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

    /* ── Custom Editor & Slash Menu ── */
    #pd-custom-editor { 
      width: 100%; height: 100%; 
      background: #111; color: #ddd; 
      font-family: 'JetBrains Mono', Consolas, monospace; 
      font-size: 13px; line-height: 1.5; 
      padding: 16px; border: none; outline: none; resize: none; 
      border-radius: 8px; box-sizing: border-box; 
    }
    .slash-menu { 
      position: absolute; z-index: 100; width: 280px; 
      background: #252526; border: 1px solid rgba(59,130,246,0.5); 
      border-radius: 6px; padding: 4px 0; margin: 0; 
      list-style: none; box-shadow: 0 4px 12px rgba(0,0,0,0.5); 
      display: none; 
    }
    .slash-menu.active { display: block; }
    .slash-item { 
      display: flex; align-items: center; padding: 6px 12px; 
      cursor: pointer; color: #ccc; font-size: 13px; 
      font-family: system-ui, -apple-system, sans-serif; 
    }
    .slash-item.selected, .slash-item:hover { 
      background: #3b82f6; color: #fff; 
    }
    .slash-item-icon { margin-right: 8px; font-size: 14px; }
    .slash-item-label { flex: 1; text-align: left; }
    .slash-item-hint { font-size: 11px; opacity: 0.7; text-align: right; }

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

    /* ── Coming Soon ── */
    .pd-coming-soon {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
      text-align: center;
      padding: 0 20px;
    }
    .pd-coming-soon-icon {
      font-size: 48px;
      margin-bottom: 20px;
      background: linear-gradient(135deg, #60a5fa, #a78bfa);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      animation: pulse-glow 2s infinite alternate;
    }
    @keyframes pulse-glow {
      0% { filter: drop-shadow(0 0 8px rgba(96,165,250,.4)); }
      100% { filter: drop-shadow(0 0 16px rgba(167,139,250,.6)); }
    }
    .pd-coming-soon-title {
      font-size: 20px;
      font-weight: 600;
      color: #fff;
      margin-bottom: 10px;
      letter-spacing: .01em;
    }
    .pd-coming-soon-desc {
      font-size: 14px;
      color: rgba(255,255,255,.5);
      line-height: 1.5;
      max-width: 280px;
    }
  `;
  shadow.appendChild(style);

  // ─── Overlay HTML ──────────────────────────────────────────────────
  const overlay = document.createElement('div');
  overlay.innerHTML = `
    <div class="pd-overlay" id="pd-overlay">
      <div class="pd-drag-handle"><div class="pd-drag-handle-bar"></div></div>
      <div class="pd-tabs-row">
        <button class="pd-tab active" data-tab="structure">Prompt Builder</button>
        <button class="pd-tab" data-tab="custom">Quick Editor</button>
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
      <div class="pd-body hidden" id="pd-tab-custom">
        <div class="pd-coming-soon">
          <div class="pd-coming-soon-icon">✨</div>
          <div class="pd-coming-soon-title">Quick Editor</div>
          <div class="pd-coming-soon-desc">A powerful, AI-assisted scratchpad is coming soon. Stay tuned for a seamless drafting experience!</div>
        </div>
      </div>
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
          priority: s.priority || 'optional',
        }));
        activeTemplateName = tmpl.name;
        templateModified = false;
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
      templateName: activeTemplateName || null,
      sections: sections.map(s => ({ label: s.label, value: s.value, placeholder: s.placeholder || '', priority: s.priority || 'optional' })),
    };
    const history = getHistory();
    history.unshift(entry);
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
        const now = Date.now();
        const diffMs = now - entry.timestamp;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHrs = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);
        let timeAgo;
        if (diffMins < 1) timeAgo = 'Just now';
        else if (diffMins < 60) timeAgo = `${diffMins}m ago`;
        else if (diffHrs < 24) timeAgo = `${diffHrs}h ago`;
        else if (diffDays < 7) timeAgo = `${diffDays}d ago`;
        else timeAgo = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

        const filledCount = entry.sections.filter(s => s.value.trim()).length;
        const totalCount = entry.sections.length;
        const tmplLabel = entry.templateName || 'Custom Prompt';

        const tags = entry.sections.map(s => {
          const isFilled = s.value.trim();
          return `<span class="pd-history-tag${isFilled ? ' filled' : ''}">${s.label || 'UNTITLED'}</span>`;
        }).join('');

        // Show up to 2 filled sections as preview lines
        const previewLines = entry.sections
          .filter(s => s.value.trim())
          .slice(0, 2)
          .map(s => `<div class="pd-history-preview-line"><span class="pd-history-preview-label">${s.label}:</span> ${s.value.trim().slice(0, 80)}${s.value.trim().length > 80 ? '...' : ''}</div>`)
          .join('');

        html += `
          <div class="pd-history-card">
            <div class="pd-history-top">
              <div class="pd-history-meta">
                <span class="pd-history-tmpl-name">${tmplLabel}</span>
                <span class="pd-history-stats">${filledCount}/${totalCount} filled</span>
                <span class="pd-history-time">${timeAgo}</span>
              </div>
              <div class="pd-history-actions">
                <button class="pd-history-use-btn" data-hist-idx="${i}">Use</button>
                <button class="pd-history-del-btn" data-hist-idx="${i}">✕</button>
              </div>
            </div>
            <div class="pd-history-tags">${tags}</div>
            ${previewLines ? `<div class="pd-history-body">${previewLines}</div>` : ''}
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
          placeholder: s.placeholder || LABEL_DESCRIPTIONS[(s.label || '').toUpperCase()] || 'Enter details...',
          priority: s.priority || 'optional',
        }));
        activeTemplateName = entry.templateName || null;
        templateModified = false;
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

    if (activeTemplateName) {
      html = `
        <div class="pd-template-banner">
          <span class="pd-template-banner-icon">✨</span>
          <span>Using template: <span class="pd-template-banner-name">${activeTemplateName}</span></span>
          ${templateModified ? '<span class="pd-template-banner-badge">Modified</span>' : ''}
        </div>
      ` + html;
    }

    sections.forEach((sec, i) => {
      html += `
        <div class="pd-section-row" draggable="true" data-idx="${i}">
          <div class="pd-section-title-row">
            <div class="pd-label-wrapper">
              <input class="pd-label" type="text" value="${sec.label}" placeholder="SECTION NAME" data-idx="${i}" spellcheck="false" autocomplete="off" />
              ${LABEL_DESCRIPTIONS[sec.label.toUpperCase()] ? `<button class="pd-info-btn" type="button">i<span class="pd-info-tip">${LABEL_DESCRIPTIONS[sec.label.toUpperCase()]}</span></button>` : ''}
              ${sec.priority ? `<span class="pd-priority ${sec.priority}">${sec.priority === 'required' ? 'Required' : sec.priority === 'recommended' ? 'Recommended' : 'Optional'}</span>` : ''}
              <div class="pd-autocomplete" data-for="${i}"></div>
            </div>
            <div class="pd-title-divider"></div>
            <div class="pd-section-controls">
              <span class="pd-grip" title="Drag to reorder">${ICONS.grip}</span>
              <button class="pd-delete-btn" data-idx="${i}" title="Remove section">${ICONS.trash}</button>
            </div>
          </div>
          <textarea class="pd-textarea"
            placeholder="${sec.placeholder || LABEL_DESCRIPTIONS[(sec.label || '').toUpperCase()] || 'Enter details for this section...'}"
            data-id="${sec.id}">${sec.value}</textarea>
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

      // Tab / Shift+Tab navigation between textareas
      ta.addEventListener('keydown', (e) => {
        if (e.key !== 'Tab') return;
        const allTextareas = Array.from(container.querySelectorAll('.pd-textarea'));
        const currentIdx = allTextareas.indexOf(ta);
        if (e.shiftKey) {
          // Shift+Tab: go to previous textarea (if not first)
          if (currentIdx > 0) {
            e.preventDefault();
            allTextareas[currentIdx - 1].focus();
          }
        } else {
          // Tab: go to next textarea (if not last)
          if (currentIdx < allTextareas.length - 1) {
            e.preventDefault();
            allTextareas[currentIdx + 1].focus();
          }
        }
      });
    });

    container.querySelectorAll('.pd-delete-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        sections.splice(parseInt(btn.dataset.idx, 10), 1);
        if (activeTemplateName) templateModified = true;
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
          if (activeTemplateName) templateModified = true;
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
        const q = filter.toUpperCase().trim();
        const terms = q.split(/\s+/).filter(Boolean);
        // Exclude the CURRENT section's label from the 'used' list
        const used = new Set(sections.filter((s, index) => index !== idx).map(s => (s.label || '').toUpperCase()));

        const matches = PRESET_LABELS.filter(l => {
          if (used.has(l)) return false;
          if (q === '') return true;
          // All typed words must be in the label
          return terms.every(term => l.includes(term));
        });

        if (matches.length === 0) {
          dropdown.classList.remove('open');
          return;
        }

        dropdown.innerHTML = matches.map(label => {
          let html = label;
          if (q) {
            // Highlight each word match
            terms.forEach(term => {
              const regex = new RegExp(`(${term})`, 'gi');
              html = html.replace(regex, '<span class="pd-match">$1</span>');
            });
          }
          return `<button class="pd-autocomplete-item" data-value="${label}">${html}</button>`;
        }).join('');
        dropdown.classList.add('open');

        // Bind click on each item
        dropdown.querySelectorAll('.pd-autocomplete-item').forEach(item => {
          item.addEventListener('mousedown', e => {
            e.preventDefault(); // prevent blur
            inp.value = item.dataset.value;
            if (sections[idx]) {
              sections[idx].label = item.dataset.value;
              sections[idx].placeholder = '';
            }
            if (activeTemplateName) templateModified = true;
            dropdown.classList.remove('open');
            updateInfoButton();
            const ta = inp.closest('.pd-section-row').querySelector('.pd-textarea');
            if (ta) ta.placeholder = LABEL_DESCRIPTIONS[item.dataset.value] || 'Enter details for this section...';
          });
        });
      }

      inp.addEventListener('focus', () => showSuggestions(inp.value));
      inp.addEventListener('input', () => {
        if (sections[idx]) {
          sections[idx].label = inp.value.toUpperCase();
          sections[idx].placeholder = ''; // Clear custom placeholder to use desc
        }
        if (activeTemplateName) templateModified = true;
        showSuggestions(inp.value);
        updateInfoButton();
        const ta = inp.closest('.pd-section-row').querySelector('.pd-textarea');
        if (ta) ta.placeholder = LABEL_DESCRIPTIONS[inp.value.toUpperCase()] || 'Enter details for this section...';
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
          placeholder: '',
          priority: 'optional',
        });
        if (activeTemplateName) templateModified = true;
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
    if (activeTab === 'custom') {
      return shadow.getElementById('pd-custom-editor')?.value.trim() || '';
    }
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
    ['structure', 'custom', 'library', 'history'].forEach(t => {
      const p = shadow.getElementById(`pd-tab-${t}`);
      if (p) { if (t === tab) p.classList.remove('hidden'); else p.classList.add('hidden'); }
    });
    if (tab === 'history') renderHistory();
  }

  // ─── Custom Editor & Slash Menu ─────────────────────────────────────
  const SLASH_COMMANDS = [
    { label: 'Code Constraint', icon: '< >', hint: 'No external libs', value: 'Constraint: No external libraries.' },
    { label: 'Format: Markdown', icon: '📝', hint: 'Output markdown', value: 'Format the output strictly as Markdown.' },
    { label: 'Step-by-Step Thinking', icon: '🧪', hint: 'Chain of thought', value: "Let's think step by step." }
  ];

  function getCaretCoordinates(element, position) {
    const div = document.createElement('div');
    const style = div.style;
    const computed = window.getComputedStyle(element);
    for (const prop of Array.from(computed)) { style[prop] = computed.getPropertyValue(prop); }
    style.position = 'absolute';
    style.visibility = 'hidden';
    style.whiteSpace = 'pre-wrap';
    style.wordWrap = 'break-word';
    div.textContent = element.value.substring(0, position);
    const span = document.createElement('span');
    span.textContent = element.value.substring(position) || '.';
    div.appendChild(span);
    document.body.appendChild(div);
    const coordinates = {
      top: span.offsetTop + parseInt(computed.borderTopWidth || 0) - element.scrollTop,
      left: span.offsetLeft + parseInt(computed.borderLeftWidth || 0) - element.scrollLeft
    };
    document.body.removeChild(div);
    return coordinates;
  }

  const customEditor = shadow.getElementById('pd-custom-editor');
  const slashMenu = shadow.getElementById('pd-slash-menu');
  let slashMenuIndex = 0;
  let isSlashMenuOpen = false;

  function renderSlashMenu() {
    slashMenu.innerHTML = SLASH_COMMANDS.map((cmd, i) => `
      <li class="slash-item ${i === slashMenuIndex ? 'selected' : ''}" data-idx="${i}">
        <span class="slash-item-icon">${cmd.icon}</span>
        <span class="slash-item-label">${cmd.label}</span>
        <span class="slash-item-hint">${cmd.hint}</span>
      </li>
    `).join('');
  }

  function closeSlashMenu() {
    isSlashMenuOpen = false;
    slashMenu.classList.remove('active');
  }

  if (customEditor && slashMenu) {
    customEditor.addEventListener('keyup', (e) => {
      // Don't trigger on arrow keys or enter when menu is open
      if (isSlashMenuOpen && ['ArrowUp', 'ArrowDown', 'Enter', 'Escape'].includes(e.key)) return;

      const val = customEditor.value;
      const cursorPos = customEditor.selectionStart;

      // Check if user just typed '/' or is right after a '/'
      const textBeforeCursor = val.substring(0, cursorPos);
      if (textBeforeCursor.endsWith('/')) {
        const coords = getCaretCoordinates(customEditor, cursorPos);
        slashMenu.style.top = (coords.top + 20) + 'px';
        slashMenu.style.left = coords.left + 'px';
        slashMenuIndex = 0;
        isSlashMenuOpen = true;
        renderSlashMenu();
        slashMenu.classList.add('active');
      } else {
        closeSlashMenu();
      }
    });

    customEditor.addEventListener('keydown', (e) => {
      if (!isSlashMenuOpen) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        slashMenuIndex = (slashMenuIndex + 1) % SLASH_COMMANDS.length;
        renderSlashMenu();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        slashMenuIndex = (slashMenuIndex - 1 + SLASH_COMMANDS.length) % SLASH_COMMANDS.length;
        renderSlashMenu();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const cmd = SLASH_COMMANDS[slashMenuIndex];
        const val = customEditor.value;
        const cursorPos = customEditor.selectionStart;
        const textBeforeCursor = val.substring(0, cursorPos);
        // Remove trailing '/'
        const newTextBefore = textBeforeCursor.slice(0, -1);
        const newText = newTextBefore + cmd.value + val.substring(cursorPos);
        customEditor.value = newText;
        const newCursorPos = newTextBefore.length + cmd.value.length;
        customEditor.setSelectionRange(newCursorPos, newCursorPos);
        closeSlashMenu();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        closeSlashMenu();
      }
    });

    // Allow clicking menu items
    slashMenu.addEventListener('mousedown', (e) => {
      e.preventDefault(); // Keep focus on textarea
      const li = e.target.closest('.slash-item');
      if (!li) return;
      const idx = parseInt(li.dataset.idx, 10);
      const cmd = SLASH_COMMANDS[idx];
      const val = customEditor.value;
      const cursorPos = customEditor.selectionStart;
      const textBeforeCursor = val.substring(0, cursorPos);
      const newTextBefore = textBeforeCursor.slice(0, -1);
      const newText = newTextBefore + cmd.value + val.substring(cursorPos);
      customEditor.value = newText;
      const newCursorPos = newTextBefore.length + cmd.value.length;
      customEditor.setSelectionRange(newCursorPos, newCursorPos);
      closeSlashMenu();
    });
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
    activeTemplateName = null;
    templateModified = false;
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
