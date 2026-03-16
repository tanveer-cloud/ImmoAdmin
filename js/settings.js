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

    runExport: async function() {
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
                        // Wir speichern die KI-Erinnerung im Jahr 2000 mit 0€. 
                        // So taucht sie in keiner Statistik auf, aber das Auto-Match lernt daraus!
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
            alert(`Tipp: Es wurden ${kiData.length} KI-Regeln (Handwerker/Stadtwerke etc.) in das Backup extrahiert!`);
        }

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

    runImport: function() {
        const fileInput = document.getElementById('import-file');
        if (!fileInput.files.length) return alert("Bitte wähle zuerst eine Backup-Datei (.json) aus.");
        
        const reader = new FileReader();
        reader.onload = async function(e) {
            try {
                const data = JSON.parse(e.target.result);
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
            } catch(err) {
                alert("Fehler beim Importieren! Ist das wirklich eine gültige ImmoApp .json Datei?");
                console.error(err);
            }
        };
        reader.readAsText(fileInput.files[0]);
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