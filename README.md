# KartenWerk

KartenWerk ist eine statische, mobil optimierte Karteikarten-Webanwendung für GitHub Pages. Projekte und Lernstände werden ausschließlich im lokalen Browserspeicher des verwendeten Geräts gespeichert.

## Neuer Projektassistent

Der Assistent führt durch drei klar getrennte Schritte:

1. **Aufbereitung wählen**
   - **Normal:** möglichst wortlautnah und ohne unnötige Synonyme.
   - **Advanced:** verständlicher erklärt, aber ohne externe Ergänzungen.
   - **Folienmodus:** genau eine Karte pro Folie oder PDF-Seite.
2. **Prompt kopieren und ChatGPT öffnen**
   - Der kombinierte Button kopiert den fertigen Prompt und öffnet `chatgpt.com`.
   - Ist die ChatGPT-App auf dem Gerät für den Link eingerichtet, kann sie sich öffnen; andernfalls wird die Webversion verwendet.
   - Ein direkt eingegebener Lerntext wird automatisch in den kopierten Prompt eingesetzt.
3. **Ergebnis importieren**
   - Empfohlen: echte `.json`-Datei hochladen.
   - Alternativ: `§§§`-Text einfügen.

## Ausdifferenzierte Kartenerstellung

### Normal und Advanced

Zusätzlich kann die Kartengröße gewählt werden:

- **Lernfreundlich:** eigenständig abfragbare Inhalte werden getrennt; zusammengehörige Merkmale dürfen auf einer Karte bleiben.
- **Große Karten:** zusammenhängende Quellenabschnitte bleiben eher gemeinsam und werden nur an klaren Themenwechseln getrennt.

### Folienmodus

- **Vollständige Folie:** alle relevanten Inhalte werden übernommen. Die Anzahl der Stichpunkte ist nicht begrenzt.
- **Kompakte Folie:** weiterhin exakt eine Karte pro Folie, aber Wiederholungen und Füllformulierungen dürfen verdichtet werden.

Lange Rückseiten werden nicht künstlich verkleinert. Nur der Inhalt innerhalb der Karte scrollt; die Lernseite selbst bleibt auf die Bildschirmhöhe begrenzt.

## Verbessertes JSON-Format

Das aktuelle Schema unterstützt:

- Schema-Version und gewählten Erstellungsmodus
- stabile Karten-IDs
- Absätze
- Zwischenüberschriften
- ungeordnete und nummerierte Listen
- Tabellen
- optionale Datei-, Seiten- und Folienangaben

Beispiel:

```json
{
  "schemaVersion": 3,
  "generationMode": "slides",
  "modeVariant": "full",
  "projectTitle": "Vorlesung Forschungsmethoden",
  "sections": [
    {
      "title": "Forschungsdesign",
      "cards": [
        {
          "id": "card-001",
          "front": "Zeitdimensionen",
          "back": [
            { "type": "heading", "text": "Untersuchungsformen" },
            { "type": "list", "style": "unordered", "items": ["Querschnitt", "Trendstudie", "Panelstudie"] }
          ],
          "source": { "file": "vorlesung.pptx", "page": null, "slide": 7 }
        }
      ]
    }
  ]
}
```

## Lernfunktionen

- Lernmodus
- Abfragemodus mit Richtig-/Falsch-Tracking
- Nachlernen falsch beantworteter Karten
- Kategorien einzeln oder gemeinsam auswählen
- Karte antippen zum Umdrehen
- horizontal wischen für vorherige/nächste Karte
- vertikal innerhalb langer Rückseiten scrollen
- breite Tabellen innerhalb der Karte horizontal wischen
- optional sichtbare Quellenangabe
- lokale Speicherung des Lernstands

## GitHub Pages veröffentlichen

1. Den Inhalt dieses Ordners in das Stammverzeichnis eines GitHub-Repositories hochladen.
2. In GitHub **Settings → Pages** öffnen.
3. **Deploy from a branch** auswählen.
4. Branch `main` und Ordner `/ (root)` festlegen.
5. Speichern.

## Lokale Speicherung

- Die Anwendung selbst sendet keine Lernprojekte an einen Server.
- Projekte liegen nur im jeweiligen Browser und Gerät.
- Das Löschen von Browserdaten kann Projekte entfernen.
- Unter **Einstellungen** können alle Projekte gesichert und später wieder eingelesen werden.

## Dateien

- `index.html` – Startseite und Dialoggrundstruktur
- `styles.css` – responsives, minimalistisches App-Layout
- `app.js` – Prompt-Assistent, Import, Projekte und lokale Speicherung
- `study.html` – separate Vollbild-Lernansicht
- `study.css` – scrollfreie Lernseite mit scrollbareren Karteninhalten
- `study.js` – Lern-, Abfrage- und Nachlernlogik
- `rich-content.js` – strukturierte Darstellung von Absätzen, Listen und Tabellen
- `sample-cards.json` – direkt importierbares Beispiel im Schema 3
- `manifest.webmanifest` und `icon.svg` – Web-App-Metadaten
