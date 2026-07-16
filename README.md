# KartenWerk

KartenWerk ist eine vollständig statische Karteikarten-Webanwendung. Ein mitgelieferter Prompt verarbeitet direkt eingefügten Text ebenso wie angehängte PDFs, Dokumente, Präsentationen oder Bilddateien. Im empfohlenen JSON-Modus fordert der Prompt ChatGPT auf, eine echte herunterladbare `.json`-Datei zu erzeugen, die anschließend hochgeladen wird.

## Funktionen

- vorbereiteter ChatGPT-Prompt für Anhänge und direkt eingefügten Text
- verbindliche Erzeugung einer herunterladbaren JSON-Datei im JSON-Modus
- empfohlener JSON-Import
- zusätzlicher Textimport mit `§§§` als Kartentrenner
- automatische Projekt- und Themenstruktur
- automatisch erzeugtes Inhaltsverzeichnis
- Lernmodus: Vorder- und Rückseite gemeinsam
- Abfragemodus: Karte durch Anklicken umdrehen
- Markierung „Gewusst“ oder „Noch einmal“
- lokale Speicherung über `localStorage`
- Einzelprojekt-Export und Gesamtsicherung
- responsive Darstellung und Dunkelmodus
- keine externen Bibliotheken, kein Server und keine Anmeldung

## Verwendung mit ChatGPT

### JSON-Modus – empfohlen

1. Den JSON-Prompt in KartenWerk kopieren.
2. Den Prompt in ChatGPT einfügen.
3. Den Lerntext entweder direkt unter den Prompt setzen oder PDF-, Word-, PowerPoint-, Text- beziehungsweise Bilddateien an die Nachricht anhängen.
4. ChatGPT soll eine echte Datei nach dem Muster `kartenwerk-kurztitel.json` erstellen. Der JSON-Inhalt soll nicht im Chat erscheinen.
5. Die heruntergeladene Datei in KartenWerk unter **Datei hochladen** importieren.

Der Prompt weist ChatGPT ausdrücklich an, bei fehlender technischer Dateierstellung nicht ersatzweise den gesamten JSON-Code in den Chat zu schreiben.

### §§§-Textmodus

Bei diesem alternativen Weg wird das Ergebnis absichtlich als Text im Chat ausgegeben. Der Text kann kopiert und in KartenWerk unter **Text einfügen** importiert werden.

## GitHub Pages veröffentlichen

1. Einen neuen GitHub-Repository-Ordner anlegen.
2. `index.html`, `styles.css`, `app.js` und optional `sample-cards.json` in das Stammverzeichnis hochladen.
3. In GitHub unter **Settings → Pages** als Quelle **Deploy from a branch** wählen.
4. Branch `main` und Ordner `/ (root)` auswählen.
5. Speichern. Nach der Bereitstellung ist die Seite über die von GitHub angezeigte URL erreichbar.

## Lokale Speicherung

Die Projekte werden ausschließlich im `localStorage` des jeweiligen Browsers gespeichert. Das bedeutet:

- Ein anderer Browser oder ein anderes Gerät sieht diese Daten nicht.
- Das Löschen von Browserdaten kann die Projekte entfernen.
- Für wichtige Projekte sollte regelmäßig „Exportieren“ oder „Alle sichern“ genutzt werden.
- GitHub selbst speichert keine Lerninhalte der Nutzer.

## Empfohlenes Importformat

```json
{
  "projectTitle": "Titel",
  "sections": [
    {
      "title": "Oberthema",
      "cards": [
        {
          "front": "Frage oder Begriff",
          "back": "Erklärung"
        }
      ]
    }
  ]
}
```

## Alternativer Textimport

```text
PROJEKT: Titel

§§§

THEMA: Oberthema
VORDERSEITE: Frage oder Begriff
RÜCKSEITE:
Erklärung

§§§

THEMA: Nächstes Oberthema
VORDERSEITE: Nächste Frage
RÜCKSEITE:
Nächste Erklärung
```

## Dateien

- `index.html` – Grundstruktur
- `styles.css` – vollständiges responsives Design
- `app.js` – Import, Speicherung, Projekte und Lernlogik
- `sample-cards.json` – direkt importierbares Beispiel
- `README.md` – Einrichtung und Dokumentation

## Datenschutz und technische Grenze

Die Anwendung sendet selbst keine Daten an ChatGPT oder andere Dienste. Nutzer kopieren den Prompt und den Ausgangstext eigenständig in ChatGPT. Die daraus erzeugte Ausgabe wird anschließend lokal in KartenWerk importiert.
