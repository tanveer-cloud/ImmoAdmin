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
                                        Optionaler Zielordner für Dokumente/Backups. Wenn leer, speichert die App im Standardbereich von Drive.
                                    </p>
                                </div>
                                <label class="flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox" id="doc-auto-upload" class="w-4 h-4 text-indigo-600 rounded">
                                    <span class="text-sm text-gray-700">Dokumente (DOCX) nach Erstellung automatisch zu Drive hochladen</span>
                                </label>
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

                <div class="mt-8 bg-gray-50 p-6 rounded-lg shadow-sm border border-gray-200">
                    <h3 class="text-lg font-bold text-gray-800 mb-2">📋 Absender für Anschreiben & NK-Abrechnung</h3>
                    <p class="text-sm text-gray-600 mb-4">Diese Daten erscheinen im Briefkopf und bei Zahlungshinweisen (z.B. IBAN).</p>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Name / Firma</label>
                            <input type="text" id="sender-name" class="w-full border rounded p-2 text-sm" placeholder="z.B. Max Mustermann oder Hausverwaltung XY">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Straße & Hausnummer</label>
                            <input type="text" id="sender-street" class="w-full border rounded p-2 text-sm" placeholder="z.B. Musterstraße 1">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">PLZ</label>
                            <input type="text" id="sender-zip" class="w-full border rounded p-2 text-sm" placeholder="12345">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Ort</label>
                            <input type="text" id="sender-city" class="w-full border rounded p-2 text-sm" placeholder="Berlin">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Land (optional)</label>
                            <input type="text" id="sender-country" class="w-full border rounded p-2 text-sm" placeholder="Deutschland">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">IBAN (für Zahlungshinweise)</label>
                            <input type="text" id="sender-iban" class="w-full border rounded p-2 text-sm font-mono" placeholder="DE89...">
                        </div>
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 border-t pt-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Ort (für Datumzeile, optional)</label>
                            <input type="text" id="sender-place" class="w-full border rounded p-2 text-sm" placeholder="z.B. Berlin">
                            <p class="text-[11px] text-gray-500 mt-1">Wird als „Ort, Datum“ im Dokument verwendet (wenn leer, nimmt die App den Absender‑Ort).</p>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Firmenlogo (optional)</label>
                            <input type="file" id="sender-logo" accept="image/*" class="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-gray-200 file:text-gray-800 hover:file:bg-gray-300 cursor-pointer border rounded-lg p-2 bg-white">
                            <div class="mt-2 flex items-center gap-3">
                                <img id="sender-logo-preview" alt="Logo Vorschau" style="display:none; max-height:48px; max-width:180px; object-fit:contain; border:1px solid #e5e7eb; border-radius:6px; padding:4px; background:#fff;" />
                                <button type="button" onclick="ImmoApp.settings.clearSenderLogo()" class="text-xs font-bold text-red-600 hover:underline">Logo entfernen</button>
                            </div>
                            <p class="text-[11px] text-gray-500 mt-1">Hinweis: Das Logo wird lokal im Browser gespeichert.</p>
                        </div>
                        <div class="md:col-span-2">
                            <label class="block text-sm font-medium text-gray-700 mb-1">Fußzeile (optional)</label>
                            <textarea id="sender-footer" rows="4" class="w-full border rounded p-2 text-sm" placeholder="z.B.\nHausverwaltung XY · Musterstraße 1 · 12345 Berlin\nIBAN: DE... · BIC: ...\nHandelsregister: ... · USt‑IdNr.: ..."></textarea>
                            <p class="text-[11px] text-gray-500 mt-1">Erscheint am Ende der Dokumente (Anschreiben + NK‑Abrechnung).</p>
                        </div>
                    </div>
                    <button onclick="ImmoApp.settings.saveSenderConfig()" class="bg-gray-700 text-white px-4 py-2 rounded font-bold hover:bg-gray-800">Absender speichern</button>
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
            const docAutoUpload = await db.settings.get("docAutoUpload");

            const clientInput = document.getElementById("google-client-id");
            const keyInput = document.getElementById("google-api-key");
            const folderInput = document.getElementById("google-drive-folder");

            if (clientInput && clientId && clientId.value) clientInput.value = clientId.value;
            if (keyInput && apiKey && apiKey.value) keyInput.value = apiKey.value;
            if (folderInput && driveFolder && driveFolder.value) folderInput.value = driveFolder.value;
            const autoEl = document.getElementById("doc-auto-upload");
            if (autoEl) autoEl.checked = !docAutoUpload || String(docAutoUpload.value) !== "false";
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
        const autoUpload = document.getElementById("doc-auto-upload")?.checked !== false;

        try {
            await db.settings.put({ key: "googleClientId", value: clientId });
            await db.settings.put({ key: "googleApiKey", value: apiKey });
            await db.settings.put({ key: "googleDriveFolder", value: driveFolder });
            await db.settings.put({ key: "docAutoUpload", value: String(autoUpload) });
            alert("Google-Konfiguration wurde lokal gespeichert.");
        } catch (e) {
            console.error("Fehler beim Speichern der Google-Konfiguration:", e);
            alert("Fehler beim Speichern der Google-Konfiguration.");
        }
    },

    isDocumentAutoUploadEnabled: async function() {
        const db = ImmoApp.db.instance;
        const row = await db.settings.get("docAutoUpload");
        if (!row || row.value == null || row.value === "") return true;
        return String(row.value) !== "false";
    },

    loadSenderConfig: async function() {
        if (!ImmoApp.db || !ImmoApp.db.instance) return;
        const db = ImmoApp.db.instance;
        try {
            const get = (k) => db.settings.get(k).then(r => r && r.value ? r.value : "");
            const name = await get("senderName");
            const street = await get("senderStreet");
            const zip = await get("senderZip");
            const city = await get("senderCity");
            const country = await get("senderCountry");
            const iban = await get("senderIban");
            const place = await get("senderPlace");
            const footer = await get("senderFooter");
            const logo = await get("senderLogoDataUrl");
            const el = (id, v) => { const e = document.getElementById(id); if (e && v) e.value = v; };
            el("sender-name", name);
            el("sender-street", street);
            el("sender-zip", zip);
            el("sender-city", city);
            el("sender-country", country);
            el("sender-iban", iban);
            el("sender-place", place);
            const footerEl = document.getElementById("sender-footer");
            if (footerEl && footer) footerEl.value = footer;
            const img = document.getElementById("sender-logo-preview");
            if (img) {
                if (logo) { img.src = logo; img.style.display = "block"; }
                else { img.removeAttribute("src"); img.style.display = "none"; }
            }
        } catch (e) { console.error("Absender laden:", e); }
    },

    saveSenderConfig: async function() {
        if (!ImmoApp.db || !ImmoApp.db.instance) { alert("Datenbank noch nicht initialisiert."); return; }
        const db = ImmoApp.db.instance;
        const v = (id) => document.getElementById(id)?.value || "";
        try {
            await db.settings.put({ key: "senderName", value: v("sender-name") });
            await db.settings.put({ key: "senderStreet", value: v("sender-street") });
            await db.settings.put({ key: "senderZip", value: v("sender-zip") });
            await db.settings.put({ key: "senderCity", value: v("sender-city") });
            await db.settings.put({ key: "senderCountry", value: v("sender-country") });
            await db.settings.put({ key: "senderIban", value: v("sender-iban") });
            await db.settings.put({ key: "senderPlace", value: v("sender-place") });
            const footerEl = document.getElementById("sender-footer");
            await db.settings.put({ key: "senderFooter", value: footerEl ? (footerEl.value || "") : "" });

            // Logo nur aktualisieren, wenn eine Datei gewählt ist (sonst bestehenden Wert beibehalten)
            const logoInput = document.getElementById("sender-logo");
            const file = logoInput && logoInput.files && logoInput.files[0] ? logoInput.files[0] : null;
            if (file) {
                const dataUrl = await new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = () => resolve(String(reader.result || ""));
                    reader.onerror = () => reject(new Error("Logo konnte nicht gelesen werden."));
                    reader.readAsDataURL(file);
                });
                await db.settings.put({ key: "senderLogoDataUrl", value: dataUrl });
                const img = document.getElementById("sender-logo-preview");
                if (img) { img.src = dataUrl; img.style.display = "block"; }
            }
            alert("Absenderdaten gespeichert.");
        } catch (e) { console.error(e); alert("Fehler beim Speichern."); }
    },

    clearSenderLogo: async function() {
        if (!ImmoApp.db || !ImmoApp.db.instance) return;
        const db = ImmoApp.db.instance;
        await db.settings.put({ key: "senderLogoDataUrl", value: "" });
        const logoInput = document.getElementById("sender-logo");
        if (logoInput) logoInput.value = "";
        const img = document.getElementById("sender-logo-preview");
        if (img) { img.removeAttribute("src"); img.style.display = "none"; }
        alert("Logo wurde entfernt.");
    },

    /** Liefert Absenderdaten für Anschreiben/NK-Abrechnung (aus Settings). */
    getSenderConfig: async function() {
        if (!ImmoApp.db || !ImmoApp.db.instance) return {};
        const db = ImmoApp.db.instance;
        const get = (k) => db.settings.get(k).then(r => (r && r.value != null && r.value !== "") ? String(r.value) : "");
        return {
            name: await get("senderName"),
            street: await get("senderStreet"),
            zip: await get("senderZip"),
            city: await get("senderCity"),
            country: await get("senderCountry"),
            iban: await get("senderIban"),
            place: await get("senderPlace"),
            footer: await get("senderFooter"),
            logoDataUrl: await get("senderLogoDataUrl")
        };
    },

    buildExportObject: async function() {
        const db = ImmoApp.db.instance;
        const data = {};
        
        // Absenderdaten (für Anschreiben/NK-Abrechnung) immer mitsichern
        try {
            if (this.getSenderConfig) {
                data.senderConfig = await this.getSenderConfig();
            }
        } catch (e) {
            console.warn("Absenderdaten konnten nicht exportiert werden:", e);
        }

        if(document.getElementById('exp-prop').checked) data.properties = await db.properties.toArray();
        if(document.getElementById('exp-tenant').checked) data.tenants = await db.tenants.toArray();
        if(document.getElementById('exp-util').checked) data.utilities = await db.utilities.toArray();
        if(document.getElementById('exp-maint').checked) data.maintenance = await db.maintenance.toArray();
        // Dokument-Metadaten immer mitsichern (klein, keine großen Binärdaten)
        if (db.documents) data.documents = await db.documents.toArray();

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
                
        // Absenderdaten (falls vorhanden) wiederherstellen
        if (data.senderConfig && typeof data.senderConfig === "object") {
            const sc = data.senderConfig || {};
            await db.settings.put({ key: "senderName", value: sc.name || "" });
            await db.settings.put({ key: "senderStreet", value: sc.street || "" });
            await db.settings.put({ key: "senderZip", value: sc.zip || "" });
            await db.settings.put({ key: "senderCity", value: sc.city || "" });
            await db.settings.put({ key: "senderCountry", value: sc.country || "" });
            await db.settings.put({ key: "senderIban", value: sc.iban || "" });
            await db.settings.put({ key: "senderPlace", value: sc.place || "" });
            await db.settings.put({ key: "senderFooter", value: sc.footer || "" });
            await db.settings.put({ key: "senderLogoDataUrl", value: sc.logoDataUrl || "" });
            msg += `✅ Absenderdaten (Anschreiben/NK)\n`;
        }

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
        if (data.documents && data.documents.length > 0 && db.documents) {
            await db.documents.bulkPut(data.documents);
            msg += `✅ ${data.documents.length} Dokument-Metadaten\n`;
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

    _sanitizeFileName: function(input, fallback = "Dokument") {
        const base = String(input || fallback)
            .replace(/[\\\/:*?"<>|]/g, "_")
            .replace(/\s+/g, " ")
            .trim()
            .slice(0, 120);
        return base || fallback;
    },

    _buildPrivacySafeDocName: function(docType, year, tenantName) {
        const type = docType === "NK" ? "NK" : "Letter";
        const y = String(year || new Date().getFullYear());
        const parts = String(tenantName || "").trim().split(/\s+/).filter(Boolean);
        const initials = parts.length === 0
            ? "tenant"
            : (parts[0][0] + (parts.length > 1 ? parts[parts.length - 1][0] : "")).toUpperCase();
        return this._sanitizeFileName(`${type}_${y}_${initials}`);
    },

    _computeChecksum: async function(contentStr) {
        if (!window.crypto || !window.crypto.subtle) return "";
        const enc = new TextEncoder();
        const buf = enc.encode(String(contentStr || ""));
        const digest = await window.crypto.subtle.digest("SHA-256", buf);
        return Array.from(new Uint8Array(digest)).map(b => b.toString(16).padStart(2, "0")).join("");
    },

    _retryDriveRequest: async function(fn, maxRetries = 3) {
        let attempt = 0;
        let waitMs = 500;
        while (attempt <= maxRetries) {
            try {
                return await fn();
            } catch (e) {
                const status = e?.status || e?.result?.error?.code || e?.result?.code;
                const retryable = status === 429 || status === 500 || status === 503;
                if (!retryable || attempt === maxRetries) throw e;
                await new Promise(r => setTimeout(r, waitMs));
                waitMs *= 2;
                attempt++;
            }
        }
        throw new Error("Drive request failed");
    },

    _getConfiguredDriveFolderId: async function() {
        const folderName = (document.getElementById("google-drive-folder")?.value || "").trim();
        const db = ImmoApp.db.instance;
        const folderFromDb = (await db.settings.get("googleDriveFolder"))?.value || "";
        const finalFolderName = (folderName || folderFromDb || "").trim();
        if (!finalFolderName) return null;

        const escapedName = finalFolderName.replace(/'/g, "\\'");
        const listResp = await this._retryDriveRequest(() => gapi.client.drive.files.list({
            q: `name = '${escapedName}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`,
            pageSize: 1,
            fields: "files(id, name)"
        }));
        if (listResp?.result?.files?.length) return listResp.result.files[0].id;

        const createResp = await this._retryDriveRequest(() => gapi.client.drive.files.create({
            resource: {
                name: finalFolderName,
                mimeType: "application/vnd.google-apps.folder"
            },
            fields: "id"
        }));
        return createResp?.result?.id || null;
    },

    uploadDocumentToDrive: async function(options = {}) {
        const {
            content = "",
            mimeType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            fileName = "Dokument.docx"
        } = options;

        if (!content || !String(content).length) {
            throw new Error("Dokument-Inhalt fehlt.");
        }
        const safeName = this._sanitizeFileName(fileName, "Dokument.docx");
        const allowedMime = new Set([
            "text/plain",
            "text/html",
            "application/json",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        ]);
        if (!allowedMime.has(mimeType)) {
            throw new Error("Nicht erlaubter Dokumenttyp.");
        }
        if (String(content).length > 10 * 1024 * 1024) {
            throw new Error("Dokument zu groß (max. 10 MB).");
        }
        await this.initGapiClient();
        const folderId = await this._getConfiguredDriveFolderId();

        const boundary = "doc_upload_" + Date.now();
        const delimiter = "\r\n--" + boundary + "\r\n";
        const closeDelimiter = "\r\n--" + boundary + "--";
        const metadata = { name: safeName, mimeType: mimeType };
        if (folderId) metadata.parents = [folderId];

        const multipartRequestBody =
            delimiter +
            "Content-Type: application/json; charset=UTF-8\r\n\r\n" +
            JSON.stringify(metadata) +
            delimiter +
            `Content-Type: ${mimeType}\r\n\r\n` +
            String(content) +
            closeDelimiter;

        const response = await this._retryDriveRequest(() => gapi.client.request({
            path: "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink,modifiedTime",
            method: "POST",
            body: multipartRequestBody,
            headers: {
                "Content-Type": "multipart/related; boundary=" + boundary
            }
        }));
        const result = response?.result || {};
        if (!result.id) throw new Error("Drive-Datei konnte nicht erstellt werden.");
        return {
            id: result.id,
            name: result.name || safeName,
            webViewLink: result.webViewLink || "",
            modifiedTime: result.modifiedTime || new Date().toISOString()
        };
    },

    registerDocumentMetadata: async function(payload = {}) {
        const db = ImmoApp.db.instance;
        if (!db || !db.documents) return null;

        const record = {
            tenantId: payload.tenantId || null,
            propertyId: payload.propertyId || null,
            year: String(payload.year || new Date().getFullYear()),
            docType: payload.docType || "LETTER",
            periodStart: payload.periodStart || "",
            periodEnd: payload.periodEnd || "",
            title: String(payload.title || "").slice(0, 200),
            fileNameSafe: String(payload.fileNameSafe || "").slice(0, 160),
            driveFileId: payload.driveFileId || "",
            driveWebViewLink: payload.driveWebViewLink || "",
            driveModifiedTime: payload.driveModifiedTime || "",
            checksum: payload.checksum || "",
            localCacheRef: payload.localCacheRef || "",
            localCacheAt: payload.localCacheAt || "",
            createdAt: payload.createdAt || new Date().toISOString(),
            createdBy: payload.createdBy || "local-user"
        };

        // Duplikate vermeiden: gleicher Typ + Zeitraum + checksum + tenant
        if (record.checksum) {
            const existing = await db.documents
                .where("tenantId")
                .equals(record.tenantId)
                .filter(d => d.docType === record.docType && d.checksum === record.checksum && (d.periodStart || "") === (record.periodStart || "") && (d.periodEnd || "") === (record.periodEnd || ""))
                .first();
            if (existing) {
                await db.documents.update(existing.id, record);
                return existing.id;
            }
        }
        return db.documents.add(record);
    },

    getDocumentsForTenant: async function(tenantId) {
        const db = ImmoApp.db.instance;
        if (!db || !db.documents || !tenantId) return [];
        const rows = await db.documents.where("tenantId").equals(parseInt(tenantId, 10)).toArray();
        rows.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        return rows;
    },

    pruneDocumentLocalCache: async function(maxEntries = 30) {
        const db = ImmoApp.db.instance;
        if (!db || !db.documents) return;
        const all = await db.documents.toArray();
        const withCache = all.filter(d => d.localCacheRef);
        if (withCache.length <= maxEntries) return;
        withCache.sort((a, b) => new Date(b.localCacheAt || b.createdAt || 0) - new Date(a.localCacheAt || a.createdAt || 0));
        const toRemove = withCache.slice(maxEntries);
        for (const d of toRemove) {
            await db.documents.update(d.id, { localCacheRef: "", localCacheAt: "" });
        }
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
                db.maintenance.clear(),
                db.documents.clear()
            ]);
            alert("Die Datenbank wurde komplett geleert. Die App wird neu gestartet.");
            location.reload();
        }
    },

    render: async function() {
        this.setupHTML();
        await this.loadGoogleConfig();
        await this.loadSenderConfig();
    }
};