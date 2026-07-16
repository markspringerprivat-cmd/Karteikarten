# KartenWerk

KartenWerk ist eine vollständig statische, mobil optimierte Karteikarten-Webanwendung. Sie kann direkt über GitHub Pages veröffentlicht werden. Alle Lernprojekte und Lernstände bleiben im lokalen Browserspeicher des verwendeten Geräts.

## Startoberfläche

Die Startseite ist wie ein Smartphone-Startbildschirm aufgebaut:

1. **Einstellungen** – Hell-/Dunkelmodus, Gesamtsicherung, Wiederherstellung und Löschen lokaler Projekte.
2. **Anleitung** – kompakte Erklärung des vollständigen Arbeitsablaufs.
3. **Neues Projekt** – öffnet den mobilen Projektassistenten.
4. **Projektkacheln** – jedes importierte Lernprojekt erscheint automatisch als eigene Kachel und öffnet den Lernbereich.

Auf Smartphones stehen die drei Systemkacheln immer gemeinsam in der ersten Reihe.

## Projektassistent

Die frühere lange Hauptseite wurde in einen geführten Drei-Schritt-Dialog verschoben:

1. JSON-Datei oder `§§§`-Textformat auswählen und den vorbereiteten Prompt kopieren.
2. Den Prompt mit angehängten PDF-, Word-, PowerPoint-, Text- oder Bilddateien beziehungsweise direkt eingefügtem Text an ChatGPT senden.
3. Die erzeugte JSON-/TXT-Datei hochladen oder die Textausgabe einfügen.

Nach einem erfolgreichen Import schließt sich der Assistent. Das neue Projekt erscheint anschließend als Kachel auf der Startseite.

## Funktionen

- für Smartphone, Tablet und Desktop optimierte Oberfläche
- appähnliches Kachelmenü mit großen Touch-Flächen
- bildschirmfüllender Projektassistent auf Mobilgeräten
- vorbereiteter ChatGPT-Prompt für Anhänge und direkt eingefügten Text
- verbindliche Anforderung einer herunterladbaren JSON-Datei im JSON-Modus
- zusätzlicher Textimport mit `§§§` als Kartentrenner
- automatische Projekt- und Themenstruktur
- automatisch erzeugtes, aufklappbares Inhaltsverzeichnis
- freie Mehrfachauswahl der Kategorien mit „Alle Kategorien“
- Lernmodus in einer eigenen, scrollfreien Vollbildseite
- Abfragemodus mit Karte antippen, richtig/falsch bewerten und Ergebniszähler
- Wischsteuerung nach links und rechts auf Mobilgeräten
- Nachlernmodus für dauerhaft falsch markierte Karten
- lokale Speicherung über `localStorage`
- Einzelprojekt-Export, Gesamtsicherung und Wiederherstellung
- Hell- und Dunkelmodus
- Web-App-Manifest und eigenes App-Symbol
- keine externen Bibliotheken, kein Server und keine Anmeldung


## Lernen innerhalb eines Projekts

Nach dem Öffnen einer Projektkachel stehen die Funktionen in fester Reihenfolge bereit:

1. **Lernmodus** – öffnet eine Kategorienauswahl mit Checkboxen und der Option **Alle Kategorien**.
2. **Abfragemodus** – verwendet dieselbe Auswahl und speichert jede Karte als richtig oder falsch.
3. **Nachlernen** – wird verfügbar, sobald mindestens eine Karte falsch beantwortet wurde, und lädt nur diese Karten.
4. **Inhaltsverzeichnis aufklappen** – zeigt alle Kategorien untereinander. Beim Antippen einer einzelnen Kategorie erscheint eine direkte Auswahl zwischen Lern-, Abfrage- und gegebenenfalls Nachlernmodus.

Die eigentliche Lerneinheit öffnet sich in `study.html`. Die Seite selbst ist nicht scrollbar und ordnet Kopfzeile, Fortschritt, Karte und Bedienfelder innerhalb der sichtbaren Bildschirmhöhe an. Eine Karte wird durch Antippen umgedreht. Auf Touchgeräten wechselt eine horizontale Wischbewegung zur vorherigen oder nächsten Karte. Im Abfragemodus erscheinen nach dem Aufdecken die Schaltflächen **Falsch** und **Richtig**. Falsch bewertete Karten bleiben im Projekt unter **Nachlernen** erhalten, bis sie dort oder in einer späteren Abfrage als richtig markiert werden.

## Verwendung mit ChatGPT

### JSON-Modus – empfohlen

1. Auf der Startseite **Neues Projekt** antippen.
2. **JSON-Datei** auswählen und den Prompt kopieren.
3. Den Prompt in ChatGPT einfügen.
4. Den Lerntext direkt ergänzen oder PDF-, Word-, PowerPoint-, Text- beziehungsweise Bilddateien anhängen. Anhänge und Text können gemeinsam verwendet werden.
5. ChatGPT soll eine echte Datei nach dem Muster `kartenwerk-kurztitel.json` erzeugen. Der JSON-Inhalt soll nicht in den Chat geschrieben werden.
6. Die heruntergeladene Datei im dritten Schritt des Projektassistenten hochladen.

### §§§-Textmodus

Bei diesem alternativen Weg wird das Ergebnis als normaler Chattext ausgegeben. Der Text wird kopiert und im dritten Schritt unter **Text einfügen** eingesetzt.

## GitHub Pages veröffentlichen

1. Den Inhalt dieses Ordners in das Stammverzeichnis eines GitHub-Repositories hochladen.
2. In GitHub **Settings → Pages** öffnen.
3. **Deploy from a branch** auswählen.
4. Branch `main` und Ordner `/ (root)` festlegen.
5. Speichern und die anschließend angezeigte GitHub-Pages-Adresse öffnen.

## Lokale Speicherung

Die Anwendung sendet selbst keine Lerninhalte an einen Server. Zu beachten ist:

- Projekte sind nur in dem Browser und auf dem Gerät vorhanden, auf dem sie importiert wurden.
- Das Löschen von Browserdaten kann die Projekte entfernen.
- Unter **Einstellungen → Alle Projekte sichern** kann eine Gesamtsicherung erstellt werden.
- Die Sicherung kann später über **Sicherung einlesen** wiederhergestellt werden.
- GitHub speichert nur die Programmdateien, nicht die Lernprojekte der Nutzer.

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

## Dateien

- `index.html` – Grundstruktur und Dialoge
- `styles.css` – Startseite, Projektzentrale, Dialoge und mobile Auswahloberflächen
- `app.js` – Import, lokale Speicherung, Projekte, Assistent und Sitzungsstart
- `study.html` – separate Vollbildseite für Lern-, Abfrage- und Nachlernmodus
- `study.css` – scrollfreies, mobiles Kartendesign
- `study.js` – Kartensteuerung, Wischgesten, Bewertung und Lernstandsverfolgung
- `manifest.webmanifest` – Metadaten für die Web-App-Darstellung
- `icon.svg` – App- und Browser-Symbol
- `sample-cards.json` – direkt importierbares Beispielprojekt
- `README.md` – Einrichtung und Dokumentation
