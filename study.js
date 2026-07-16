'use strict';

const STORAGE_KEY = 'kartenwerk.projects.v1';
const THEME_KEY = 'kartenwerk.theme.v1';
const params = new URLSearchParams(location.search);
const projectId = params.get('project') || '';
const requestedMode = params.get('mode') || 'learn';
const selectedSectionIds = (params.get('sections') || '').split(',').filter(Boolean);
const validModes = new Set(['learn', 'quiz', 'relearn']);
const mode = validModes.has(requestedMode) ? requestedMode : 'learn';
const app = document.getElementById('studyApp');

const projects = loadProjects();
const project = projects.find((item) => item.id === projectId);

const session = {
  project,
  mode,
  cards: [],
  index: 0,
  flipped: false,
  complete: false,
  ratings: {},
  correct: 0,
  wrong: 0,
  lastSwipeAt: 0
};

applyTheme();
init();

function init() {
  if (!project) {
    renderError('Projekt nicht gefunden', 'Das ausgewählte Projekt ist in diesem Browser nicht mehr vorhanden.');
    return;
  }

  const sections = selectedSectionIds.length
    ? project.sections.filter((section) => selectedSectionIds.includes(section.id))
    : project.sections;

  session.cards = sections.flatMap((section) => section.cards
    .filter((card) => mode !== 'relearn' || project.progress?.[card.id] === 'repeat')
    .map((card) => ({ ...card, sectionTitle: section.title, sectionId: section.id })));

  if (!session.cards.length) {
    renderError('Keine Karten ausgewählt', mode === 'relearn'
      ? 'In den gewählten Kategorien sind keine falsch beantworteten Karten mehr vorhanden.'
      : 'Für diese Auswahl wurden keine Karten gefunden.');
    return;
  }

  bindKeyboard();
  render();
}

function render() {
  if (session.complete) {
    renderSummary();
    return;
  }

  const card = session.cards[session.index];
  const modeTitle = mode === 'learn' ? 'Lernmodus' : mode === 'quiz' ? 'Abfragemodus' : 'Nachlernen';
  const progress = ((session.index + 1) / session.cards.length) * 100;
  const status = project.progress?.[card.id];
  const statusText = status === 'known' ? 'Bisher richtig' : status === 'repeat' ? 'Zum Nachlernen' : 'Noch unbewertet';
  const sourceText = formatSource(card.source);

  app.innerHTML = `
    <header class="session-header">
      <button class="session-back" id="backButton" type="button" aria-label="Zurück zum Projekt">←</button>
      <div class="session-heading">
        <strong>${escapeHTML(project.title)}</strong>
        <span>${modeTitle} · ${escapeHTML(card.sectionTitle)}</span>
      </div>
      <div class="session-score" aria-label="Ergebnis dieser Lerneinheit">
        ${mode === 'learn' ? `<span>${session.index + 1}/${session.cards.length}</span>` : `<span class="score-good">${session.correct}✓</span><span class="score-bad">${session.wrong}×</span>`}
      </div>
    </header>

    <section class="session-main">
      <div class="progress-line">
        <div class="progress-track"><div class="progress-bar" style="width:${progress}%"></div></div>
        <span class="progress-label">${session.index + 1} / ${session.cards.length}</span>
      </div>

      <div class="card-stage" id="cardStage">
        <span class="swipe-indicator left ${session.index === 0 ? 'disabled' : ''}" aria-hidden="true">‹</span>
        <div class="session-card ${session.flipped ? 'flipped' : ''}" id="sessionCard" role="button" tabindex="0" aria-label="Karte umdrehen">
          <div class="session-card-inner">
            <div class="session-face front">
              <div class="face-top"><span class="face-kicker">${escapeHTML(card.sectionTitle)}</span><span class="face-side">${escapeHTML(statusText)}</span></div>
              <div class="front-content"><h1 class="front-title fit-front">${escapeHTML(card.front)}</h1></div>
              <div class="face-hint">Antippen zum Umdrehen · nach links oder rechts wischen</div>
            </div>
            <div class="session-face back">
              <div class="face-top"><span class="face-kicker">Antwort</span><span class="face-side">${escapeHTML(sourceText || card.sectionTitle)}</span></div>
              <div class="answer-shell">
                <div class="answer-viewport" id="answerViewport"><div class="answer-content">${formatAnswer(card.back)}</div></div>
                <div class="scroll-cue" id="scrollCue" aria-hidden="true"><span>↓</span> Inhalt scrollen</div>
              </div>
              <div class="face-hint" id="backFaceHint">Antippen, um wieder die Vorderseite zu sehen</div>
            </div>
          </div>
        </div>
        <span class="swipe-indicator right ${session.index === session.cards.length - 1 ? 'disabled' : ''}" aria-hidden="true">›</span>
      </div>
    </section>

    <footer class="session-footer">
      ${renderControls()}
    </footer>`;

  bindSessionEvents();
  requestAnimationFrame(fitCardContent);
}

function renderControls() {
  const prevDisabled = session.index === 0 ? 'disabled' : '';
  const isLast = session.index === session.cards.length - 1;

  if (mode === 'learn') {
    return `
      <div class="session-controls">
        <button class="nav-button" id="prevButton" type="button" ${prevDisabled} aria-label="Vorherige Karte">←</button>
        <div class="center-actions"><button class="action-button" id="nextButton" type="button">${isLast ? 'Lernen beenden' : 'Nächste Karte'}</button></div>
        <button class="nav-button" id="nextArrowButton" type="button" aria-label="Nächste Karte">→</button>
      </div>`;
  }

  if (!session.flipped) {
    return `
      <div class="session-controls">
        <button class="nav-button" id="prevButton" type="button" ${prevDisabled} aria-label="Vorherige Karte">←</button>
        <div class="control-hint">Antwort überlegen und Karte antippen</div>
        <button class="nav-button" id="flipButton" type="button" aria-label="Antwort anzeigen">↻</button>
      </div>`;
  }

  const wrongLabel = mode === 'relearn' ? 'Noch unsicher' : 'Falsch';
  const correctLabel = mode === 'relearn' ? 'Jetzt gewusst' : 'Richtig';
  return `
    <div class="session-controls">
      <button class="nav-button" id="prevButton" type="button" ${prevDisabled} aria-label="Vorherige Karte">←</button>
      <div class="center-actions">
        <button class="action-button wrong" data-rate="repeat" type="button">${wrongLabel}</button>
        <button class="action-button correct" data-rate="known" type="button">${correctLabel}</button>
      </div>
      <button class="nav-button" id="flipButton" type="button" aria-label="Karte zurückdrehen">↻</button>
    </div>`;
}

function bindSessionEvents() {
  document.getElementById('backButton').addEventListener('click', goBackToProject);
  document.getElementById('sessionCard').addEventListener('click', () => {
    if (Date.now() - session.lastSwipeAt < 400) return;
    toggleFlip();
  });
  document.getElementById('prevButton')?.addEventListener('click', () => move(-1));
  document.getElementById('nextButton')?.addEventListener('click', () => move(1));
  document.getElementById('nextArrowButton')?.addEventListener('click', () => move(1));
  document.getElementById('flipButton')?.addEventListener('click', toggleFlip);
  document.querySelectorAll('[data-rate]').forEach((button) => button.addEventListener('click', () => rate(button.dataset.rate)));
  bindSwipe(document.getElementById('cardStage'));
  document.querySelectorAll('.rich-table-scroll').forEach((tableRegion) => {
    tableRegion.addEventListener('click', (event) => event.stopPropagation());
    tableRegion.addEventListener('touchstart', (event) => event.stopPropagation(), { passive: true });
    tableRegion.addEventListener('touchend', (event) => event.stopPropagation(), { passive: true });
  });
  const answerViewport = document.getElementById('answerViewport');
  answerViewport?.addEventListener('scroll', () => {
    session.lastSwipeAt = Date.now();
    updateAnswerOverflow();
  }, { passive: true });
}

function bindSwipe(element) {
  let startX = 0;
  let startY = 0;
  let active = false;

  element.addEventListener('touchstart', (event) => {
    const touch = event.changedTouches[0];
    startX = touch.clientX;
    startY = touch.clientY;
    active = true;
  }, { passive: true });

  element.addEventListener('touchend', (event) => {
    if (!active) return;
    active = false;
    const touch = event.changedTouches[0];
    const dx = touch.clientX - startX;
    const dy = touch.clientY - startY;
    if (Math.hypot(dx, dy) > 10) session.lastSwipeAt = Date.now();
    if (Math.abs(dx) < 52 || Math.abs(dx) < Math.abs(dy) * 1.2) return;
    move(dx < 0 ? 1 : -1);
  }, { passive: true });
}

function bindKeyboard() {
  document.addEventListener('keydown', (event) => {
    if (session.complete) return;
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      move(1);
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault();
      move(-1);
    } else if (event.key === ' ' || event.key === 'Enter') {
      event.preventDefault();
      toggleFlip();
    } else if (session.flipped && event.key.toLowerCase() === 'r' && mode !== 'learn') {
      rate('known');
    } else if (session.flipped && event.key.toLowerCase() === 'f' && mode !== 'learn') {
      rate('repeat');
    }
  });
}

function toggleFlip() {
  session.flipped = !session.flipped;
  const card = document.getElementById('sessionCard');
  if (card) card.classList.toggle('flipped', session.flipped);
  renderFooterOnly();
  requestAnimationFrame(fitCardContent);
}

function renderFooterOnly() {
  const footer = document.querySelector('.session-footer');
  if (!footer) return;
  footer.innerHTML = renderControls();
  document.getElementById('prevButton')?.addEventListener('click', () => move(-1));
  document.getElementById('nextButton')?.addEventListener('click', () => move(1));
  document.getElementById('nextArrowButton')?.addEventListener('click', () => move(1));
  document.getElementById('flipButton')?.addEventListener('click', toggleFlip);
  document.querySelectorAll('[data-rate]').forEach((button) => button.addEventListener('click', () => rate(button.dataset.rate)));
}

function move(direction) {
  if (direction > 0 && session.index >= session.cards.length - 1) {
    session.complete = true;
    render();
    return;
  }
  const next = Math.min(Math.max(session.index + direction, 0), session.cards.length - 1);
  if (next === session.index) return;
  session.index = next;
  session.flipped = false;
  render();
}

function rate(value) {
  const card = session.cards[session.index];
  const previous = session.ratings[card.id];
  if (previous === 'known') session.correct -= 1;
  if (previous === 'repeat') session.wrong -= 1;

  session.ratings[card.id] = value;
  if (value === 'known') session.correct += 1;
  if (value === 'repeat') session.wrong += 1;

  project.progress ||= {};
  project.progress[card.id] = value;
  project.updatedAt = new Date().toISOString();
  saveProjects();

  if (session.index >= session.cards.length - 1) {
    session.complete = true;
    render();
  } else {
    session.index += 1;
    session.flipped = false;
    render();
  }
}

function renderSummary() {
  const isLearn = mode === 'learn';
  const remainingWrong = Object.values(project.progress || {}).filter((value) => value === 'repeat').length;
  app.innerHTML = `
    <header class="session-header">
      <button class="session-back" id="backButton" type="button" aria-label="Zurück zum Projekt">←</button>
      <div class="session-heading"><strong>${escapeHTML(project.title)}</strong><span>Lerneinheit beendet</span></div>
      <div></div>
    </header>
    <section class="session-summary">
      <div class="summary-card">
        <span class="summary-icon" aria-hidden="true">✓</span>
        <h1>${isLearn ? 'Lernrunde abgeschlossen' : mode === 'relearn' ? 'Nachlernen abgeschlossen' : 'Abfrage abgeschlossen'}</h1>
        <p>${session.cards.length} ${session.cards.length === 1 ? 'Karte wurde' : 'Karten wurden'} bearbeitet.</p>
        ${isLearn ? '' : `
          <div class="summary-stats">
            <div class="summary-stat"><strong class="score-good">${session.correct}</strong><span>richtig beantwortet</span></div>
            <div class="summary-stat"><strong class="score-bad">${session.wrong}</strong><span>falsch beantwortet</span></div>
          </div>`}
        <div class="summary-actions">
          <button class="action-button" id="returnProjectButton" type="button">Zurück zum Projekt</button>
          ${remainingWrong ? `<button class="action-button secondary" id="startRelearnButton" type="button">${remainingWrong} ${remainingWrong === 1 ? 'Karte' : 'Karten'} nachlernen</button>` : ''}
        </div>
      </div>
    </section>
    <footer></footer>`;

  document.getElementById('backButton').addEventListener('click', goBackToProject);
  document.getElementById('returnProjectButton').addEventListener('click', goBackToProject);
  document.getElementById('startRelearnButton')?.addEventListener('click', () => {
    const sectionIds = [...new Set(session.cards.map((card) => card.sectionId))];
    const nextParams = new URLSearchParams({ project: project.id, mode: 'relearn', sections: sectionIds.join(',') });
    location.href = `study.html?${nextParams.toString()}`;
  });
}

function renderError(title, message) {
  app.innerHTML = `
    <header class="session-header"><button class="session-back" id="backButton" type="button">←</button><div class="session-heading"><strong>KartenWerk</strong><span>Lerneinheit</span></div><div></div></header>
    <section class="session-error"><div class="summary-card"><span class="summary-icon">!</span><h1>${escapeHTML(title)}</h1><p>${escapeHTML(message)}</p><div class="summary-actions"><button class="action-button" id="returnProjectButton" type="button">Zurück</button></div></div></section><footer></footer>`;
  document.getElementById('backButton').addEventListener('click', goBackToProject);
  document.getElementById('returnProjectButton').addEventListener('click', goBackToProject);
}

function fitCardContent() {
  fitElement(document.querySelector('.fit-front'), 18);
  const viewport = document.getElementById('answerViewport');
  if (viewport) viewport.scrollTop = 0;
  updateAnswerOverflow();
}

function updateAnswerOverflow() {
  const viewport = document.getElementById('answerViewport');
  const cue = document.getElementById('scrollCue');
  const hint = document.getElementById('backFaceHint');
  if (!viewport || !cue || !hint) return;
  const scrollable = viewport.scrollHeight > viewport.clientHeight + 6;
  const atBottom = viewport.scrollTop + viewport.clientHeight >= viewport.scrollHeight - 8;
  cue.classList.toggle('visible', scrollable && !atBottom);
  viewport.classList.toggle('is-scrollable', scrollable);
  hint.textContent = scrollable
    ? 'Nach oben oder unten scrollen · antippen zum Umdrehen'
    : 'Antippen, um wieder die Vorderseite zu sehen';
}

function fitElement(element, minimum) {
  if (!element) return;
  const container = element.parentElement;
  if (!container) return;
  element.style.fontSize = '';
  let size = parseFloat(getComputedStyle(element).fontSize);
  let attempts = 0;
  while ((element.scrollHeight > container.clientHeight || element.scrollWidth > container.clientWidth) && size > minimum && attempts < 45) {
    size -= 1;
    element.style.fontSize = `${size}px`;
    attempts += 1;
  }
}

function goBackToProject() {
  location.href = `index.html#project=${encodeURIComponent(projectId)}`;
}

function loadProjects() {
  try {
    const value = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

function saveProjects() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
  } catch {
    showToast('Lernstand konnte nicht gespeichert werden');
  }
}

function applyTheme() {
  const saved = localStorage.getItem(THEME_KEY);
  const preferred = window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  const theme = saved === 'dark' || (!saved && preferred) ? 'dark' : 'light';
  document.documentElement.dataset.theme = theme;
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#0e1420' : '#4f46e5');
}

function showToast(message) {
  const toast = document.getElementById('sessionToast');
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2600);
}

function formatAnswer(content) {
  return window.KartenWerkRichText?.render(content) || '<p>Keine Erklärung vorhanden.</p>';
}

function formatSource(source) {
  if (!source || typeof source !== 'object') return '';
  const parts = [];
  if (source.file) parts.push(String(source.file));
  if (source.slide) parts.push(`Folie ${source.slide}`);
  else if (source.page) parts.push(`Seite ${source.page}`);
  return parts.join(' · ');
}

function escapeHTML(value) {
  return String(value).replace(/[&<>\"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '\"': '&quot;' }[char]));
}
