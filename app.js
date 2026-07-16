'use strict';

const STORAGE_KEY = 'kartenwerk.projects.v1';
const THEME_KEY = 'kartenwerk.theme.v1';
const APP_VERSION = 1;

const JSON_PROMPT = `Erstelle aus der bereitgestellten Quelle einen vollständigen, karteikartengerechten Lernkartensatz für die Webanwendung „KartenWerk“.

QUELLE ERKENNEN:
- Die Quelle kann als angehängte PDF-, Word-, PowerPoint-, Text- oder Bilddatei vorliegen.
- Sie kann alternativ direkt unter „AUSGANGSTEXT“ in diese Nachricht eingefügt sein.
- Falls Anhänge und eingefügter Text vorhanden sind, berücksichtige beides gemeinsam, sofern nichts anderes angegeben ist.
- Falls mehrere Dateien angehängt sind, werte alle relevanten Dateien gemeinsam aus.
- Verwende ausschließlich Informationen aus der bereitgestellten Quelle. Erfinde, ergänze oder recherchiere nichts.

INHALTLICHE VORGABEN:
1. Bestimme einen aussagekräftigen Titel für das gesamte Lernprojekt.
2. Ordne den Inhalt in sinnvolle Oberthemen. Diese Oberthemen bilden später automatisch das Inhaltsverzeichnis.
3. Erstelle pro klar abgrenzbarem Begriff, Konzept, Modell, Argument oder Zusammenhang genau eine Karteikarte.
4. Die Vorderseite „front“ enthält eine eindeutige Frage oder einen präzisen Begriff.
5. Die Rückseite „back“ enthält eine verständliche, fachlich korrekte und lernbare Erklärung. Wichtige Definitionen, Merkmale, Zusammenhänge, Abgrenzungen und Beispiele aus der Quelle sollen erhalten bleiben.
6. Teile überladene Inhalte auf mehrere Karten auf, vermeide aber unnötige Wiederholungen.
7. Formuliere knapp, aber vollständig. Zeilenumbrüche innerhalb einer Rückseite dürfen als \\n gespeichert werden.

VERBINDLICHES DATEIFORMAT:
Erstelle den Inhalt exakt nach diesem JSON-Schema und verwende keine zusätzlichen Schlüssel:

{
  "projectTitle": "Aussagekräftiger Titel des Lernprojekts",
  "sections": [
    {
      "title": "Titel des Oberthemas",
      "cards": [
        {
          "front": "Frage oder Begriff auf der Vorderseite",
          "back": "Erklärung auf der Rückseite"
        }
      ]
    }
  ]
}

DATEIAUSGABE – SEHR WICHTIG:
1. Erstelle eine echte, herunterladbare UTF-8-Datei mit der Endung .json und dem MIME-Typ application/json.
2. Benenne sie nach dem Muster „kartenwerk-kurztitel.json“. Verwende im Dateinamen nur Kleinbuchstaben, Zahlen und Bindestriche.
3. Prüfe vor dem Bereitstellen, dass die Datei gültiges JSON enthält, alle Zeichen korrekt maskiert sind und nach dem jeweils letzten Element kein Komma steht.
4. Stelle die fertige JSON-Datei als herunterladbaren Dateianhang beziehungsweise Download-Link bereit.
5. Schreibe den JSON-Inhalt NICHT in den Chat, NICHT in einen Markdown-Codeblock und NICHT als Vorschau. Im Chat darf außer einem kurzen Hinweis auf die fertige Datei kein Karteninhalt erscheinen.
6. Falls in dieser ChatGPT-Umgebung technisch keine Datei erstellt werden kann, gib nicht ersatzweise den JSON-Code im Chat aus, sondern teile nur knapp mit, dass keine Datei erzeugt werden konnte.

AUSGANGSTEXT – nur verwenden, wenn der Inhalt nicht oder nicht vollständig als Anhang vorliegt:
[TEXT ODER LERNZETTEL HIER EINFÜGEN. BEI VOLLSTÄNDIGEM DATEIANHANG KANN DIESER PLATZHALTER STEHEN BLEIBEN.]`;

const DELIMITER_PROMPT = `Erstelle aus der bereitgestellten Quelle einen vollständigen, karteikartengerechten Lernkartensatz für die Webanwendung „KartenWerk“.

QUELLE ERKENNEN:
- Die Quelle kann als angehängte PDF-, Word-, PowerPoint-, Text- oder Bilddatei vorliegen.
- Sie kann alternativ direkt unter „AUSGANGSTEXT“ in diese Nachricht eingefügt sein.
- Falls Anhänge und eingefügter Text vorhanden sind, berücksichtige beides gemeinsam, sofern nichts anderes angegeben ist.
- Falls mehrere Dateien angehängt sind, werte alle relevanten Dateien gemeinsam aus.
- Verwende ausschließlich Informationen aus der bereitgestellten Quelle. Erfinde, ergänze oder recherchiere nichts.

INHALTLICHE VORGABEN:
1. Bestimme einen aussagekräftigen Titel für das gesamte Lernprojekt.
2. Ordne die Karten in sinnvolle Oberthemen. Diese Oberthemen bilden später automatisch das Inhaltsverzeichnis.
3. Jede Karte soll genau ein klar abgrenzbares Konzept behandeln.
4. Formuliere die Vorderseite als eindeutige Frage oder präzisen Begriff.
5. Formuliere die Rückseite als knappe, aber vollständige Erklärung. Wichtige Definitionen, Merkmale, Zusammenhänge, Abgrenzungen und Beispiele aus der Quelle sollen erhalten bleiben.
6. Teile überladene Inhalte auf mehrere Karten auf und vermeide unnötige Wiederholungen.

Gib das Ergebnis direkt als reinen Text im Chat aus. Verwende exakt dieses Format:

PROJEKT: Titel des Lernprojekts

§§§

THEMA: Name des Oberthemas
VORDERSEITE: Frage oder Begriff
RÜCKSEITE:
Vollständige Erklärung

§§§

THEMA: Name des Oberthemas
VORDERSEITE: Nächste Frage oder nächster Begriff
RÜCKSEITE:
Nächste Erklärung

FORMATREGELN:
- Zwischen zwei Karten muss immer eine eigene Zeile mit genau drei Paragrafzeichen stehen: §§§
- Vor und nach der Zeile mit §§§ muss jeweils eine Leerzeile stehen.
- Wiederhole „THEMA:“ bei jeder Karte, auch wenn mehrere Karten zum selben Oberthema gehören.
- Verwende keine Einleitung, keine Abschlussbemerkung, keine Aufzählung außerhalb der Karten und keine Markdown-Codeblöcke.
- In diesem Textmodus soll keine Datei erstellt werden.

AUSGANGSTEXT – nur verwenden, wenn der Inhalt nicht oder nicht vollständig als Anhang vorliegt:
[TEXT ODER LERNZETTEL HIER EINFÜGEN. BEI VOLLSTÄNDIGEM DATEIANHANG KANN DIESER PLATZHALTER STEHEN BLEIBEN.]`;

const state = {
  projects: loadProjects(),
  importTab: 'file',
  promptMode: 'json',
  study: {
    projectId: null,
    section: 'all',
    index: 0,
    mode: 'learn',
    flipped: false
  }
};

const app = document.getElementById('app');
const themeToggle = document.getElementById('themeToggle');
const homeButton = document.getElementById('homeButton');
const confirmDialog = document.getElementById('confirmDialog');

init();

function init() {
  applySavedTheme();
  bindGlobalEvents();
  route();
}

function bindGlobalEvents() {
  window.addEventListener('hashchange', route);

  homeButton.addEventListener('click', () => {
    location.hash = '';
  });

  themeToggle.addEventListener('click', () => {
    const root = document.documentElement;
    const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
    root.dataset.theme = next;
    localStorage.setItem(THEME_KEY, next);
    themeToggle.textContent = next === 'dark' ? '☀' : '◐';
  });

  document.addEventListener('keydown', (event) => {
    if (!location.hash.startsWith('#project=')) return;
    if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)) return;

    if (event.key === 'ArrowRight') {
      event.preventDefault();
      moveCard(1);
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault();
      moveCard(-1);
    } else if (event.key === ' ' && state.study.mode === 'quiz') {
      event.preventDefault();
      toggleFlip();
    }
  });
}

function route() {
  const match = location.hash.match(/^#project=([^&]+)/);
  if (match) {
    const projectId = decodeURIComponent(match[1]);
    if (state.projects.some((project) => project.id === projectId)) {
      if (state.study.projectId !== projectId) {
        state.study = { projectId, section: 'all', index: 0, mode: 'learn', flipped: false };
      }
      renderProject(projectId);
      return;
    }
  }
  renderDashboard();
}

function renderDashboard() {
  const prompt = state.promptMode === 'json' ? JSON_PROMPT : DELIMITER_PROMPT;

  app.innerHTML = `
    <section class="hero">
      <div class="hero-copy">
        <p class="eyebrow">Karteikarten aus KI-Ausgaben</p>
        <h1>Vom Lernzettel zum lernbaren Kartensatz.</h1>
        <p>Kopiere den vorbereiteten Prompt in ChatGPT, importiere das Ergebnis und lerne anschließend direkt im Browser. Alle Projekte bleiben lokal auf deinem Gerät.</p>
        <div class="hero-pills">
          <span class="pill">Keine Anmeldung</span>
          <span class="pill">JSON- und §§§-Import</span>
          <span class="pill">Lern- und Abfragemodus</span>
          <span class="pill">GitHub-Pages-fähig</span>
        </div>
      </div>
      <aside class="hero-card">
        <div>
          <h2>So funktioniert es</h2>
          <p>Drei Schritte ohne Server oder Datenbank.</p>
          <div class="flow-list">
            <div class="flow-item"><span class="flow-number">1</span><div><strong>Prompt kopieren</strong><small>Mit Text oder angehängten Dateien an ChatGPT senden</small></div></div>
            <div class="flow-item"><span class="flow-number">2</span><div><strong>Ergebnis importieren</strong><small>JSON-Datei hochladen oder Text einfügen</small></div></div>
            <div class="flow-item"><span class="flow-number">3</span><div><strong>Lernen</strong><small>Nach Themen filtern und Karten abfragen</small></div></div>
          </div>
        </div>
        <div class="notice info">Empfohlen: JSON. Der Prompt verlangt eine echte Download-Datei, die anschließend hier hochgeladen wird.</div>
      </aside>
    </section>

    <section class="grid-2">
      <article class="panel">
        <div class="panel-header">
          <div>
            <h2>1. ChatGPT-Prompt</h2>
            <p>Der Prompt erkennt Dateianhänge und eingefügten Text. Im JSON-Modus verlangt er eine echte Download-Datei.</p>
          </div>
        </div>
        <div class="import-tabs" role="tablist" aria-label="Promptformat">
          <button class="tab-button ${state.promptMode === 'json' ? 'active' : ''}" data-prompt-mode="json" type="button">JSON · empfohlen</button>
          <button class="tab-button ${state.promptMode === 'delimiter' ? 'active' : ''}" data-prompt-mode="delimiter" type="button">§§§ · Textformat</button>
        </div>
        <pre class="prompt-preview" id="promptPreview">${escapeHTML(prompt)}</pre>
        <div class="notice info">${state.promptMode === 'json'
          ? 'Erwartetes Ergebnis: eine herunterladbare .json-Datei. Diese Datei anschließend rechts unter „Datei hochladen“ auswählen.'
          : 'Erwartetes Ergebnis: reiner Chattext mit §§§-Trennzeilen. Diesen Text anschließend rechts einfügen.'}</div>
        <div class="button-row">
          <button class="button" id="copyPromptButton" type="button">Prompt kopieren</button>
          <button class="button ghost" id="copyPromptWithSourceButton" type="button">Prompt + Text kopieren</button>
        </div>
      </article>

      <article class="panel">
        <div class="panel-header">
          <div>
            <h2>2. Kartensatz importieren</h2>
            <p>Die Themen werden automatisch zum Inhaltsverzeichnis.</p>
          </div>
        </div>
        <div class="field">
          <label class="label" for="projectTitleOverride">Projektname <span style="font-weight:500;color:var(--muted)">(optional)</span></label>
          <input class="input" id="projectTitleOverride" type="text" maxlength="100" placeholder="Überschreibt den importierten Projekttitel">
        </div>
        <div class="import-tabs" role="tablist" aria-label="Importart">
          <button class="tab-button ${state.importTab === 'paste' ? 'active' : ''}" data-import-tab="paste" type="button">Text einfügen</button>
          <button class="tab-button ${state.importTab === 'file' ? 'active' : ''}" data-import-tab="file" type="button">Datei hochladen</button>
        </div>
        <div id="pasteImport" class="${state.importTab === 'paste' ? '' : 'hidden'}">
          <label class="label" for="importText">ChatGPT-Textausgabe</label>
          <textarea class="textarea" id="importText" spellcheck="false" placeholder='Optional: JSON-Inhalt oder Text mit §§§-Trennzeichen hier einfügen …'></textarea>
          <div class="button-row">
            <button class="button ghost" id="pasteClipboardButton" type="button">Aus Zwischenablage einfügen</button>
            <button class="button" id="importTextButton" type="button">Projekt erstellen</button>
          </div>
        </div>
        <div id="fileImport" class="${state.importTab === 'file' ? '' : 'hidden'}">
          <label class="dropzone" id="dropzone" for="fileInput">
            <div><strong>JSON- oder TXT-Datei auswählen</strong><span>Datei hier ablegen oder klicken</span></div>
          </label>
          <input class="hidden" id="fileInput" type="file" accept=".json,.txt,application/json,text/plain">
          <p class="field-help">Eine Beispieldatei liegt im Download-Ordner als <span class="code-inline">sample-cards.json</span>.</p>
        </div>
      </article>
    </section>

    <section>
      <div class="section-heading">
        <div>
          <h2>Deine Projekte</h2>
          <p>${state.projects.length} ${state.projects.length === 1 ? 'lokal gespeichertes Projekt' : 'lokal gespeicherte Projekte'}</p>
        </div>
        ${state.projects.length ? '<button class="button ghost small" id="exportAllButton" type="button">Alle sichern</button>' : ''}
      </div>
      <div class="project-grid">
        ${renderProjectCards()}
      </div>
    </section>
  `;

  bindDashboardEvents();
  app.focus({ preventScroll: true });
}

function renderProjectCards() {
  if (!state.projects.length) {
    return `<div class="empty-state"><strong>Noch kein Projekt vorhanden</strong>Importiere oben deinen ersten Kartensatz.</div>`;
  }

  return state.projects
    .slice()
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
    .map((project) => {
      const cardCount = countCards(project);
      const sectionCount = project.sections.length;
      return `
        <article class="project-card">
          <div class="project-card-top">
            <span class="project-icon">${escapeHTML(initials(project.title))}</span>
            <button class="kebab" data-delete-project="${project.id}" type="button" aria-label="Projekt löschen" title="Projekt löschen">×</button>
          </div>
          <h3>${escapeHTML(project.title)}</h3>
          <p class="project-meta">${sectionCount} ${sectionCount === 1 ? 'Thema' : 'Themen'} · ${cardCount} ${cardCount === 1 ? 'Karte' : 'Karten'}</p>
          <div class="project-card-footer">
            <span class="project-meta">${formatDate(project.updatedAt)}</span>
            <button class="button small" data-open-project="${project.id}" type="button">Öffnen</button>
          </div>
        </article>`;
    }).join('');
}

function bindDashboardEvents() {
  document.querySelectorAll('[data-prompt-mode]').forEach((button) => {
    button.addEventListener('click', () => {
      state.promptMode = button.dataset.promptMode;
      state.importTab = state.promptMode === 'json' ? 'file' : 'paste';
      renderDashboard();
    });
  });

  document.querySelectorAll('[data-import-tab]').forEach((button) => {
    button.addEventListener('click', () => {
      state.importTab = button.dataset.importTab;
      document.querySelectorAll('[data-import-tab]').forEach((item) => item.classList.toggle('active', item === button));
      document.getElementById('pasteImport').classList.toggle('hidden', state.importTab !== 'paste');
      document.getElementById('fileImport').classList.toggle('hidden', state.importTab !== 'file');
    });
  });

  document.getElementById('copyPromptButton').addEventListener('click', async () => {
    await copyText(state.promptMode === 'json' ? JSON_PROMPT : DELIMITER_PROMPT);
    toast('Prompt kopiert', 'Du kannst ihn jetzt in ChatGPT einfügen.');
  });

  document.getElementById('copyPromptWithSourceButton').addEventListener('click', async () => {
    const source = window.prompt('Füge deinen Ausgangstext ein. Er wird nur für den kopierten Prompt verwendet:');
    if (source === null) return;
    const base = state.promptMode === 'json' ? JSON_PROMPT : DELIMITER_PROMPT;
    const combined = base.replace(/\[TEXT ODER LERNZETTEL HIER EINFÜGEN[^\]]*\]/, source.trim());
    await copyText(combined);
    toast('Prompt mit Text kopiert', 'Der vollständige Auftrag liegt in der Zwischenablage.');
  });

  document.getElementById('pasteClipboardButton').addEventListener('click', async () => {
    try {
      const text = await navigator.clipboard.readText();
      document.getElementById('importText').value = text;
      toast('Zwischenablage eingefügt', 'Die Ausgabe kann jetzt importiert werden.');
    } catch {
      toast('Zugriff nicht möglich', 'Bitte füge den Text mit Strg+V in das Feld ein.');
    }
  });

  document.getElementById('importTextButton').addEventListener('click', () => {
    const text = document.getElementById('importText').value;
    importProjectText(text, document.getElementById('projectTitleOverride').value);
  });

  const fileInput = document.getElementById('fileInput');
  const dropzone = document.getElementById('dropzone');
  fileInput.addEventListener('change', () => {
    if (fileInput.files?.[0]) importFile(fileInput.files[0]);
  });
  ['dragenter', 'dragover'].forEach((name) => dropzone.addEventListener(name, (event) => {
    event.preventDefault();
    dropzone.classList.add('dragging');
  }));
  ['dragleave', 'drop'].forEach((name) => dropzone.addEventListener(name, (event) => {
    event.preventDefault();
    dropzone.classList.remove('dragging');
  }));
  dropzone.addEventListener('drop', (event) => {
    const file = event.dataTransfer.files?.[0];
    if (file) importFile(file);
  });

  document.querySelectorAll('[data-open-project]').forEach((button) => {
    button.addEventListener('click', () => {
      location.hash = `#project=${encodeURIComponent(button.dataset.openProject)}`;
    });
  });

  document.querySelectorAll('[data-delete-project]').forEach((button) => {
    button.addEventListener('click', async () => {
      const project = getProject(button.dataset.deleteProject);
      if (!project) return;
      const confirmed = await confirmAction('Projekt löschen?', `„${project.title}“ und alle zugehörigen Karten werden aus diesem Browser entfernt.`);
      if (confirmed) deleteProject(project.id);
    });
  });

  document.getElementById('exportAllButton')?.addEventListener('click', () => {
    downloadJson({ app: 'KartenWerk', version: APP_VERSION, exportedAt: new Date().toISOString(), projects: state.projects }, 'kartenwerk-gesamtsicherung.json');
  });
}

function renderProject(projectId) {
  const project = getProject(projectId);
  if (!project) {
    location.hash = '';
    return;
  }

  const cards = getFilteredCards(project);
  if (state.study.index >= cards.length) state.study.index = Math.max(0, cards.length - 1);
  const current = cards[state.study.index];
  const known = Object.values(project.progress || {}).filter((value) => value === 'known').length;
  const repeat = Object.values(project.progress || {}).filter((value) => value === 'repeat').length;

  app.innerHTML = `
    <header class="study-header">
      <div>
        <div class="breadcrumb"><button id="backToDashboard" type="button">Projekte</button> / Lernprojekt</div>
        <h1>${escapeHTML(project.title)}</h1>
        <p>${project.sections.length} ${project.sections.length === 1 ? 'Thema' : 'Themen'} · ${countCards(project)} ${countCards(project) === 1 ? 'Karte' : 'Karten'} · lokal gespeichert</p>
      </div>
      <div class="button-row">
        <button class="button ghost small" id="exportProjectButton" type="button">Exportieren</button>
        <button class="button ghost small" id="renameProjectButton" type="button">Umbenennen</button>
        <button class="button danger small" id="deleteCurrentProjectButton" type="button">Löschen</button>
      </div>
    </header>

    <div class="study-layout">
      <aside class="sidebar">
        <div class="sidebar-head"><strong>Inhaltsverzeichnis</strong><small>Thema zum Filtern auswählen</small></div>
        <nav class="toc" aria-label="Inhaltsverzeichnis">
          <button class="toc-button ${state.study.section === 'all' ? 'active' : ''}" data-section="all" type="button"><span>Alle Karten</span><span class="count-badge">${countCards(project)}</span></button>
          ${project.sections.map((section, index) => `
            <button class="toc-button ${state.study.section === String(index) ? 'active' : ''}" data-section="${index}" type="button">
              <span>${escapeHTML(section.title)}</span><span class="count-badge">${section.cards.length}</span>
            </button>`).join('')}
        </nav>
      </aside>

      <section class="study-shell">
        <div class="study-toolbar">
          <div class="segmented" aria-label="Lernmodus">
            <button class="${state.study.mode === 'learn' ? 'active' : ''}" data-mode="learn" type="button">Lernmodus</button>
            <button class="${state.study.mode === 'quiz' ? 'active' : ''}" data-mode="quiz" type="button">Abfragemodus</button>
          </div>
          <div class="progress-wrap">
            <div class="progress-meta"><span>${escapeHTML(current?.sectionTitle || 'Keine Karten')}</span><span>${cards.length ? `${state.study.index + 1} / ${cards.length}` : '0 / 0'}</span></div>
            <div class="progress-track"><div class="progress-bar" style="width:${cards.length ? ((state.study.index + 1) / cards.length) * 100 : 0}%"></div></div>
          </div>
        </div>

        ${current ? renderFlashcard(current) : `<div class="no-cards"><div><strong>In diesem Bereich sind keine Karten vorhanden.</strong><br>Wähle ein anderes Thema oder importiere einen neuen Kartensatz.</div></div>`}

        ${current ? `
          ${state.study.mode === 'quiz' ? `
            <div class="rating-row ${state.study.flipped ? '' : 'hidden'}" id="ratingRow">
              <button class="button ghost" data-rate="repeat" type="button">Noch einmal</button>
              <button class="button success" data-rate="known" type="button">Gewusst</button>
            </div>` : ''}
          <div class="study-nav">
            <button class="button ghost" id="prevCardButton" type="button" ${state.study.index === 0 ? 'disabled' : ''}>← Zurück</button>
            <span class="card-position">${state.study.mode === 'quiz' ? 'Leertaste dreht die Karte' : 'Titel und Erklärung zusammen'}</span>
            <button class="button" id="nextCardButton" type="button" ${state.study.index >= cards.length - 1 ? 'disabled' : ''}>Weiter →</button>
          </div>` : ''}

        <div class="stats-row">
          <div class="stat"><strong>${known}</strong><span>als gewusst markiert</span></div>
          <div class="stat"><strong>${repeat}</strong><span>zum Wiederholen</span></div>
          <div class="stat"><strong>${countCards(project) - known - repeat}</strong><span>noch ohne Bewertung</span></div>
        </div>
      </section>
    </div>
  `;

  bindProjectEvents(project);
  app.focus({ preventScroll: true });
}

function renderFlashcard(card) {
  const status = getProject(state.study.projectId)?.progress?.[card.id];
  const statusLabel = status === 'known' ? ' · Gewusst' : status === 'repeat' ? ' · Wiederholen' : '';

  if (state.study.mode === 'learn') {
    return `
      <div class="flashcard-stage">
        <article class="flashcard learn-card" aria-label="Lernkarte">
          <div class="card-face">
            <span class="card-kicker">${escapeHTML(card.sectionTitle)}${statusLabel}</span>
            <h2>${escapeHTML(card.front)}</h2>
            <div class="card-answer">${formatAnswer(card.back)}</div>
          </div>
        </article>
      </div>`;
  }

  return `
    <div class="flashcard-stage">
      <button class="flashcard ${state.study.flipped ? 'flipped' : ''}" id="flashcardButton" type="button" aria-label="Karte umdrehen">
        <span class="flashcard-inner">
          <span class="card-face front">
            <span class="card-kicker">${escapeHTML(card.sectionTitle)}${statusLabel}</span>
            <h2>${escapeHTML(card.front)}</h2>
            <span class="card-hint">Klicken zum Aufdecken</span>
          </span>
          <span class="card-face back">
            <span class="card-kicker">Antwort</span>
            <span class="card-answer">${formatAnswer(card.back)}</span>
            <span class="card-hint">Klicken zum Zurückdrehen</span>
          </span>
        </span>
      </button>
    </div>`;
}

function bindProjectEvents(project) {
  document.getElementById('backToDashboard').addEventListener('click', () => { location.hash = ''; });

  document.querySelectorAll('[data-section]').forEach((button) => {
    button.addEventListener('click', () => {
      state.study.section = button.dataset.section;
      state.study.index = 0;
      state.study.flipped = false;
      renderProject(project.id);
    });
  });

  document.querySelectorAll('[data-mode]').forEach((button) => {
    button.addEventListener('click', () => {
      state.study.mode = button.dataset.mode;
      state.study.flipped = false;
      renderProject(project.id);
    });
  });

  document.getElementById('flashcardButton')?.addEventListener('click', toggleFlip);
  document.getElementById('prevCardButton')?.addEventListener('click', () => moveCard(-1));
  document.getElementById('nextCardButton')?.addEventListener('click', () => moveCard(1));

  document.querySelectorAll('[data-rate]').forEach((button) => {
    button.addEventListener('click', () => rateCurrentCard(button.dataset.rate));
  });

  document.getElementById('exportProjectButton').addEventListener('click', () => {
    const clean = {
      projectTitle: project.title,
      sections: project.sections.map((section) => ({
        title: section.title,
        cards: section.cards.map((card) => ({ front: card.front, back: card.back }))
      }))
    };
    downloadJson(clean, `${safeFilename(project.title)}.json`);
  });

  document.getElementById('renameProjectButton').addEventListener('click', () => {
    const next = window.prompt('Neuer Projektname:', project.title)?.trim();
    if (!next || next === project.title) return;
    project.title = next.slice(0, 100);
    project.updatedAt = new Date().toISOString();
    saveProjects();
    renderProject(project.id);
    toast('Projekt umbenannt', next);
  });

  document.getElementById('deleteCurrentProjectButton').addEventListener('click', async () => {
    const confirmed = await confirmAction('Projekt löschen?', `„${project.title}“ und alle zugehörigen Karten werden aus diesem Browser entfernt.`);
    if (confirmed) deleteProject(project.id);
  });
}

function moveCard(direction) {
  const project = getProject(state.study.projectId);
  if (!project) return;
  const cards = getFilteredCards(project);
  const next = Math.min(Math.max(state.study.index + direction, 0), cards.length - 1);
  if (next === state.study.index) return;
  state.study.index = next;
  state.study.flipped = false;
  renderProject(project.id);
}

function toggleFlip() {
  if (state.study.mode !== 'quiz') return;
  state.study.flipped = !state.study.flipped;
  const card = document.getElementById('flashcardButton');
  const ratingRow = document.getElementById('ratingRow');
  if (card) {
    card.classList.toggle('flipped', state.study.flipped);
    card.setAttribute('aria-label', state.study.flipped ? 'Karte zurückdrehen' : 'Karte umdrehen');
  }
  if (ratingRow) ratingRow.classList.toggle('hidden', !state.study.flipped);
}

function rateCurrentCard(rating) {
  const project = getProject(state.study.projectId);
  const cards = project ? getFilteredCards(project) : [];
  const card = cards[state.study.index];
  if (!project || !card) return;
  project.progress ||= {};
  project.progress[card.id] = rating;
  project.updatedAt = new Date().toISOString();
  saveProjects();

  if (state.study.index < cards.length - 1) {
    state.study.index += 1;
    state.study.flipped = false;
  }
  renderProject(project.id);
}

function importFile(file) {
  if (!/\.(json|txt)$/i.test(file.name) && !['application/json', 'text/plain'].includes(file.type)) {
    toast('Dateityp nicht unterstützt', 'Bitte eine JSON- oder TXT-Datei auswählen.');
    return;
  }
  const reader = new FileReader();
  reader.onload = () => {
    const override = document.getElementById('projectTitleOverride')?.value || '';
    importProjectText(String(reader.result || ''), override);
  };
  reader.onerror = () => toast('Datei konnte nicht gelesen werden', 'Bitte versuche es erneut.');
  reader.readAsText(file, 'utf-8');
}

function importProjectText(raw, titleOverride = '') {
  if (!raw.trim()) {
    toast('Kein Inhalt', 'Füge zuerst eine ChatGPT-Textausgabe ein.');
    return;
  }

  try {
    const parsed = parseImport(raw);
    const project = normalizeProject(parsed, titleOverride);
    if (!countCards(project)) throw new Error('Es wurden keine gültigen Karten gefunden.');
    state.projects.push(project);
    saveProjects();
    toast('Projekt erstellt', `${countCards(project)} Karten wurden importiert.`);
    location.hash = `#project=${encodeURIComponent(project.id)}`;
  } catch (error) {
    console.error(error);
    toast('Import fehlgeschlagen', error.message || 'Das Format konnte nicht gelesen werden.');
  }
}

function parseImport(raw) {
  const cleaned = stripCodeFence(raw.trim());

  try {
    const json = JSON.parse(cleaned);
    if (json?.projects && Array.isArray(json.projects)) {
      throw new Error('Diese Datei ist eine Gesamtsicherung. Bitte importiere einzelne Projektdateien.');
    }
    return json;
  } catch (jsonError) {
    if (/^[\[{]/.test(cleaned)) {
      throw new Error(`Ungültiges JSON: ${friendlyJsonError(jsonError.message)}`);
    }
  }

  return parseDelimiterFormat(cleaned);
}

function parseDelimiterFormat(text) {
  const blocks = text.split(/\s*§{3}\s*/g).map((block) => block.trim()).filter(Boolean);
  let projectTitle = 'Neues Lernprojekt';
  let currentSection = 'Allgemein';
  const sectionMap = new Map();

  for (const block of blocks) {
    const projectMatch = block.match(/^\s*PROJEKT\s*:\s*(.+)$/im);
    if (projectMatch) projectTitle = projectMatch[1].trim();

    const sectionMatch = block.match(/^\s*(?:THEMA|ABSCHNITT|SECTION)\s*:\s*(.+)$/im);
    if (sectionMatch) currentSection = sectionMatch[1].trim();

    const frontMatch = block.match(/^\s*(?:VORDERSEITE|FRAGE|TITEL|FRONT)\s*:\s*(.+)$/im);
    const backMatch = block.match(/^\s*(?:RÜCKSEITE|ANTWORT|INHALT|BACK)\s*:\s*([\s\S]+)$/im);

    if (frontMatch && backMatch) {
      const back = backMatch[1].trim();
      addParsedCard(sectionMap, currentSection, frontMatch[1].trim(), back);
      continue;
    }

    const usableLines = block.split(/\r?\n/).map((line) => line.trim()).filter(Boolean)
      .filter((line) => !/^(PROJEKT|THEMA|ABSCHNITT|SECTION)\s*:/i.test(line));

    if (!frontMatch && usableLines.length >= 2) {
      addParsedCard(sectionMap, currentSection, usableLines[0], usableLines.slice(1).join('\n'));
    }
  }

  const sections = Array.from(sectionMap, ([title, cards]) => ({ title, cards }));
  if (!sections.length) {
    throw new Error('Keine Karten erkannt. Nutze JSON oder trenne Textkarten mit §§§ und kennzeichne VORDERSEITE und RÜCKSEITE.');
  }
  return { projectTitle, sections };
}

function addParsedCard(sectionMap, sectionTitle, front, back) {
  if (!front || !back) return;
  if (!sectionMap.has(sectionTitle)) sectionMap.set(sectionTitle, []);
  sectionMap.get(sectionTitle).push({ front, back });
}

function normalizeProject(input, titleOverride = '') {
  if (!input || typeof input !== 'object') throw new Error('Die Importdaten sind kein gültiges Objekt.');

  let sections = input.sections;
  if (!Array.isArray(sections) && Array.isArray(input.cards)) {
    sections = [{ title: 'Allgemein', cards: input.cards }];
  }
  if (!Array.isArray(sections)) throw new Error('Der Schlüssel „sections“ fehlt oder ist keine Liste.');

  const normalizedSections = sections.map((section, sectionIndex) => {
    if (!section || typeof section !== 'object') return null;
    const cards = Array.isArray(section.cards) ? section.cards : [];
    const normalizedCards = cards.map((card) => {
      const front = String(card?.front ?? card?.question ?? card?.title ?? '').trim();
      const back = String(card?.back ?? card?.answer ?? card?.content ?? '').trim();
      if (!front || !back) return null;
      return { id: makeId('card'), front: front.slice(0, 500), back: back.slice(0, 12000) };
    }).filter(Boolean);
    if (!normalizedCards.length) return null;
    return {
      id: makeId('section'),
      title: String(section.title || `Thema ${sectionIndex + 1}`).trim().slice(0, 120),
      cards: normalizedCards
    };
  }).filter(Boolean);

  if (!normalizedSections.length) throw new Error('In den Themen wurden keine vollständigen Karten mit „front“ und „back“ gefunden.');

  const now = new Date().toISOString();
  return {
    id: makeId('project'),
    version: APP_VERSION,
    title: (titleOverride.trim() || String(input.projectTitle || input.title || 'Neues Lernprojekt').trim()).slice(0, 100),
    sections: normalizedSections,
    progress: {},
    createdAt: now,
    updatedAt: now
  };
}

function getFilteredCards(project) {
  if (!project) return [];
  const selected = state.study.section;
  const sections = selected === 'all' ? project.sections : [project.sections[Number(selected)]].filter(Boolean);
  return sections.flatMap((section) => section.cards.map((card) => ({ ...card, sectionTitle: section.title })));
}

function loadProjects() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveProjects() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.projects));
  } catch (error) {
    console.error(error);
    toast('Speicher voll', 'Der Browser konnte die Projekte nicht lokal speichern. Exportiere ältere Projekte und lösche sie anschließend.');
  }
}

function getProject(id) {
  return state.projects.find((project) => project.id === id);
}

function deleteProject(id) {
  state.projects = state.projects.filter((project) => project.id !== id);
  saveProjects();
  toast('Projekt gelöscht', 'Die lokalen Daten wurden entfernt.');
  location.hash = '';
  renderDashboard();
}

function countCards(project) {
  return project.sections.reduce((sum, section) => sum + section.cards.length, 0);
}

function applySavedTheme() {
  const saved = localStorage.getItem(THEME_KEY);
  const preferred = window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  const theme = saved || preferred;
  document.documentElement.dataset.theme = theme;
  themeToggle.textContent = theme === 'dark' ? '☀' : '◐';
}

async function copyText(text) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand('copy');
  textarea.remove();
}

function downloadJson(data, filename) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  toast('Export erstellt', filename);
}

function toast(title, message) {
  const region = document.getElementById('toastRegion');
  const item = document.createElement('div');
  item.className = 'toast';
  item.innerHTML = `<strong>${escapeHTML(title)}</strong><span>${escapeHTML(message)}</span>`;
  region.appendChild(item);
  window.setTimeout(() => item.remove(), 4200);
}

function confirmAction(title, message) {
  document.getElementById('confirmTitle').textContent = title;
  document.getElementById('confirmMessage').textContent = message;
  confirmDialog.showModal();
  return new Promise((resolve) => {
    confirmDialog.addEventListener('close', () => resolve(confirmDialog.returnValue === 'confirm'), { once: true });
  });
}

function stripCodeFence(text) {
  const match = text.match(/^```(?:json|txt|text)?\s*([\s\S]*?)\s*```$/i);
  return match ? match[1].trim() : text;
}

function friendlyJsonError(message) {
  return message.replace(/^JSON\.parse:\s*/i, '').replace(/^Unexpected token.*?in JSON at position/i, 'Fehler an Zeichenposition');
}

function formatAnswer(text) {
  const escaped = escapeHTML(text).replace(/\r\n/g, '\n');
  const lines = escaped.split('\n');
  let html = '';
  let listType = null;

  const closeList = () => {
    if (listType) html += `</${listType}>`;
    listType = null;
  };

  for (const rawLine of lines) {
    const line = rawLine.trim();
    const bullet = line.match(/^[-•*]\s+(.+)/);
    const numbered = line.match(/^\d+[.)]\s+(.+)/);

    if (bullet) {
      if (listType !== 'ul') { closeList(); html += '<ul>'; listType = 'ul'; }
      html += `<li>${bullet[1]}</li>`;
    } else if (numbered) {
      if (listType !== 'ol') { closeList(); html += '<ol>'; listType = 'ol'; }
      html += `<li>${numbered[1]}</li>`;
    } else if (line) {
      closeList();
      html += `<p>${line}</p>`;
    } else {
      closeList();
    }
  }
  closeList();
  return html || '<p>Keine Erklärung vorhanden.</p>';
}

function escapeHTML(value) {
  return String(value).replace(/[&<>"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[char]));
}

function makeId(prefix) {
  if (crypto?.randomUUID) return `${prefix}-${crypto.randomUUID()}`;
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

function initials(title) {
  return String(title).split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase() || 'KW';
}

function formatDate(value) {
  try {
    return new Intl.DateTimeFormat('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(value));
  } catch {
    return '';
  }
}

function safeFilename(value) {
  return String(value).trim().replace(/[<>:"/\\|?*\x00-\x1F]/g, '-').replace(/\s+/g, '_').slice(0, 80) || 'karteikarten';
}
