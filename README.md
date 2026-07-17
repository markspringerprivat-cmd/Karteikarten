# KartenWerk

KartenWerk ist eine statische, mobile Web-App zum Importieren und Lernen lokal gespeicherter Karteikarten. Sie kann direkt auf GitHub Pages veröffentlicht werden.

## Neuer Projektassistent

Der Assistent führt in drei getrennten, bildschirmfüllenden Schritten durch den Ablauf:

1. Dokumenttyp, Aufbereitungsmodus, optionale Eingrenzung und Ausgabeformat wählen.
2. Den modular erzeugten Prompt kopieren und ChatGPT öffnen.
3. Eine oder mehrere JSON-Dateien beziehungsweise formatierten Text importieren.

Der aktuelle Schritt und alle Eingaben werden im Browser gespeichert. Nach einem Wechsel zu ChatGPT öffnet sich KartenWerk wieder bei Schritt 3.

## Dokumenttypen

- Lernzettel / Notizen
- PowerPoint / Folien-PDF
- Buch / Kapitel
- Text-PDF / Fachtext
- anderes Dokument

Für Bücher kann optional ein Kapitel angegeben werden. Für Bücher, Präsentationen und Text-PDFs kann ein Seiten- oder Folienbereich eingegrenzt werden.

## Aufbereitungsmodi

- **Normal: Konzepte** – erkennt Überschriften, Schlüsselbegriffe und zugehörige Erklärungen; bleibt bei Wortwahl und Fachbegriffen der Quelle.
- **Kapitel zusammenfassen** – erstellt lernbare Stichpunktsätze mit den wichtigsten Aussagen eines Kapitels.
- **Advanced: erklärt** – bleibt quellennah und ergänzt verständliche Erläuterungen, soweit sie aus der Quelle ableitbar sind.
- **PowerPoint: Folie = Karte** – jede Folie bleibt genau eine Karte; lange Karten sind innerhalb der Karte scrollbar.

## Import

JSON ist das empfohlene Format. Mehrere nummerierte Teil-Dateien können gemeinsam ausgewählt und automatisch zusammengeführt werden. Alternativ unterstützt KartenWerk den `§§§`-Textimport.

## Speicherung

Projekte, Lernstände und der laufende Projektassistent werden ausschließlich lokal im Browser gespeichert. Für dauerhafte Sicherheit sollten Projekte regelmäßig exportiert werden.

## GitHub Pages

1. Den Inhalt dieses Ordners in ein GitHub-Repository laden.
2. Unter **Settings → Pages** die Bereitstellung aus dem Branch `main` und dem Ordner `/ (root)` aktivieren.
3. Die veröffentlichte Adresse auf dem Smartphone öffnen und optional zum Home-Bildschirm hinzufügen.
