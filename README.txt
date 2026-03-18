ImmoAdmin (Hausverwaltung App)

ImmoAdmin ist eine clientseitige Hausverwaltungs‑App (läuft komplett im Browser). Daten werden lokal in IndexedDB (Dexie.js) gespeichert. Optional kann ein Backup verschlüsselt in Google Drive gespeichert und von dort wieder geladen werden.

Voraussetzungen

- Moderner Browser (Chrome, Edge, Firefox)
- Für Google Drive Sync:
  - App muss über HTTPS laufen (z.B. GitHub Pages)
  - In der Google Cloud Console:
    - Google Drive API aktivieren
    - OAuth 2.0 Client ID (Web App) anlegen
    - API Key anlegen (empfohlen: HTTP‑Referrer‑Restriktion auf deine Pages‑URL)
    - OAuth Consent Screen: falls „Testing“, deinen Account als Test‑User hinzufügen

Schnellstart (lokal)

1. Projekt öffnen und index.html im Browser starten (oder über einen lokalen Webserver).
2. In der App unter Einstellungen:
   - Optional: Google‑Konfiguration eintragen und speichern
   - Optional: Absenderdaten eintragen und speichern (für Anschreiben/NK‑Abrechnung)

Datenhaltung & Backup

Selektives Backup (Export)

Im Tab Einstellungen kannst du selektiv exportieren:
- Objekte / WGs
- Mieter & Verträge
- Kontoauszüge / Zahlungen
- Nebenkosten / Rechnungen
- Wartung / Zähler / Notizen

Export erzeugt eine JSON‑Datei (Download).

Import (Restore)

Im Tab Einstellungen kannst du eine zuvor exportierte JSON‑Datei importieren. Vorhandene Einträge werden aktualisiert, neue hinzugefügt.

Google Drive Sync (verschlüsselt)

Im Tab Einstellungen:
- „Mit Drive synchronisieren“: Exportobjekt erzeugen → verschlüsseln → als ImmoAdmin_DB.json in Drive speichern
- „Von Drive laden“: Datei aus Drive holen → Passwort abfragen → entschlüsseln → in IndexedDB importieren

Verschlüsselung (Kurzinfo)

- AES‑GCM (256‑bit) mit WebCrypto
- Key‑Derivation: PBKDF2 (SHA‑256), Salt + Iterationen
- Ohne Passwort ist das Backup praktisch nicht wiederherstellbar

Architekturüberblick

- Single‑Page App ohne Framework
- Einstieg über index.html
- Module liegen in js/ unter einem gemeinsamen Namespace window.ImmoApp

Wichtige Module:
- js/db.js: Dexie‑Schema / Versionierung
- js/dashboard.js: Dashboard, Miet‑Soll/Ist, Bilanz, Sprünge in Kontoauszug/Historie
- js/banking.js: CSV‑Import, Sortierung, Filter, Auto‑Match, Kategorisierung
- js/tenants.js: Mieter‑Verwaltung, Historie, Anschreiben, NK‑Abrechnung, DOCX Export
- js/utilities.js: Nebenkostenverwaltung, Zuordnungsregeln, Exporte, Bulk‑DOCX
- js/meters.js: Zähler, Ablesungen, Tarife, Verbrauchs‑/Kostenberechnung
- js/settings.js: Backup/Import, Reset, Google Drive Sync, Absenderdaten

Datenmodell (vereinfacht)

Die App speichert u.a.:
- properties: Objekte/WGs
- tenants: Mieter + Vertrag (Miete, Vorauszahlung, Historie, Ein-/Auszug, Adresse, E‑Mail)
- transactions: Bankbuchungen (Kategorie, Zuweisung zu Mieter, Jahr, Importbatch)
- utilities: Nebenkostenpositionen/Rechnungen (Jahr, Objektzuordnung)
- meters, meterReadings, tariffs: Zähler, Ablesungen, Tarife

Dokumente: Anschreiben & Nebenkostenabrechnung

Die App kann druckbare HTML‑Dokumente (für PDF via Browser‑Druckdialog) und DOCX erzeugen:
- Anschreiben
- NK‑Abrechnung (inkl. detaillierter Kostenpositionen)

Absenderdaten (Briefkopf) & IBAN

Unter Einstellungen → „Absender für Anschreiben & NK‑Abrechnung“ kannst du einmalig speichern:
- Name/Firma, Adresse
- IBAN (für Zahlungshinweise)

Diese Absenderdaten werden automatisch:
- oben im Briefkopf von Anschreiben und NK‑Abrechnung angezeigt (HTML und DOCX)
- in der NK‑Abrechnung bei „Zahlungshinweise“ als Bankverbindung verwendet (falls IBAN gesetzt)

Anlagenliste

Am Ende der Dokumente erscheint eine Anlagenliste:
- Anschreiben: „· Anschreiben (dieses Schreiben)“
- NK‑Abrechnung: „· Kostenaufstellung (dieses Schreiben)“, „· Zählerabrechnungen (falls vorhanden)“

Workflow (empfohlen)

1. Kontoauszug importieren (Tab „Kontoauszug“) und Buchungen kategorisieren / zuordnen.
2. Nebenkosten (Tab „Nebenkosten“) erfassen und dem richtigen Objekt zuordnen.
3. Zähler (Tab „Zähler“) Ablesungen/Tarife pflegen (optional).
4. Dashboard prüfen (Soll/Ist, Bilanz je Mieter).
5. In der Mieter‑Historie:
   - „Anschreiben öffnen“ → Text im Popup editieren → PDF drucken oder DOCX herunterladen
   - „NK‑Abrechnung öffnen“ → Betreff/Hinweise/Zahlungshinweise editieren → PDF/DOCX erzeugen

Hosting

- GitHub Pages ist ideal (HTTPS, statisch).
- Lokal ist vieles testbar, Drive Sync benötigt HTTPS und Google‑Konfiguration.

