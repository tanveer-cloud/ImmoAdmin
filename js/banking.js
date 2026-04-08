window.ImmoApp = window.ImmoApp || {};

window.ImmoApp.banking = {
    tenantFilterId: null,
    tenantFilterName: null,
    sortByDateAsc: false,
    outsideMenuClickHandlerBound: false,
    setupHTML: function() {
        const container = document.getElementById("banking-content");
        if (container.innerHTML.includes("Lade Module...")) {
            container.innerHTML = `
                <div class="bg-blue-50 border border-blue-200 p-6 rounded-xl mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h3 class="text-blue-800 font-bold mb-1">CSV-Import (Bank-Export)</h3>
                        <p class="text-sm text-blue-600">Lade hier die Umsätze aus deinem Online-Banking hoch.</p>
                    </div>
                    <div class="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                        <input type="file" id="csv-upload" accept=".csv" class="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer">
                        <button onclick="ImmoApp.banking.importCSV()" class="bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 font-bold whitespace-nowrap w-full sm:w-auto">Importieren</button>
                    </div>
                </div>

                <div class="flex flex-col md:flex-row justify-between items-stretch md:items-end mb-4 gap-4">
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full md:w-2/3">
                        <div class="w-full">
                            <label class="block text-xs font-bold text-gray-500 mb-1">Suche (Name, Verwendungszweck)</label>
                            <input type="text" id="banking-text-filter" placeholder="Suchbegriff..." class="w-full border rounded p-2 text-sm" onkeyup="ImmoApp.banking.onSearchChange()">
                        </div>
                        <div class="w-full">
                            <label class="block text-xs font-bold text-gray-500 mb-1">Status-Filter</label>
                            <select id="banking-status-filter" class="w-full border rounded p-2 text-sm" onchange="ImmoApp.banking.onStatusChange()">
                                <option value="ALL">Alle anzeigen</option>
                                <option value="UNMATCHED">⚠️ Nur Offene (Nicht zugeordnet)</option>
                                <option value="RENT">✅ Mieten</option>
                                <option value="UTILITY">📊 Nebenkosten / Rechnungen</option>
                                <option value="IGNORE">🗑️ Ignoriert</option>
                            </select>
                        </div>
                    </div>
                    <div class="flex flex-col items-stretch md:items-end gap-2">
                        <div class="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                            <button onclick="ImmoApp.banking.resetFilters()" class="border border-gray-300 text-gray-700 px-3 py-2 rounded-lg shadow-sm hover:bg-gray-50 text-xs font-bold whitespace-nowrap w-full sm:w-auto">Filter zurücksetzen</button>
                            <button onclick="ImmoApp.banking.runAutoMatch()" class="bg-indigo-600 text-white px-4 py-2 rounded-lg shadow hover:bg-indigo-700 text-sm font-bold whitespace-nowrap w-full sm:w-auto">🤖 Auto-Match starten</button>
                        </div>
                        <button onclick="ImmoApp.banking.deleteAllTxs()" class="text-red-500 hover:text-red-700 hover:underline text-xs font-bold mt-1">⚠️ Alle Buchungen löschen (Reset)</button>
                    </div>
                </div>

                <!-- Desktop/Tablet: Tabellenansicht -->
                <div class="hidden md:block bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
                    <table class="min-w-full divide-y divide-gray-200 text-sm">
                        <thead class="bg-gray-50">
                            <tr>
                                <th class="px-4 py-3 text-left w-24 font-bold text-gray-600 cursor-pointer" onclick="ImmoApp.banking.toggleDateSort()">Datum</th>
                                <th class="px-4 py-3 text-left font-bold text-gray-600">Details (Sender/Empfänger & Zweck)</th>
                                <th class="px-4 py-3 text-right font-bold text-gray-600">Betrag</th>
                                <th class="px-4 py-3 text-left w-64 font-bold text-gray-600">Kategorie / Zuweisung</th>
                                <th class="px-4 py-3 text-right w-28 font-bold text-gray-600"></th>
                            </tr>
                        </thead>
                        <tbody id="banking-table-body" class="bg-white divide-y divide-gray-200"></tbody>
                    </table>
                </div>

                <!-- Mobile: Kartenansicht -->
                <div id="banking-cards" class="md:hidden space-y-3"></div>
            `;

            if (!this.outsideMenuClickHandlerBound) {
                document.addEventListener('click', (event) => {
                    const target = event.target;
                    const clickInsideMenu = target && target.closest && target.closest('[id^="tx-actions-menu-"]');
                    const clickOnToggle = target && target.closest && target.closest('.tx-actions-toggle');
                    if (clickInsideMenu || clickOnToggle) return;
                    document.querySelectorAll('[id^="tx-actions-menu-"]').forEach(m => m.classList.add('hidden'));
                });
                this.outsideMenuClickHandlerBound = true;
            }
        }
    },

    onSearchChange: function() {
        // Manuelle Suche hebt die Filterung auf einen bestimmten Mieter wieder auf
        this.tenantFilterId = null;
        this.tenantFilterName = null;
        this.render();
    },

    onStatusChange: function() {
        // Statuswechsel soll ebenfalls alle Mieter berücksichtigen
        this.tenantFilterId = null;
        this.tenantFilterName = null;
        this.render();
    },

    resetFilters: function() {
        const textInput = document.getElementById("banking-text-filter");
        const statusSelect = document.getElementById("banking-status-filter");
        if (textInput) textInput.value = "";
        if (statusSelect) statusSelect.value = "ALL";
        this.tenantFilterId = null;
        this.tenantFilterName = null;
        this.render();
    },

    toggleDateSort: function() {
        this.sortByDateAsc = !this.sortByDateAsc;
        this.render();
    },

    _getTx: async function (txId) {
        const id = parseInt(String(txId), 10);
        if (ImmoApp.api && ImmoApp.api.useApiData()) {
            const row = await ImmoApp.api.getTransaction(id);
            return row ? ImmoApp.api.mapTransactionFromApi(row) : null;
        }
        return ImmoApp.db.instance.transactions.get(id);
    },

    _loadTenantsBanking: async function () {
        if (ImmoApp.api && ImmoApp.api.useApiData()) {
            const res = await ImmoApp.api.getTenants({ limit: 500 });
            return (res.data || []).map(ImmoApp.api.mapTenantFromApi);
        }
        return ImmoApp.db.instance.tenants.toArray();
    },

    _loadTxsForYear: async function (currentYear) {
        if (ImmoApp.api && ImmoApp.api.useApiData()) {
            const res = await ImmoApp.api.getTransactions({ limit: 8000, page: 1 });
            return (res.data || [])
                .map(ImmoApp.api.mapTransactionFromApi)
                .filter(function (tx) { return String(tx.year) === String(currentYear); });
        }
        return ImmoApp.db.instance.transactions.where("year").equals(currentYear).toArray();
    },

    _loadAllTxsBanking: async function () {
        if (ImmoApp.api && ImmoApp.api.useApiData()) {
            const res = await ImmoApp.api.getTransactions({ limit: 8000, page: 1 });
            return (res.data || []).map(ImmoApp.api.mapTransactionFromApi);
        }
        return ImmoApp.db.instance.transactions.toArray();
    },

    importCSV: async function() {
        const fileInput = document.getElementById('csv-upload');
        if (!fileInput.files.length) return alert("Bitte wähle zuerst eine CSV-Datei aus!");
        
        const file = fileInput.files[0];
        const reader = new FileReader();
        const currentYear = ImmoApp.ui.currentYear;
        const batchId = 'batch_' + Date.now();

        reader.onload = async function(e) {
            const text = e.target.result;
            const db = ImmoApp.db.instance;
            const useApi = ImmoApp.api && ImmoApp.api.useApiData();
            let existingKeys = new Set();
            if (useApi) {
                try {
                    const res = await ImmoApp.api.getTransactions({ limit: 8000 });
                    (res.data || []).forEach(function (row) {
                        const t = ImmoApp.api.mapTransactionFromApi(row);
                        existingKeys.add((t.date || "") + "|" + t.amount + "|" + (t.name || ""));
                    });
                } catch (err) {
                    alert(err.message || "API");
                    return;
                }
            }

            const rows = [];
            let currentRow = [];
            let currentCell = '';
            let inQuotes = false;

            for (let i = 0; i < text.length; i++) {
                let c = text[i];
                let nextC = text[i+1];

                if (c === '"') {
                    if (inQuotes && nextC === '"') {
                        currentCell += '"'; 
                        i++; 
                    } else {
                        inQuotes = !inQuotes;
                    }
                } else if (c === ';' && !inQuotes) {
                    currentRow.push(currentCell.trim());
                    currentCell = '';
                } else if ((c === '\n' || c === '\r') && !inQuotes) {
                    if (c === '\r' && nextC === '\n') i++;
                    if (currentCell !== '' || currentRow.length > 0) {
                        currentRow.push(currentCell.trim());
                        rows.push(currentRow);
                        currentRow = [];
                        currentCell = '';
                    }
                } else {
                    currentCell += c;
                }
            }
            if (currentCell !== '' || currentRow.length > 0) {
                currentRow.push(currentCell.trim());
                rows.push(currentRow);
            }

            if (rows.length < 2) return alert("Die CSV-Datei scheint leer zu sein.");

            let headerLineIdx = 0;
            let headers = [];
            for (let i = 0; i < Math.min(20, rows.length); i++) {
                const lineStr = rows[i].join(' ').toLowerCase();
                if (lineStr.includes('betrag') || lineStr.includes('umsatz') || lineStr.includes('buchungsdatum')) {
                    headerLineIdx = i;
                    headers = rows[i];
                    break;
                }
            }

            let dateIdx = -1, senderIdx = -1, receiverIdx = -1, purposeIdx = -1, amountIdx = -1, ibanIdx = -1;

            for (let i = 0; i < headers.length; i++) {
                const h = headers[i].toLowerCase();
                if (h.includes('buchungsdatum') || h.includes('datum')) dateIdx = i;
                if (h.includes('zahlungspflichtig') || h.includes('auftraggeber')) senderIdx = i;
                if (h.includes('zahlungsempf') || h.includes('begünstigte')) receiverIdx = i;
                if (h.includes('verwendungszweck') || h.includes('buchungstext')) purposeIdx = i;
                if (h.includes('betrag') || h.includes('umsatz')) amountIdx = i;
                if (h.includes('iban') || h.includes('kontonummer')) ibanIdx = i;
            }

            if(amountIdx === -1) amountIdx = headers.length - 1;
            if(dateIdx === -1) dateIdx = 0;
            if(senderIdx === -1) senderIdx = 1;
            if(purposeIdx === -1) purposeIdx = 3;

            let count = 0;

            for (let i = headerLineIdx + 1; i < rows.length; i++) {
                const cols = rows[i];
                if (cols.length < 4) continue; 

                let date = cols[dateIdx] ? cols[dateIdx] : '';
                if (!date.includes(currentYear.substring(2)) && !date.includes(currentYear)) continue; 
                
                let amountStr = cols[amountIdx];
                if (!amountStr) continue;
                amountStr = amountStr.replace(/\s/g, '').replace(/\./g, '').replace(',', '.');
                const amount = parseFloat(amountStr);
                if (isNaN(amount)) continue;

                let name = '';
                if (amount > 0 && senderIdx > -1 && cols[senderIdx]) {
                    name = cols[senderIdx];
                } else if (amount < 0 && receiverIdx > -1 && cols[receiverIdx]) {
                    name = cols[receiverIdx];
                } else {
                    name = cols[senderIdx > -1 ? senderIdx : 1] || 'Unbekannt';
                }

                name = name.split('  ')[0].trim();

                let iban = (ibanIdx > -1 && cols[ibanIdx]) ? cols[ibanIdx].replace(/\s+/g, '') : '';
                let purpose = (purposeIdx > -1 && cols[purposeIdx]) ? cols[purposeIdx].replace(/[\r\n]+/g, ' ') : '';

                const dupKey = date + "|" + amount + "|" + name;
                if (useApi) {
                    if (existingKeys.has(dupKey)) continue;
                    const iso = ImmoApp.api.germanDateToIso(date);
                    if (!iso) continue;
                    try {
                        await ImmoApp.api.postTransaction({
                            tenant_id: null,
                            date_value: iso,
                            amount: amount,
                            purpose: purpose || null,
                            name: name || null,
                            iban: iban || null,
                            category: "UNMATCHED",
                            year_value: String(currentYear),
                            import_batch_id: batchId
                        });
                        existingKeys.add(dupKey);
                        count++;
                    } catch (err) {
                        console.error(err);
                    }
                } else {
                    const exists = await db.transactions.where({ date: date, amount: amount, name: name }).count();
                    if (exists === 0) {
                        await db.transactions.add({
                            date: date, name: name, iban: iban, purpose: purpose, amount: amount,
                            category: "UNMATCHED", matchedTenantId: null, year: currentYear, importBatchId: batchId
                        });
                        count++;
                    }
                }
            }
            alert(`${count} neue Buchungen für das Jahr ${currentYear} sauber importiert!`);
            ImmoApp.banking.runAutoMatch();
        };
        reader.readAsText(file, 'ISO-8859-1'); 
    },

    deleteAllTxs: async function() {
        if(confirm("ACHTUNG: Willst du WIRKLICH alle bisher importierten Kontoauszüge löschen?\n\n(Deine Mieter, Objekte und Notizen bleiben erhalten. Du kannst danach deine CSV sauber neu importieren!)")) {
            try {
                if (ImmoApp.api && ImmoApp.api.useApiData()) {
                    const res = await ImmoApp.api.getTransactions({ limit: 20000 });
                    for (const row of res.data || []) {
                        await ImmoApp.api.deleteTransaction(row.id);
                    }
                } else {
                    await ImmoApp.db.instance.transactions.clear();
                }
            } catch (e) {
                alert(e.message || "Löschen fehlgeschlagen");
                return;
            }
            this.render();
            if(window.ImmoApp.dashboard) ImmoApp.dashboard.render();
            alert("Alle Buchungen wurden gelöscht. Du kannst jetzt sauber neu importieren!");
        }
    },

    // 🤖 DIE NEUE LERNFÄHIGE KI-FUNKTION
    runAutoMatch: async function() {
        const db = ImmoApp.db.instance;
        let txs;
        let allTxs;
        let tenants;
        if (ImmoApp.api && ImmoApp.api.useApiData()) {
            allTxs = await this._loadAllTxsBanking();
            txs = allTxs.filter(function (t) { return t.category === "UNMATCHED"; });
            tenants = await this._loadTenantsBanking();
        } else {
            txs = await db.transactions.where("category").equals("UNMATCHED").toArray();
            allTxs = await db.transactions.toArray();
            tenants = await db.tenants.toArray();
        }
        let matchCount = 0;

        // 1. LERN-DATENBANK AUFBAUEN
        // Wir merken uns alle Namen, die du jemals als Nebenkosten oder "Ignorieren" markiert hast.
        const knownUtilities = new Set();
        const knownIgnores = new Set();
        
        allTxs.forEach(t => {
            if (t.name && t.name.trim() !== '') {
                const cleanName = t.name.trim().toLowerCase();
                if (t.category === 'UTILITY') knownUtilities.add(cleanName);
                if (t.category === 'IGNORE') knownIgnores.add(cleanName);
            }
        });

        for (let tx of txs) {
            let matched = false;
            
            // 2. Suche nach IBAN Übereinstimmung (Die sicherste Methode!)
            if (tx.iban && tx.iban.length > 5) {
                const t = tenants.find(t => t.iban === tx.iban);
                if (t) {
                    await this.updateCategory(tx.id, 'RENT', t.id, true); // true = lädt die Tabelle nicht nach jedem Klick neu (macht es extrem schnell)
                    matched = true;
                }
            }

            // 3. Suche nach Mieter-Name (z.B. Eltern überweisen Miete)
            if (!matched && tx.amount > 0) {
                for (let t of tenants) {
                    const lastName = t.name.split(' ').pop().toLowerCase();
                    const searchStr = (tx.name + " " + tx.purpose).toLowerCase();
                    
                    if (lastName.length > 2 && searchStr.includes(lastName)) {
                        const min = t.rent * 0.9;
                        const max = t.rent * 1.1;
                        if (tx.amount >= min && tx.amount <= max) {
                            await this.updateCategory(tx.id, 'RENT', t.id, true);
                            matched = true;
                            break;
                        }
                    }
                }
            }

            // 4. KI-ABGLEICH (Die neue Magie für Nebenkosten wie Telekom, Stadtwerke etc.)
            if (!matched && tx.name) {
                const txNameLower = tx.name.trim().toLowerCase();
                
                if (knownUtilities.has(txNameLower)) {
                    await this.updateCategory(tx.id, 'UTILITY', null, true);
                    matched = true;
                } 
                else if (knownIgnores.has(txNameLower)) {
                    await this.updateCategory(tx.id, 'IGNORE', null, true);
                    matched = true;
                }
            }

            // 5. Hardcode-Fallback für offensichtliche Bankgebühren
            if (!matched && tx.amount < 0 && tx.amount > -10 && tx.name.toLowerCase().includes('entgelt')) {
                await this.updateCategory(tx.id, 'IGNORE', null, true);
                matched = true;
            }

            if(matched) matchCount++;
        }
        
        if (matchCount > 0) {
            alert(`🤖 KI-Zuordnung erfolgreich!\n\nDie App hat aus deinen bisherigen Zuweisungen gelernt und ${matchCount} Buchungen automatisch einsortiert.`);
        } else {
            alert("🤖 Kein neues Muster gefunden.\n\nTipp: Wenn du einen Empfänger (z.B. 'Telekom') manuell als Nebenkosten zuweist und dann nochmal hier klickst, ordnet die App den Rest automatisch zu!");
        }
        
        this.render();
        if(window.ImmoApp.dashboard) ImmoApp.dashboard.render();
    },

    // Die Update Funktion wurde angepasst, damit sie mit dem schnellen KI-Loop funktioniert
    updateCategory: async function(txId, category, tenantId = null, skipRender = false) {
        const db = ImmoApp.db.instance;
        const tx = await this._getTx(txId);
        if (!tx) {
            alert("Buchung nicht gefunden.");
            return;
        }
        const oldCategory = tx.category;

        if (ImmoApp.api && ImmoApp.api.useApiData()) {
            try {
                await ImmoApp.api.patchTransaction(txId, {
                    category: String(category).toUpperCase(),
                    tenant_id: tenantId ? parseInt(String(tenantId), 10) : null
                });
            } catch (e) {
                alert(e.message || "API");
                return;
            }

            const utilName = (tx.name || "") + " - " + (tx.purpose || "");
            const utilAmount = Math.abs(Number(tx.amount) || 0);
            const yearStr = String(tx.year != null ? tx.year : "");

            const findApiUtilityMatches = async function () {
                const res = await ImmoApp.api.getUtilities({ limit: 5000 });
                return (res.data || []).filter(function (r) {
                    return r.name === utilName
                        && Math.abs(Number(r.amount) - utilAmount) < 0.005
                        && String(r.year_value) === yearStr;
                });
            };

            if (String(category).toUpperCase() === "UTILITY" && yearStr !== "") {
                const matches = await findApiUtilityMatches();
                if (matches.length === 0) {
                    await ImmoApp.api.postUtility({
                        name: utilName,
                        amount: utilAmount,
                        year_value: yearStr,
                        property_id: null,
                        category: null,
                        split_key: null
                    });
                }
            }

            if (String(oldCategory).toUpperCase() === "UTILITY" && String(category).toUpperCase() !== "UTILITY" && yearStr !== "") {
                const candidates = await findApiUtilityMatches();
                for (const u of candidates) {
                    try {
                        await ImmoApp.api.deleteUtility(u.id);
                    } catch (err) {
                        console.warn("Nebenkosten-Spiegel nicht gelöscht (z. B. nur ADMIN):", err);
                    }
                }
            }
        } else {
            await db.transactions.update(txId, {
                category: category,
                matchedTenantId: tenantId ? parseInt(tenantId) : null
            });

            if (category === "UTILITY") {
                const exists = await db.utilities.where({ name: tx.name + " - " + tx.purpose, amount: Math.abs(tx.amount) }).count();
                if (exists === 0) {
                    await db.utilities.add({
                        name: tx.name + " - " + tx.purpose,
                        amount: Math.abs(tx.amount),
                        year: tx.year,
                        propertyId: null
                    });
                }
            }

            if (oldCategory === "UTILITY" && category !== "UTILITY") {
                const candidates = await db.utilities.where({
                    name: tx.name + " - " + tx.purpose,
                    amount: Math.abs(tx.amount),
                    year: tx.year
                }).toArray();
                for (const u of candidates) {
                    await db.utilities.delete(u.id);
                }
            }
        }

        if (!skipRender) {
            this.render();
            if(window.ImmoApp.dashboard) ImmoApp.dashboard.render();
        }
    },

    deleteTx: async function(id) {
        if(confirm("Buchung wirklich löschen?")) {
            try {
                if (ImmoApp.api && ImmoApp.api.useApiData()) {
                    await ImmoApp.api.deleteTransaction(id);
                } else {
                    await ImmoApp.db.instance.transactions.delete(id);
                }
            } catch (e) {
                alert(e.message || "Löschen fehlgeschlagen");
                return;
            }
            this.render();
            if(window.ImmoApp.dashboard) ImmoApp.dashboard.render();
        }
    },

    updateTxDate: async function(txId, newDateStr) {
        if (!newDateStr || !/^\d{2}\.\d{2}\.\d{2,4}$/.test(newDateStr.trim())) {
            alert("Bitte Datum im Format TT.MM.JJ oder TT.MM.JJJJ eingeben.");
            return;
        }
        const trimmed = newDateStr.trim();
        try {
            if (ImmoApp.api && ImmoApp.api.useApiData()) {
                const iso = ImmoApp.api.germanDateToIso(trimmed);
                if (!iso) {
                    alert("Ungültiges Datum.");
                    return;
                }
                await ImmoApp.api.patchTransaction(txId, {
                    date_value: iso,
                    year_value: iso.substring(0, 4)
                });
            } else {
                await ImmoApp.db.instance.transactions.update(txId, { date: trimmed });
            }
        } catch (e) {
            alert(e.message || "Speichern fehlgeschlagen");
            return;
        }
        this.render();
        if (window.ImmoApp.dashboard) ImmoApp.dashboard.render();
    },

    toggleTxActionsMenu: function(txId) {
        const menuId = `tx-actions-menu-${txId}`;
        const menu = document.getElementById(menuId);
        if (!menu) return;
        const willOpen = menu.classList.contains('hidden');
        document.querySelectorAll('[id^="tx-actions-menu-"]').forEach(m => m.classList.add('hidden'));
        if (willOpen) menu.classList.remove('hidden');
    },

    createTenantFromTx: async function(txId) {
        const tx = await this._getTx(txId);
        if (!tx) return alert("Buchung nicht gefunden.");
        if (!ImmoApp.tenants || !ImmoApp.tenants.showTenantModal) {
            alert("Mietermodul ist nicht geladen.");
            return;
        }

        const defaultName = tx.name || "";
        const defaultIban = tx.iban || "";
        const defaultDate = tx.date || "";
        const defaultRent = "";

        ImmoApp.ui.switchTab('tenants');
        setTimeout(() => {
            ImmoApp.tenants.showTenantModal(null, defaultName, defaultIban, defaultDate, defaultRent);
        }, 50);
    },

    splitToDepositAndRent: async function(txId) {
        const db = ImmoApp.db.instance;
        const tx = await this._getTx(txId);
        if (!tx) return alert("Buchung nicht gefunden.");
        if (tx.amount <= 0) return alert("Nur Zahlungseingänge können gesplittet werden.");

        const input = prompt(`Wieviel von ${ImmoApp.ui.formatCurrency(tx.amount)} ist Kaution?`, "0");
        if (input === null) return;
        const dep = parseFloat(input.replace(',', '.'));
        if (isNaN(dep) || dep <= 0 || dep >= tx.amount) {
            alert("Ungültiger Kautionsbetrag. Er muss > 0 und < Gesamtbetrag sein.");
            return;
        }
        const rentPart = tx.amount - dep;

        try {
            if (ImmoApp.api && ImmoApp.api.useApiData()) {
                const tid = tx.matchedTenantId != null ? Number(tx.matchedTenantId) : null;
                const iso = ImmoApp.api.germanDateToIso(tx.date);
                if (!iso) throw new Error("Ungültiges Datum");
                const y = String(tx.year || "");
                const base = { tenant_id: tid, date_value: iso, name: tx.name || null, iban: tx.iban || null, year_value: y };
                await ImmoApp.api.postTransaction(Object.assign({}, base, {
                    amount: dep,
                    purpose: (tx.purpose || "") + " (Kaution)",
                    category: "DEPOSIT",
                    import_batch_id: (tx.importBatchId || "split") + "_deposit"
                }));
                await ImmoApp.api.postTransaction(Object.assign({}, base, {
                    amount: rentPart,
                    purpose: (tx.purpose || "") + " (Miete)",
                    category: "RENT",
                    import_batch_id: (tx.importBatchId || "split") + "_rent"
                }));
                await ImmoApp.api.patchTransaction(txId, { category: "IGNORE", tenant_id: null });
            } else {
                await db.transactions.add({
                    date: tx.date,
                    amount: dep,
                    name: tx.name,
                    purpose: (tx.purpose || '') + ' (Kaution)',
                    iban: tx.iban,
                    matchedTenantId: tx.matchedTenantId || null,
                    category: 'DEPOSIT',
                    year: tx.year,
                    importBatchId: (tx.importBatchId || 'split') + '_deposit'
                });

                await db.transactions.add({
                    date: tx.date,
                    amount: rentPart,
                    name: tx.name,
                    purpose: (tx.purpose || '') + ' (Miete)',
                    iban: tx.iban,
                    matchedTenantId: tx.matchedTenantId || null,
                    category: 'RENT',
                    year: tx.year,
                    importBatchId: (tx.importBatchId || 'split') + '_rent'
                });

                await db.transactions.update(txId, { category: 'IGNORE', matchedTenantId: null });
            }
        } catch (e) {
            alert(e.message || "Split fehlgeschlagen");
            return;
        }

        this.render();
        if (window.ImmoApp.dashboard) ImmoApp.dashboard.render();
    },

    render: async function() {
        this.setupHTML();
        const db = ImmoApp.db.instance;
        const currentYear = ImmoApp.ui.currentYear;
        
        const filterText = (document.getElementById("banking-text-filter")?.value || "").toLowerCase();
        const filterStatus = document.getElementById("banking-status-filter")?.value || "ALL";

        let txs;
        let tenants;
        try {
            txs = await this._loadTxsForYear(currentYear);
            tenants = await this._loadTenantsBanking();
        } catch (e) {
            const tbody = document.getElementById("banking-table-body");
            const cardsContainer = document.getElementById("banking-cards");
            const msg = e.message || "Laden fehlgeschlagen";
            if (tbody) tbody.innerHTML = '<tr><td colspan="5" class="px-4 py-8 text-center text-red-600">' + msg + "</td></tr>";
            if (cardsContainer) cardsContainer.innerHTML = "";
            return;
        }

        if (filterStatus !== "ALL") txs = txs.filter(tx => tx.category === filterStatus);
        if (filterText) {
            txs = txs.filter(tx => 
                tx.name.toLowerCase().includes(filterText) || 
                tx.purpose.toLowerCase().includes(filterText) ||
                (tx.amount.toString().includes(filterText))
            );
        }

        // Sortierung nach Datum (auf- oder absteigend)
        const parseDate = (d) => {
            if (!d) return 0;
            const parts = d.split('.');
            if (parts.length !== 3) return 0;
            let y = parts[2];
            if (y.length === 2) {
                y = ((parseInt(y, 10) > 50 ? 1900 : 2000) + parseInt(y, 10)).toString();
            }
            return new Date(`${y}-${parts[1]}-${parts[0]}`).getTime();
        };
        txs.sort((a, b) => {
            const da = parseDate(a.date);
            const dbt = parseDate(b.date);
            return this.sortByDateAsc ? (da - dbt) : (dbt - da);
        });

        const tbody = document.getElementById("banking-table-body");
        const cardsContainer = document.getElementById("banking-cards");
        if (tbody) tbody.innerHTML = "";
        if (cardsContainer) cardsContainer.innerHTML = "";

        if (txs.length === 0) {
            if (tbody) {
                tbody.innerHTML = `<tr><td colspan="5" class="px-4 py-8 text-center text-gray-500 italic">Keine Buchungen für dieses Jahr oder diesen Filter gefunden.</td></tr>`;
            }
            if (cardsContainer) {
                cardsContainer.innerHTML = `<div class="px-4 py-4 text-center text-gray-500 italic bg-white rounded-lg shadow-sm border border-gray-100">Keine Buchungen für dieses Jahr oder diesen Filter gefunden.</div>`;
            }
            return;
        }

        txs.forEach(tx => {
            let selectColor = 'bg-white border-gray-300';
            if(tx.category === 'UNMATCHED') selectColor = 'bg-orange-50 border-orange-400 text-orange-800 font-bold';
            if(tx.category === 'RENT') selectColor = 'bg-green-50 border-green-400 text-green-800 font-bold';
            if(tx.category === 'UTILITY') selectColor = 'bg-blue-50 border-blue-400 text-blue-800 font-bold';
            if(tx.category === 'IGNORE') selectColor = 'bg-gray-100 border-gray-300 text-gray-500 line-through';

            let selectHtml = `<select onchange="ImmoApp.banking.updateCategory(${tx.id}, this.options[this.selectedIndex].dataset.cat, this.value)" class="w-full border rounded p-1 text-xs shadow-sm ${selectColor}">`;
            selectHtml += `<option value="" data-cat="UNMATCHED" ${tx.category === 'UNMATCHED' ? 'selected' : ''}>⚠️ Offen (Nicht zugewiesen)</option>`;
            selectHtml += `<optgroup label="✅ Miete von...">`;
            tenants.forEach(t => {
                const isSelected = (tx.category === 'RENT' && tx.matchedTenantId === t.id) ? 'selected' : '';
                selectHtml += `<option value="${t.id}" data-cat="RENT" ${isSelected}>${t.name}</option>`;
            });
            selectHtml += `</optgroup>`;
            selectHtml += `<option value="" data-cat="DEPOSIT" ${tx.category === 'DEPOSIT' ? 'selected' : ''}>🔒 Kaution</option>`;
            selectHtml += `<option value="" data-cat="UTILITY" ${tx.category === 'UTILITY' ? 'selected' : ''}>📊 Ist Nebenkosten-Ausgabe</option>`;
            selectHtml += `<option value="" data-cat="IGNORE" ${tx.category === 'IGNORE' ? 'selected' : ''}>🗑️ Ignorieren / Privat</option>`;
            selectHtml += `</select>`;

            const isNegative = tx.amount < 0;
            const amountColor = isNegative ? 'text-red-600' : 'text-green-600';
            
            const nameLabel = isNegative 
                ? `<span class="text-[10px] bg-red-100 text-red-800 px-1 py-0.5 rounded mr-1 border border-red-200 uppercase font-bold tracking-wide">Empfänger:</span>` 
                : `<span class="text-[10px] bg-green-100 text-green-800 px-1 py-0.5 rounded mr-1 border border-green-200 uppercase font-bold tracking-wide">Sender:</span>`;

            const isManual = tx.importBatchId === 'manual' || tx.importBatchId === 'manual_history';
            const actionsMenuHtml = `
                <div class="relative inline-block text-left">
                    <button onclick="ImmoApp.banking.toggleTxActionsMenu(${tx.id})" class="tx-actions-toggle text-xs bg-gray-50 border border-gray-300 px-2 py-1 rounded-lg hover:bg-gray-100" title="Aktionen">⋯</button>
                    <div id="tx-actions-menu-${tx.id}" class="hidden absolute right-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
                        <button onclick="ImmoApp.banking.createTenantFromTx(${tx.id}); document.getElementById('tx-actions-menu-${tx.id}')?.classList.add('hidden');" class="block w-full text-left px-3 py-2 text-xs text-gray-700 hover:bg-gray-50">👤 Mieter anlegen</button>
                        <button onclick="ImmoApp.banking.splitToDepositAndRent(${tx.id}); document.getElementById('tx-actions-menu-${tx.id}')?.classList.add('hidden');" class="block w-full text-left px-3 py-2 text-xs text-gray-700 hover:bg-gray-50">➗ In Kaution + Miete splitten</button>
                        <button onclick="ImmoApp.banking.deleteTx(${tx.id}); document.getElementById('tx-actions-menu-${tx.id}')?.classList.add('hidden');" class="block w-full text-left px-3 py-2 text-xs text-red-700 hover:bg-red-50">🗑️ Löschen</button>
                    </div>
                </div>
            `;

            if (tbody) {
                tbody.innerHTML += `
                    <tr class="hover:bg-gray-50 border-b">
                        <td class="px-4 py-3 align-top whitespace-nowrap text-xs text-gray-500">
                            ${
                                isManual
                                    ? `<input type="text" value="${tx.date || ''}" class="w-20 border rounded px-1 text-xs"
                                               onchange="ImmoApp.banking.updateTxDate(${tx.id}, this.value)" title="Datum ändern (TT.MM.JJ oder TT.MM.JJJJ)">`
                                    : (tx.date || '')
                            }
                        </td>
                        <td class="px-4 py-3 align-top">
                            <div class="mb-1">${nameLabel} <strong class="text-gray-800 font-bold text-sm">${tx.name || 'Unbekannt'}</strong></div>
                            <div class="text-xs text-gray-600 break-words">${tx.purpose || ''}</div>
                        </td>
                        <td class="px-4 py-3 align-top text-right font-bold ${amountColor} whitespace-nowrap">${ImmoApp.ui.formatCurrency(tx.amount)}</td>
                        <td class="px-4 py-3 align-top">${selectHtml}</td>
                        <td class="px-4 py-3 align-top text-right">
                            ${actionsMenuHtml}
                        </td>
                    </tr>
                `;
            }

            if (cardsContainer) {
                cardsContainer.innerHTML += `
                    <div class="bg-white border border-gray-200 rounded-lg shadow-sm p-3 text-sm">
                        <div class="flex justify-between items-center mb-1">
                            <div class="text-xs text-gray-500">
                                ${isManual
                                    ? `<input type="text" value="${tx.date || ''}" class="w-24 border rounded px-1 text-xs"
                                               onchange="ImmoApp.banking.updateTxDate(${tx.id}, this.value)" title="Datum ändern (TT.MM.JJ oder TT.MM.JJJJ)">`
                                    : (tx.date || '')
                                }
                            </div>
                            <div class="font-bold ${amountColor}">${ImmoApp.ui.formatCurrency(tx.amount)}</div>
                        </div>
                        <div class="mb-1">
                            ${nameLabel}
                            <span class="font-bold text-gray-800">${tx.name || 'Unbekannt'}</span>
                        </div>
                        <div class="text-xs text-gray-600 mb-2 break-words">${tx.purpose || ''}</div>
                        <div class="mb-2">
                            ${selectHtml}
                        </div>
                        <div class="flex justify-end">
                            ${actionsMenuHtml}
                        </div>
                    </div>
                `;
            }
        });
    }
};