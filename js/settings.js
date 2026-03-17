window.ImmoApp = window.ImmoApp || {};

window.ImmoApp.settings = {
    setupHTML: function() {
        const container = document.getElementById("settings-content");
        if (container && container.innerHTML.includes("Lade Module...")) {
            container.innerHTML = `
                <div class="mb-6">
                    <h2 class="text-2xl font-bold text-gray-800">Datenverwaltung, Cloud-Konfiguration & Reset</h2>
                    <p class="text-gray-500 text-sm">Hier kannst du deine Daten sichern, eine Google API-Konfiguration hinterlegen oder Backups einspielen.</p>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                    
                    <!-- Google API / Cloud-Konfiguration -->
                    <div class="bg-white p-6 rounded-lg shadow-sm border border-indigo-100 flex flex-col justify-between">
                        <div>
                            <h3 class="text-lg font-bold text-indigo-800 mb-2">🔑 Google API & Drive</h3>
                            <p class="text-sm text-gray-600 mb-4 border-b pb-4">
                                Trage hier deine Google-API-Daten ein, wenn du die App später mit Google Drive verbinden möchtest
                                (z.B. wenn sie über GitHub Pages unter https läuft). Lokal bleiben diese Werte sicher im Browser gespeichert.
                            </p>

                            <div class="space-y-3 mb-4">
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-1">OAuth Client ID</label>
                                    <input type="text" id="google-client-id" class="w-full border rounded p-2 text-xs bg-gray-50 font-mono" placeholder="1234567890-abc.apps.googleusercontent.com">
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-1">API Key</label>
                                    <input type="text" id="google-api-key" class="w-full border rounded p-2 text-xs bg-gray-50 font-mono" placeholder="AIzaSy...">
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-1">Drive-Ordner (optional)</label>
                                    <input type="text" id="google-drive-folder" class="w-full border rounded p-2 text-xs bg-gray-50" placeholder="z.B. ImmoAdmin-Daten">
                                    <p class="text-[11px] text-gray-400 mt-1">
                                        Hinweis: Dient nur als Merktext. Die eigentliche Ordner-Verknüpfung wird in einem späteren Schritt umgesetzt.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <button onclick="ImmoApp.settings.saveGoogleConfig()" class="bg-indigo-600 text-white px-4 py-3 rounded-lg shadow font-bold w-full hover:bg-indigo-700 transition flex justify-center items-center gap-2">
                            <span>💾</span> Google-Konfiguration speichern
                        </button>
                    </div>
                    
                    <div class="bg-white p-6 rounded-lg shadow-sm border border-blue-100">
                        <h3 class="text-lg font-bold text-blue-800 mb-2">📥 Selektives Backup (Export)</h3>
                        <p class="text-sm text-gray-600 mb-4 border-b pb-4">Wähle genau aus, was du in deine Backup-Datei speichern möchtest.</p>
                        
                        <div class="space-y-3 mb-6">
                            <label class="flex items-center gap-3 cursor-pointer">
                                <input type="checkbox" id="exp-prop" checked class="w-5 h-5 text-blue-600 rounded"> 
                                <span class="font-medium text-gray-700">🏢 Objekte & WGs</span>
                            </label>
                            
                            <label class="flex items-center gap-3 cursor-pointer">
                                <input type="checkbox" id="exp-tenant" checked class="w-5 h-5 text-blue-600 rounded"> 
                                <span class="font-medium text-gray-700">👥 Mieter & Verträge (Die Zuordnungen)</span>
                            </label>
                            
                            <label class="flex items-center gap-3 cursor-pointer">
                                <input type="checkbox" id="exp-tx" checked onchange="document.getElementById('ki-hint').style.display = this.checked ? 'none' : 'block';" class="w-5 h-5 text-blue-600 rounded"> 
                                <span class="font-medium text-gray-700">🏦 Alle Kontoauszüge & Zahlungen</span>
                            </label>
                            
                            <div id="ki-hint" style="display:none;" class="ml-8 mt-2 p-3 bg-indigo-50 border border-indigo-200 rounded-lg shadow-inner">
                                <label class="flex items-center gap-2 text-indigo-800 font-bold cursor-pointer">
                                    <input type="checkbox" id="exp-ki" checked class="w-4 h-4 text-indigo-600 rounded"> 
                                    🤖 KI-Wissen trotzdem behalten?
                                </label>
                                <p class="text-xs text-indigo-600 mt-1">Sichert nur die Namen von Stadtwerken, Handwerkern etc., damit die Auto-Erkennung nach einem Neustart weiterhin sofort funktioniert!</p>
                            </div>

                            <label class="flex items-center gap-3 cursor-pointer mt-2">
                                <input type="checkbox" id="exp-util" checked class="w-5 h-5 text-blue-600 rounded"> 
                                <span class="font-medium text-gray-700">📊 Nebenkosten-Verbrauch & Rechnungen</span>
                            </label>
                            
                            <label class="flex items-center gap-3 cursor-pointer">
                                <input type="checkbox" id="exp-maint" checked class="w-5 h-5 text-blue-600 rounded"> 
                                <span class="font-medium text-gray-700">🛠️ Wartung, Zählerstände & Notizen</span>
                            </label>
                        </div>
                        
                        <button onclick="ImmoApp.settings.runExport()" class="bg-blue-600 text-white px-4 py-3 rounded-lg shadow font-bold w-full hover:bg-blue-700 transition flex justify-center items-center gap-2">
                            <span>💾</span> Ausgewählte Daten herunterladen (.json)
                        </button>
                        <div class="mt-4 space-y-2 border-t pt-4">
                            <h4 class="text-sm font-bold text-blue-800 mb-1">🌥️ Google Drive Sync (Beta)</h4>
                            <button onclick="ImmoApp.settings.syncToDrive()" class="w-full bg-indigo-600 text-white px-3 py-2 rounded-lg text-sm font-bold hover:bg-indigo-700 flex items-center justify-center gap-2">
                                <span>⬆️</span><span>Mit Drive synchronisieren</span>
                            </button>
                            <button onclick="ImmoApp.settings.syncFromDrive()" class="w-full bg-indigo-50 text-indigo-800 px-3 py-2 rounded-lg text-sm font-bold hover:bg-indigo-100 flex items-center justify-center gap-2">
                                <span>⬇️</span><span>Von Drive laden</span>
                            </button>
                            <p class="text-[11px] text-gray-400">Hinweis: Nutzt deine oben hinterlegte Client ID / API Key und speichert eine Datei <code>ImmoAdmin_DB.json</code> in deinem Drive.</p>
                        </div>
                    </div>

                    <div class="bg-white p-6 rounded-lg shadow-sm border border-green-100 flex flex-col justify-between">
                        <div>
                            <h3 class="text-lg font-bold text-green-800 mb-2">📤 Daten Wiederherstellen (Import)</h3>
                            <p class="text-sm text-gray-600 mb-4 border-b pb-4">Lade eine zuvor gespeicherte .json Datei hoch, um Daten wiederherzustellen oder hinzuzufügen.</p>
                            
                            <input type="file" id="import-file" accept=".json" class="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100 cursor-pointer border rounded-lg p-2 bg-gray-50 mb-4">
                            <p class="text-xs text-gray-500 mb-6">Hinweis: Bestehende Einträge mit der gleichen ID werden aktualisiert, neue werden hinzugefügt.</p>
                        </div>
                        
                        <button onclick="ImmoApp.settings.runImport()" class="bg-green-600 text-white px-4 py-3 rounded-lg shadow font-bold w-full hover:bg-green-700 transition flex justify-center items-center gap-2">
                            <span>📂</span> Backup Datei einlesen
                        </button>
                    </div>

                </div>

                <div class="mt-8 bg-red-50 p-6 rounded-lg shadow-sm border border-red-200">
                    <h3 class="text-lg font-bold text-red-800 mb-2">🚨 Gefahrenzone: Daten gezielt löschen (Reset)</h3>
                    <p class="text-sm text-red-600 mb-4 border-b border-red-200 pb-4">Achtung: Diese Aktionen können nicht rückgängig gemacht werden. Bitte mache vorher ein Backup!</p>
                    
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <button onclick="ImmoApp.settings.clearTable('transactions', 'Alle Kontoauszüge')" class="bg-white text-red-700 border border-red-300 px-4 py-2 rounded shadow-sm font-bold hover:bg-red-100 text-sm">
                            🗑️ Nur Kontoauszüge löschen
                        </button>
                        <button onclick="ImmoApp.settings.clearTable('tenants', 'Alle Mieter')" class="bg-white text-red-700 border border-red-300 px-4 py-2 rounded shadow-sm font-bold hover:bg-red-100 text-sm">
                            🗑️ Nur Mieter löschen
                        </button>
                        <button onclick="ImmoApp.settings.clearAll()" class="bg-red-600 text-white px-4 py-2 rounded shadow font-bold hover:bg-red-700 text-sm">
                            💥 Werkseinstellungen (Alles löschen)
                        </button>
                    </div>
                </div>
            `;
        }
    },

    // Google-Konfiguration laden
    loadGoogleConfig: async function() {
        if (!ImmoApp.db || !ImmoApp.db.instance) return;
        const db = ImmoApp.db.instance;
        try {
            const clientId = await db.settings.get("googleClientId");
            const apiKey = await db.settings.get("googleApiKey");
            const driveFolder = await db.settings.get("googleDriveFolder");

            const clientInput = document.getElementById("google-client-id");
            const keyInput = document.getElementById("google-api-key");
            const folderInput = document.getElementById("google-drive-folder");

            if (clientInput && clientId && clientId.value) clientInput.value = clientId.value;
            if (keyInput && apiKey && apiKey.value) keyInput.value = apiKey.value;
            if (folderInput && driveFolder && driveFolder.value) folderInput.value = driveFolder.value;
        } catch (e) {
            console.error("Fehler beim Laden der Google-Konfiguration:", e);
        }
    },

    // Google-Konfiguration speichern
    saveGoogleConfig: async function() {
        if (!ImmoApp.db || !ImmoApp.db.instance) {
            alert("Datenbank noch nicht initialisiert. Bitte Seite neu laden.");
            return;
        }
        const db = ImmoApp.db.instance;
        const clientId = document.getElementById("google-client-id")?.value || "";
        const apiKey = document.getElementById("google-api-key")?.value || "";
        const driveFolder = document.getElementById("google-drive-folder")?.value || "";

        try {
            await db.settings.put({ key: "googleClientId", value: clientId });
            await db.settings.put({ key: "googleApiKey", value: apiKey });
            await db.settings.put({ key: "googleDriveFolder", value: driveFolder });
            alert("Google-Konfiguration wurde lokal gespeichert.");
        } catch (e) {
            console.error("Fehler beim Speichern der Google-Konfiguration:", e);
            alert("Fehler beim Speichern der Google-Konfiguration.");
        }
    },

    buildExportObject: async function() {
        const db = ImmoApp.db.instance;
        const data = {};
        
        if(document.getElementById('exp-prop').checked) data.properties = await db.properties.toArray();
        if(document.getElementById('exp-tenant').checked) data.tenants = await db.tenants.toArray();
        if(document.getElementById('exp-util').checked) data.utilities = await db.utilities.toArray();
        if(document.getElementById('exp-maint').checked) data.maintenance = await db.maintenance.toArray();

        // Kontoauszüge ODER intelligentes KI-Wissen extrahieren
        if(document.getElementById('exp-tx').checked) {
            data.transactions = await db.transactions.toArray();
        } else if(document.getElementById('exp-ki') && document.getElementById('exp-ki').checked) {
            const allTxs = await db.transactions.toArray();
            const kiData = [];
            const seen = new Set();
            
            allTxs.forEach(tx => {
                if(tx.category === 'UTILITY' || tx.category === 'IGNORE') {
                    const name = (tx.name || '').trim().toLowerCase();
                    if(name && !seen.has(name)) {
                        seen.add(name);
                        kiData.push({
                            date: '01.01.2000', year: '2000', amount: 0,
                            name: tx.name, purpose: '🤖 KI-Gedächtnis (Auto-Zuordnung)',
                            category: tx.category, iban: '', matchedTenantId: null,
                            importBatchId: 'ki_memory'
                        });
                    }
                }
            });
            data.transactions = kiData;
        }
        return data;
    },

    runExport: async function() {
        const data = await this.buildExportObject();
        const jsonString = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonString], {type: "application/json"});
        const url = URL.createObjectURL(blob);
        
        const dateStr = new Date().toISOString().split('T')[0];
        const a = document.createElement('a');
        a.href = url;
        a.download = `ImmoApp_Backup_${dateStr}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    },

    importFromObject: async function(data) {
        const db = ImmoApp.db.instance;
        let msg = "Folgende Daten wurden erfolgreich importiert:\n\n";
                
        if (data.properties && data.properties.length > 0) {
            await db.properties.bulkPut(data.properties);
            msg += `✅ ${data.properties.length} Objekte/WGs\n`;
        }
        if (data.tenants && data.tenants.length > 0) {
            await db.tenants.bulkPut(data.tenants);
            msg += `✅ ${data.tenants.length} Mieter\n`;
        }
        if (data.transactions && data.transactions.length > 0) {
            await db.transactions.bulkPut(data.transactions);
            msg += `✅ ${data.transactions.length} Buchungen / KI-Regeln\n`;
        }
        if (data.utilities && data.utilities.length > 0) {
            await db.utilities.bulkPut(data.utilities);
            msg += `✅ ${data.utilities.length} Nebenkosten-Einträge\n`;
        }
        if (data.maintenance && data.maintenance.length > 0) {
            await db.maintenance.bulkPut(data.maintenance);
            msg += `✅ ${data.maintenance.length} Notizen & Zählerstände\n`;
        }
        alert(msg + "\nDie App wird nun neu geladen, um die Änderungen anzuzeigen.");
        location.reload();
    },

    runImport: function() {
        const fileInput = document.getElementById('import-file');
        if (!fileInput.files.length) return alert("Bitte wähle zuerst eine Backup-Datei (.json) aus.");
        
        const reader = new FileReader();
        reader.onload = async function(e) {
            try {
                const data = JSON.parse(e.target.result);
                await ImmoApp.settings.importFromObject(data);
            } catch(err) {
                alert("Fehler beim Importieren! Ist das wirklich eine gültige ImmoApp .json Datei?");
                console.error(err);
            }
        };
        reader.readAsText(fileInput.files[0]);
    },

    // --- Google Drive Sync (Basis, ohne Verschlüsselung) ---
    _driveState: {
        lastSyncAt: null,
        tokenClient: null,
        gapiInited: false,
        gisInited: false,
        cryptSupported: typeof window !== "undefined" && !!(window.crypto && window.crypto.subtle)
    },

    // --- Hilfsfunktionen für Verschlüsselung (nur für Drive) ---
    _toBase64: function(buffer) {
        let binary = "";
        const bytes = new Uint8Array(buffer);
        const len = bytes.byteLength;
        for (let i = 0; i < len; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return btoa(binary);
    },

    _fromBase64: function(base64) {
        const binary = atob(base64);
        const len = binary.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            bytes[i] = binary.charCodeAt(i);
        }
        return bytes.buffer;
    },

    _askPassword: function(message) {
        const pw = prompt(message || "Bitte ein Passwort für die Verschlüsselung eingeben:");
        if (!pw) {
            alert("Aktion abgebrochen, da kein Passwort eingegeben wurde.");
            return null;
        }
        if (pw.length < 6) {
            alert("Bitte ein Passwort mit mindestens 6 Zeichen wählen.");
            return null;
        }
        return pw;
    },

    _deriveKey: async function(password, salt) {
        const enc = new TextEncoder();
        const keyMaterial = await crypto.subtle.importKey(
            "raw",
            enc.encode(password),
            { name: "PBKDF2" },
            false,
            ["deriveKey"]
        );
        return crypto.subtle.deriveKey(
            {
                name: "PBKDF2",
                salt: salt,
                iterations: 100000,
                hash: "SHA-256"
            },
            keyMaterial,
            { name: "AES-GCM", length: 256 },
            false,
            ["encrypt", "decrypt"]
        );
    },

    encryptForDrive: async function(plainObject) {
        if (!this._driveState.cryptSupported) {
            alert("Die Verschlüsselung wird in diesem Browser nicht unterstützt (kein WebCrypto).");
            return null;
        }
        const password = this._askPassword("Passwort für das verschlüsselte Drive‑Backup eingeben:");
        if (!password) return null;

        const enc = new TextEncoder();
        const data = enc.encode(JSON.stringify(plainObject));
        const salt = crypto.getRandomValues(new Uint8Array(16));
        const iv = crypto.getRandomValues(new Uint8Array(12));
        const key = await this._deriveKey(password, salt);
        const cipher = await crypto.subtle.encrypt(
            { name: "AES-GCM", iv: iv },
            key,
            data
        );

        return {
            version: 1,
            algo: "AES-GCM",
            salt: this._toBase64(salt),
            iv: this._toBase64(iv),
            data: this._toBase64(cipher)
        };
    },

    decryptFromDrive: async function(envelope) {
        // Wenn es wie ein altes, unverschlüsseltes Backup aussieht, einfach zurückgeben
        if (!envelope || typeof envelope !== "object" || !envelope.version || !envelope.algo || !envelope.data) {
            return envelope;
        }
        if (!this._driveState.cryptSupported) {
            alert("Die Entschlüsselung wird in diesem Browser nicht unterstützt (kein WebCrypto).");
            return null;
        }
        if (envelope.algo !== "AES-GCM") {
            alert("Unbekanntes Verschlüsselungsformat.");
            return null;
        }
        const password = this._askPassword("Passwort für das Drive‑Backup zur Entschlüsselung eingeben:");
        if (!password) return null;

        try {
            const salt = new Uint8Array(this._fromBase64(envelope.salt));
            const iv = new Uint8Array(this._fromBase64(envelope.iv));
            const cipher = this._fromBase64(envelope.data);
            const key = await this._deriveKey(password, salt);
            const plainBuf = await crypto.subtle.decrypt(
                { name: "AES-GCM", iv: iv },
                key,
                cipher
            );
            const dec = new TextDecoder();
            const json = dec.decode(plainBuf);
            return JSON.parse(json);
        } catch (e) {
            console.error("Fehler bei der Entschlüsselung", e);
            alert("Das Backup konnte nicht entschlüsselt werden. Passwort korrekt?");
            return null;
        }
    },

    ensureDriveConfig: async function() {
        const db = ImmoApp.db.instance;
        const clientId = await db.settings.get("googleClientId");
        const apiKey = await db.settings.get("googleApiKey");
        if (!clientId || !clientId.value || !apiKey || !apiKey.value) {
            alert("Bitte zuerst im Bereich 'Google API & Drive' eine OAuth Client ID und einen API Key speichern.");
            return null;
        }
        return { clientId: clientId.value, apiKey: apiKey.value };
    },

    initGapiClient: async function() {
        return new Promise((resolve, reject) => {
            if (this._driveState.gapiInited && this._driveState.gisInited) {
                resolve();
                return;
            }
            if (typeof gapi === "undefined" || !google || !google.accounts || !google.accounts.oauth2) {
                alert("Google API-Skripte wurden noch nicht geladen. Bitte stelle sicher, dass die Seite über HTTPS (z.B. GitHub Pages) geladen wird und lade die Seite neu.");
                reject("gapi_not_loaded");
                return;
            }
            const scope = "https://www.googleapis.com/auth/drive.file";
            const discoveryDocs = ["https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"];

            this.ensureDriveConfig().then(cfg => {
                if (!cfg) {
                    reject("no_config");
                    return;
                }
                gapi.load("client", async () => {
                    try {
                        await gapi.client.init({
                            apiKey: cfg.apiKey,
                            discoveryDocs
                        });
                        this._driveState.gapiInited = true;
                        this._driveState.tokenClient = google.accounts.oauth2.initTokenClient({
                            client_id: cfg.clientId,
                            scope,
                            callback: (tokenResponse) => {
                                if (tokenResponse && tokenResponse.access_token) {
                                    gapi.client.setToken(tokenResponse);
                                    this._driveState.gisInited = true;
                                    resolve();
                                } else {
                                    reject("no_token");
                                }
                            }
                        });
                        this._driveState.tokenClient.requestAccessToken();
                    } catch (e) {
                        console.error("Fehler beim Initialisieren des Drive-Clients", e);
                        alert("Fehler beim Initialisieren der Google Drive Verbindung. Details in der Konsole.");
                        reject(e);
                    }
                });
            });
        });
    },

    syncToDrive: async function() {
        try {
            await this.initGapiClient();
        } catch {
            return;
        }
        const data = await this.buildExportObject();
        const encrypted = await this.encryptForDrive(data);
        if (!encrypted) return;
        const jsonString = JSON.stringify(encrypted, null, 2);

        const boundary = "foo_bar_baz_" + Date.now();
        const delimiter = "\r\n--" + boundary + "\r\n";
        const closeDelimiter = "\r\n--" + boundary + "--";
        const metadata = {
            name: "ImmoAdmin_DB.json",
            mimeType: "application/json"
        };

        const multipartRequestBody =
            delimiter +
            "Content-Type: application/json; charset=UTF-8\r\n\r\n" +
            JSON.stringify(metadata) +
            delimiter +
            "Content-Type: application/json\r\n\r\n" +
            jsonString +
            closeDelimiter;

        try {
            const response = await gapi.client.request({
                path: "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart",
                method: "POST",
                body: multipartRequestBody,
                headers: {
                    "Content-Type": "multipart/related; boundary=" + boundary
                }
            });
            console.log("Drive Upload Ergebnis:", response);
            this._driveState.lastSyncAt = new Date();
            alert("Backup wurde erfolgreich nach Google Drive hochgeladen.");
        } catch (e) {
            console.error("Fehler beim Hochladen zu Drive", e);
            alert("Fehler beim Hochladen zu Google Drive. Details in der Konsole.");
        }
    },

    syncFromDrive: async function() {
        try {
            await this.initGapiClient();
        } catch {
            return;
        }
        try {
            const listResp = await gapi.client.drive.files.list({
                q: "name = 'ImmoAdmin_DB.json' and trashed = false",
                pageSize: 1,
                fields: "files(id, name, modifiedTime)"
            });
            if (!listResp.result.files || listResp.result.files.length === 0) {
                alert("Es wurde keine Datei 'ImmoAdmin_DB.json' in deinem Drive gefunden.");
                return;
            }
            const file = listResp.result.files[0];
            const getResp = await gapi.client.drive.files.get({
                fileId: file.id,
                alt: "media"
            });
            let data = getResp.result;
            if (!data || typeof data !== "object") {
                alert("Die geladene Datei konnte nicht als ImmoAdmin-Backup erkannt werden.");
                return;
            }

            // Versuchen zu entschlüsseln, falls verschlüsselt
            const maybeDecrypted = await this.decryptFromDrive(data);
            if (!maybeDecrypted) return;
            data = maybeDecrypted;

            if (!data || typeof data !== "object") {
                alert("Das entschlüsselte Backup ist ungültig.");
                return;
            }

            if (!confirm("Backup von Google Drive laden und in die lokale Datenbank importieren? Bereits vorhandene Einträge mit gleicher ID werden überschrieben.")) {
                return;
            }
            await this.importFromObject(data);
        } catch (e) {
            console.error("Fehler beim Laden von Drive", e);
            alert("Fehler beim Laden der Backup-Datei von Google Drive. Details in der Konsole.");
        }
    },

    clearTable: async function(tableName, displayName) {
        if(confirm(`🚨 WARNUNG: Möchtest du wirklich "${displayName}" endgültig aus der Datenbank löschen?\n\nDies kann nicht rückgängig gemacht werden!`)) {
            await ImmoApp.db.instance[tableName].clear();
            alert(`Erfolgreich gelöscht: ${displayName}`);
            this.render();
        }
    },

    clearAll: async function() {
        if(confirm("🚨 ACHTUNG: Du bist dabei, ALLES zu löschen! (Objekte, Mieter, Kontoauszüge, Notizen).\n\nMöchtest du die App wirklich komplett auf Werkseinstellungen zurücksetzen?")) {
            const db = ImmoApp.db.instance;
            await Promise.all([
                db.properties.clear(),
                db.tenants.clear(),
                db.transactions.clear(),
                db.utilities.clear(),
                db.maintenance.clear()
            ]);
            alert("Die Datenbank wurde komplett geleert. Die App wird neu gestartet.");
            location.reload();
        }
    },

    render: async function() {
        this.setupHTML();
    }
};