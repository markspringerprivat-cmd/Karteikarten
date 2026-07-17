'use strict';

const STORAGE_KEY = 'kartenwerk.projects.v1';
const THEME_KEY = 'kartenwerk.theme.v1';
const WIZARD_KEY = 'kartenwerk.createWizard.v2';
const APP_VERSION = 3;
const CHATGPT_URL = 'https://chatgpt.com/';

const DOCUMENT_TYPES = {
  notes: {
    label: 'Lernzettel / Notizen',
    short: 'Bereits verdichtete Lerninhalte',
    prompt: `DOKUMENTTYP – LERNZETTEL ODER NOTIZEN:\n- Behandle Überschriften als mögliche Kategorien oder Kartentitel.\n- Erhalte vorhandene Stichpunkte, Einrückungen, Definitionen und Hervorhebungen.\n- Fasse bereits knappe Inhalte nicht unnötig weiter zusammen.`
  },
  slides: {
    label: 'PowerPoint / Folien-PDF',
    short: 'Folienstruktur und Reihenfolge',
    prompt: `DOKUMENTTYP – PRÄSENTATION:\n- Beachte Foliengrenzen, Folientitel, Unterpunkte, Einrückungen, Tabellen und sichtbare Reihenfolge.\n- Verwende ausschließlich die gewählte Folien- oder Seitenspanne, sofern angegeben.\n- Interpretiere Abbildungen nur anhand eindeutig lesbarer Beschriftungen und Werte.`
  },
  book: {
    label: 'Buch / Kapitel',
    short: 'Kapitelstruktur und Fließtext',
    prompt: `DOKUMENTTYP – BUCH ODER BUCHKAPITEL:\n- Orientiere dich an Kapitel- und Zwischenüberschriften.\n- Verwende nur das angegebene Kapitel beziehungsweise den angegebenen Seitenbereich, sofern eine Eingrenzung vorliegt.\n- Löse Konzepte aus dem Fließtext, ohne Aussagen aus ihrem fachlichen Zusammenhang zu reißen.`
  },
  textPdf: {
    label: 'Text-PDF / Fachtext',
    short: 'Abschnitte, Begriffe und Argumente',
    prompt: `DOKUMENTTYP – TEXT-PDF ODER FACHTEXT:\n- Nutze Überschriften und Absätze zur Gliederung.\n- Identifiziere Definitionen, Schlüsselbegriffe, Modelle, Argumente, Zusammenhänge und Ergebnisse.\n- Verwende nur den angegebenen Seitenbereich, sofern eine Eingrenzung vorliegt.`
  },
  other: {
    label: 'Anderes Dokument',
    short: 'Allgemeine strukturierte Auswertung',
    prompt: `DOKUMENTTYP – SONSTIGE QUELLE:\n- Erkenne die sichtbare Gliederung der Quelle und übertrage sie nachvollziehbar.\n- Bewahre die Reihenfolge, soweit sie für das Verständnis relevant ist.`
  }
};

const CARD_CREATION_MODES = {
  normal: {
    label: 'Normal: Konzepte',
    short: 'Quellennah nach Begriffen und Überschriften',
    infoTitle: 'Normaler Modus',
    infoText: 'Erkennt hervorgehobene Überschriften, Schlüsselbegriffe und Konzepte. Die Erklärung darunter wird möglichst wortlautnah übernommen. Fachbegriffe, Wortwahl und Stil der Quelle bleiben erhalten.',
    prompt: `MODUS – NORMAL, KONZEPTE:\n- Suche nach deutlich erkennbaren Überschriften, hervorgehobenen Begriffen, Definitionen, Schlüsselbegriffen und eigenständigen Konzepten.\n- Verwende eine Überschrift oder einen Schlüsselbegriff als Vorderseite und übernimm die zugehörige Erklärung darunter als Rückseite.\n- Bleibe möglichst genau bei Fachbegriffen, Wortwahl, Stil und Aussagefolge der Quelle.\n- Formuliere nur so weit um, wie es für eine eigenständig verständliche Karte grammatisch notwendig ist.\n- Nutze ausschließlich die bereitgestellte Quelle. Ergänze, recherchiere oder erfinde nichts.`
  },
  chapter: {
    label: 'Kapitel zusammenfassen',
    short: 'Wichtigste Aussagen eines Kapitels',
    infoTitle: 'Kapitel zusammenfassen',
    infoText: 'Erkennt Kapitel und fasst deren wichtigste Inhalte in lernbaren Stichpunktsätzen zusammen. Besonders geeignet für Bücher und längere Fachtexte.',
    prompt: `MODUS – KAPITEL ZUSAMMENFASSEN:\n- Erkenne Kapitel und Unterkapitel anhand der Quelle.\n- Erstelle pro ausgewähltem Kapitel eine oder mehrere logisch gegliederte Karten mit den wichtigsten Aussagen.\n- Schreibe die Rückseiten als vollständige, knappe Stichpunktsätze.\n- Bewahre zentrale Fachbegriffe, Definitionen, Modelle, Argumente und Ergebnisse.\n- Lasse Beispiele und Details nur weg, wenn sie für das Verständnis der Kernaussagen nicht erforderlich sind.\n- Nutze ausschließlich die Quelle; keine Ergänzungen aus Vorwissen.`
  },
  advanced: {
    label: 'Advanced: erklärt',
    short: 'Quellennah plus verständliche Definitionen',
    infoTitle: 'Advanced-Modus',
    infoText: 'Bleibt nah an Wortwahl und Stil der Quelle, ergänzt aber kurze verständliche Erklärungen zu Fachbegriffen und schwierigen Zusammenhängen – ohne fremde Informationen.',
    prompt: `MODUS – ADVANCED:\n- Übernimm Kernaussagen, Fachbegriffe, Wortwahl und Stil so nah wie sinnvoll an der Quelle.\n- Ergänze kurze verständliche Erklärungen zu schwierigen Fachbegriffen und Zusammenhängen.\n- Solche Erklärungen dürfen nur aus Informationen abgeleitet werden, die in der Quelle selbst enthalten oder eindeutig erkennbar sind.\n- Nutze keine externen Quellen, keine erfundenen Beispiele und keine zusätzlichen Theorien.\n- Trenne Quelleninhalt und erklärende Verdeutlichung nicht künstlich, sondern formuliere eine gut lernbare, fachlich genaue Antwort.`
  },
  slides: {
    label: 'PowerPoint: Folie = Karte',
    short: 'Eine Folie bleibt eine Karte',
    infoTitle: 'PowerPoint-Modus',
    infoText: 'Jede berücksichtigte Folie oder PDF-Seite wird genau eine Karte. Lange Inhalte bleiben vollständig und werden in KartenWerk innerhalb der Karte gescrollt.',
    prompt: `MODUS – POWERPOINT:\n- Erstelle aus jeder berücksichtigten Folie beziehungsweise Seite genau eine Karte.\n- Vorderseite: exakter Folientitel; fehlt er, verwende „Folie X“ oder „Seite X“.\n- Rückseite: sämtliche relevanten Inhalte derselben Folie in sichtbarer Reihenfolge und Hierarchie.\n- Lege keine Folien zusammen und teile keine Folie wegen ihrer Länge.\n- Erhalte Hauptpunkte, Unterpunkte, Nummerierungen, Tabellen, Zahlen und Fachbegriffe.\n- Lange Karten sind ausdrücklich zulässig und werden in KartenWerk gescrollt.`
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

const JSON_PROMPT = `Erstelle eine herunterladbare JSON-Datei mit folgendem Inhalt.

QUELLE
Verarbeite angehängte PDF-, Word-, PowerPoint-, Text- oder Bilddateien und/oder den Text unter AUSGANGSTEXT gemeinsam. Nutze ausschließlich sicher lesbare Informationen aus diesen Quellen. Erfinde, ergänze oder recherchiere nichts.

{{DOCUMENT_RULES}}
{{SCOPE_RULES}}
{{MODE_RULES}}
{{VARIANT_RULES}}

KARTENWERK-FORMAT
- Gliedere das Projekt in sinnvolle sections.
- Jede Karte hat front und back. back ist ein Array strukturierter Blöcke.
- Erhalte sichtbare Überschriften, Absätze, Listen, Unterpunkte, Nummerierungen, Tabellen, Fachbegriffe, Zahlen und Reihenfolge.
- Lange Karten sind erlaubt; kürze nicht wegen der Bildschirmgröße.

ZULÄSSIGE BACK-BLÖCKE
{"type":"heading","text":"Zwischenüberschrift"}
{"type":"paragraph","text":"Absatz"}
{"type":"list","style":"unordered","items":["Punkt 1","Punkt 2"]}
{"type":"list","style":"ordered","items":["Schritt 1","Schritt 2"]}
{"type":"table","headers":["A","B"],"rows":[["a1","b1"],["a2","b2"]]}

TECHNISCHE REGELN
- Jeder Listenpunkt ist ein eigenes items-Element; keine Aufzählungszeichen im paragraph-Text.
- Keine sichtbaren \\n, \\r, <br>, Markdown- oder HTML-Zeichen in Textfeldern.
- Tabellen nur bei einer tatsächlichen Tabelle oder klaren Gegenüberstellung; alle Zeilen haben gleich viele Zellen.
- Eindeutige Karten-IDs: card-001, card-002 usw.
- source nur mit sicher erkennbaren Angaben füllen, sonst null.

SCHEMA
{
  "schemaVersion":3,
  "projectId":"stabiler-kurztitel",
  "part":1,
  "parts":1,
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

UMFANG UND TEILDATEIEN
- Versuche zuerst, eine vollständige Datei zu erstellen.
- Falls die Quelle nicht vollständig verfügbar ist: Erstelle keine unvollständige Datei. Frage: „Die Quelle konnte nicht vollständig gelesen werden. Möchtest du den Vorgang abbrechen oder die Quelle erneut vollständig bereitstellen? Antworte mit ABBRECHEN oder ERNEUT.“
- Falls nur die Ausgabe zu umfangreich für eine Datei ist: Frage: „Das vollständige Projekt benötigt mehrere JSON-Dateien. Soll ich Teil 1, Teil 2 usw. erstellen oder abbrechen? Antworte mit AUFTEILEN oder ABBRECHEN.“
- Nach AUFTEILEN: Erzeuge mehrere vollständige Dateien mit höchstens 80 Karten. Gleiche projectId und projectTitle, korrekte part/parts-Werte, Dateinamen kartenwerk-kurztitel-teil-01.json usw.

AUSGABE
- Stelle die fertige UTF-8-.json-Datei beziehungsweise die Teil-Dateien als echte herunterladbare Anhänge bereit.
- Schreibe den JSON-Inhalt nicht in den Chat und nicht in einen Codeblock.
- Prüfe vorher: gültiges JSON, keine leeren oder doppelten Karten, korrekte Blöcke und ausschließlich Quelleninhalt.

AUSGANGSTEXT
[TEXT HIER EINFÜGEN ODER LEER LASSEN, WENN DIE QUELLE ANGEHÄNGT WIRD.]`;
const DELIMITER_PROMPT = `AUFGABE
Erstelle aus angehängten Dateien und/oder AUSGANGSTEXT einen vollständigen KartenWerk-Lernkartensatz. Nutze ausschließlich Quelleninformationen.

QUELLENART
{{DOCUMENT_RULES}}
{{SCOPE_RULES}}

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
  documentType: 'notes',
  scopeChapter: '',
  scopePages: '',
  wizardStep: 1,
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

        <button class="app-tile system-tile" id="mergeProjectsTile" type="button" ${state.projects.length < 2 ? 'disabled' : ''}>
          <span class="tile-icon" aria-hidden="true">↗</span>
          <span class="tile-title">Projekte verbinden</span>
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


function openNewProjectChoiceDialog() {
  appDialog.className = 'app-dialog compact-dialog new-project-choice-dialog';
  appDialog.innerHTML = `
    <div class="app-dialog-card new-project-choice-card">
      <header class="dialog-header">
        <div>
          <p class="eyebrow">Neues Projekt</p>
          <h2 id="appDialogTitle">Wie möchtest du starten?</h2>
        </div>
        <button class="dialog-close" data-close-dialog type="button" aria-label="Schließen">×</button>
      </header>

      <div class="new-project-choice-grid">
        <button class="new-project-choice" id="startProjectWizard" type="button">
          <span class="new-project-choice-icon" aria-hidden="true">＋</span>
          <span><strong>Projekt erstellen</strong><small>Quelle und Aufbereitung auswählen, Prompt erzeugen und das Ergebnis anschließend importieren.</small></span>
        </button>

        <label class="new-project-choice upload-choice" for="quickJsonInput">
          <span class="new-project-choice-icon" aria-hidden="true">⇧</span>
          <span><strong>JSON-Datei hochladen</strong><small>Eine vorhandene KartenWerk-Datei auswählen und sofort als neues Projekt anlegen.</small></span>
        </label>
        <input class="hidden" id="quickJsonInput" type="file" multiple accept=".json,application/json">
      </div>
      <p class="choice-hint">Mehrere zusammengehörige Teil-Dateien können gemeinsam ausgewählt werden.</p>
    </div>`;

  showAppDialog();
  bindDialogClose();

  document.getElementById('startProjectWizard')?.addEventListener('click', () => {
    appDialog.close();
    openCreateProjectDialog(false);
  });

  document.getElementById('quickJsonInput')?.addEventListener('change', (event) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;
    importFiles(files);
    event.target.value = '';
  });
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
        </button>
        <button class="project-tile-menu" data-delete-project="${project.id}" type="button" aria-label="${escapeHTML(project.title)} löschen" title="Projekt löschen">×</button>
      </article>`;
  }).join('');
}

function bindDashboardEvents() {
  document.getElementById('settingsTile').addEventListener('click', openSettingsDialog);
  document.getElementById('instructionsTile').addEventListener('click', openInstructionsDialog);
  document.getElementById('newProjectTile').addEventListener('click', openNewProjectChoiceDialog);
  document.getElementById('mergeProjectsTile')?.addEventListener('click', openMergeProjectsDialog);

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


function openMergeProjectsDialog(preselectedProjectId = '') {
  if (state.projects.length < 2) {
    toast('Zu wenige Projekte', 'Importiere mindestens zwei Teilprojekte, bevor du sie verbindest.');
    return;
  }
  const grouped = new Map();
  state.projects.forEach((project) => {
    const key = project.projectId || safeFilename(project.title);
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key).push(project);
  });
  const likelyGroups = [...grouped.entries()].filter(([, items]) => items.length > 1);
  const candidates = preselectedProjectId && grouped.has(preselectedProjectId)
    ? grouped.get(preselectedProjectId)
    : (likelyGroups[0]?.[1] || state.projects);

  appDialog.className = 'app-dialog compact-dialog';
  appDialog.innerHTML = `
    <form class="app-dialog-card" id="mergeProjectsForm">
      <header class="dialog-header"><div><p class="eyebrow">Teilprojekte</p><h2 id="appDialogTitle">Projekte verbinden</h2></div><button class="dialog-close" data-close-dialog type="button">×</button></header>
      <p>Wähle mindestens zwei Projekte. Gleichnamige Kategorien werden zusammengeführt; doppelte Karten-IDs werden automatisch bereinigt.</p>
      <div class="section-check-list">
        ${candidates.map((project) => `<label class="section-check-row"><input type="checkbox" name="mergeProject" value="${escapeHTML(project.id)}" checked><span><strong>${escapeHTML(project.title)}</strong><small>${countCards(project)} Karten${project.parts > 1 ? ` · Teil ${project.part} von ${project.parts}` : ''}</small></span></label>`).join('')}
      </div>
      <label class="field-label">Name des verbundenen Projekts<input id="mergedProjectTitle" type="text" value="${escapeHTML(candidates[0]?.title?.replace(/\s*\(Teil.*?\)$/i, '') || 'Verbundenes Projekt')}"></label>
      <label class="select-all-row"><input id="removeSourceProjects" type="checkbox" checked><span><strong>Teilprojekte nach dem Verbinden entfernen</strong><small>Die zusammengeführte Version bleibt erhalten.</small></span></label>
      <div class="dialog-actions mobile-stack"><button class="button ghost" data-close-dialog type="button">Abbrechen</button><button class="button" type="submit">Auswahl verbinden</button></div>
    </form>`;
  showAppDialog();
  bindDialogClose();
  document.getElementById('mergeProjectsForm').addEventListener('submit', (event) => {
    event.preventDefault();
    const ids = [...event.currentTarget.querySelectorAll('input[name="mergeProject"]:checked')].map((box) => box.value);
    if (ids.length < 2) { toast('Auswahl fehlt', 'Wähle mindestens zwei Projekte.'); return; }
    const selected = ids.map(getProject).filter(Boolean);
    mergeStoredProjects(selected, document.getElementById('mergedProjectTitle').value, document.getElementById('removeSourceProjects').checked);
  });
}

function openMergeSuggestion(projectId) {
  const matches = state.projects.filter((project) => project.projectId === projectId);
  if (matches.length < 2) return;
  openMergeProjectsDialog(projectId);
}

function mergeStoredProjects(projects, title, removeSources) {
  const payloads = projects.map((project) => ({
    schemaVersion: project.schemaVersion || 3,
    projectId: project.projectId,
    projectTitle: project.title,
    generationMode: project.generationMode,
    modeVariant: project.modeVariant,
    sections: project.sections
  }));
  const mergedPayload = mergeImportPayloads(payloads);
  mergedPayload.projectTitle = String(title || projects[0].title || 'Verbundenes Projekt').trim();
  const merged = normalizeProject(mergedPayload, mergedPayload.projectTitle);
  merged.projectId = projects[0].projectId || safeFilename(merged.title);
  merged.part = 1;
  merged.parts = 1;
  if (removeSources) state.projects = state.projects.filter((item) => !projects.some((project) => project.id === item.id));
  state.projects.push(merged);
  saveProjects();
  appDialog.close();
  renderDashboard();
  toast('Projekte verbunden', `${projects.length} Projekte wurden zu ${countCards(merged)} Karten zusammengeführt.`);
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
  document.getElementById('instructionCreateProject').addEventListener('click', () => openCreateProjectDialog(true));
}

function getSelectedVariant() {
  if (state.generationMode === 'slides') {
    return { key: state.slideDetail, ...(SLIDE_DETAIL_OPTIONS[state.slideDetail] || SLIDE_DETAIL_OPTIONS.full) };
  }
  return { key: state.cardSize, ...(CARD_SIZE_OPTIONS[state.cardSize] || CARD_SIZE_OPTIONS.learning) };
}

function getScopeRules() {
  const chapter = String(state.scopeChapter || '').trim();
  const pages = String(state.scopePages || '').trim();
  const lines = ['EINGRENZUNG:'];
  if (chapter) lines.push(`- Verwende ausschließlich dieses Kapitel beziehungsweise diesen Abschnitt: ${chapter}`);
  if (pages) lines.push(`- Verwende ausschließlich diesen Folien-/Seitenbereich: ${pages}`);
  if (!chapter && !pages) lines.push('- Verarbeite die gesamte bereitgestellte Quelle.');
  return lines.join('\n');
}

function getActivePrompt() {
  const template = state.promptMode === 'json' ? JSON_PROMPT : DELIMITER_PROMPT;
  const mode = CARD_CREATION_MODES[state.generationMode] || CARD_CREATION_MODES.normal;
  const doc = DOCUMENT_TYPES[state.documentType] || DOCUMENT_TYPES.notes;
  const variant = getSelectedVariant();
  return template
    .replaceAll('{{DOCUMENT_RULES}}', doc.prompt)
    .replaceAll('{{SCOPE_RULES}}', getScopeRules())
    .replaceAll('{{MODE_RULES}}', mode.prompt)
    .replaceAll('{{VARIANT_RULES}}', variant.prompt)
    .replaceAll('{{MODE_KEY}}', state.generationMode)
    .replaceAll('{{VARIANT_KEY}}', variant.key);
}

function getPromptWithOptionalSource() {
  const source = document.getElementById('sourceText')?.value.trim() || loadWizardDraft().sourceText || '';
  const prompt = getActivePrompt();
  if (!source) return prompt;
  return prompt.replace(/\[TEXT HIER EINFÜGEN[^\]]*\]/, () => source);
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
      saveWizardDraft();
      document.querySelectorAll('[data-mode-variant]').forEach((item) => item.classList.toggle('active', item === button));
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

function loadWizardDraft() {
  try { return JSON.parse(localStorage.getItem(WIZARD_KEY) || '{}'); } catch { return {}; }
}

function saveWizardDraft(extra = {}) {
  const draft = {
    step: state.wizardStep,
    documentType: state.documentType,
    generationMode: state.generationMode,
    cardSize: state.cardSize,
    slideDetail: state.slideDetail,
    promptMode: state.promptMode,
    importTab: state.importTab,
    scopeChapter: state.scopeChapter,
    scopePages: state.scopePages,
    sourceText: document.getElementById('sourceText')?.value ?? loadWizardDraft().sourceText ?? '',
    projectTitle: document.getElementById('projectTitleOverride')?.value ?? loadWizardDraft().projectTitle ?? '',
    importText: document.getElementById('importText')?.value ?? loadWizardDraft().importText ?? '',
    ...extra
  };
  localStorage.setItem(WIZARD_KEY, JSON.stringify(draft));
}

function clearWizardDraft() { localStorage.removeItem(WIZARD_KEY); }

function restoreWizardState() {
  const d = loadWizardDraft();
  state.wizardStep = Math.min(3, Math.max(1, Number(d.step) || 1));
  state.documentType = d.documentType || '';
  state.generationMode = d.generationMode || '';
  state.cardSize = d.cardSize || 'learning';
  state.slideDetail = d.slideDetail || 'full';
  state.promptMode = d.promptMode || 'json';
  state.importTab = d.importTab || 'file';
  state.scopeChapter = d.scopeChapter || '';
  state.scopePages = d.scopePages || '';
}

function wizardStepComplete(step) {
  if (step === 1) return Boolean(state.documentType && state.generationMode); // optionale Eingrenzungen und das standardmäßige JSON-Format blockieren nicht
  return true;
}

function openCreateProjectDialog(reset = false) {
  if (reset) clearWizardDraft();
  restoreWizardState();
  renderCreateWizard();
}

function renderCreateWizard() {
  const draft = loadWizardDraft();
  const step = state.wizardStep;
  appDialog.className = 'app-dialog create-dialog wizard-dialog';
  appDialog.innerHTML = `
    <div class="app-dialog-card create-dialog-card wizard-card">
      <header class="dialog-header wizard-header">
        <div><p class="eyebrow">Neues Projekt</p><h2 id="appDialogTitle">Schritt ${step} von 3</h2></div>
        <button class="dialog-close" data-close-dialog type="button" aria-label="Schließen">×</button>
      </header>
      <div class="wizard-stepper" aria-label="Projektfortschritt">
        <span class="${step===1?'active':step>1?'done':''}"><b>1</b><small>Quelle wählen</small></span>
        <span class="${step===2?'active':step>2?'done':''}"><b>2</b><small>Prompt erzeugen</small></span>
        <span class="${step===3?'active':''}"><b>3</b><small>Importieren</small></span>
      </div>
      <div class="wizard-progress" aria-hidden="true"><span style="width:${step/3*100}%"></span></div>
      <main class="wizard-page">${renderWizardStep(step, draft)}</main>
      <footer class="wizard-footer">
        <button class="button ghost" id="wizardBack" type="button" ${step === 1 ? 'disabled' : ''}>← Zurück</button>
        ${step < 3
          ? `<button class="button" id="wizardNext" type="button" ${wizardStepComplete(step) ? '' : 'disabled'}>Weiter →</button>`
          : `<button class="button" id="wizardCreate" type="button">Projekt erstellen</button>`}
      </footer>
    </div>`;
  showAppDialog(); bindDialogClose(); bindWizardEvents();
}

function renderWizardStep(step, draft) {
  if (step === 1) return `
    <section class="wizard-centered">
      <h3>Quelle und Aufbereitung wählen</h3>
      <p class="wizard-intro">Diese Auswahl bestimmt, wie ChatGPT deine Quelle liest und die Karten gliedert.</p>
      <label class="compact-field">Dokumenttyp
        <select id="documentTypeSelect" class="input centered-input">
          <option value="">Bitte auswählen …</option>
          ${Object.entries(DOCUMENT_TYPES).map(([k,v])=>`<option value="${k}" ${state.documentType===k?'selected':''}>${escapeHTML(v.label)}</option>`).join('')}
        </select>
      </label>
      <label class="compact-field">Aufbereitungsmodus
        <select id="generationModeSelect" class="input centered-input">
          <option value="">Bitte auswählen …</option>
          ${Object.entries(CARD_CREATION_MODES).map(([k,v])=>`<option value="${k}" ${state.generationMode===k?'selected':''}>${escapeHTML(v.label)}</option>`).join('')}
        </select>
      </label>
      <button class="text-help-button" id="modeHelpButton" type="button" ${state.generationMode?'':'disabled'}>Was macht dieser Modus?</button>
      <div id="contextOptions">${renderContextOptions(draft)}</div>
      <label class="compact-field">Ausgabeformat
        <select id="promptModeSelect" class="input centered-input">
          <option value="">Bitte auswählen …</option>
          <option value="json" ${(!state.promptMode || state.promptMode==='json')?'selected':''}>JSON-Datei (empfohlen)</option>
          <option value="delimiter" ${state.promptMode==='delimiter'?'selected':''}>§§§-Text</option>
        </select>
      </label>
    </section>`;
  if (step === 2) return `
    <section class="wizard-centered prompt-step-page">
      <h3>Prompt an ChatGPT senden</h3>
      <p class="wizard-intro">Der Prompt ist fertig auf deine Auswahl abgestimmt. Anhänge fügst du anschließend direkt in ChatGPT hinzu.</p>
      <div class="selection-summary">
        <strong>${escapeHTML(DOCUMENT_TYPES[state.documentType]?.label || '')}</strong>
        <span>${escapeHTML(CARD_CREATION_MODES[state.generationMode]?.label || '')}</span>
      </div>
      <label class="compact-field">Text direkt ergänzen <small>optional</small>
        <textarea class="textarea source-textarea" id="sourceText" placeholder="Leer lassen, wenn du eine Datei in ChatGPT anhängst.">${escapeHTML(draft.sourceText || '')}</textarea>
      </label>
      <button class="button full-width chatgpt-button" id="copyAndOpenChatGPTButton" type="button">Prompt kopieren &amp; ChatGPT öffnen ↗</button>
      <button class="button ghost full-width" id="copyPromptButton" type="button">Nur Prompt kopieren</button>
      <details class="prompt-details"><summary>Prompt ansehen</summary><pre class="prompt-preview" id="promptPreview">${escapeHTML(getActivePrompt())}</pre></details>
    </section>`;
  return `
    <section class="wizard-centered import-wizard-page">
      <h3>Ergebnis importieren</h3>
      <p class="wizard-intro">Wähle die heruntergeladene JSON-Datei. Mehrere Teil-Dateien kannst du gemeinsam auswählen.</p>
      <label class="compact-field">Projektname <small>optional</small>
        <input class="input centered-input" id="projectTitleOverride" maxlength="100" value="${escapeHTML(draft.projectTitle || '')}" placeholder="Titel aus Datei übernehmen">
      </label>
      <div class="import-tabs compact-tabs">
        <button class="tab-button ${state.importTab==='file'?'active':''}" data-import-tab="file" type="button">Datei</button>
        <button class="tab-button ${state.importTab==='paste'?'active':''}" data-import-tab="paste" type="button">Text</button>
      </div>
      <div id="fileImport" class="${state.importTab==='file'?'':'hidden'}">
        <label class="dropzone mobile-dropzone" id="dropzone" for="fileInput"><span class="dropzone-icon">＋</span><div><strong>Datei(en) auswählen</strong><span>JSON oder TXT; Teil-Dateien gemeinsam möglich</span></div></label>
        <input class="hidden" id="fileInput" type="file" multiple accept=".json,.txt,application/json,text/plain">
        <div id="selectedFilesStatus" class="file-status">Noch keine Datei ausgewählt</div>
      </div>
      <div id="pasteImport" class="${state.importTab==='paste'?'':'hidden'}">
        <textarea class="textarea import-textarea" id="importText" placeholder="JSON- oder §§§-Text einfügen …">${escapeHTML(draft.importText || '')}</textarea>
        <button class="button ghost full-width" id="pasteClipboardButton" type="button">Aus Zwischenablage einfügen</button>
      </div>
    </section>`;
}

function renderContextOptions(draft) {
  const doc = state.documentType;
  const mode = state.generationMode;
  let html = '';
  if (doc === 'book') html += `<label class="compact-field">Kapitel / Abschnitt <small>optional</small><input id="scopeChapter" class="input centered-input" value="${escapeHTML(state.scopeChapter)}" placeholder="z. B. Kapitel 4"></label>`;
  if (doc === 'book' || doc === 'slides' || doc === 'textPdf') html += `<label class="compact-field">Seiten / Folien <small>optional</small><input id="scopePages" class="input centered-input" value="${escapeHTML(state.scopePages)}" placeholder="z. B. 12–28"></label>`;
  if (mode) html += renderModeVariantOptions();
  return html;
}

function bindWizardEvents() {
  const next = document.getElementById('wizardNext');
  const back = document.getElementById('wizardBack');
  back?.addEventListener('click', () => { saveWizardDraft(); state.wizardStep--; saveWizardDraft({step:state.wizardStep}); renderCreateWizard(); });
  next?.addEventListener('click', () => { saveWizardDraft(); if (!wizardStepComplete(state.wizardStep)) return; state.wizardStep++; saveWizardDraft({step:state.wizardStep}); renderCreateWizard(); });

  const docSel = document.getElementById('documentTypeSelect');
  const modeSel = document.getElementById('generationModeSelect');
  const formatSel = document.getElementById('promptModeSelect');
  const updateStepOne = () => {
    state.documentType = docSel?.value || state.documentType;
    state.generationMode = modeSel?.value || state.generationMode;
    state.promptMode = formatSel?.value || state.promptMode;
    state.importTab = state.promptMode === 'delimiter' ? 'paste' : 'file';
    saveWizardDraft(); renderCreateWizard();
  };
  docSel?.addEventListener('change', updateStepOne);
  modeSel?.addEventListener('change', updateStepOne);
  formatSel?.addEventListener('change', updateStepOne);
  document.getElementById('modeHelpButton')?.addEventListener('click',()=>openModeInfoDialog(state.generationMode));
  document.getElementById('scopeChapter')?.addEventListener('input',e=>{state.scopeChapter=e.target.value;saveWizardDraft();});
  document.getElementById('scopePages')?.addEventListener('input',e=>{state.scopePages=e.target.value;saveWizardDraft();});
  bindModeVariantButtons();

  document.getElementById('sourceText')?.addEventListener('input',()=>saveWizardDraft());
  document.getElementById('projectTitleOverride')?.addEventListener('input',()=>saveWizardDraft());
  document.getElementById('importText')?.addEventListener('input',()=>saveWizardDraft());

  document.getElementById('copyPromptButton')?.addEventListener('click', async()=>{ try{await copyText(getPromptWithOptionalSource());saveWizardDraft();toast('Prompt kopiert','Füge ihn jetzt in ChatGPT ein.');}catch{toast('Kopieren nicht möglich','Öffne die Prompt-Vorschau und kopiere manuell.');} });
  document.getElementById('copyAndOpenChatGPTButton')?.addEventListener('click', async()=>{
    saveWizardDraft(); state.wizardStep=3; saveWizardDraft({step:3});
    try{await copyText(getPromptWithOptionalSource());}catch{}
    const opened=window.open(CHATGPT_URL,'_blank');
    if(opened) {
      opened.opener=null;
      renderCreateWizard();
      toast('Prompt kopiert','Nach der Rückkehr wartet Schritt 3 auf deine Datei.');
    } else {
      window.location.href=CHATGPT_URL;
    }
  });
  document.querySelectorAll('[data-import-tab]').forEach(b=>b.addEventListener('click',()=>{state.importTab=b.dataset.importTab;saveWizardDraft();renderCreateWizard();}));
  document.getElementById('pasteClipboardButton')?.addEventListener('click',async()=>{try{document.getElementById('importText').value=await navigator.clipboard.readText();saveWizardDraft();}catch{toast('Zugriff nicht möglich','Füge den Text manuell ein.');}});

  const fileInput=document.getElementById('fileInput'); const dropzone=document.getElementById('dropzone');
  fileInput?.addEventListener('change',()=>{ const files=Array.from(fileInput.files||[]); window.__kartenwerkPendingFiles=files; const status=document.getElementById('selectedFilesStatus'); if(status)status.textContent=files.length?`${files.length} Datei(en) ausgewählt`:'Noch keine Datei ausgewählt'; });
  ['dragenter','dragover'].forEach(n=>dropzone?.addEventListener(n,e=>{e.preventDefault();dropzone.classList.add('dragging');}));
  ['dragleave','drop'].forEach(n=>dropzone?.addEventListener(n,e=>{e.preventDefault();dropzone.classList.remove('dragging');}));
  dropzone?.addEventListener('drop',e=>{window.__kartenwerkPendingFiles=Array.from(e.dataTransfer.files||[]);const st=document.getElementById('selectedFilesStatus');if(st)st.textContent=`${window.__kartenwerkPendingFiles.length} Datei(en) ausgewählt`;});

  document.getElementById('wizardCreate')?.addEventListener('click',async()=>{
    const title=document.getElementById('projectTitleOverride')?.value||'';
    if(state.importTab==='file'){
      const files=window.__kartenwerkPendingFiles||[];
      if(!files.length){toast('Datei fehlt','Wähle mindestens eine JSON- oder TXT-Datei aus.');return;}
      await importFiles(files,title); window.__kartenwerkPendingFiles=[];
    } else {
      const text=document.getElementById('importText')?.value||'';
      if(!text.trim()){toast('Text fehlt','Füge zuerst die ChatGPT-Ausgabe ein.');return;}
      importProjectText(text,title);
    }
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
    button.addEventListener('click', () => { if (appDialog.classList.contains('wizard-dialog')) saveWizardDraft(); appDialog.close(); });
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
      projectId: project.projectId || safeFilename(project.title),
      part: project.part || 1,
      parts: project.parts || 1,
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
    projectId: first.projectId || safeFilename(first.projectTitle || first.title || 'projekt'),
    part: 1,
    parts: 1,
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
  clearWizardDraft();
  if (appDialog.open) appDialog.close();
  location.hash = '';
  renderDashboard();
  const suffix = sourceLabel ? ` aus ${sourceLabel}` : '';
  const partInfo = project.parts > 1 ? ` · Teil ${project.part} von ${project.parts}` : '';
  toast('Projekt importiert', `${countCards(project)} Karten${suffix}${partInfo}.`);
  const matches = state.projects.filter((item) => item.id !== project.id && item.projectId && item.projectId === project.projectId);
  if (matches.length) setTimeout(() => openMergeSuggestion(project.projectId), 250);
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
    projectId: String(input.projectId || safeFilename(input.projectTitle || input.title || 'projekt')).trim().slice(0, 100),
    part: Math.max(1, Math.trunc(Number(input.part) || 1)),
    parts: Math.max(1, Math.trunc(Number(input.parts) || 1)),
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
