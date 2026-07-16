'use strict';

const STORAGE_KEY = 'kartenwerk.projects.v1';
const THEME_KEY = 'kartenwerk.theme.v1';
const APP_VERSION = 3;
const CHATGPT_URL = 'https://chatgpt.com/';

const CARD_CREATION_MODES = {
  normal: {
    label: 'Normal',
    short: 'Wortlaut und Fachbegriffe bewahren',
    infoTitle: 'Normaler Modus',
    infoText: 'Dieser Modus bleibt so nah wie möglich an der Quelle. Fachbegriffe, Definitionen, Reihenfolge und charakteristische Formulierungen werden übernommen. Nur die kleinste notwendige grammatische Anpassung ist erlaubt.',
    prompt: `NORMALER MODUS – VERBINDLICH:
- Verwende zuerst den exakten Wortlaut der Quelle.
- Übernimm Fachbegriffe, Definitionen, Kernaussagen, Aufzählungen und charakteristische Formulierungen möglichst wörtlich.
- Ersetze keinen Fachbegriff durch ein Synonym, wenn der Quellenbegriff übernommen werden kann.
- Ändere eine Formulierung nur, wenn sie ohne den ursprünglichen Satzkontext unverständlich wäre. Nimm dann ausschließlich die kleinste notwendige grammatische Anpassung vor.
- Vereinfache, erkläre oder interpretiere nicht eigenständig.
- Ergänze keine Beispiele, Bewertungen, Ursachen, Folgen oder Informationen, die nicht ausdrücklich aus der Quelle hervorgehen.
- Unvollständige Stichpunkte dürfen sprachlich geordnet, aber nicht inhaltlich ergänzt werden.`
  },
  advanced: {
    label: 'Advanced',
    short: 'Verständlich erklären, ohne Neues zu erfinden',
    infoTitle: 'Advanced-Modus',
    infoText: 'Dieser Modus bereitet den Quelleninhalt verständlicher auf. Schwierige Sätze dürfen vereinfacht und Fachbegriffe im vorhandenen Zusammenhang erklärt werden. Externe Informationen oder erfundene Beispiele bleiben ausgeschlossen.',
    prompt: `ADVANCED-MODUS – VERBINDLICH:
- Bereite die Inhalte klar, leicht verständlich und lernfreundlich auf.
- Erhalte alle zentralen Fachbegriffe und den fachlichen Sinn der Quelle.
- Löse unnötig komplizierte Satzstrukturen auf und erkläre schwierige Begriffe kurz in dem Zusammenhang, der aus der Quelle erkennbar ist.
- Erkläre ausschließlich durch sprachliche Vereinfachung und durch Zusammenhänge, die in der Quelle ausdrücklich erkennbar sind.
- Ergänze keine externen Informationen, keine recherchierten Inhalte, keine fremden Beispiele und keine nur plausibel klingenden Folgerungen.
- Beispiele, Abgrenzungen und Begründungen dürfen nur verwendet werden, wenn sie in der Quelle enthalten sind.
- Kennzeichne Lücken oder Unklarheiten nicht durch erfundene Präzisierungen.`
  },
  slides: {
    label: 'Folienmodus',
    short: 'Eine Folie bleibt genau eine Karte',
    infoTitle: 'Folienmodus',
    infoText: 'Dieser Modus ist für PowerPoint-Dateien und folienartige PDFs gedacht. Jede Folie beziehungsweise Seite bleibt genau eine Karte. Lange Inhalte werden in KartenWerk innerhalb der Karte gescrollt.',
    prompt: `FOLIENMODUS – VERBINDLICH:
- Dieser Modus ist für PowerPoint-Präsentationen und folienartige PDF-Dateien bestimmt.
- Erstelle für jede einzelne Folie beziehungsweise PDF-Seite genau eine Karte und bewahre die ursprüngliche Reihenfolge.
- Lege niemals mehrere Folien zusammen und teile niemals eine Folie aufgrund ihrer Länge auf mehrere Karten auf.
- Die Vorderseite enthält den exakten Folientitel. Fehlt ein Titel, verwende „Folie X“ beziehungsweise „Seite X“ mit der tatsächlichen Nummer.
- Bewahre Überschriften, Unterüberschriften, Absätze, Hauptpunkte, Unterpunkte, Nummerierungen und Tabellen in ihrer erkennbaren Reihenfolge und Hierarchie.
- Bei Diagrammen und Abbildungen übernimm nur eindeutig erkennbare Beschriftungen, Werte und ausdrücklich dargestellte Aussagen. Erfinde keine Interpretation.
- Bilde Oberthemen aus vorhandenen Präsentationsabschnitten oder klar erkennbaren thematischen Blöcken, ohne zusätzliche Karten zu erzeugen.
- Die Anzahl der Karten muss der Anzahl der berücksichtigten Folien beziehungsweise Seiten entsprechen.`
  }
};

const CARD_SIZE_OPTIONS = {
  learning: {
    label: 'Lernfreundlich',
    short: 'Eigenständige Inhalte getrennt abfragen',
    prompt: `KARTENAUFTEILUNG – LERNFREUNDLICH:
- Jede Karte behandelt genau eine eigenständig abfragbare Wissenseinheit.
- Teile Inhalte auf, wenn mehrere voneinander unabhängige Fragen, Definitionen, Modelle oder Argumente enthalten sind.
- Teile eine Karte nicht allein deshalb auf, weil die Rückseite lang ist. Zusammengehörige Merkmale, Schritte oder Bestandteile dürfen auf einer scrollbaren Karte bleiben.
- Die Vorderseite darf die Antwort nicht vorwegnehmen.`
  },
  large: {
    label: 'Große Karten',
    short: 'Zusammenhängende Quellenblöcke erhalten',
    prompt: `KARTENAUFTEILUNG – GROSSE KARTEN:
- Erhalte zusammenhängende Quellenabschnitte möglichst als gemeinsame Karte.
- Teile nur an klaren Themenwechseln oder wenn Inhalte fachlich unabhängig voneinander sind.
- Kürze oder teile nicht nur, um eine Karte an die Bildschirmgröße anzupassen. KartenWerk stellt lange Rückseiten scrollbar dar.
- Die Vorderseite muss den gesamten zusammenhängenden Inhalt eindeutig ankündigen.`
  }
};

const SLIDE_DETAIL_OPTIONS = {
  full: {
    label: 'Vollständige Folie',
    short: 'Alle relevanten Inhalte übernehmen',
    prompt: `FOLIENÜBERNAHME – VOLLSTÄNDIG:
- Übernimm den gesamten inhaltlich relevanten Text jeder Folie beziehungsweise Seite.
- Kürze den Inhalt nicht und lasse keinen Punkt nur wegen der Länge weg.
- Die Anzahl der Inhaltsblöcke und Stichpunkte ist nicht begrenzt.
- Lange Karten sind ausdrücklich erlaubt und werden in KartenWerk innerhalb der Karte gescrollt.
- Auch Titel-, Inhaltsverzeichnis-, Übergangs- und Abschlussfolien werden übernommen, sofern sie Bestandteil der Quelle sind.`
  },
  compact: {
    label: 'Kompakte Folie',
    short: 'Eine Karte pro Folie, sprachlich verdichtet',
    prompt: `FOLIENÜBERNAHME – KOMPAKT:
- Jede Folie beziehungsweise Seite bleibt weiterhin genau eine Karte.
- Verdichte Wiederholungen und unnötige Füllformulierungen, ohne Kernaussagen, Fachbegriffe, Zahlen, Schritte oder Abgrenzungen zu verlieren.
- Fasse nur Inhalte derselben Folie zusammen. Vermische niemals verschiedene Folien.
- Titel-, reine Übergangs- und Abschlussfolien bleiben eigene Karten, dürfen aber sehr kurz sein.`
  }
};

const JSON_PROMPT = `AUFGABE
Erstelle aus den angehängten Dateien und/oder dem Text unter AUSGANGSTEXT einen vollständigen KartenWerk-Lernkartensatz. Nutze ausschließlich sicher erkennbare Quelleninformationen; nichts ergänzen oder recherchieren.

MODUS
{{MODE_RULES}}
{{VARIANT_RULES}}

KARTEN
- Projekt in sinnvolle Oberthemen gliedern.
- front: eindeutige Frage, Begriff oder im Folienmodus der Folientitel.
- back: Array aus strukturierten Blöcken.
- Lange Karten sind erlaubt; KartenWerk scrollt den Karteninhalt.
- Sichtbare Reihenfolge, Hierarchie, Fachbegriffe, Zahlen, Listen und Tabellen bewahren.

BACK-BLÖCKE
{ "type":"heading", "text":"Zwischenüberschrift" }
{ "type":"paragraph", "text":"Absatz" }
{ "type":"list", "style":"unordered", "items":["Punkt 1","Punkt 2"] }
{ "type":"list", "style":"ordered", "items":["Schritt 1","Schritt 2"] }
{ "type":"table", "headers":["A","B"], "rows":[["a1","b1"],["a2","b2"]] }

REGELN
- Aufzählungszeichen nie als normalen Absatz speichern; jeder Punkt ist ein eigenes items-Element.
- Keine sichtbaren \\n, \\r, <br>, Markdown- oder HTML-Zeichen in Textfeldern.
- Tabellen nur übernehmen, wenn die Quelle eine Tabelle oder klare Gegenüberstellung enthält; alle Zeilen gleich breit.
- Jede Karte erhält eine eindeutige ID card-001, card-002 usw.
- source nur mit sicher erkennbaren Angaben füllen, sonst null.

JSON-SCHEMA
{
  "schemaVersion":3,
  "generationMode":"{{MODE_KEY}}",
  "modeVariant":"{{VARIANT_KEY}}",
  "projectTitle":"Titel",
  "sections":[{
    "title":"Oberthema",
    "cards":[{
      "id":"card-001",
      "front":"Frage oder Titel",
      "back":[{"type":"paragraph","text":"Antwort"}],
      "source":{"file":null,"page":null,"slide":null}
    }]
  }]
}

GROSSE PROJEKTE
- Beginne mit der Erstellung; lehne die Aufgabe nicht vorsorglich wegen möglicher Ausgabelimits ab.
- Passt alles in eine Datei, erstelle genau eine Datei.
- Ist das Projekt zu groß, teile es automatisch in mehrere gültige JSON-Dateien mit höchstens 80 Karten je Datei.
- Jede Teil-Datei verwendet dasselbe projectTitle und enthält nur vollständige Karten. Benenne sie kartenwerk-kurztitel-teil-01.json, -teil-02.json usw.
- KartenWerk kann alle Teil-Dateien gleichzeitig auswählen und wieder zu einem Projekt zusammenführen.

AUSGABE
- Erstelle echte UTF-8-.json-Dateien als herunterladbare Anhänge. Schreibe den JSON-Inhalt nicht in den Chat oder in Codeblöcke.
- Prüfe vor dem Speichern: gültiges JSON, keine leeren/doppelten Karten, korrekte Blöcke, ausschließlich Quelleninhalt.
- Falls Dateierstellung technisch wirklich unmöglich ist, erkläre das erst nach einem tatsächlichen Erstellungsversuch knapp.

AUSGANGSTEXT
[TEXT HIER EINFÜGEN ODER LEER LASSEN, WENN DIE QUELLE ANGEHÄNGT WIRD.]`;
const DELIMITER_PROMPT = `AUFGABE
Erstelle aus angehängten Dateien und/oder AUSGANGSTEXT einen vollständigen KartenWerk-Lernkartensatz. Nutze ausschließlich Quelleninformationen.

MODUS
{{MODE_RULES}}
{{VARIANT_RULES}}

AUSGABEFORMAT
Gib reinen Text aus. Trenne jede Karte durch eine eigene Zeile mit §§§.

PROJEKT: Titel
§§§
THEMA: Oberthema
VORDERSEITE: Frage oder Begriff
RÜCKSEITE:
Normaler Absatz.

- Stichpunkt 1
- Stichpunkt 2

1. Schritt 1
2. Schritt 2

| Spalte A | Spalte B |
| --- | --- |
| Inhalt A | Inhalt B |
§§§

REGELN
- Sichtbare Struktur, Reihenfolge, Fachbegriffe, Zahlen, Listen und Tabellen bewahren.
- Echte Zeilenumbrüche verwenden; niemals sichtbare \\n- oder \\r-Zeichen.
- Lange Karten sind erlaubt; KartenWerk scrollt sie.
- Tabellen nur übernehmen, wenn sie in der Quelle vorhanden oder eindeutig als Gegenüberstellung angelegt sind.
- Bei sehr großen Projekten in logisch nummerierte Teile aufteilen, ohne Karten abzuschneiden.

AUSGANGSTEXT
[TEXT HIER EINFÜGEN ODER LEER LASSEN, WENN DIE QUELLE ANGEHÄNGT WIRD.]`;
const state = {
  projects: loadProjects(),
  importTab: 'file',
  promptMode: 'json',
  generationMode: 'normal',
  cardSize: 'learning',
  slideDetail: 'full',
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
const appDialog = document.getElementById('appDialog');
const modeInfoDialog = document.getElementById('modeInfoDialog');

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
    const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
  });

  appDialog.addEventListener('click', (event) => {
    if (event.target === appDialog) appDialog.close();
  });

  modeInfoDialog.addEventListener('click', (event) => {
    if (event.target === modeInfoDialog || event.target.closest('[data-close-mode-info]')) {
      modeInfoDialog.close();
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
  const sortedProjects = state.projects
    .slice()
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

  app.innerHTML = `
    <section class="home-screen" aria-labelledby="homeTitle">
      <header class="home-header">
        <div>
          <p class="eyebrow">Deine Lernzentrale</p>
          <h1 id="homeTitle">KartenWerk</h1>
          <p>Projekte erstellen, öffnen und vollständig lokal auf diesem Gerät lernen.</p>
        </div>
        <span class="home-storage"><span aria-hidden="true">●</span> ${state.projects.length} ${state.projects.length === 1 ? 'Projekt' : 'Projekte'}</span>
      </header>

      <div class="app-grid" aria-label="Startmenü und Projekte">
        <button class="app-tile system-tile" id="settingsTile" type="button">
          <span class="tile-icon tile-icon-settings" aria-hidden="true">⚙</span>
          <span class="tile-title">Einstellungen</span>
        </button>

        <button class="app-tile system-tile" id="instructionsTile" type="button">
          <span class="tile-icon tile-icon-help" aria-hidden="true">?</span>
          <span class="tile-title">Anleitung</span>
        </button>

        <button class="app-tile system-tile add-tile" id="newProjectTile" type="button">
          <span class="tile-icon tile-icon-add" aria-hidden="true">+</span>
          <span class="tile-title">Neues Projekt</span>
        </button>

        ${renderProjectCards(sortedProjects)}
      </div>

      ${state.projects.length ? '' : `
        <div class="home-empty-hint">
          <strong>Noch keine Lernprojekte</strong>
          Tippe oben auf das Plus. Dort findest du den Prompt, die Anleitung und den Import in einem Ablauf.
        </div>`}
    </section>
  `;

  bindDashboardEvents();
  app.focus({ preventScroll: true });
}

function renderProjectCards(projects = state.projects) {
  return projects.map((project, index) => {
    const cardCount = countCards(project);
    const sectionCount = project.sections.length;
    const hueClass = `project-tone-${(index % 6) + 1}`;
    return `
      <article class="app-project ${hueClass}">
        <button class="app-tile project-tile" data-open-project="${project.id}" type="button" aria-label="${escapeHTML(project.title)} öffnen">
          <span class="tile-icon project-tile-icon" aria-hidden="true">${escapeHTML(initials(project.title))}</span>
          <span class="tile-title">${escapeHTML(project.title)}</span>
          <span class="tile-meta">${sectionCount} ${sectionCount === 1 ? 'Thema' : 'Themen'} · ${cardCount} ${cardCount === 1 ? 'Karte' : 'Karten'}</span>
        </button>
        <button class="project-tile-menu" data-delete-project="${project.id}" type="button" aria-label="${escapeHTML(project.title)} löschen" title="Projekt löschen">×</button>
      </article>`;
  }).join('');
}

function bindDashboardEvents() {
  document.getElementById('settingsTile').addEventListener('click', openSettingsDialog);
  document.getElementById('instructionsTile').addEventListener('click', openInstructionsDialog);
  document.getElementById('newProjectTile').addEventListener('click', openCreateProjectDialog);

  document.querySelectorAll('[data-open-project]').forEach((button) => {
    button.addEventListener('click', () => {
      location.hash = `#project=${encodeURIComponent(button.dataset.openProject)}`;
    });
  });

  document.querySelectorAll('[data-delete-project]').forEach((button) => {
    button.addEventListener('click', async (event) => {
      event.stopPropagation();
      const project = getProject(button.dataset.deleteProject);
      if (!project) return;
      const confirmed = await confirmAction('Projekt löschen?', `„${project.title}“ und alle zugehörigen Karten werden aus diesem Browser entfernt.`);
      if (confirmed) deleteProject(project.id);
    });
  });
}

function openSettingsDialog() {
  const currentTheme = document.documentElement.dataset.theme || 'light';
  appDialog.className = 'app-dialog compact-dialog';
  appDialog.innerHTML = `
    <div class="app-dialog-card">
      <header class="dialog-header">
        <div>
          <p class="eyebrow">KartenWerk</p>
          <h2 id="appDialogTitle">Einstellungen</h2>
        </div>
        <button class="dialog-close" data-close-dialog type="button" aria-label="Schließen">×</button>
      </header>

      <section class="settings-section">
        <h3>Darstellung</h3>
        <div class="theme-choice" role="group" aria-label="Farbschema">
          <button class="choice-button ${currentTheme === 'light' ? 'active' : ''}" data-theme-choice="light" type="button">☀ Hell</button>
          <button class="choice-button ${currentTheme === 'dark' ? 'active' : ''}" data-theme-choice="dark" type="button">◐ Dunkel</button>
        </div>
      </section>

      <section class="settings-section">
        <h3>Lokale Daten</h3>
        <p>Alle Projekte liegen ausschließlich im lokalen Browserspeicher dieses Geräts. Beim Löschen der Browserdaten können sie verloren gehen.</p>
        <div class="settings-actions">
          <button class="button ghost" id="settingsExportAll" type="button" ${state.projects.length ? '' : 'disabled'}>Alle Projekte sichern</button>
          <label class="button ghost file-button" for="backupInput">Sicherung einlesen</label>
          <input class="hidden" id="backupInput" type="file" accept=".json,application/json">
          <button class="button danger" id="settingsDeleteAll" type="button" ${state.projects.length ? '' : 'disabled'}>Alle Projekte löschen</button>
        </div>
      </section>
    </div>`;

  showAppDialog();
  bindDialogClose();

  document.querySelectorAll('[data-theme-choice]').forEach((button) => {
    button.addEventListener('click', () => {
      setTheme(button.dataset.themeChoice);
      document.querySelectorAll('[data-theme-choice]').forEach((item) => item.classList.toggle('active', item === button));
    });
  });

  document.getElementById('settingsExportAll').addEventListener('click', () => {
    downloadJson({ app: 'KartenWerk', version: APP_VERSION, exportedAt: new Date().toISOString(), projects: state.projects }, 'kartenwerk-gesamtsicherung.json');
  });

  document.getElementById('backupInput').addEventListener('change', (event) => {
    const file = event.target.files?.[0];
    if (file) importBackupFile(file);
  });

  document.getElementById('settingsDeleteAll').addEventListener('click', async () => {
    const confirmed = await confirmAction('Alle Projekte löschen?', 'Alle lokal gespeicherten Projekte und Lernstände werden unwiderruflich entfernt.');
    if (!confirmed) return;
    state.projects = [];
    saveProjects();
    appDialog.close();
    renderDashboard();
    toast('Alle Projekte gelöscht', 'Der lokale Projektspeicher ist jetzt leer.');
  });
}

function openInstructionsDialog() {
  appDialog.className = 'app-dialog compact-dialog';
  appDialog.innerHTML = `
    <div class="app-dialog-card">
      <header class="dialog-header">
        <div>
          <p class="eyebrow">Kurzanleitung</p>
          <h2 id="appDialogTitle">In drei Schritten zum Lernprojekt</h2>
        </div>
        <button class="dialog-close" data-close-dialog type="button" aria-label="Schließen">×</button>
      </header>

      <div class="instruction-list">
        <article class="instruction-card">
          <span>1</span>
          <div><h3>Aufbereitung wählen</h3><p>Normal bleibt wortlautnah, Advanced erklärt verständlicher. Im Folienmodus bleibt jede Folie genau eine Karte. Zusätzlich bestimmst du Kartengröße oder Folienumfang.</p></div>
        </article>
        <article class="instruction-card">
          <span>2</span>
          <div><h3>Prompt kopieren und ChatGPT öffnen</h3><p>Der kombinierte Button kopiert den fertigen Prompt und öffnet ChatGPT. Dort hängst du PDF, PowerPoint oder andere Quellen an und fügst den Prompt ein.</p></div>
        </article>
        <article class="instruction-card">
          <span>3</span>
          <div><h3>Datei importieren</h3><p>Lade eine JSON-Datei oder alle erzeugten Teil-Dateien gemeinsam hoch. KartenWerk führt sie automatisch zu einem Projekt zusammen. Alternativ kannst du den §§§-Textmodus verwenden.</p></div>
        </article>
      </div>

      <div class="notice info"><strong>Empfehlung:</strong> Nutze JSON. Dadurch bleiben Absätze, Überschriften, Listen, Tabellen und Quellenangaben strukturiert. Lange Karten können innerhalb der Karte gescrollt werden.</div>
      <button class="button full-width" id="instructionCreateProject" type="button">Projektassistent öffnen</button>
    </div>`;

  showAppDialog();
  bindDialogClose();
  document.getElementById('instructionCreateProject').addEventListener('click', () => openCreateProjectDialog());
}

function getSelectedVariant() {
  if (state.generationMode === 'slides') {
    return { key: state.slideDetail, ...(SLIDE_DETAIL_OPTIONS[state.slideDetail] || SLIDE_DETAIL_OPTIONS.full) };
  }
  return { key: state.cardSize, ...(CARD_SIZE_OPTIONS[state.cardSize] || CARD_SIZE_OPTIONS.learning) };
}

function getActivePrompt() {
  const template = state.promptMode === 'json' ? JSON_PROMPT : DELIMITER_PROMPT;
  const mode = CARD_CREATION_MODES[state.generationMode] || CARD_CREATION_MODES.normal;
  const variant = getSelectedVariant();
  return template
    .replaceAll('{{MODE_RULES}}', mode.prompt)
    .replaceAll('{{VARIANT_RULES}}', variant.prompt)
    .replaceAll('{{MODE_KEY}}', state.generationMode)
    .replaceAll('{{VARIANT_KEY}}', variant.key);
}

function getPromptWithOptionalSource() {
  const source = document.getElementById('sourceText')?.value.trim() || '';
  const prompt = getActivePrompt();
  if (!source) return prompt;
  return prompt.replace(/\[TEXT ODER LERNZETTEL HIER EINFÜGEN[^\]]*\]/, () => source);
}

function renderPromptModeOptions() {
  return Object.entries(CARD_CREATION_MODES).map(([key, mode]) => `
    <div class="prompt-mode-option ${state.generationMode === key ? 'active' : ''}">
      <button class="prompt-mode-select" data-generation-mode="${key}" type="button" role="radio" aria-checked="${state.generationMode === key}">
        <span class="prompt-mode-radio" aria-hidden="true"></span>
        <span class="prompt-mode-copy"><strong>${escapeHTML(mode.label)}</strong><small>${escapeHTML(mode.short)}</small></span>
      </button>
      <button class="prompt-mode-help" data-mode-info="${key}" type="button" aria-label="${escapeHTML(mode.label)} erklären" title="Modus erklären">?</button>
    </div>`).join('');
}

function renderModeVariantOptions() {
  const options = state.generationMode === 'slides' ? SLIDE_DETAIL_OPTIONS : CARD_SIZE_OPTIONS;
  const selectedKey = state.generationMode === 'slides' ? state.slideDetail : state.cardSize;
  const heading = state.generationMode === 'slides' ? 'Folienübernahme' : 'Kartengröße';
  return `
    <div class="variant-block">
      <div class="variant-heading"><span class="mini-label">${heading}</span><span>Wie umfangreich soll eine Karte sein?</span></div>
      <div class="variant-choice" role="radiogroup" aria-label="${heading}">
        ${Object.entries(options).map(([key, option]) => `
          <button class="variant-option ${selectedKey === key ? 'active' : ''}" data-mode-variant="${key}" type="button" role="radio" aria-checked="${selectedKey === key}">
            <strong>${escapeHTML(option.label)}</strong>
            <small>${escapeHTML(option.short)}</small>
          </button>`).join('')}
      </div>
    </div>`;
}

function refreshPromptConfiguration() {
  updatePromptModeSelection();
  const variantHost = document.getElementById('modeVariantHost');
  if (variantHost) variantHost.innerHTML = renderModeVariantOptions();
  bindModeVariantButtons();
  const preview = document.getElementById('promptPreview');
  if (preview) preview.textContent = getActivePrompt();
  const modeSummary = document.getElementById('selectedModeSummary');
  if (modeSummary) {
    const mode = CARD_CREATION_MODES[state.generationMode];
    const variant = getSelectedVariant();
    modeSummary.textContent = `${mode.label} · ${variant.label}`;
  }
}

function bindModeVariantButtons() {
  document.querySelectorAll('[data-mode-variant]').forEach((button) => {
    button.addEventListener('click', () => {
      if (state.generationMode === 'slides') state.slideDetail = button.dataset.modeVariant;
      else state.cardSize = button.dataset.modeVariant;
      refreshPromptConfiguration();
    });
  });
}

function updatePromptModeSelection() {
  document.querySelectorAll('.prompt-mode-option').forEach((option) => {
    const button = option.querySelector('[data-generation-mode]');
    const active = button?.dataset.generationMode === state.generationMode;
    option.classList.toggle('active', active);
    button?.setAttribute('aria-checked', String(active));
  });
}

function openModeInfoDialog(modeKey) {
  const mode = CARD_CREATION_MODES[modeKey];
  if (!mode) return;
  modeInfoDialog.innerHTML = `
    <div class="mode-info-card">
      <header class="mode-info-header">
        <div>
          <p class="eyebrow">Aufbereitungsmodus</p>
          <h2 id="modeInfoTitle">${escapeHTML(mode.infoTitle)}</h2>
        </div>
        <button class="dialog-close" data-close-mode-info type="button" aria-label="Schließen">×</button>
      </header>
      <p>${escapeHTML(mode.infoText)}</p>
      <button class="button full-width" data-close-mode-info type="button">Verstanden</button>
    </div>`;
  if (!modeInfoDialog.open) modeInfoDialog.showModal();
}

function openCreateProjectDialog() {
  const prompt = getActivePrompt();
  const selectedMode = CARD_CREATION_MODES[state.generationMode];
  const selectedVariant = getSelectedVariant();
  appDialog.className = 'app-dialog create-dialog';
  appDialog.innerHTML = `
    <div class="app-dialog-card create-dialog-card">
      <header class="dialog-header sticky-dialog-header">
        <div>
          <p class="eyebrow">Projektassistent</p>
          <h2 id="appDialogTitle">Neues Lernprojekt</h2>
        </div>
        <button class="dialog-close" data-close-dialog type="button" aria-label="Schließen">×</button>
      </header>

      <div class="wizard-overview" aria-label="Ablauf">
        <span><b>1</b> Prompt wählen</span>
        <span><b>2</b> In ChatGPT erstellen</span>
        <span><b>3</b> Ergebnis importieren</span>
      </div>

      <div class="create-flow simplified-flow">
        <section class="flow-step">
          <div class="flow-step-number">1</div>
          <div class="flow-step-content">
            <h3>Wie sollen die Karten erstellt werden?</h3>
            <p>Wähle zuerst die Aufbereitung. Das Fragezeichen erklärt den Unterschied.</p>

            <fieldset class="prompt-mode-fieldset">
              <legend>Aufbereitungsmodus</legend>
              <div class="prompt-mode-list" role="radiogroup" aria-label="Aufbereitungsmodus">
                ${renderPromptModeOptions()}
              </div>
            </fieldset>

            <div id="modeVariantHost">${renderModeVariantOptions()}</div>

            <div class="output-format-block">
              <span class="mini-label">Ausgabeformat</span>
              <p>JSON wird empfohlen: Listen, Tabellen und Überschriften bleiben eindeutig strukturiert.</p>
              <div class="format-choice" role="group" aria-label="Ausgabeformat">
                <button class="choice-button ${state.promptMode === 'json' ? 'active' : ''}" data-create-prompt-mode="json" type="button">JSON-Datei <small>empfohlen</small></button>
                <button class="choice-button ${state.promptMode === 'delimiter' ? 'active' : ''}" data-create-prompt-mode="delimiter" type="button">§§§-Text</button>
              </div>
            </div>
          </div>
        </section>

        <section class="flow-step prompt-action-step">
          <div class="flow-step-number">2</div>
          <div class="flow-step-content">
            <h3>Prompt an ChatGPT übergeben</h3>
            <p>Hänge die Quelle anschließend in ChatGPT an. Einen direkt eingefügten Lerntext kannst du schon hier ergänzen.</p>

            <div class="selected-mode-card">
              <span>Gewählt</span>
              <strong id="selectedModeSummary">${escapeHTML(selectedMode.label)} · ${escapeHTML(selectedVariant.label)}</strong>
            </div>

            <div class="field">
              <label class="label" for="sourceText">Lerntext direkt ergänzen <span class="optional">optional</span></label>
              <textarea class="textarea source-textarea" id="sourceText" placeholder="Leer lassen, wenn du PDF, PowerPoint oder eine andere Datei erst in ChatGPT anhängst."></textarea>
              <p class="field-help">Ist hier Text eingetragen, wird er beim Kopieren automatisch in den Prompt eingesetzt.</p>
            </div>

            <div class="prompt-primary-actions">
              <button class="button full-width chatgpt-button" id="copyAndOpenChatGPTButton" type="button">
                <span aria-hidden="true">↗</span> Prompt kopieren &amp; ChatGPT öffnen
              </button>
              <button class="button ghost full-width" id="copyPromptButton" type="button">Nur Prompt kopieren</button>
            </div>
            <p class="opening-note">Ist die ChatGPT-App für den Link eingerichtet, kann sie sich öffnen. Andernfalls öffnet sich ChatGPT im Browser.</p>

            <details class="prompt-details">
              <summary>Erzeugten Prompt ansehen</summary>
              <pre class="prompt-preview" id="promptPreview">${escapeHTML(prompt)}</pre>
            </details>

            <div class="notice info" id="formatNotice">${state.promptMode === 'json'
              ? 'ChatGPT erstellt eine oder bei großen Projekten mehrere .json-Dateien. Du kannst alle Teil-Dateien gemeinsam hochladen.'
              : 'ChatGPT gibt formatierten §§§-Text aus. Diesen kopierst du anschließend unten in KartenWerk.'}</div>
          </div>
        </section>

        <section class="flow-step import-step">
          <div class="flow-step-number">3</div>
          <div class="flow-step-content">
            <h3>Ergebnis in KartenWerk importieren</h3>
            <p>Lade eine JSON-Datei oder mehrere Teil-Dateien gemeinsam hoch. KartenWerk fügt sie automatisch zusammen. Alternativ kannst du Text einfügen.</p>
            <div class="field">
              <label class="label" for="projectTitleOverride">Eigener Projektname <span class="optional">optional</span></label>
              <input class="input" id="projectTitleOverride" type="text" maxlength="100" placeholder="Sonst wird der Titel aus der Datei übernommen">
            </div>

            <div class="import-tabs" role="tablist" aria-label="Importart">
              <button class="tab-button ${state.importTab === 'file' ? 'active' : ''}" data-import-tab="file" type="button">Datei hochladen</button>
              <button class="tab-button ${state.importTab === 'paste' ? 'active' : ''}" data-import-tab="paste" type="button">Text einfügen</button>
            </div>

            <div id="fileImport" class="${state.importTab === 'file' ? '' : 'hidden'}">
              <label class="dropzone mobile-dropzone" id="dropzone" for="fileInput">
                <span class="dropzone-icon" aria-hidden="true">＋</span>
                <div><strong>JSON- oder TXT-Datei(en) auswählen</strong><span>Einzeldatei oder mehrere Teil-Dateien gemeinsam auswählen</span></div>
              </label>
              <input class="hidden" id="fileInput" type="file" multiple accept=".json,.txt,application/json,text/plain">
            </div>

            <div id="pasteImport" class="${state.importTab === 'paste' ? '' : 'hidden'}">
              <label class="label" for="importText">ChatGPT-Ausgabe</label>
              <textarea class="textarea import-textarea" id="importText" spellcheck="false" placeholder="§§§-Text oder vorhandenen JSON-Inhalt einfügen …"></textarea>
              <div class="button-row mobile-stack">
                <button class="button ghost" id="pasteClipboardButton" type="button">Aus Zwischenablage</button>
                <button class="button" id="importTextButton" type="button">Projekt erstellen</button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>`;

  showAppDialog();
  bindDialogClose();
  bindCreateDialogEvents();
}

function bindCreateDialogEvents() {
  document.querySelectorAll('[data-generation-mode]').forEach((button) => {
    button.addEventListener('click', () => {
      state.generationMode = button.dataset.generationMode;
      refreshPromptConfiguration();
    });
  });

  bindModeVariantButtons();

  document.querySelectorAll('[data-mode-info]').forEach((button) => {
    button.addEventListener('click', (event) => {
      event.stopPropagation();
      openModeInfoDialog(button.dataset.modeInfo);
    });
  });

  document.querySelectorAll('[data-create-prompt-mode]').forEach((button) => {
    button.addEventListener('click', () => {
      state.promptMode = button.dataset.createPromptMode;
      state.importTab = state.promptMode === 'json' ? 'file' : 'paste';
      document.querySelectorAll('[data-create-prompt-mode]').forEach((item) => item.classList.toggle('active', item === button));
      document.getElementById('promptPreview').textContent = getActivePrompt();
      document.getElementById('formatNotice').textContent = state.promptMode === 'json'
        ? 'ChatGPT erstellt eine oder bei großen Projekten mehrere .json-Dateien. Du kannst alle Teil-Dateien gemeinsam hochladen.'
        : 'ChatGPT gibt formatierten §§§-Text aus. Diesen kopierst du anschließend unten in KartenWerk.';
      setImportTab(state.importTab);
    });
  });

  document.querySelectorAll('[data-import-tab]').forEach((button) => {
    button.addEventListener('click', () => setImportTab(button.dataset.importTab));
  });

  document.getElementById('copyPromptButton').addEventListener('click', async () => {
    try {
      await copyText(getPromptWithOptionalSource());
      toast('Prompt kopiert', 'Der ausgewählte Modus und ein eventuell eingetragener Lerntext wurden übernommen.');
    } catch {
      toast('Kopieren nicht möglich', 'Markiere den Prompt unter „Erzeugten Prompt ansehen“ und kopiere ihn manuell.');
    }
  });

  document.getElementById('copyAndOpenChatGPTButton').addEventListener('click', async () => {
    const promptText = getPromptWithOptionalSource();
    const copyPromise = copyText(promptText);
    const opened = window.open(CHATGPT_URL, '_blank');
    if (opened) opened.opener = null;
    try {
      await copyPromise;
      toast('Prompt kopiert', 'ChatGPT wird geöffnet. Füge den Prompt dort in das Eingabefeld ein.');
    } catch {
      toast('ChatGPT geöffnet', 'Der Prompt konnte nicht automatisch kopiert werden. Nutze „Nur Prompt kopieren“.');
    }
    if (!opened) window.location.href = CHATGPT_URL;
  });

  document.getElementById('pasteClipboardButton').addEventListener('click', async () => {
    try {
      const text = await navigator.clipboard.readText();
      document.getElementById('importText').value = text;
      toast('Text eingefügt', 'Du kannst das Projekt jetzt erstellen.');
    } catch {
      toast('Zugriff nicht möglich', 'Halte das Feld gedrückt und füge den Text manuell ein.');
    }
  });

  document.getElementById('importTextButton').addEventListener('click', () => {
    const text = document.getElementById('importText').value;
    importProjectText(text, document.getElementById('projectTitleOverride').value);
  });

  const fileInput = document.getElementById('fileInput');
  const dropzone = document.getElementById('dropzone');
  fileInput.addEventListener('change', () => {
    if (fileInput.files?.length) importFiles(Array.from(fileInput.files));
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
    const files = Array.from(event.dataTransfer.files || []);
    if (files.length) importFiles(files);
  });
}

function setImportTab(tab) {
  state.importTab = tab;
  document.querySelectorAll('[data-import-tab]').forEach((item) => item.classList.toggle('active', item.dataset.importTab === tab));
  document.getElementById('pasteImport')?.classList.toggle('hidden', tab !== 'paste');
  document.getElementById('fileImport')?.classList.toggle('hidden', tab !== 'file');
}

function showAppDialog() {
  if (!appDialog.open) appDialog.showModal();
  appDialog.scrollTop = 0;
}

function bindDialogClose() {
  appDialog.querySelectorAll('[data-close-dialog]').forEach((button) => {
    button.addEventListener('click', () => appDialog.close());
  });
}

async function importBackupFile(file) {
  try {
    const text = await file.text();
    const parsed = JSON.parse(text);
    if (!Array.isArray(parsed?.projects)) throw new Error('Die Datei enthält keine KartenWerk-Projektsicherung.');
    const confirmed = await confirmAction('Sicherung einlesen?', `${parsed.projects.length} Projekte aus der Sicherung ersetzen den aktuellen lokalen Bestand.`);
    if (!confirmed) return;
    state.projects = parsed.projects;
    saveProjects();
    appDialog.close();
    renderDashboard();
    toast('Sicherung eingelesen', `${state.projects.length} Projekte wurden wiederhergestellt.`);
  } catch (error) {
    toast('Sicherung ungültig', error.message || 'Die Datei konnte nicht gelesen werden.');
  }
}

function renderProject(projectId) {
  const project = getProject(projectId);
  if (!project) {
    location.hash = '';
    return;
  }

  const progress = project.progress || {};
  const known = Object.values(progress).filter((value) => value === 'known').length;
  const repeat = Object.values(progress).filter((value) => value === 'repeat').length;
  const total = countCards(project);
  const open = total - known - repeat;
  const projectMode = CARD_CREATION_MODES[project.generationMode]?.label || 'Importiert';
  const projectVariant = project.generationMode === 'slides'
    ? SLIDE_DETAIL_OPTIONS[project.modeVariant]?.label
    : CARD_SIZE_OPTIONS[project.modeVariant]?.label;
  const projectMethod = projectVariant ? `${projectMode} · ${projectVariant}` : projectMode;

  app.innerHTML = `
    <section class="project-hub" aria-labelledby="projectTitle">
      <header class="project-hub-header">
        <button class="project-back" id="backToDashboard" type="button">← Projekte</button>
        <div class="project-title-row">
          <div>
            <p class="eyebrow">Lernprojekt</p>
            <h1 id="projectTitle">${escapeHTML(project.title)}</h1>
            <p>${project.sections.length} ${project.sections.length === 1 ? 'Kategorie' : 'Kategorien'} · ${total} ${total === 1 ? 'Karte' : 'Karten'} · ${escapeHTML(projectMethod)}</p>
          </div>
          <div class="project-tools" aria-label="Projekt bearbeiten">
            <button class="icon-action" id="exportProjectButton" type="button" title="Projekt exportieren" aria-label="Projekt exportieren">⇩</button>
            <button class="icon-action" id="renameProjectButton" type="button" title="Projekt umbenennen" aria-label="Projekt umbenennen">✎</button>
            <button class="icon-action danger-icon" id="deleteCurrentProjectButton" type="button" title="Projekt löschen" aria-label="Projekt löschen">⌫</button>
          </div>
        </div>
      </header>

      <div class="project-hub-grid">
        <section class="project-launch-panel" aria-labelledby="startHeading">
          <div class="launch-intro">
            <span class="launch-icon" aria-hidden="true">▶</span>
            <div>
              <h2 id="startHeading">Was möchtest du starten?</h2>
              <p>Wähle anschließend die Kategorien aus, die in der Lerneinheit vorkommen sollen.</p>
            </div>
          </div>

          <div class="mode-launch-list">
            <button class="mode-launch learn-launch" data-open-study="learn" type="button">
              <span class="mode-launch-icon" aria-hidden="true">▣</span>
              <span><strong>Lernmodus</strong><small>Karten in Ruhe ansehen und durchgehen</small></span>
              <span class="mode-chevron" aria-hidden="true">›</span>
            </button>
            <button class="mode-launch quiz-launch" data-open-study="quiz" type="button">
              <span class="mode-launch-icon" aria-hidden="true">?</span>
              <span><strong>Abfragemodus</strong><small>Antwort aufdecken und als richtig oder falsch bewerten</small></span>
              <span class="mode-chevron" aria-hidden="true">›</span>
            </button>
            <button class="mode-launch relearn-launch" data-open-study="relearn" type="button" ${repeat ? '' : 'disabled'}>
              <span class="mode-launch-icon" aria-hidden="true">↻</span>
              <span><strong>Nachlernen</strong><small>${repeat ? `${repeat} falsch beantwortete ${repeat === 1 ? 'Karte' : 'Karten'} erneut üben` : 'Wird nach der ersten falschen Antwort verfügbar'}</small></span>
              <span class="mode-chevron" aria-hidden="true">›</span>
            </button>
          </div>

          <div class="project-stats" aria-label="Lernstand">
            <div><strong>${known}</strong><span>richtig</span></div>
            <div><strong>${repeat}</strong><span>nachlernen</span></div>
            <div><strong>${open}</strong><span>offen</span></div>
          </div>
        </section>

        <section class="project-index-panel" aria-labelledby="tocHeading">
          <div class="project-index-heading">
            <span aria-hidden="true">☰</span>
            <div>
              <h2 id="tocHeading">Inhaltsverzeichnis</h2>
              <p>Eine Kategorie kann auch direkt gestartet werden.</p>
            </div>
          </div>
          <details class="project-toc-details">
            <summary>
              <span class="toc-open-label">Inhaltsverzeichnis aufklappen</span>
              <span class="toc-close-label">Inhaltsverzeichnis zuklappen</span>
              <span class="details-chevron" aria-hidden="true">⌄</span>
            </summary>
            <div class="project-toc-list">
              ${project.sections.map((section, index) => {
                const sectionWrong = section.cards.filter((card) => progress[card.id] === 'repeat').length;
                return `
                  <button class="project-toc-item" data-open-section="${index}" type="button">
                    <span class="toc-number">${index + 1}</span>
                    <span class="toc-copy"><strong>${escapeHTML(section.title)}</strong><small>${section.cards.length} ${section.cards.length === 1 ? 'Karte' : 'Karten'}${sectionWrong ? ` · ${sectionWrong} nachlernen` : ''}</small></span>
                    <span class="mode-chevron" aria-hidden="true">›</span>
                  </button>`;
              }).join('')}
            </div>
          </details>
        </section>
      </div>
    </section>`;

  bindProjectHubEvents(project);
  app.focus({ preventScroll: true });
}

function bindProjectHubEvents(project) {
  document.getElementById('backToDashboard').addEventListener('click', () => { location.hash = ''; });

  document.querySelectorAll('[data-open-study]').forEach((button) => {
    button.addEventListener('click', () => openStudySelectionDialog(project, button.dataset.openStudy));
  });

  document.querySelectorAll('[data-open-section]').forEach((button) => {
    button.addEventListener('click', () => openCategoryModeDialog(project, Number(button.dataset.openSection)));
  });

  document.getElementById('exportProjectButton').addEventListener('click', () => {
    const clean = {
      schemaVersion: 3,
      generationMode: project.generationMode || 'normal',
      modeVariant: project.modeVariant || 'learning',
      projectTitle: project.title,
      sections: project.sections.map((section) => ({
        title: section.title,
        cards: section.cards.map((card) => ({
          id: card.id,
          front: card.front,
          back: card.back,
          source: card.source || { file: null, page: null, slide: null }
        }))
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

function openStudySelectionDialog(project, mode) {
  const eligibleSections = project.sections.map((section, index) => ({
    section,
    index,
    count: mode === 'relearn'
      ? section.cards.filter((card) => project.progress?.[card.id] === 'repeat').length
      : section.cards.length
  })).filter((entry) => entry.count > 0);

  if (!eligibleSections.length) {
    toast('Keine Karten vorhanden', mode === 'relearn' ? 'Es gibt aktuell keine falsch beantworteten Karten zum Nachlernen.' : 'Dieses Projekt enthält keine Karten.');
    return;
  }

  const labels = {
    learn: ['Lernmodus', 'Kategorien zum Lernen auswählen', 'Lernmodus starten'],
    quiz: ['Abfragemodus', 'Kategorien für die Abfrage auswählen', 'Abfragemodus starten'],
    relearn: ['Nachlernen', 'Falsch beantwortete Karten auswählen', 'Nachlernen starten']
  }[mode];

  appDialog.className = 'app-dialog compact-dialog study-select-dialog';
  appDialog.innerHTML = `
    <form class="app-dialog-card study-select-card" id="studySelectionForm">
      <header class="dialog-header">
        <div>
          <p class="eyebrow">${labels[0]}</p>
          <h2 id="appDialogTitle">${labels[1]}</h2>
        </div>
        <button class="dialog-close" data-close-dialog type="button" aria-label="Schließen">×</button>
      </header>

      <label class="select-all-row">
        <input id="selectAllSections" type="checkbox" checked>
        <span><strong>Alle Kategorien</strong><small>Alle verfügbaren Karten dieser Auswahl verwenden</small></span>
      </label>

      <div class="section-check-list">
        ${eligibleSections.map(({ section, count }) => `
          <label class="section-check-row">
            <input type="checkbox" name="sections" value="${escapeHTML(section.id)}" checked>
            <span><strong>${escapeHTML(section.title)}</strong><small>${count} ${count === 1 ? 'Karte' : 'Karten'}</small></span>
          </label>`).join('')}
      </div>

      <p class="selection-count" id="selectionCount"></p>
      <div class="dialog-actions mobile-stack">
        <button class="button ghost" data-close-dialog type="button">Abbrechen</button>
        <button class="button" id="startStudyButton" type="submit">${labels[2]}</button>
      </div>
    </form>`;

  showAppDialog();
  bindDialogClose();

  const form = document.getElementById('studySelectionForm');
  const all = document.getElementById('selectAllSections');
  const boxes = [...form.querySelectorAll('input[name="sections"]')];
  const countLabel = document.getElementById('selectionCount');
  const startButton = document.getElementById('startStudyButton');

  const updateSelection = () => {
    const selected = boxes.filter((box) => box.checked);
    const cardCount = eligibleSections
      .filter(({ section }) => selected.some((box) => box.value === section.id))
      .reduce((sum, entry) => sum + entry.count, 0);
    all.checked = selected.length === boxes.length;
    all.indeterminate = selected.length > 0 && selected.length < boxes.length;
    countLabel.textContent = `${selected.length} von ${boxes.length} Kategorien · ${cardCount} ${cardCount === 1 ? 'Karte' : 'Karten'}`;
    startButton.disabled = selected.length === 0;
  };

  all.addEventListener('change', () => {
    boxes.forEach((box) => { box.checked = all.checked; });
    updateSelection();
  });
  boxes.forEach((box) => box.addEventListener('change', updateSelection));
  updateSelection();

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const selectedIds = boxes.filter((box) => box.checked).map((box) => box.value);
    if (!selectedIds.length) return;
    startStudySession(project.id, mode, selectedIds);
  });
}

function openCategoryModeDialog(project, sectionIndex) {
  const section = project.sections[sectionIndex];
  if (!section) return;
  const wrong = section.cards.filter((card) => project.progress?.[card.id] === 'repeat').length;

  appDialog.className = 'app-dialog compact-dialog category-mode-dialog';
  appDialog.innerHTML = `
    <div class="app-dialog-card category-mode-card">
      <header class="dialog-header">
        <div>
          <p class="eyebrow">Kategorie ${sectionIndex + 1}</p>
          <h2 id="appDialogTitle">${escapeHTML(section.title)}</h2>
        </div>
        <button class="dialog-close" data-close-dialog type="button" aria-label="Schließen">×</button>
      </header>
      <p class="category-mode-intro">Wie möchtest du die ${section.cards.length} ${section.cards.length === 1 ? 'Karte' : 'Karten'} dieser Kategorie bearbeiten?</p>
      <div class="category-mode-actions">
        <button class="mode-launch learn-launch" data-category-mode="learn" type="button">
          <span class="mode-launch-icon" aria-hidden="true">▣</span><span><strong>Lernmodus</strong><small>Kategorie ansehen und durchgehen</small></span><span class="mode-chevron">›</span>
        </button>
        <button class="mode-launch quiz-launch" data-category-mode="quiz" type="button">
          <span class="mode-launch-icon" aria-hidden="true">?</span><span><strong>Abfragemodus</strong><small>Richtig und falsch selbst bewerten</small></span><span class="mode-chevron">›</span>
        </button>
        ${wrong ? `<button class="mode-launch relearn-launch" data-category-mode="relearn" type="button">
          <span class="mode-launch-icon" aria-hidden="true">↻</span><span><strong>Nachlernen</strong><small>${wrong} falsch beantwortete ${wrong === 1 ? 'Karte' : 'Karten'}</small></span><span class="mode-chevron">›</span>
        </button>` : ''}
      </div>
    </div>`;

  showAppDialog();
  bindDialogClose();
  document.querySelectorAll('[data-category-mode]').forEach((button) => {
    button.addEventListener('click', () => startStudySession(project.id, button.dataset.categoryMode, [section.id]));
  });
}

function startStudySession(projectId, mode, sectionIds) {
  const params = new URLSearchParams({
    project: projectId,
    mode,
    sections: sectionIds.join(',')
  });
  window.location.href = `study.html?${params.toString()}`;
}

function importFiles(files) {
  const supported = files.filter((file) => /\.(json|txt)$/i.test(file.name) || ['application/json', 'text/plain'].includes(file.type));
  if (!supported.length) {
    toast('Dateityp nicht unterstützt', 'Bitte JSON- oder TXT-Dateien auswählen.');
    return;
  }
  if (supported.length !== files.length) {
    toast('Einige Dateien übersprungen', 'Nur JSON- und TXT-Dateien werden verarbeitet.');
  }

  Promise.all(supported.map(readTextFile))
    .then((texts) => {
      const override = document.getElementById('projectTitleOverride')?.value || '';
      if (texts.length === 1) {
        importProjectText(texts[0], override);
        return;
      }
      const payloads = texts.map(parseImport);
      const merged = mergeImportPayloads(payloads);
      importParsedProject(merged, override, `${texts.length} Teil-Dateien`);
    })
    .catch((error) => {
      console.error(error);
      toast('Import fehlgeschlagen', error.message || 'Mindestens eine Datei konnte nicht gelesen werden.');
    });
}

function readTextFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error(`Die Datei „${file.name}“ konnte nicht gelesen werden.`));
    reader.readAsText(file, 'utf-8');
  });
}

function mergeImportPayloads(payloads) {
  const first = payloads[0] || {};
  const sectionMap = new Map();
  payloads.forEach((payload) => {
    const sections = Array.isArray(payload?.sections)
      ? payload.sections
      : (Array.isArray(payload?.cards) ? [{ title: 'Allgemein', cards: payload.cards }] : []);
    sections.forEach((section) => {
      const title = String(section?.title || 'Allgemein').trim() || 'Allgemein';
      if (!sectionMap.has(title)) sectionMap.set(title, []);
      if (Array.isArray(section?.cards)) sectionMap.get(title).push(...section.cards);
    });
  });
  return {
    schemaVersion: first.schemaVersion || 3,
    generationMode: first.generationMode,
    modeVariant: first.modeVariant,
    projectTitle: first.projectTitle || first.title || 'Importiertes Lernprojekt',
    sections: Array.from(sectionMap, ([title, cards]) => ({ title, cards }))
  };
}

function importProjectText(raw, titleOverride = '') {
  if (!raw.trim()) {
    toast('Kein Inhalt', 'Füge zuerst eine ChatGPT-Textausgabe ein.');
    return;
  }

  try {
    const parsed = parseImport(raw);
    importParsedProject(parsed, titleOverride);
  } catch (error) {
    console.error(error);
    toast('Import fehlgeschlagen', error.message || 'Das Format konnte nicht gelesen werden.');
  }
}

function importParsedProject(parsed, titleOverride = '', sourceLabel = '') {
  const project = normalizeProject(parsed, titleOverride);
  if (!countCards(project)) throw new Error('Es wurden keine gültigen Karten gefunden.');
  state.projects.push(project);
  saveProjects();
  if (appDialog.open) appDialog.close();
  location.hash = '';
  renderDashboard();
  const suffix = sourceLabel ? ` aus ${sourceLabel}` : '';
  toast('Projekt erstellt', `${countCards(project)} Karten${suffix} wurden zusammengeführt und gespeichert.`);
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

  const usedCardIds = new Set();
  const normalizedSections = sections.map((section, sectionIndex) => {
    if (!section || typeof section !== 'object') return null;
    const cards = Array.isArray(section.cards) ? section.cards : [];
    const normalizedCards = cards.map((card, cardIndex) => {
      const front = (window.KartenWerkRichText?.decodeLineBreaks(card?.front ?? card?.question ?? card?.title ?? '') || '')
        .replace(/\s*\n\s*/g, ' ')
        .trim();
      const rawBack = card?.back ?? card?.answer ?? card?.content ?? card?.blocks ?? '';
      const back = window.KartenWerkRichText?.normalize(rawBack) || [];
      if (!front || !window.KartenWerkRichText?.hasContent(back)) return null;

      const proposedId = String(card?.id || '').trim().replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 80);
      let cardId = proposedId || `card-${String(cardIndex + 1).padStart(3, '0')}`;
      if (usedCardIds.has(cardId)) cardId = makeId('card');
      usedCardIds.add(cardId);

      return {
        id: cardId,
        front: front.slice(0, 700),
        back,
        source: normalizeSource(card?.source)
      };
    }).filter(Boolean);
    if (!normalizedCards.length) return null;
    return {
      id: makeId('section'),
      title: String(section.title || `Thema ${sectionIndex + 1}`).trim().slice(0, 120),
      cards: normalizedCards
    };
  }).filter(Boolean);

  if (!normalizedSections.length) throw new Error('In den Themen wurden keine vollständigen Karten mit „front“ und „back“ gefunden.');

  const generationMode = ['normal', 'advanced', 'slides'].includes(input.generationMode)
    ? input.generationMode
    : state.generationMode;
  const fallbackVariant = generationMode === 'slides' ? state.slideDetail : state.cardSize;
  const now = new Date().toISOString();
  return {
    id: makeId('project'),
    version: APP_VERSION,
    schemaVersion: Number(input.schemaVersion) || 1,
    generationMode,
    modeVariant: String(input.modeVariant || fallbackVariant).slice(0, 40),
    title: (titleOverride.trim() || String(input.projectTitle || input.title || 'Neues Lernprojekt').trim()).slice(0, 100),
    sections: normalizedSections,
    progress: {},
    createdAt: now,
    updatedAt: now
  };
}

function normalizeSource(source) {
  if (!source || typeof source !== 'object') return null;
  const file = source.file == null ? null : String(source.file).trim().slice(0, 180) || null;
  const pageNumber = Number(source.page);
  const slideNumber = Number(source.slide);
  const page = Number.isFinite(pageNumber) && pageNumber > 0 ? Math.trunc(pageNumber) : null;
  const slide = Number.isFinite(slideNumber) && slideNumber > 0 ? Math.trunc(slideNumber) : null;
  return file || page || slide ? { file, page, slide } : null;
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
  setTheme(saved || preferred, false);
}

function setTheme(theme, persist = true) {
  const next = theme === 'dark' ? 'dark' : 'light';
  document.documentElement.dataset.theme = next;
  themeToggle.textContent = next === 'dark' ? '☀' : '◐';
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', next === 'dark' ? '#0e1420' : '#4f46e5');
  if (persist) localStorage.setItem(THEME_KEY, next);
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

function formatAnswer(content) {
  return window.KartenWerkRichText?.render(content) || '<p>Keine Erklärung vorhanden.</p>';
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
