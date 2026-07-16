# KartenWerk

KartenWerk ist eine vollständig statische Karteikarten-Webanwendung. Ein mitgelieferter Prompt lässt ChatGPT Lerntexte in ein klar definiertes JSON-Format umwandeln. Die Ausgabe kann anschließend eingefügt oder als Datei hochgeladen werden.

## Funktionen

- vorbereiteter ChatGPT-Prompt
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
