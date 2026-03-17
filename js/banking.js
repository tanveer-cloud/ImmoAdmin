window.ImmoApp = window.ImmoApp || {};

window.ImmoApp.banking = {
    tenantFilterId: null,
    setupHTML: function() {
        const container = document.getElementById("banking-content");
        if (container.innerHTML.includes("Lade Module...")) {
            container.innerHTML = `
                <div class="bg-blue-50 border border-blue-200 p-6 rounded-lg mb-6 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div>
                        <h3 class="text-blue-800 font-bold mb-1">CSV-Import (Bank-Export)</h3>
                        <p class="text-sm text-blue-600">Lade hier die Umsätze aus deinem Online-Banking hoch.</p>
                    </div>
                    <div class="flex gap-2">
                        <input type="file" id="csv-upload" accept=".csv" class="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer">
                        <button onclick="ImmoApp.banking.importCSV()" class="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700 font-bold whitespace-nowrap">Importieren</button>
                    </div>
                </div>

                <div class="flex flex-col md:flex-row justify-between items-end mb-4 gap-4">
                    <div class="flex gap-4 w-full md:w-2/3">
                        <div class="w-1/2">
                            <label class="block text-xs font-bold text-gray-500 mb-1">Suche (Name, Verwendungszweck)</label>
                            <input type="text" id="banking-text-filter" placeholder="Suchbegriff..." class="w-full border rounded p-2 text-sm" onkeyup="ImmoApp.banking.onSearchChange()">
                        </div>
                        <div class="w-1/2">
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
                    <div class="flex flex-col items-end gap-2">
                        <button onclick="ImmoApp.banking.runAutoMatch()" class="bg-indigo-600 text-white px-4 py-2 rounded shadow hover:bg-indigo-700 text-sm font-bold whitespace-nowrap">🤖 Auto-Match starten</button>
                        <button onclick="ImmoApp.banking.deleteAllTxs()" class="text-red-500 hover:text-red-700 hover:underline text-xs font-bold">⚠️ Alle Buchungen löschen (Reset)</button>
                    </div>
                </div>

                <div class="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden overflow-x-auto">
                    <table class="min-w-full divide-y divide-gray-200 text-sm">
                        <thead class="bg-gray-50">
                            <tr>
                                <th class="px-4 py-3 text-left w-24 font-bold text-gray-600">Datum</th>
                                <th class="px-4 py-3 text-left font-bold text-gray-600">Details (Sender/Empfänger & Zweck)</th>
                                <th class="px-4 py-3 text-right font-bold text-gray-600">Betrag</th>
                                <th class="px-4 py-3 text-left w-64 font-bold text-gray-600">Kategorie / Zuweisung</th>
                                <th class="px-4 py-3 text-right w-28 font-bold text-gray-600"></th>
                            </tr>
                        </thead>
                        <tbody id="banking-table-body" class="bg-white divide-y divide-gray-200"></tbody>
                    </table>
                </div>
            `;
        }
    },

    onSearchChange: function() {
        // Manuelle Suche hebt die Filterung auf einen bestimmten Mieter wieder auf
        this.tenantFilterId = null;
        this.render();
    },

    onStatusChange: function() {
        // Statuswechsel soll ebenfalls alle Mieter berücksichtigen
        this.tenantFilterId = null;
        this.render();
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

                const exists = await db.transactions.where({date: date, amount: amount, name: name}).count();
                if (exists === 0) {
                    await db.transactions.add({
                        date, name, iban, purpose, amount, 
                        category: 'UNMATCHED', matchedTenantId: null, year: currentYear, importBatchId: batchId
                    });
                    count++;
                }
            }
            alert(`${count} neue Buchungen für das Jahr ${currentYear} sauber importiert!`);
            ImmoApp.banking.runAutoMatch();
        };
        reader.readAsText(file, 'ISO-8859-1'); 
    },

    deleteAllTxs: async function() {
        if(confirm("ACHTUNG: Willst du WIRKLICH alle bisher importierten Kontoauszüge löschen?\n\n(Deine Mieter, Objekte und Notizen bleiben erhalten. Du kannst danach deine CSV sauber neu importieren!)")) {
            await ImmoApp.db.instance.transactions.clear();
            this.render();
            if(window.ImmoApp.dashboard) ImmoApp.dashboard.render();
            alert("Alle Buchungen wurden gelöscht. Du kannst jetzt sauber neu importieren!");
        }
    },

    // 🤖 DIE NEUE LERNFÄHIGE KI-FUNKTION
    runAutoMatch: async function() {
        const db = ImmoApp.db.instance;
        const txs = await db.transactions.where('category').equals('UNMATCHED').toArray();
        const allTxs = await db.transactions.toArray(); // Holt ALLE jemals erfassten Buchungen als Lern-Basis
        const tenants = await db.tenants.toArray();
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
        const tx = await db.transactions.get(txId);
        
        const oldCategory = tx.category;

        await db.transactions.update(txId, { 
            category: category, 
            matchedTenantId: tenantId ? parseInt(tenantId) : null 
        });

        // Wenn es als Nebenkosten markiert wird, spiegeln wir es ins Utilities-Modul rüber
        if (category === 'UTILITY') {
            const exists = await db.utilities.where({ name: tx.name + ' - ' + tx.purpose, amount: Math.abs(tx.amount) }).count();
            if (exists === 0) {
                await db.utilities.add({
                    name: tx.name + ' - ' + tx.purpose,
                    amount: Math.abs(tx.amount), // Nebenkosten sind in der Ansicht meist positiv
                    year: tx.year,
                    propertyId: null // Muss der Nutzer im Utilities-Tab noch zuweisen
                });
            }
        }

        // Wenn eine Buchung vorher als Nebenkosten lief und jetzt nicht mehr,
        // sollten wir den dazugehörigen Utilities-Eintrag wieder entfernen
        if (oldCategory === 'UTILITY' && category !== 'UTILITY') {
            const candidates = await db.utilities.where({
                name: tx.name + ' - ' + tx.purpose,
                amount: Math.abs(tx.amount),
                year: tx.year
            }).toArray();
            for (const u of candidates) {
                await db.utilities.delete(u.id);
            }
        }

        // Falls es aus dem Auto-Match kommt, rendern wir erst ganz am Ende 1x, um Ruckler zu vermeiden!
        if (!skipRender) {
            this.render();
            if(window.ImmoApp.dashboard) ImmoApp.dashboard.render();
        }
    },

    deleteTx: async function(id) {
        if(confirm("Buchung wirklich löschen?")) {
            await ImmoApp.db.instance.transactions.delete(id);
            this.render();
            if(window.ImmoApp.dashboard) ImmoApp.dashboard.render();
        }
    },

    splitToDepositAndRent: async function(txId) {
        const db = ImmoApp.db.instance;
        const tx = await db.transactions.get(txId);
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

        // Kaution
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

        // Miete
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

        // Ursprüngliche Zahlung ignorieren, damit sie nicht doppelt gezählt wird
        await db.transactions.update(txId, { category: 'IGNORE', matchedTenantId: null });

        this.render();
        if (window.ImmoApp.dashboard) ImmoApp.dashboard.render();
    },

    render: async function() {
        this.setupHTML();
        const db = ImmoApp.db.instance;
        const currentYear = ImmoApp.ui.currentYear;
        
        const filterText = (document.getElementById("banking-text-filter")?.value || "").toLowerCase();
        const filterStatus = document.getElementById("banking-status-filter")?.value || "ALL";

        let txs = await db.transactions.where('year').equals(currentYear).reverse().toArray();
        const tenants = await db.tenants.toArray();

        // wenn aus dem Dashboard ein bestimmter Mieter gewählt wurde, zuerst nach matchedTenantId filtern
        if (this.tenantFilterId != null) {
            txs = txs.filter(tx => tx.matchedTenantId === this.tenantFilterId);
        }

        if (filterStatus !== "ALL") txs = txs.filter(tx => tx.category === filterStatus);
        if (filterText) {
            txs = txs.filter(tx => 
                tx.name.toLowerCase().includes(filterText) || 
                tx.purpose.toLowerCase().includes(filterText) ||
                (tx.amount.toString().includes(filterText))
            );
        }

        const tbody = document.getElementById("banking-table-body");
        tbody.innerHTML = "";

        if (txs.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5" class="px-4 py-8 text-center text-gray-500 italic">Keine Buchungen für dieses Jahr oder diesen Filter gefunden.</td></tr>`;
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

            tbody.innerHTML += `
                <tr class="hover:bg-gray-50 border-b">
                    <td class="px-4 py-3 align-top whitespace-nowrap text-xs text-gray-500">${tx.date}</td>
                    <td class="px-4 py-3 align-top">
                        <div class="mb-1">${nameLabel} <strong class="text-gray-800 font-bold text-sm">${tx.name || 'Unbekannt'}</strong></div>
                        <div class="text-xs text-gray-600 break-words">${tx.purpose || ''}</div>
                    </td>
                    <td class="px-4 py-3 align-top text-right font-bold ${amountColor} whitespace-nowrap">${ImmoApp.ui.formatCurrency(tx.amount)}</td>
                    <td class="px-4 py-3 align-top">${selectHtml}</td>
                    <td class="px-4 py-3 align-top text-right space-x-1">
                        <button onclick="ImmoApp.banking.splitToDepositAndRent(${tx.id})" class="text-xs bg-gray-50 border border-gray-300 px-2 py-1 rounded hover:bg-gray-100" title="Zahlung in Kaution + Miete aufteilen">➗</button>
                        <button onclick="ImmoApp.banking.deleteTx(${tx.id})" class="text-red-500 hover:bg-red-50 p-1 rounded" title="Buchung löschen">🗑️</button>
                    </td>
                </tr>
            `;
        });
    }
};