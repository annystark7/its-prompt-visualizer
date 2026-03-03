(() => {
  'use strict';

  // ─── State ──────────────────────────────────────────────────────────
  let overlayVisible = false;
  let activeTab = 'structure';
  let sections = [
    { id: crypto.randomUUID(), label: 'TARGET AUDIENCE', value: '', placeholder: 'Describe the target audience...' },
    { id: crypto.randomUUID(), label: 'TONE', value: '', placeholder: 'e.g. Professional, Friendly, Witty...' },
    { id: crypto.randomUUID(), label: 'LENGTH', value: '', placeholder: 'e.g. Short, Medium, Detailed...' },
  ];
  let dragSrcIndex = null;

  // ─── Colors ─────────────────────────────────────────────────────────
  const C = {
    bg: '#212121',
    card: '#2f2f2f',
    border: '#424242',
    borderSubtle: '#383838',
    blue: '#3B82F6',
    blueHover: '#2563EB',
    text: '#ECECEC',
    muted: '#8E8E8E',
    input: '#2b2b2b',
    inputBorder: '#424242',
  };

  // ─── SVG Icons ─────────────────────────────────────────────────────
  const ICONS = {
    grip: `<svg width="10" height="16" viewBox="0 0 10 16" fill="currentColor"><circle cx="2" cy="2" r="1.5"/><circle cx="8" cy="2" r="1.5"/><circle cx="2" cy="8" r="1.5"/><circle cx="8" cy="8" r="1.5"/><circle cx="2" cy="14" r="1.5"/><circle cx="8" cy="14" r="1.5"/></svg>`,
    trash: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>`,
    chevronDown: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg>`,
    merge: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14"/><path d="M5 12l7-7 7 7"/></svg>`,
    copy: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>`,
    toggle: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="5" rx="1.5"/><rect x="3" y="10" width="18" height="5" rx="1.5"/><rect x="3" y="17" width="18" height="5" rx="1.5"/></svg>`,
  };

  // ─── Shadow DOM Host ───────────────────────────────────────────────
  const host = document.createElement('div');
  host.id = 'promptdeck-host';
  host.style.cssText = 'position:fixed;top:0;left:0;width:0;height:0;z-index:99999;pointer-events:none;';
  document.body.appendChild(host);

  const shadow = host.attachShadow({ mode: 'open' });

  // ─── All Styles ────────────────────────────────────────────────────
  const style = document.createElement('style');
  style.textContent = `
    :host { all: initial; }
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    /* Scrollbar */
    ::-webkit-scrollbar { width: 5px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: ${C.border}; border-radius: 3px; }
    ::-webkit-scrollbar-thumb:hover { background: #555; }

    /* Animations */
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

    /* ── Overlay ── */
    .pd-overlay {
      position: fixed;
      bottom: 0;
      left: 50%;
      transform: translateX(-50%);
      width: 720px;
      max-width: 95vw;
      height: 520px;
      display: none;
      flex-direction: column;
      background: ${C.bg};
      border-radius: 18px 18px 0 0;
      border: 1px solid ${C.borderSubtle};
      border-bottom: none;
      box-shadow: 0 -12px 50px rgba(0,0,0,.55), 0 -2px 10px rgba(0,0,0,.3);
      color: ${C.text};
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 13px;
      pointer-events: auto;
    }

    /* ── Header ── */
    .pd-header { flex-shrink: 0; }
    .pd-drag-handle {
      display: flex;
      justify-content: center;
      padding: 10px 0 6px;
      cursor: grab;
    }
    .pd-drag-handle-bar {
      width: 36px;
      height: 4px;
      border-radius: 2px;
      background: #4a4a4a;
    }
    .pd-tabs-row {
      display: flex;
      align-items: center;
      border-bottom: 1px solid ${C.borderSubtle};
      padding: 0 16px;
    }
    .pd-tab {
      position: relative;
      padding: 10px 14px;
      font-size: 13px;
      font-weight: 500;
      color: ${C.muted};
      background: transparent;
      border: none;
      cursor: pointer;
      transition: color .15s;
      font-family: inherit;
      white-space: nowrap;
    }
    .pd-tab::after {
      content: '';
      position: absolute;
      bottom: -1px;
      left: 8px; right: 8px;
      height: 2px;
      background: transparent;
      border-radius: 1px;
      transition: background .15s;
    }
    .pd-tab.active { color: #fff; }
    .pd-tab.active::after { background: ${C.blue}; }
    .pd-tab:hover:not(.active) { color: #bbb; }
    .pd-close-btn {
      margin-left: auto;
      background: transparent;
      border: none;
      color: ${C.muted};
      cursor: pointer;
      padding: 6px;
      display: flex;
      align-items: center;
      border-radius: 6px;
      transition: background .15s, color .15s;
    }
    .pd-close-btn:hover { background: rgba(255,255,255,.08); color: ${C.text}; }

    /* ── Body ── */
    .pd-body {
      flex: 1;
      overflow-y: auto;
      padding: 16px 20px;
    }
    .pd-body.hidden { display: none; }

    /* ── Section Cards ── */
    .pd-sections { display: flex; flex-direction: column; gap: 16px; }
    .pd-card {
      display: flex;
      gap: 10px;
      padding: 14px 16px;
      background: ${C.card};
      border: 1px solid ${C.borderSubtle};
      border-radius: 10px;
      transition: border-color .15s;
    }
    .pd-card:hover { border-color: ${C.border}; }
    .pd-card.drag-over { border-color: ${C.blue} !important; background: rgba(59,130,246,.08) !important; }
    .pd-card-icons {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      padding-top: 2px;
      flex-shrink: 0;
      width: 18px;
    }
    .pd-grip {
      cursor: grab;
      color: #555;
      display: flex;
      align-items: center;
      transition: color .15s;
    }
    .pd-grip:hover { color: ${C.muted}; }
    .pd-delete-btn {
      background: transparent;
      border: none;
      cursor: pointer;
      color: #555;
      padding: 0;
      display: flex;
      align-items: center;
      transition: color .15s;
    }
    .pd-delete-btn:hover { color: #f87171; }
    .pd-card-content { flex: 1; display: flex; flex-direction: column; gap: 6px; min-width: 0; }
    .pd-label {
      font-size: 11px;
      font-weight: 600;
      letter-spacing: 0.08em;
      color: ${C.blue};
      text-transform: uppercase;
      font-family: inherit;
    }
    .pd-textarea {
      width: 100%;
      min-height: 68px;
      background: ${C.input};
      border: 1px solid ${C.inputBorder};
      border-radius: 8px;
      padding: 10px 12px;
      color: ${C.text};
      font-size: 13px;
      font-family: inherit;
      resize: vertical;
      transition: border-color .15s;
      line-height: 1.5;
    }
    .pd-textarea:focus { outline: none; border-color: ${C.blue}; }
    .pd-textarea::placeholder { color: #666; }

    /* ── Add Section ── */
    .pd-add-btn {
      width: 100%;
      padding: 10px;
      margin-top: 8px;
      border-radius: 10px;
      border: 1px dashed #444;
      background: transparent;
      color: #666;
      font-size: 13px;
      font-weight: 500;
      font-family: inherit;
      cursor: pointer;
      transition: border-color .2s, color .2s;
    }
    .pd-add-btn:hover { border-color: ${C.blue}; color: ${C.blue}; }

    /* ── Custom Tab ── */
    .pd-custom-textarea {
      width: 100%;
      height: 280px;
      background: ${C.input};
      border: 1px solid ${C.inputBorder};
      border-radius: 8px;
      padding: 12px;
      color: ${C.text};
      font-size: 13px;
      font-family: inherit;
      resize: none;
      line-height: 1.5;
    }
    .pd-custom-textarea:focus { outline: none; border-color: ${C.blue}; }
    .pd-custom-textarea::placeholder { color: #666; }

    /* ── Placeholder tabs ── */
    .pd-placeholder {
      text-align: center;
      padding: 48px 0;
      color: #555;
      font-size: 13px;
    }

    /* ── Footer ── */
    .pd-footer {
      flex-shrink: 0;
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 20px 16px;
      border-top: 1px solid ${C.borderSubtle};
    }
    .pd-merge-btn {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      background: ${C.blue};
      border: none;
      color: #fff;
      font-weight: 600;
      font-size: 14px;
      font-family: inherit;
      padding: 12px 0;
      border-radius: 12px;
      cursor: pointer;
      transition: background .15s;
      letter-spacing: 0.01em;
    }
    .pd-merge-btn:hover { background: ${C.blueHover}; }
    .pd-copy-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 42px;
      height: 42px;
      border-radius: 10px;
      background: ${C.card};
      border: 1px solid ${C.borderSubtle};
      color: ${C.muted};
      cursor: pointer;
      transition: color .15s, border-color .15s, background .15s;
    }
    .pd-copy-btn:hover { color: #fff; border-color: #555; background: #363636; }
  `;
  shadow.appendChild(style);

  // ─── Overlay Markup ────────────────────────────────────────────────
  const overlay = document.createElement('div');
  overlay.innerHTML = `
    <div class="pd-overlay" id="pd-overlay">
      <!-- Header -->
      <div class="pd-header">
        <div class="pd-drag-handle"><div class="pd-drag-handle-bar"></div></div>
        <div class="pd-tabs-row">
          <button class="pd-tab active" data-tab="structure">Structure Builder</button>
          <button class="pd-tab" data-tab="custom">Custom</button>
          <button class="pd-tab" data-tab="library">Prompt Library</button>
          <button class="pd-tab" data-tab="history">History</button>
          <button class="pd-close-btn" id="pd-close" title="Close">${ICONS.chevronDown}</button>
        </div>
      </div>

      <!-- Tab Bodies -->
      <div class="pd-body" id="pd-tab-structure"></div>
      <div class="pd-body hidden" id="pd-tab-custom">
        <textarea class="pd-custom-textarea" placeholder="Write your full custom prompt here..."></textarea>
      </div>
      <div class="pd-body hidden" id="pd-tab-library">
        <p class="pd-placeholder">Prompt Library — coming soon.</p>
      </div>
      <div class="pd-body hidden" id="pd-tab-history">
        <p class="pd-placeholder">Merge history — coming soon.</p>
      </div>

      <!-- Footer -->
      <div class="pd-footer">
        <button class="pd-merge-btn" id="pd-merge">
          ${ICONS.merge}
          Merge &amp; Insert to Chat
        </button>
        <button class="pd-copy-btn" id="pd-copy" title="Copy to clipboard">
          ${ICONS.copy}
        </button>
      </div>
    </div>
  `;
  shadow.appendChild(overlay);

  // ─── Render Section Cards ──────────────────────────────────────────
  function renderSections() {
    const container = shadow.getElementById('pd-tab-structure');
    if (!container) return;

    let html = '<div class="pd-sections">';
    sections.forEach((sec, i) => {
      html += `
        <div class="pd-card" draggable="true" data-idx="${i}">
          <div class="pd-card-icons">
            <span class="pd-grip" title="Drag to reorder">${ICONS.grip}</span>
            <button class="pd-delete-btn" data-idx="${i}" title="Remove section">
              ${ICONS.trash}
            </button>
          </div>
          <div class="pd-card-content">
            <div class="pd-label">${sec.label}</div>
            <textarea class="pd-textarea" placeholder="${sec.placeholder || 'Enter details for this section...'}" data-id="${sec.id}">${sec.value}</textarea>
          </div>
        </div>`;
    });
    html += '</div><button class="pd-add-btn" id="pd-add-section">+ Add Section</button>';
    container.innerHTML = html;
    bindSectionEvents(container);
  }

  // ─── Section Event Binding ─────────────────────────────────────────
  function bindSectionEvents(container) {
    container.querySelectorAll('.pd-textarea').forEach(ta => {
      ta.addEventListener('input', () => {
        const sec = sections.find(s => s.id === ta.dataset.id);
        if (sec) sec.value = ta.value;
      });
    });

    container.querySelectorAll('.pd-delete-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.dataset.idx, 10);
        sections.splice(idx, 1);
        renderSections();
      });
    });

    container.querySelectorAll('.pd-card').forEach(card => {
      card.addEventListener('dragstart', e => {
        dragSrcIndex = parseInt(card.dataset.idx, 10);
        card.style.opacity = '0.4';
        e.dataTransfer.effectAllowed = 'move';
      });
      card.addEventListener('dragend', () => { card.style.opacity = '1'; });
      card.addEventListener('dragover', e => { e.preventDefault(); card.classList.add('drag-over'); });
      card.addEventListener('dragleave', () => { card.classList.remove('drag-over'); });
      card.addEventListener('drop', e => {
        e.preventDefault();
        card.classList.remove('drag-over');
        const targetIdx = parseInt(card.dataset.idx, 10);
        if (dragSrcIndex !== null && dragSrcIndex !== targetIdx) {
          const [moved] = sections.splice(dragSrcIndex, 1);
          sections.splice(targetIdx, 0, moved);
          renderSections();
        }
        dragSrcIndex = null;
      });
    });

    const addBtn = container.querySelector('#pd-add-section');
    if (addBtn) {
      addBtn.addEventListener('click', () => {
        const name = prompt('Section name:');
        if (name && name.trim()) {
          sections.push({
            id: crypto.randomUUID(),
            label: name.trim().toUpperCase(),
            value: '',
            placeholder: 'Enter details for this section...',
          });
          renderSections();
        }
      });
    }
  }

  // ─── Assemble Merged Prompt ────────────────────────────────────────
  function assembleMergedPrompt() {
    if (activeTab === 'custom') {
      const ta = shadow.querySelector('#pd-tab-custom textarea');
      return ta ? ta.value.trim() : '';
    }
    return sections
      .filter(s => s.value.trim())
      .map(s => `### ${s.label}:\n${s.value.trim()}`)
      .join('\n\n');
  }

  // ─── Inject into ChatGPT Textarea ─────────────────────────────────
  function injectIntoChatGPT(text) {
    const textarea = document.querySelector('#prompt-textarea');
    if (!textarea) return;

    if (textarea.tagName === 'TEXTAREA' || textarea.tagName === 'INPUT') {
      const nativeSet = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value')?.set
        || Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set;
      if (nativeSet) nativeSet.call(textarea, text);
      else textarea.value = text;
      textarea.dispatchEvent(new Event('input', { bubbles: true }));
    } else {
      textarea.focus();
      textarea.innerHTML = '';
      const p = document.createElement('p');
      p.textContent = text;
      textarea.appendChild(p);
      textarea.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'insertText' }));
    }
  }

  // ─── Show / Hide Overlay ───────────────────────────────────────────
  function showOverlay() {
    const el = shadow.getElementById('pd-overlay');
    if (!el) return;
    el.style.display = 'flex';
    el.classList.remove('overlay-exit');
    el.classList.add('overlay-enter');
    overlayVisible = true;
    toggleBtn.style.display = 'none';
    renderSections();
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
    shadow.querySelectorAll('.pd-tab').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === tab);
    });
    const tabs = ['structure', 'custom', 'library', 'history'];
    tabs.forEach(t => {
      const panel = shadow.getElementById(`pd-tab-${t}`);
      if (panel) {
        if (t === tab) panel.classList.remove('hidden');
        else panel.classList.add('hidden');
      }
    });
  }

  // ─── Bind Overlay Events ───────────────────────────────────────────
  function bindOverlayEvents() {
    shadow.querySelectorAll('.pd-tab').forEach(btn => {
      btn.addEventListener('click', () => switchTab(btn.dataset.tab));
    });
    shadow.getElementById('pd-close')?.addEventListener('click', hideOverlay);
    shadow.getElementById('pd-merge')?.addEventListener('click', () => {
      const text = assembleMergedPrompt();
      if (!text) return;
      injectIntoChatGPT(text);
      hideOverlay();
    });
    shadow.getElementById('pd-copy')?.addEventListener('click', () => {
      const text = assembleMergedPrompt();
      if (text) navigator.clipboard.writeText(text).catch(() => { });
    });
  }
  bindOverlayEvents();

  // ─── Toggle Button (Shadow DOM, fixed position) ────────────────────
  const toggleBtn = document.createElement('button');
  toggleBtn.id = 'pd-toggle';
  toggleBtn.title = 'Open PromptDeck';
  toggleBtn.innerHTML = ICONS.toggle;
  toggleBtn.style.cssText = `
    position: fixed;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    border: none;
    background: transparent;
    color: #b4b4b4;
    cursor: pointer;
    display: none;
    align-items: center;
    justify-content: center;
    z-index: 99998;
    transition: background .15s, color .15s;
    pointer-events: auto;
    padding: 0;
  `;
  toggleBtn.addEventListener('mouseenter', () => { toggleBtn.style.background = 'rgba(255,255,255,0.1)'; toggleBtn.style.color = '#e5e5e5'; });
  toggleBtn.addEventListener('mouseleave', () => { toggleBtn.style.background = 'transparent'; toggleBtn.style.color = '#b4b4b4'; });
  toggleBtn.addEventListener('click', e => { e.preventDefault(); e.stopPropagation(); toggleOverlay(); });
  shadow.appendChild(toggleBtn);

  // ─── Position the toggle next to ChatGPT's native buttons ─────────
  let lastRect = '';

  function positionToggle() {
    if (overlayVisible) return;

    const textarea = document.querySelector('#prompt-textarea');
    if (!textarea) { toggleBtn.style.display = 'none'; return; }

    const formContainer = textarea.closest('form') || textarea.closest('[class*="composer"]') || textarea.parentElement?.parentElement?.parentElement;
    if (!formContainer) { toggleBtn.style.display = 'none'; return; }

    const rect = formContainer.getBoundingClientRect();
    const key = `${rect.top},${rect.right},${rect.bottom},${rect.left}`;

    if (key !== lastRect) {
      lastRect = key;
      toggleBtn.style.display = 'flex';
      toggleBtn.style.top = (rect.bottom - 44) + 'px';
      toggleBtn.style.left = (rect.right - 130) + 'px';
    } else if (toggleBtn.style.display === 'none') {
      toggleBtn.style.display = 'flex';
    }
  }

  // ─── requestAnimationFrame loop for instant position tracking ─────
  let rafId;
  function rafLoop() {
    positionToggle();
    rafId = requestAnimationFrame(rafLoop);
  }
  setTimeout(() => { rafId = requestAnimationFrame(rafLoop); }, 500);
})();
