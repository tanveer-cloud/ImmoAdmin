window.ImmoApp = window.ImmoApp || {};

window.ImmoApp.utilities = {
    setupHTML: function() {
        const container = document.getElementById("utilities-content");
        if (container.innerHTML.includes("Lade Module...")) {
            container.innerHTML = `
                <div class="flex border-b border-gray-200 mb-6">
                    <button id="tab-util-costs" class="px-6 py-3 font-bold text-blue-600 border-b-2 border-blue-600" onclick="ImmoApp.utilities.switchTab('costs')">1. Kosten erfassen & WG-Check</button>
                    <button id="tab-util-export" class="px-6 py-3 font-bold text-gray-500 hover:text-blue-600" onclick="ImmoApp.utilities.switchTab('export')">2. Abrechnungen generieren</button>
                </div>

                <div id="util-view-costs">
                    <div class="flex flex-col gap-4 mb-6">
                        <div class="flex justify-between items-center">
                            <div>
                                <h2 class="text-2xl font-bold text-gray-800">WG-Rentabilitäts-Check & Kosten-Verteiler (<span class="year-label"></span>)</h2>
                            </div>
                            <select id="util-prop-select" class="border rounded p-2 text-sm bg-white font-bold shadow-sm" onchange="ImmoApp.utilities.renderCosts()">
                                <option value="ALL">-- Alle Objekte --</option>
                            </select>
                        </div>

                        <!-- Manuelle Rechnung erfassen -->
                    <div class="bg-white border border-gray-200 rounded-xl shadow-sm p-4">
                            <h3 class="text-sm font-bold text-gray-700 mb-2">+ Manuelle Nebenkosten-Rechnung erfassen</h3>
                            <div class="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
                                <div>
                                    <label class="block text-xs font-bold text-gray-600 mb-1">Datum</label>
                                    <input type="date" id="util-man-date" class="w-full border rounded p-2 text-xs">
                                </div>
                                <div>
                                    <label class="block text-xs font-bold text-gray-600 mb-1">Lieferant / Rechnungstext</label>
                                    <input type="text" id="util-man-name" placeholder="z.B. Stadtwerke, Heizkostenabrechnung" class="w-full border rounded p-2 text-xs">
                                </div>
                                <div>
                                    <label class="block text-xs font-bold text-gray-600 mb-1">Betrag (€)</label>
                                    <input type="number" step="0.01" id="util-man-amount" class="w-full border rounded p-2 text-xs" placeholder="z.B. 1200">
                                </div>
                                <div class="flex gap-2">
                                    <button onclick="ImmoApp.utilities.addManualUtility()" class="w-full md:w-auto bg-blue-600 text-white px-4 py-2 rounded-lg text-xs font-bold shadow hover:bg-blue-700 whitespace-nowrap">
                                        💾 Rechnung hinzufügen
                                    </button>
                                </div>
                            </div>
                            <p class="text-[11px] text-gray-400 mt-1">
                                Hinweis: Die detaillierte Objektzuordnung, Kategorie und Verteilung kannst du in der Tabelle unten nachtragen.
                            </p>
                        </div>
                    </div>

                    <div id="wg-check-container" class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div class="bg-blue-50 p-6 rounded-lg shadow-sm border border-blue-200">
                            <h3 class="text-blue-800 text-sm font-semibold mb-1">Eingenommene NK-Pauschalen</h3>
                            <p class="text-3xl font-bold text-blue-600" id="wg-check-income">0,00 €</p>
                            <p class="text-xs text-blue-600 mt-1">Summe aller Vorauszahlungen/Pauschalen im Jahr.</p>
                        </div>
                        <div class="bg-orange-50 p-6 rounded-lg shadow-sm border border-orange-200">
                            <h3 class="text-orange-800 text-sm font-semibold mb-1">Tatsächliche Haus-Kosten</h3>
                            <p class="text-3xl font-bold text-orange-600" id="wg-check-costs">0,00 €</p>
                            <p class="text-xs text-orange-600 mt-1">Summe aller erfassten Ausgaben unten.</p>
                        </div>
                        <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-200 flex flex-col justify-between" id="wg-check-result-box">
                            <div>
                                <h3 class="text-gray-500 text-sm font-semibold mb-1">WG-Gewinn / Verlust</h3>
                                <p class="text-3xl font-bold" id="wg-check-result">0,00 €</p>
                                <p class="text-xs text-gray-500 mt-1" id="wg-check-result-text">Rechnen deine Pauschalen sich?</p>
                            </div>
                            <button onclick="document.getElementById('modal-wg-check').classList.remove('hidden')" class="mt-4 text-xs bg-gray-100 border border-gray-300 px-3 py-2 rounded-lg hover:bg-gray-200 text-gray-700 font-bold w-full transition-colors">🔍 Aufschlüsselung anzeigen</button>
                        </div>
                    </div>

                    <div class="hidden md:block bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden overflow-x-auto">
                        <table class="min-w-full divide-y divide-gray-200 text-sm">
                            <thead class="bg-gray-50">
                                <tr>
                                    <th class="px-4 py-3 text-left w-1/3 font-bold text-gray-600">Rechnung (aus Kontoauszug)</th>
                                    <th class="px-4 py-3 text-right font-bold text-gray-600">Betrag</th>
                                    <th class="px-4 py-3 text-left font-bold text-gray-600">Objekt-Zuweisung</th>
                                    <th class="px-4 py-3 text-left font-bold text-gray-600">Kategorie & Schlüssel</th>
                                </tr>
                            </thead>
                            <tbody id="utilities-table-body" class="bg-white divide-y divide-gray-200"></tbody>
                        </table>
                    </div>
                    <div id="utilities-cards" class="md:hidden space-y-3"></div>
                </div>

                <div id="util-view-export" class="hidden">
                    <div class="bg-blue-50 border border-blue-200 p-6 rounded-xl mb-6">
                        <h2 class="text-xl font-bold text-blue-800 mb-4">1-Klick Abrechnungs-Generator</h2>
                        <div class="flex flex-col md:flex-row gap-4 items-end">
                            <div class="w-full md:w-1/3">
                                <label class="block text-sm font-bold mb-1 text-blue-800">1. Objekt wählen</label>
                                <select id="export-prop-select" class="w-full border rounded p-2" onchange="ImmoApp.utilities.loadTenantsForExport()">
                                    <option value="">-- Bitte wählen --</option>
                                </select>
                            </div>
                            <div class="w-full md:w-1/3">
                                <label class="block text-sm font-bold mb-1 text-blue-800">2. Mieter wählen</label>
                                <select id="export-tenant-select" class="w-full border rounded p-2 disabled:bg-gray-100" disabled>
                                    <option value="">-- Zuerst Objekt wählen --</option>
                                </select>
                            </div>
                            <div class="w-full md:w-1/3">
                                <button onclick="ImmoApp.utilities.generateStatementPreview()" class="w-full bg-blue-600 text-white font-bold py-2 rounded-lg shadow hover:bg-blue-700">📄 Vorschau generieren</button>
                            </div>
                        </div>
                        <div class="mt-4 flex flex-col md:flex-row gap-4 items-end">
                            <div class="w-full md:w-1/2">
                                <label class="block text-sm font-bold mb-1 text-blue-800">NK-Zeitraum Start (optional)</label>
                                <input type="date" id="nk-period-start" class="w-full border rounded p-2 text-sm bg-white">
                            </div>
                            <div class="w-full md:w-1/2">
                                <label class="block text-sm font-bold mb-1 text-blue-800">NK-Zeitraum Ende (optional)</label>
                                <input type="date" id="nk-period-end" class="w-full border rounded p-2 text-sm bg-white">
                            </div>
                        </div>
                        <div class="mt-4 flex flex-col md:flex-row gap-3">
                            <button onclick="ImmoApp.utilities.bulkDownloadNkDocxForProperty()" class="w-full md:w-auto bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg shadow hover:bg-indigo-700">
                                🧾 NK-Abrechnungen (DOCX) für alle Mieter dieses Objekts
                            </button>
                            <button onclick="ImmoApp.utilities.bulkDownloadLettersDocxForProperty()" class="w-full md:w-auto bg-blue-600 text-white font-bold py-2 px-4 rounded-lg shadow hover:bg-blue-700">
                                📄 Anschreiben (DOCX) für alle Mieter dieses Objekts
                            </button>
                            <p class="text-xs text-blue-700 md:pt-2">
                                Hinweis: Lädt mehrere Dateien nacheinander herunter (Browser-Download-Popups ggf. erlauben).
                            </p>
                        </div>
                    </div>

                    <div id="statement-preview-container" class="hidden">
                        <div class="flex flex-col sm:flex-row justify-end gap-2 mb-4">
                            <button onclick="ImmoApp.utilities.downloadWord()" class="w-full sm:w-auto bg-indigo-600 text-white px-4 py-2 rounded-lg font-bold shadow hover:bg-indigo-700">💾 Als Word (.doc)</button>
                            <button onclick="ImmoApp.utilities.downloadPDF()" class="w-full sm:w-auto bg-red-600 text-white px-4 py-2 rounded-lg font-bold shadow hover:bg-red-700">🖨️ Als PDF</button>
                        </div>
                        <div id="statement-doc" class="bg-white border border-gray-200 rounded-xl p-12 shadow-lg mx-auto" style="max-width: 840px; color: #111827; font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.55;"></div>
                    </div>
                </div>

                <div id="modal-wg-check" class="fixed inset-0 bg-black bg-opacity-50 hidden flex items-center justify-center z-50 overflow-y-auto">
                    <div class="bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl my-8">
                        <div class="flex justify-between items-center mb-6">
                            <h3 class="text-xl font-bold">Detail-Aufschlüsselung: <span class="year-label"></span></h3>
                            <button onclick="document.getElementById('modal-wg-check').classList.add('hidden')" class="text-gray-500 hover:text-gray-800 font-bold text-xl">&times;</button>
                        </div>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div class="flex flex-col min-h-0">
                                <h4 class="font-bold text-blue-800 border-b-2 border-blue-200 pb-2 mb-3">Welche Mieter haben bezahlt?</h4>
                                <ul id="wg-check-income-list" class="space-y-3 text-sm overflow-y-auto max-h-72 min-h-0 pr-2 border border-blue-100 rounded"></ul>
                                <div class="mt-4 pt-3 border-t-2 border-blue-800 flex justify-between font-bold text-blue-800 text-lg flex-shrink-0">
                                    <span>Summe Einnahmen:</span>
                                    <span id="wg-check-income-sum">0,00 €</span>
                                </div>
                            </div>
                            <div class="flex flex-col min-h-0">
                                <h4 class="font-bold text-orange-800 border-b-2 border-orange-200 pb-2 mb-3">Welche Rechnungen fielen an?</h4>
                                <ul id="wg-check-costs-list" class="space-y-3 text-sm overflow-y-auto max-h-72 min-h-0 pr-2 border border-orange-100 rounded"></ul>
                                <div class="mt-4 pt-3 border-t-2 border-orange-800 flex justify-between font-bold text-orange-800 text-lg flex-shrink-0">
                                    <span>Summe Ausgaben:</span>
                                    <span id="wg-check-costs-sum">0,00 €</span>
                                </div>
                            </div>
                        </div>
                        <div class="mt-8 flex justify-end">
                            <button onclick="document.getElementById('modal-wg-check').classList.add('hidden')" class="px-6 py-2 bg-gray-200 text-gray-800 font-bold rounded hover:bg-gray-300">Schließen</button>
                        </div>
                    </div>
                </div>
            `;
            ImmoApp.ui.updateYearLabels();
        }
    },

    switchTab: function(tab) {
        document.getElementById("util-view-costs").classList.add("hidden");
        document.getElementById("util-view-export").classList.add("hidden");
        document.getElementById("tab-util-costs").className = "px-6 py-3 font-bold text-gray-500 hover:text-blue-600";
        document.getElementById("tab-util-export").className = "px-6 py-3 font-bold text-gray-500 hover:text-blue-600";

        if(tab === 'costs') {
            document.getElementById("util-view-costs").classList.remove("hidden");
            document.getElementById("tab-util-costs").className = "px-6 py-3 font-bold text-blue-600 border-b-2 border-blue-600";
            this.renderCosts();
        } else {
            document.getElementById("util-view-export").classList.remove("hidden");
            document.getElementById("tab-util-export").className = "px-6 py-3 font-bold text-blue-600 border-b-2 border-blue-600";
            this.setupExportTab();
        }
    },

    getUtilityAssignmentRules: async function() {
        const db = ImmoApp.db.instance;
        const r = await db.settings.get("utilityAssignmentRules");
        try { return r && r.value ? JSON.parse(r.value) : {}; } catch (e) { return {}; }
    },

    saveUtilityAssignmentRule: async function(namePart, update) {
        const db = ImmoApp.db.instance;
        const rules = await this.getUtilityAssignmentRules();
        namePart = (namePart || "").trim();
        if (!namePart) return;
        rules[namePart] = rules[namePart] || {};
        if (update.propertyId !== undefined) rules[namePart].propertyId = update.propertyId;
        if (update.category !== undefined) rules[namePart].category = update.category;
        if (update.splitKey !== undefined) rules[namePart].splitKey = update.splitKey;
        await db.settings.put({ key: "utilityAssignmentRules", value: JSON.stringify(rules) });
    },

    applyRulesToUtility: async function(u) {
        const namePart = (u.name || "").split(' - ')[0].trim() || (u.name || "").trim();
        if (!namePart) return u;
        const rules = await this.getUtilityAssignmentRules();
        const rule = rules[namePart];
        if (!rule) return u;
        const db = ImmoApp.db.instance;
        const upd = {};
        if ((u.propertyId == null || u.propertyId === '') && rule.propertyId != null) upd.propertyId = rule.propertyId;
        if ((!u.category || u.category === '') && rule.category) upd.category = rule.category;
        if ((!u.splitKey || u.splitKey === '') && rule.splitKey) upd.splitKey = rule.splitKey;
        if (Object.keys(upd).length) {
            await db.utilities.update(u.id, upd);
            u = { ...u, ...upd };
        }
        return u;
    },

    updateUtil: async function(utilId, field, value) {
        const db = ImmoApp.db.instance;
        let updateData = {};
        if(field === 'propertyId') updateData.propertyId = value ? parseInt(value) : null;
        if(field === 'category') updateData.category = value;
        if(field === 'splitKey') updateData.splitKey = value;
        await db.utilities.update(utilId, updateData);
        const util = await db.utilities.get(utilId);
        if (util && util.name) {
            const namePart = (util.name || "").split(' - ')[0].trim();
            await this.saveUtilityAssignmentRule(namePart, updateData);
        }
        this.renderCosts();
    },

    addManualUtility: async function() {
        const db = ImmoApp.db.instance;
        const currentYear = ImmoApp.ui.currentYear;

        const dateInput = document.getElementById("util-man-date");
        const nameInput = document.getElementById("util-man-name");
        const amountInput = document.getElementById("util-man-amount");

        const rawDate = dateInput?.value || "";
        const name = (nameInput?.value || "").trim();
        const amountStr = amountInput?.value || "";

        if (!name || !amountStr) {
            alert("Bitte mindestens einen Rechnungstext und einen Betrag eingeben.");
            return;
        }

        const amount = parseFloat(amountStr.replace(',', '.'));
        if (isNaN(amount) || amount <= 0) {
            alert("Bitte einen gültigen Betrag größer 0 eingeben.");
            return;
        }

        // Datum in deutsches Format TT.MM.JJ/JJJJ umwandeln, falls gesetzt
        let prettyDate = "";
        if (rawDate) {
            const d = new Date(rawDate);
            if (!isNaN(d.getTime())) {
                const dd = String(d.getDate()).padStart(2, '0');
                const mm = String(d.getMonth() + 1).padStart(2, '0');
                const yy = String(d.getFullYear()).slice(-2);
                prettyDate = `${dd}.${mm}.${yy}`;
            }
        }

        const fullName = prettyDate ? `${name} - ${prettyDate}` : name;

        const newId = await db.utilities.add({
            name: fullName,
            amount: amount,
            year: currentYear,
            importBatchId: 'manual',
            propertyId: null
        });
        let newUtil = await db.utilities.get(newId);
        if (newUtil) {
            newUtil = await this.applyRulesToUtility(newUtil);
        }

        if (dateInput) dateInput.value = "";
        if (nameInput) nameInput.value = "";
        if (amountInput) amountInput.value = "";

        this.renderCosts();
    },

    renderCosts: async function() {
        const db = ImmoApp.db.instance;
        const currentYear = ImmoApp.ui.currentYear;
        
        const props = await db.properties.toArray();
        const propSelect = document.getElementById("util-prop-select");
        const currentSelection = propSelect.value;
        
        propSelect.innerHTML = `<option value="ALL">-- Alle Objekte / Gesamtübersicht --</option>`;
        props.forEach(p => {
            propSelect.innerHTML += `<option value="${p.id}" ${currentSelection == p.id ? 'selected' : ''}>${p.name}</option>`;
        });

        let utils = await db.utilities.where('year').equals(currentYear).toArray();
        for (let i = 0; i < utils.length; i++) {
            utils[i] = await this.applyRulesToUtility(utils[i]);
        }
        let allTenants = await db.tenants.toArray();
        const allTxForYear = await db.transactions.where('year').equals(currentYear).toArray();

        // Nur solche Utilities berücksichtigen, die noch eine aktive UTILITY-Buchung haben
        // oder manuell erfasst wurden (importBatchId === 'manual')
        utils = utils.filter(u => {
            if (u.importBatchId === 'manual') return true;
            const hasTx = allTxForYear.some(tx => 
                tx.category === 'UTILITY' &&
                tx.year === u.year &&
                Math.abs(tx.amount) === u.amount &&
                (tx.name + ' - ' + tx.purpose) === u.name
            );
            return hasTx;
        });

        // Wenn ein spezielles Objekt gewählt ist, filtere!
        if(currentSelection && currentSelection !== "ALL") {
            const pid = parseInt(currentSelection);
            utils = utils.filter(u => u.propertyId === pid);
            allTenants = allTenants.filter(t => t.propertyId === pid);
        }

        // === DER WG CHECK BEREICH (Inkl. Aufschlüsselung) ===
        let totalIncome = 0;
        let totalCosts = 0;
        let incomeHtml = "";
        let costsHtml = "";

        // 1. Einnahmen durch Pauschalen berechnen & aufschlüsseln
        const getPrepaymentForMonth = (tenant, year, monthIndex) => {
            const checkDate = new Date(year, monthIndex, 15);
            const moveIn = tenant.moveIn ? new Date(tenant.moveIn) : new Date(2000, 0, 1);
            const moveOut = tenant.moveOut ? new Date(tenant.moveOut) : new Date(2099, 11, 31);
            if (checkDate < moveIn || checkDate > moveOut) return 0;
            const history = Array.isArray(tenant.rentHistory) ? tenant.rentHistory : null;
            if (!history || history.length === 0) return tenant.prepayment || 0;
            let best = null;
            history.forEach(h => {
                if (!h.from) return;
                const d = new Date(h.from);
                if (d <= checkDate) {
                    if (!best || d > new Date(best.from)) best = h;
                }
            });
            return best ? (best.prepayment || 0) : (tenant.prepayment || 0);
        };

        allTenants.forEach(t => {
            let tenantSum = 0;
            for (let m = 0; m < 12; m++) {
                tenantSum += getPrepaymentForMonth(t, parseInt(currentYear, 10), m);
            }
            if (tenantSum > 0) {
                totalIncome += tenantSum;
                incomeHtml += `
                    <li class="flex flex-col border-b border-gray-100 pb-2">
                        <div class="flex justify-between items-center">
                            <span class="font-bold text-gray-800">${t.name}</span>
                            <span class="font-bold text-blue-600">${ImmoApp.ui.formatCurrency(tenantSum)}</span>
                        </div>
                        <span class="text-xs text-gray-500">Vorauszahlungen nach aktuellem Stand (inkl. Anpassungen)</span>
                    </li>
                `;
            }
        });

        // 2. Kosten durch Stadtwerke etc. berechnen & aufschlüsseln
        utils.forEach(u => {
            totalCosts += u.amount;
            costsHtml += `
                <li class="flex flex-col border-b border-gray-100 pb-2">
                    <div class="flex justify-between items-start gap-4">
                        <span class="font-bold text-gray-800 break-words w-2/3">${u.name.split(' - ')[0]}</span>
                        <span class="font-bold text-orange-600 whitespace-nowrap">${ImmoApp.ui.formatCurrency(u.amount)}</span>
                    </div>
                    <span class="text-xs text-gray-500 block truncate" title="${u.name}">${u.name.split(' - ')[1] || 'Kein Verwendungszweck'}</span>
                </li>
            `;
        });

        if (!incomeHtml) incomeHtml = `<li class="text-gray-500 italic">Es wurden bei keinem Mieter Nebenkosten-Pauschalen hinterlegt.</li>`;
        if (!costsHtml) costsHtml = `<li class="text-gray-500 italic">Es wurden unten noch keine Rechnungen erfasst.</li>`;

        // Aufschlüsselungs-Modal befüllen
        document.getElementById("wg-check-income-list").innerHTML = incomeHtml;
        document.getElementById("wg-check-costs-list").innerHTML = costsHtml;
        document.getElementById("wg-check-income-sum").innerText = ImmoApp.ui.formatCurrency(totalIncome);
        document.getElementById("wg-check-costs-sum").innerText = ImmoApp.ui.formatCurrency(totalCosts);

        // Dashboard Werte setzen
        const diff = totalIncome - totalCosts;
        document.getElementById("wg-check-income").innerText = ImmoApp.ui.formatCurrency(totalIncome);
        document.getElementById("wg-check-costs").innerText = ImmoApp.ui.formatCurrency(totalCosts);
        
        const resultEl = document.getElementById("wg-check-result");
        const resultBox = document.getElementById("wg-check-result-box");
        const resultText = document.getElementById("wg-check-result-text");
        
        resultEl.innerText = ImmoApp.ui.formatCurrency(diff);
        
        if (diff > 0) {
            resultEl.className = "text-3xl font-bold text-green-600";
            resultBox.className = "p-6 rounded-lg shadow-sm border border-green-200 bg-green-50 flex flex-col justify-between";
            resultText.innerText = "Super! Deine NK-Pauschalen decken die Kosten.";
            resultText.className = "text-xs mt-1 text-green-700 font-bold";
        } else if (diff < 0) {
            resultEl.className = "text-3xl font-bold text-red-600";
            resultBox.className = "p-6 rounded-lg shadow-sm border border-red-200 bg-red-50 flex flex-col justify-between";
            resultText.innerText = "Achtung: Du machst Verlust! Pauschalen erhöhen?";
            resultText.className = "text-xs mt-1 text-red-700 font-bold";
        } else {
            resultEl.className = "text-3xl font-bold text-gray-800";
            resultBox.className = "p-6 rounded-lg shadow-sm border border-gray-200 bg-white flex flex-col justify-between";
            resultText.innerText = "Genau ausgeglichen.";
        }
        // =================================


        const tbody = document.getElementById("utilities-table-body");
        const cards = document.getElementById("utilities-cards");
        tbody.innerHTML = "";
        if (cards) cards.innerHTML = "";
        
        if (utils.length === 0) {
            tbody.innerHTML = `<tr><td colspan="4" class="px-4 py-8 text-center text-gray-500 italic">Keine Nebenkosten-Buchungen gefunden.</td></tr>`;
            if (cards) cards.innerHTML = `<div class="bg-white border border-gray-100 rounded-xl p-4 text-center text-gray-500 italic text-sm">Keine Nebenkosten-Buchungen gefunden.</div>`;
            return;
        }

        const categories = [
            {val: "Grundsteuer", label: "Grundsteuer"},
            {val: "Wasser/Abwasser", label: "Wasser / Abwasser"},
            {val: "Heizung/Warmwasser", label: "Heizung / Warmwasser"},
            {val: "Müllabfuhr", label: "Müllabfuhr / Straßenreingung"},
            {val: "Gebäudeversicherung", label: "Gebäudeversicherung"},
            {val: "Allgemeinstrom", label: "Allgemeinstrom / Beleuchtung"},
            {val: "Telekommunikation", label: "Internet / Telekom / GEZ"},
            {val: "Hausmeister/Garten", label: "Hausmeister / Reinigung"},
            {val: "Sonstiges", label: "Sonstige Betriebskosten"}
        ];

        const splitKeys = [
            {val: "WG", label: "Pauschale/WG (Keine Verteilung)"},
            {val: "PERSONS", label: "Nach Personen (Köpfe)"},
            {val: "SQM", label: "Nach Wohnfläche (m²)"},
            {val: "UNITS", label: "Nach Wohneinheit (pauschal)"},
            {val: "DIRECT", label: "100% Direktzuweisung"}
        ];

        utils.forEach(u => {
            let propOpts = `<option value="">-- Objekt wählen! --</option>`;
            props.forEach(p => propOpts += `<option value="${p.id}" ${u.propertyId === p.id ? 'selected' : ''}>${p.name}</option>`);
            const propColor = !u.propertyId ? 'border-orange-400 bg-orange-50' : 'bg-white';

            let catOpts = `<option value="">-- Kategorie --</option>`;
            categories.forEach(c => catOpts += `<option value="${c.val}" ${u.category === c.val ? 'selected' : ''}>${c.label}</option>`);
            
            let keyOpts = `<option value="">-- Schlüssel --</option>`;
            splitKeys.forEach(k => keyOpts += `<option value="${k.val}" ${u.splitKey === k.val ? 'selected' : ''}>${k.label}</option>`);

            const catColor = (!u.category || !u.splitKey) ? 'border-red-300 bg-red-50' : 'bg-white';

            tbody.innerHTML += `
                <tr class="hover:bg-gray-50 border-b">
                    <td class="px-4 py-3 align-top">
                        <span class="font-bold text-gray-800 block">${u.name.split(' - ')[0]}</span>
                        <span class="text-xs text-gray-500 truncate block max-w-xs" title="${u.name}">${u.name.split(' - ')[1] || ''}</span>
                    </td>
                    <td class="px-4 py-3 text-right font-bold text-gray-800 align-top">${ImmoApp.ui.formatCurrency(u.amount)}</td>
                    <td class="px-4 py-3 align-top">
                        <select onchange="ImmoApp.utilities.updateUtil(${u.id}, 'propertyId', this.value)" class="border rounded p-1 text-xs w-full ${propColor}">
                            ${propOpts}
                        </select>
                    </td>
                    <td class="px-4 py-3 align-top flex gap-2">
                        <select onchange="ImmoApp.utilities.updateUtil(${u.id}, 'category', this.value)" class="border rounded p-1 text-xs w-1/2 ${catColor}">
                            ${catOpts}
                        </select>
                        <select onchange="ImmoApp.utilities.updateUtil(${u.id}, 'splitKey', this.value)" class="border rounded p-1 text-xs w-1/2 ${catColor}">
                            ${keyOpts}
                        </select>
                    </td>
                </tr>
            `;

            if (cards) {
                cards.innerHTML += `
                    <div class="bg-white border border-gray-100 rounded-xl shadow-sm p-3">
                        <div class="flex justify-between items-start gap-3">
                            <div class="min-w-0">
                                <div class="font-bold text-gray-800 break-words">${u.name.split(' - ')[0]}</div>
                                <div class="text-xs text-gray-500 mt-0.5 break-words">${u.name.split(' - ')[1] || ''}</div>
                            </div>
                            <div class="text-sm font-bold text-gray-800 whitespace-nowrap">${ImmoApp.ui.formatCurrency(u.amount)}</div>
                        </div>
                        <div class="mt-3">
                            <label class="block text-[11px] font-bold text-gray-500 mb-1">Objekt-Zuweisung</label>
                            <select onchange="ImmoApp.utilities.updateUtil(${u.id}, 'propertyId', this.value)" class="border rounded p-2 text-xs w-full ${propColor}">
                                ${propOpts}
                            </select>
                        </div>
                        <div class="mt-3 grid grid-cols-1 gap-2">
                            <div>
                                <label class="block text-[11px] font-bold text-gray-500 mb-1">Kategorie</label>
                                <select onchange="ImmoApp.utilities.updateUtil(${u.id}, 'category', this.value)" class="border rounded p-2 text-xs w-full ${catColor}">
                                    ${catOpts}
                                </select>
                            </div>
                            <div>
                                <label class="block text-[11px] font-bold text-gray-500 mb-1">Schlüssel</label>
                                <select onchange="ImmoApp.utilities.updateUtil(${u.id}, 'splitKey', this.value)" class="border rounded p-2 text-xs w-full ${catColor}">
                                    ${keyOpts}
                                </select>
                            </div>
                        </div>
                    </div>
                `;
            }
        });
    },

    setupExportTab: async function() {
        const db = ImmoApp.db.instance;
        const props = await db.properties.toArray();
        const propSelect = document.getElementById("export-prop-select");
        propSelect.innerHTML = `<option value="">-- Bitte wählen --</option>`;
        props.forEach(p => {
            propSelect.innerHTML += `<option value="${p.id}">${p.name}</option>`;
        });
    },

    loadTenantsForExport: async function() {
        const propId = document.getElementById("export-prop-select").value;
        const tenantSelect = document.getElementById("export-tenant-select");
        
        if(!propId) {
            tenantSelect.innerHTML = `<option value="">-- Zuerst Objekt wählen --</option>`;
            tenantSelect.disabled = true;
            return;
        }

        const db = ImmoApp.db.instance;
        const currentYear = ImmoApp.ui.currentYear;
        const tenants = await db.tenants.where('propertyId').equals(parseInt(propId)).toArray();
        const activeTenants = tenants.filter(t => ImmoApp.utils.getActiveMonthsInYear(t.moveIn, t.moveOut, currentYear) > 0);

        tenantSelect.innerHTML = `<option value="">-- Mieter wählen --</option>`;
        activeTenants.forEach(t => {
            const flatWarn = t.isFlatRate ? " (Pauschalmiete - Abrechnung nicht nötig)" : "";
            tenantSelect.innerHTML += `<option value="${t.id}">${t.name} ${t.room ? '['+t.room+']' : ''}${flatWarn}</option>`;
        });
        tenantSelect.disabled = false;
    },

    bulkDownloadNkDocxForProperty: async function() {
        const propIdStr = document.getElementById("export-prop-select")?.value || "";
        const propId = parseInt(propIdStr, 10);
        if (!propId) {
            alert("Bitte zuerst ein Objekt wählen (Tab 2: Abrechnungen generieren).");
            return;
        }
        if (!window.ImmoApp || !ImmoApp.tenants || !ImmoApp.tenants.downloadUtilitiesDocx) {
            alert("Mieter-Modul ist nicht geladen (DOCX-Funktion fehlt). Bitte Seite neu laden.");
            return;
        }

        const db = ImmoApp.db.instance;
        const year = ImmoApp.ui.currentYear;
        const nkStartISO = document.getElementById("nk-period-start")?.value || "";
        const nkEndISO = document.getElementById("nk-period-end")?.value || "";
        const parseISODate = (s) => {
            if (!s) return null;
            const parts = String(s).split("-");
            if (parts.length !== 3) return null;
            const y = parseInt(parts[0], 10);
            const m = parseInt(parts[1], 10);
            const d = parseInt(parts[2], 10);
            if (!Number.isFinite(y) || !Number.isFinite(m) || !Number.isFinite(d)) return null;
            return new Date(y, m - 1, d);
        };
        const periodStart = parseISODate(nkStartISO);
        const periodEnd = parseISODate(nkEndISO);
        const usePeriod = !!(periodStart && periodEnd);

        const property = await db.properties.get(propId);
        const tenants = await db.tenants.where('propertyId').equals(propId).toArray();
        const msDay = 24 * 60 * 60 * 1000;
        const activeTenants = usePeriod
            ? tenants.filter(t => {
                if (t.isFlatRate) return false;
                const moveIn = t.moveIn ? new Date(t.moveIn) : new Date(0);
                const moveOut = t.moveOut ? new Date(t.moveOut) : new Date(8640000000000000);
                const from = moveIn > periodStart ? moveIn : periodStart;
                const to = moveOut < periodEnd ? moveOut : periodEnd;
                const days = (to > from) ? Math.round((to - from) / msDay) : 0;
                return days > 0;
            })
            : tenants.filter(t => ImmoApp.utils.getActiveMonthsInYear(t.moveIn, t.moveOut, year) > 0 && !t.isFlatRate);

        if (activeTenants.length === 0) {
            alert("Keine aktiven (nicht-pausschalen) Mieter für dieses Objekt im gewählten Jahr gefunden.");
            return;
        }

        if (!confirm(`Sollen ${activeTenants.length} DOCX-Dateien für "${property ? property.name : ('Objekt #' + propId)}" erzeugt und heruntergeladen werden?`)) {
            return;
        }

        // Kurzer Delay zwischen Downloads, damit Browser nicht blockiert
        const sleep = (ms) => new Promise(r => setTimeout(r, ms));
        for (const t of activeTenants) {
            try {
                await ImmoApp.tenants.downloadUtilitiesDocx(t.id, null, null, null, null, nkStartISO, nkEndISO);
                await sleep(600);
            } catch (e) {
                console.error("Fehler beim DOCX-Export für", t, e);
            }
        }
        alert("Fertig: DOCX-Abrechnungen wurden gestartet. Falls Downloads blockiert wurden, bitte im Browser erlauben und erneut klicken.");
    },

    bulkDownloadLettersDocxForProperty: async function() {
        const propIdStr = document.getElementById("export-prop-select")?.value || "";
        const propId = parseInt(propIdStr, 10);
        if (!propId) {
            alert("Bitte zuerst ein Objekt wählen (Tab 2: Abrechnungen generieren).");
            return;
        }
        if (!window.ImmoApp || !ImmoApp.tenants || !ImmoApp.tenants.downloadLetterDocx) {
            alert("Mieter-Modul ist nicht geladen (DOCX-Funktion fehlt). Bitte Seite neu laden.");
            return;
        }

        const db = ImmoApp.db.instance;
        const year = ImmoApp.ui.currentYear;
        const property = await db.properties.get(propId);
        const tenants = await db.tenants.where('propertyId').equals(propId).toArray();
        const activeTenants = tenants.filter(t => ImmoApp.utils.getActiveMonthsInYear(t.moveIn, t.moveOut, year) > 0);

        if (activeTenants.length === 0) {
            alert("Keine aktiven Mieter für dieses Objekt im gewählten Jahr gefunden.");
            return;
        }

        const subject = `Anschreiben ${year} – ${property ? property.name : ('Objekt #' + propId)}`;
        const body = `Sehr geehrte Damen und Herren,\n\nhiermit erhalten Sie ein Anschreiben der Hausverwaltung.\n\nMit freundlichen Grüßen\n__________________________`;

        if (!confirm(`Sollen ${activeTenants.length} DOCX-Dateien (Anschreiben) für "${property ? property.name : ('Objekt #' + propId)}" erzeugt und heruntergeladen werden?`)) {
            return;
        }

        const sleep = (ms) => new Promise(r => setTimeout(r, ms));
        for (const t of activeTenants) {
            try {
                await ImmoApp.tenants.downloadLetterDocx(t.id, subject, body);
                await sleep(600);
            } catch (e) {
                console.error("Fehler beim Anschreiben-DOCX für", t, e);
            }
        }
        alert("Fertig: Anschreiben-DOCX Downloads wurden gestartet. Falls Downloads blockiert wurden, bitte im Browser erlauben und erneut klicken.");
    },

    generateStatementPreview: async function() {
        try {
            const propEl = document.getElementById("export-prop-select");
            const tenantEl = document.getElementById("export-tenant-select");
            const propId = parseInt(propEl?.value || "", 10);
            const tenantId = parseInt(tenantEl?.value || "", 10);
            if(!Number.isFinite(propId) || !Number.isFinite(tenantId)) {
                alert("Bitte Objekt und Mieter auswählen!");
                return;
            }

            const db = ImmoApp.db.instance;
            const currentYear = ImmoApp.ui.currentYear;

            const periodStartInput = document.getElementById("nk-period-start")?.value || "";
            const periodEndInput = document.getElementById("nk-period-end")?.value || "";

            const parseDateInput = (s) => {
                if(!s) return null;
                const parts = String(s).split("-");
                if(parts.length !== 3) return null;
                const y = parseInt(parts[0], 10);
                const m = parseInt(parts[1], 10);
                const d = parseInt(parts[2], 10);
                if(!Number.isFinite(y) || !Number.isFinite(m) || !Number.isFinite(d)) return null;
                return new Date(y, m - 1, d);
            };

            let periodStart = parseDateInput(periodStartInput);
            let periodEnd = parseDateInput(periodEndInput);
            const fallbackYear = parseInt(currentYear, 10);
            if(!periodStart || !periodEnd) {
                periodStart = new Date(fallbackYear, 0, 1);
                periodEnd = new Date(fallbackYear, 11, 31);
            }
            if(periodEnd < periodStart) {
                alert("NK-Zeitraum: Start-Datum muss vor dem End-Datum liegen.");
                return;
            }

            const formatDE = (dt) => {
                const day = String(dt.getDate()).padStart(2, '0');
                const mon = String(dt.getMonth() + 1).padStart(2, '0');
                const yr = dt.getFullYear();
                return `${day}.${mon}.${yr}`;
            };

            const periodLabel = `${formatDE(periodStart)} - ${formatDE(periodEnd)}`;

            const startYear = periodStart.getFullYear();
            const endYear = periodEnd.getFullYear();
            const yearsToInclude = [];
            for(let y = startYear; y <= endYear; y++) yearsToInclude.push(String(y));

            const property = await db.properties.get(propId);
            const targetTenant = await db.tenants.get(tenantId);

            const sender = (ImmoApp.settings && ImmoApp.settings.getSenderConfig) ? await ImmoApp.settings.getSenderConfig() : {};
            const senderLines = [sender.name, sender.street, [sender.zip, sender.city].filter(Boolean).join(' '), sender.country].filter(Boolean);
            const safeSenderLinesHtml = senderLines.map(l => (l || '').replace(/</g, '&lt;')).join('<br>');
            const logoBlock = sender.logoDataUrl
                ? `<div style="display:flex;justify-content:flex-start;margin-bottom:10px;">
                        <img src="${sender.logoDataUrl}" alt="Logo" style="max-height:60px;max-width:220px;object-fit:contain;">
                   </div>`
                : '';
            const senderBlock = (logoBlock || senderLines.length > 0)
                ? `<div style="font-size:12px;color:#374151;line-height:1.4;margin-bottom:10px;">${logoBlock}${safeSenderLinesHtml}</div>`
                : '';
            const footerText = (sender.footer || '').trim();
            const footerBlock = `<div id="statement-footer" contenteditable="true" style="outline:none;white-space:pre-line;margin-top:18px;padding-top:10px;border-top:1px solid #e5e7eb;font-size:11px;color:#6b7280;">${(footerText || '').replace(/</g,'&lt;')}</div>`;

            if(targetTenant?.isFlatRate) {
                // Pauschal-Texte sind aktuell kalenderjahr-basiert; wir nutzen das aktuelle UI-Jahr.
                await this.generateFlatRateStatement(targetTenant, property, currentYear);
                return;
            }

        // Kosten & Mieter fürs Objekt laden (über mehrere Jahre im Zeitraum)
        const allUtils = [];
        for(const yStr of yearsToInclude) {
            const arr = await db.utilities.where('year').equals(yStr).filter(u => u.propertyId === propId).toArray();
            allUtils.push(...arr);
        }
        const allTenants = await db.tenants.where('propertyId').equals(propId).toArray();

        const uncategorized = allUtils.filter(u => !u.category || !u.splitKey);
        if(uncategorized.length > 0) {
            alert(`Achtung: Es gibt ${uncategorized.length} Kostenpunkte ohne Kategorie oder Schlüssel! Gehe zu Tab 1 und trage diese nach.`);
            return;
        }

        const normSqm = (v) => {
            const n = parseFloat(v);
            return Number.isFinite(n) && n > 0 ? n : 1;
        };
        const normPersons = (v) => {
            const n = parseInt(v, 10);
            return Number.isFinite(n) && n > 0 ? n : 1;
        };
        const msDay = 24 * 60 * 60 * 1000;
        const calcOverlapDaysInYear = (t, yearNum) => {
            const mi = t.moveIn ? new Date(t.moveIn) : new Date(0);
            const mo = t.moveOut ? new Date(t.moveOut) : new Date(8640000000000000);
            const yStart = new Date(yearNum, 0, 1);
            const yEnd = new Date(yearNum, 11, 31);
            const from = new Date(Math.max(yStart.getTime(), periodStart.getTime(), mi.getTime()));
            const to = new Date(Math.min(yEnd.getTime(), periodEnd.getTime(), mo.getTime()));
            return to > from ? Math.round((to - from) / msDay) : 0;
        };

        const getActiveMonthsInPeriodForTenantYear = (t, yearNum) => {
            // ImmoApp.utils.getActiveMonthsInYear() liefert hier nur eine Monatsanzahl,
            // aber wir brauchen für die weitere Logik die konkreten Monate (für .length).
            const mi = t.moveIn ? new Date(t.moveIn) : new Date(0);
            const mo = t.moveOut ? new Date(t.moveOut) : new Date(8640000000000000);
            const months = [];
            for(let mIdx = 0; mIdx < 12; mIdx++) {
                const check = new Date(yearNum, mIdx, 15);
                if(check < mi || check > mo) continue; // nicht in Mietzeit
                if(check < periodStart || check > periodEnd) continue; // nicht im NK-Zeitraum
                months.push(mIdx);
            }
            return months;
        };

        const categoryAmountTotal = {};
        const categoryMyShareTotal = {};
        let totalTenantCost = 0;
        let totalTargetMonths = 0;

        for(const yStr of yearsToInclude) {
            const yearNum = parseInt(yStr, 10);
            const yearUtils = allUtils.filter(u => String(u.year) === yStr);

            const yearGroupedUtils = {};
            yearUtils.forEach(u => {
                if(!yearGroupedUtils[u.category]) yearGroupedUtils[u.category] = { amount: 0, key: u.splitKey };
                yearGroupedUtils[u.category].amount += u.amount;
            });

            // Gewichte für Schlüssel innerhalb des Jahres (aber nur im gewählten Zeitraum)
            let totalSqmDays = 0, totalPersonDays = 0, totalUnitDays = 0;
            const activeTenants = allTenants.map(t => ({ ...t }))
                .filter(t => getActiveMonthsInPeriodForTenantYear(t, yearNum).length > 0);

            activeTenants.forEach(t => {
                const days = calcOverlapDaysInYear(t, yearNum);
                if(days <= 0) return;
                totalSqmDays += normSqm(t.sqm) * days;
                totalPersonDays += normPersons(t.persons) * days;
                totalUnitDays += 1 * days;
            });

            const targetMonthsYear = getActiveMonthsInPeriodForTenantYear(targetTenant, yearNum).length;
            totalTargetMonths += targetMonthsYear;
            const expectedPrepaymentYearFactor = targetMonthsYear;

            // Kosten (aus dem Jahr) auf den Mieter umlegen
            const targetDays = calcOverlapDaysInYear(targetTenant, yearNum);
            for(const [category, data] of Object.entries(yearGroupedUtils)) {
                let myShare = 0;
                if (data.key === 'WG') {
                    continue;
                } else if (data.key === 'DIRECT') {
                    myShare = 0;
                } else if (data.key === 'SQM') {
                    const mySqmDays = normSqm(targetTenant.sqm) * targetDays;
                    const fraction = mySqmDays / (totalSqmDays || 1);
                    myShare = data.amount * fraction;
                } else if (data.key === 'PERSONS') {
                    const myPersonDays = normPersons(targetTenant.persons) * targetDays;
                    const fraction = myPersonDays / (totalPersonDays || 1);
                    myShare = data.amount * fraction;
                } else if (data.key === 'UNITS') {
                    const myUnitDays = 1 * targetDays;
                    const fraction = myUnitDays / (totalUnitDays || 1);
                    myShare = data.amount * fraction;
                }

                if(!categoryAmountTotal[category]) categoryAmountTotal[category] = 0;
                if(!categoryMyShareTotal[category]) categoryMyShareTotal[category] = 0;
                categoryAmountTotal[category] += data.amount;
                categoryMyShareTotal[category] += myShare;
                totalTenantCost += myShare;
            }
        }

        const expectedPrepayment = (parseFloat(targetTenant.prepayment) || 0) * totalTargetMonths;
        const balance = expectedPrepayment - totalTenantCost;
        let balanceText = balance >= 0
            ? `<span style="color: green;">Ihr Guthaben beträgt: <b>${ImmoApp.ui.formatCurrency(balance)}</b></span>`
            : `<span style="color: red;">Ihre Nachzahlung beträgt: <b>${ImmoApp.ui.formatCurrency(Math.abs(balance))}</b></span>`;

        const today = new Date().toLocaleDateString('de-DE');
        const placeStr = (sender.place || sender.city || '').trim();
        const placeDate = placeStr ? `${placeStr}, ${today}` : today;

        const paymentDefault = `Zahlungshinweise (editierbar):\n- Nachzahlung bitte innerhalb von 14 Tagen überweisen (falls Nachzahlung).\n- Ein Guthaben wird erstattet oder mit der nächsten Zahlung verrechnet (falls Guthaben).\n- Verwendungszweck: Nebenkosten ${periodLabel} – ${targetTenant.name}\n- Bankverbindung: _______________________`;

        // Tabelle bauen (mit Anteil in %)
        let tableRows = '';
        const categories = Object.keys(categoryAmountTotal).sort((a,b)=>a.localeCompare(b));
        for(const category of categories) {
            const amountTotal = categoryAmountTotal[category] || 0;
            const myShareTotal = categoryMyShareTotal[category] || 0;
            const sharePercent = amountTotal ? (myShareTotal / amountTotal * 100) : 0;
            tableRows += `
                <tr style="border-bottom: 1px solid #ddd;">
                    <td style="padding: 8px;">${category}</td>
                    <td style="padding: 8px; text-align: right;">${ImmoApp.ui.formatCurrency(amountTotal)}</td>
                    <td style="padding: 8px; text-align: center;">${sharePercent.toFixed(2).replace('.', ',')} %</td>
                    <td style="padding: 8px; text-align: right; font-weight: bold;">${ImmoApp.ui.formatCurrency(myShareTotal)}</td>
                </tr>
            `;
        }

        const docHTML = `
            ${senderBlock}
            <div style="margin-bottom: 40px;">
                <div style="font-size:12px;color:#374151;font-weight:700;margin-bottom:6px;">Betreff (editierbar):</div>
                <div id="statement-subject" contenteditable="true" style="outline:none;border:1px dashed #c7d2fe;background:#eef2ff;border-radius:6px;padding:8px;font-size:12px;color:#312e81;margin-bottom:10px;">Nebenkostenabrechnung ${periodLabel} – ${property.name} – ${targetTenant.name}</div>
                <h1 style="font-size: 24px; color: #333; margin-bottom: 5px;">Nebenkostenabrechnung ${periodLabel}</h1>
                <p style="color: #777; margin-top: 0;">Erstellt am ${placeDate}</p>
            </div>
            
            <div style="margin-bottom: 30px; display: flex; justify-content: space-between;">
                <div>
                    <p style="margin: 2px 0;"><strong>Mieter:</strong> ${targetTenant.name}</p>
                    <p style="margin: 2px 0;"><strong>Objekt:</strong> ${property.name} ${targetTenant.room ? '('+targetTenant.room+')' : ''}</p>
                </div>
                <div style="text-align: right;">
                    <p style="margin: 2px 0;"><strong>Abrechnungszeitraum:</strong></p>
                    <p style="margin: 2px 0;">${periodLabel} (${totalTargetMonths} Monate)</p>
                </div>
            </div>

            <div id="statement-intro" contenteditable="true" style="outline:none;border:1px dashed #e5e7eb;border-radius:6px;padding:10px;margin-bottom:16px;white-space:pre-line;">
Sehr geehrte(r) Herr/Frau ${targetTenant.name.split(' ').pop()},

anbei erhalten Sie Ihre Betriebskostenabrechnung für den gewählten Zeitraum. Die Gesamtkosten des Hauses wurden anteilig auf Ihre Mietzeit und den gesetzlichen Umlageschlüssel umgelegt.
            </div>

            <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px; font-size: 14px;">
                <thead>
                    <tr style="background-color: #f3f4f6; border-bottom: 2px solid #ccc;">
                        <th style="padding: 10px 8px; text-align: left;">Kostenart</th>
                        <th style="padding: 10px 8px; text-align: right;">Haus-Gesamt</th>
                        <th style="padding: 10px 8px; text-align: center;">Umlageschlüssel</th>
                        <th style="padding: 10px 8px; text-align: right;">Ihr Anteil</th>
                    </tr>
                </thead>
                <tbody>
                    ${tableRows}
                </tbody>
                <tfoot>
                    <tr style="background-color: #f3f4f6; border-top: 2px solid #333; font-weight: bold;">
                        <td style="padding: 12px 8px;" colspan="3">Summe Ihrer Anteile:</td>
                        <td style="padding: 12px 8px; text-align: right;">${ImmoApp.ui.formatCurrency(totalTenantCost)}</td>
                    </tr>
                </tfoot>
            </table>

            <div style="background-color: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; border-radius: 4px;">
                <table style="width: 100%; font-size: 15px;">
                    <tr>
                        <td style="padding: 5px 0;">Ihre Anteiligen Betriebskosten:</td>
                        <td style="text-align: right; padding: 5px 0;">${ImmoApp.ui.formatCurrency(totalTenantCost)}</td>
                    </tr>
                    <tr>
                        <td style="padding: 5px 0; border-bottom: 1px solid #ccc;">Abzüglich geleisteter Vorauszahlungen (Soll: ${totalTargetMonths}x ${ImmoApp.ui.formatCurrency(targetTenant.prepayment)}):</td>
                        <td style="text-align: right; padding: 5px 0; border-bottom: 1px solid #ccc;">- ${ImmoApp.ui.formatCurrency(expectedPrepayment)}</td>
                    </tr>
                    <tr>
                        <td style="padding: 15px 0 5px 0; font-weight: bold; font-size: 18px;">Ergebnis:</td>
                        <td style="text-align: right; padding: 15px 0 5px 0; font-size: 18px;">${balanceText}</td>
                    </tr>
                </table>
            </div>
            
            <div id="statement-payment" contenteditable="true" style="outline:none;margin-top:16px;border:1px solid #e5e7eb;border-radius:8px;padding:12px;background:#f9fafb;white-space:pre-line;">
${paymentDefault}
            </div>
            <p style="margin-top: 40px;">Mit freundlichen Grüßen</p>
            <p style="margin-top: 10px;">Ihre Hausverwaltung</p>
            ${footerBlock}
        `;

        document.getElementById('statement-doc').innerHTML = docHTML;
            document.getElementById('statement-preview-container').classList.remove('hidden');
        } catch (e) {
            console.error("Fehler in generateStatementPreview:", e);
            alert(`Fehler bei Vorschau: ${e?.message || e}`);
        }
    },

    generateFlatRateStatement: async function(tenant, property, year) {
        const sender = (ImmoApp.settings && ImmoApp.settings.getSenderConfig) ? await ImmoApp.settings.getSenderConfig() : {};
        const senderLines = [sender.name, sender.street, [sender.zip, sender.city].filter(Boolean).join(' '), sender.country].filter(Boolean);
        const safeSenderLinesHtml = senderLines.map(l => (l || '').replace(/</g, '&lt;')).join('<br>');
        const logoBlock = sender.logoDataUrl
            ? `<div style="display:flex;justify-content:flex-start;margin-bottom:10px;">
                    <img src="${sender.logoDataUrl}" alt="Logo" style="max-height:60px;max-width:220px;object-fit:contain;">
               </div>`
            : '';
        const senderBlock = (logoBlock || senderLines.length > 0)
            ? `<div style="font-size:12px;color:#374151;line-height:1.4;margin-bottom:10px;">${logoBlock}${safeSenderLinesHtml}</div>`
            : '';

        const todayDate = new Date();
        const today = todayDate.toLocaleDateString('de-DE');
        const placeStr = (sender.place || sender.city || '').trim();
        const placeDate = placeStr ? `${placeStr}, ${today}` : today;

        const footerText = (sender.footer || '').trim();
        const footerBlock = `<div id="statement-footer" contenteditable="true" style="outline:none;white-space:pre-line;margin-top:18px;padding-top:10px;border-top:1px solid #e5e7eb;font-size:11px;color:#6b7280;">${(footerText || '').replace(/</g,'&lt;')}</div>`;

        const docHTML = `
            ${senderBlock}
            <div style="margin-bottom: 40px;">
                <h1 style="font-size: 24px; color: #333; margin-bottom: 5px;">Mietbescheinigung ${year}</h1>
                <p style="color: #777; margin-top: 0;">Erstellt am ${placeDate}</p>
            </div>

            <div style="margin-bottom: 30px; display: flex; justify-content: space-between;">
                <div>
                    <p style="margin: 2px 0;"><strong>Mieter:</strong> ${tenant.name}</p>
                    <p style="margin: 2px 0;"><strong>Objekt:</strong> ${property.name} ${tenant.room ? '('+tenant.room+')' : ''}</p>
                </div>
            </div>

            <p style="margin-bottom: 20px;">Sehr geehrte(r) Herr/Frau ${tenant.name.split(' ').pop()},</p>
            <p style="margin-bottom: 20px;">hiermit bestätigen wir, dass Sie im Jahr ${year} mit uns einen Mietvertrag über eine Pauschalmiete / Warmmiete abgeschlossen haben.</p>
            <p style="margin-bottom: 20px;">Gemäß der vertraglichen Vereinbarung sind mit der monatlichen Mietzahlung in Höhe von <strong>${ImmoApp.ui.formatCurrency(tenant.rent)}</strong> alle anfallenden Betriebskosten vollständig abgegolten.</p>

            <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; padding: 15px; border-radius: 4px; margin-top: 30px;">
                <p style="margin: 0; color: #166534; font-weight: bold;">✅ Es erfolgt keine weitere Nachberechnung der Nebenkosten.</p>
            </div>

            <p style="margin-top: 40px;">Mit freundlichen Grüßen</p>
            <p style="margin-top: 10px;">Ihre Hausverwaltung</p>
            ${footerBlock}
        `;
        document.getElementById('statement-doc').innerHTML = docHTML;
        document.getElementById('statement-preview-container').classList.remove('hidden');
    },

    downloadPDF: function() {
        const element = document.getElementById('statement-doc');
        const year = ImmoApp.ui.currentYear;
        const tenantName = document.getElementById("export-tenant-select").options[document.getElementById("export-tenant-select").selectedIndex].text;
        
        const opt = {
            margin:       15,
            filename:     `NK_${year}_${tenantName.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`,
            image:        { type: 'jpeg', quality: 0.98 },
            html2canvas:  { scale: 2 },
            jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };
        html2pdf().set(opt).from(element).save();
    },

    downloadWord: function() {
        const year = ImmoApp.ui.currentYear;
        const tenantName = document.getElementById("export-tenant-select").options[document.getElementById("export-tenant-select").selectedIndex].text;
        
        const contentHTML = document.getElementById('statement-doc').innerHTML;
        const header = "<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><title>Abrechnung</title></head><body>";
        const footer = "</body></html>";
        const html = header + contentHTML + footer;
        
        const blob = new Blob(['\ufeff', html], { type: 'application/msword' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `NK_${year}_${tenantName.replace(/[^a-zA-Z0-9]/g, '_')}.doc`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    },

    render: function() {
        this.setupHTML();
        this.switchTab('costs');
    }
};