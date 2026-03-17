window.ImmoApp = window.ImmoApp || {};

window.ImmoApp.utilities = {
    setupHTML: function() {
        const container = document.getElementById("utilities-content");
        if (container.innerHTML.includes("Lade Module...")) {
            container.innerHTML = `
                <div class="flex border-b mb-6">
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
                        <div class="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
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
                                    <button onclick="ImmoApp.utilities.addManualUtility()" class="w-full md:w-auto bg-blue-600 text-white px-4 py-2 rounded text-xs font-bold shadow hover:bg-blue-700 whitespace-nowrap">
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
                            <button onclick="document.getElementById('modal-wg-check').classList.remove('hidden')" class="mt-4 text-xs bg-gray-100 border border-gray-300 px-3 py-2 rounded hover:bg-gray-200 text-gray-700 font-bold w-full transition-colors">🔍 Aufschlüsselung anzeigen</button>
                        </div>
                    </div>

                    <div class="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden overflow-x-auto">
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
                </div>

                <div id="util-view-export" class="hidden">
                    <div class="bg-blue-50 border border-blue-200 p-6 rounded-lg mb-6">
                        <h2 class="text-xl font-bold text-blue-800 mb-4">1-Klick Abrechnungs-Generator</h2>
                        <div class="flex gap-4 items-end">
                            <div class="w-1/3">
                                <label class="block text-sm font-bold mb-1 text-blue-800">1. Objekt wählen</label>
                                <select id="export-prop-select" class="w-full border rounded p-2" onchange="ImmoApp.utilities.loadTenantsForExport()">
                                    <option value="">-- Bitte wählen --</option>
                                </select>
                            </div>
                            <div class="w-1/3">
                                <label class="block text-sm font-bold mb-1 text-blue-800">2. Mieter wählen</label>
                                <select id="export-tenant-select" class="w-full border rounded p-2 disabled:bg-gray-100" disabled>
                                    <option value="">-- Zuerst Objekt wählen --</option>
                                </select>
                            </div>
                            <div class="w-1/3">
                                <button onclick="ImmoApp.utilities.generateStatementPreview()" class="w-full bg-blue-600 text-white font-bold py-2 rounded shadow hover:bg-blue-700">📄 Vorschau generieren</button>
                            </div>
                        </div>
                    </div>

                    <div id="statement-preview-container" class="hidden">
                        <div class="flex justify-end gap-2 mb-4">
                            <button onclick="ImmoApp.utilities.downloadWord()" class="bg-indigo-600 text-white px-4 py-2 rounded font-bold shadow hover:bg-indigo-700">💾 Als Word (.doc)</button>
                            <button onclick="ImmoApp.utilities.downloadPDF()" class="bg-red-600 text-white px-4 py-2 rounded font-bold shadow hover:bg-red-700">🖨️ Als PDF</button>
                        </div>
                        <div id="statement-doc" class="bg-white border p-12 shadow-lg mx-auto" style="max-w: 800px; color: black; font-family: Arial, sans-serif; line-height: 1.5;"></div>
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
        allTenants.forEach(t => {
            const activeM = ImmoApp.utils.getActiveMonthsInYear(t.moveIn, t.moveOut, currentYear);
            const prepayment = t.prepayment || 0;
            
            if(activeM > 0 && prepayment > 0) {
                const tenantSum = prepayment * activeM;
                totalIncome += tenantSum;
                incomeHtml += `
                    <li class="flex flex-col border-b border-gray-100 pb-2">
                        <div class="flex justify-between items-center">
                            <span class="font-bold text-gray-800">${t.name}</span>
                            <span class="font-bold text-blue-600">${ImmoApp.ui.formatCurrency(tenantSum)}</span>
                        </div>
                        <span class="text-xs text-gray-500">${activeM} Monate &agrave; ${ImmoApp.ui.formatCurrency(prepayment)} (NK-Anteil)</span>
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
        tbody.innerHTML = "";
        
        if (utils.length === 0) {
            tbody.innerHTML = `<tr><td colspan="4" class="px-4 py-8 text-center text-gray-500 italic">Keine Nebenkosten-Buchungen gefunden.</td></tr>`;
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

    generateStatementPreview: async function() {
        const propId = parseInt(document.getElementById("export-prop-select").value);
        const tenantId = parseInt(document.getElementById("export-tenant-select").value);
        
        if(!propId || !tenantId) return alert("Bitte Objekt und Mieter auswählen!");

        const db = ImmoApp.db.instance;
        const year = ImmoApp.ui.currentYear;
        
        const property = await db.properties.get(propId);
        const targetTenant = await db.tenants.get(tenantId);
        const allUtils = await db.utilities.where('year').equals(year).filter(u => u.propertyId === propId).toArray();
        const allTenants = await db.tenants.where('propertyId').equals(propId).toArray();

        if(targetTenant.isFlatRate) {
            this.generateFlatRateStatement(targetTenant, property, year);
            return;
        }

        const uncategorized = allUtils.filter(u => !u.category || !u.splitKey);
        if(uncategorized.length > 0) {
            alert(`Achtung: Es gibt ${uncategorized.length} Kostenpunkte ohne Kategorie oder Schlüssel! Gehe zu Tab 1 und trage diese nach.`);
            return;
        }

        let totalSqm = 0, totalPersons = 0, totalUnits = 0;

        const activeTenants = allTenants.map(t => {
            const months = ImmoApp.utils.getActiveMonthsInYear(t.moveIn, t.moveOut, year);
            return { ...t, activeMonths: months };
        }).filter(t => t.activeMonths > 0);

        activeTenants.forEach(t => {
            const timeFactor = t.activeMonths / 12;
            totalSqm += (parseFloat(t.sqm) || 0) * timeFactor;
            totalPersons += (parseInt(t.persons) || 0) * timeFactor;
            totalUnits += 1 * timeFactor;
        });

        const targetMonths = targetTenant.activeMonths || ImmoApp.utils.getActiveMonthsInYear(targetTenant.moveIn, targetTenant.moveOut, year);
        const targetTimeFactor = targetMonths / 12;

        let tableRows = '';
        let totalTenantCost = 0;
        const groupedUtils = {};
        
        allUtils.forEach(u => {
            if(!groupedUtils[u.category]) groupedUtils[u.category] = { amount: 0, key: u.splitKey };
            groupedUtils[u.category].amount += u.amount;
        });

        for (const [category, data] of Object.entries(groupedUtils)) {
            let myShare = 0;
            let shareText = "";

            if (data.key === 'WG') {
                continue; 
            } else if (data.key === 'DIRECT') {
                shareText = "100% Direkt"; 
                myShare = 0; 
            } else if (data.key === 'SQM') {
                const fraction = (parseFloat(targetTenant.sqm) || 0) / (totalSqm || 1);
                myShare = data.amount * fraction * targetTimeFactor;
                shareText = `${targetTenant.sqm || 0} von ${totalSqm.toFixed(1)} m²`;
            } else if (data.key === 'PERSONS') {
                const fraction = (parseInt(targetTenant.persons) || 0) / (totalPersons || 1);
                myShare = data.amount * fraction * targetTimeFactor;
                shareText = `${targetTenant.persons || 0} von ${totalPersons.toFixed(1)} Personen`;
            } else if (data.key === 'UNITS') {
                const fraction = 1 / (totalUnits || 1);
                myShare = data.amount * fraction * targetTimeFactor;
                shareText = `1 von ${totalUnits.toFixed(1)} Einheiten`;
            }

            totalTenantCost += myShare;

            tableRows += `
                <tr style="border-bottom: 1px solid #ddd;">
                    <td style="padding: 8px;">${category}</td>
                    <td style="padding: 8px; text-align: right;">${ImmoApp.ui.formatCurrency(data.amount)}</td>
                    <td style="padding: 8px; text-align: center;">${shareText}</td>
                    <td style="padding: 8px; text-align: right; font-weight: bold;">${ImmoApp.ui.formatCurrency(myShare)}</td>
                </tr>
            `;
        }

        const expectedPrepayment = (parseFloat(targetTenant.prepayment) || 0) * targetMonths;
        const balance = expectedPrepayment - totalTenantCost;
        let balanceText = balance >= 0 
            ? `<span style="color: green;">Ihr Guthaben beträgt: <b>${ImmoApp.ui.formatCurrency(balance)}</b></span>` 
            : `<span style="color: red;">Ihre Nachzahlung beträgt: <b>${ImmoApp.ui.formatCurrency(Math.abs(balance))}</b></span>`;

        const today = new Date().toLocaleDateString('de-DE');
        
        const docHTML = `
            <div style="margin-bottom: 40px;">
                <h1 style="font-size: 24px; color: #333; margin-bottom: 5px;">Nebenkostenabrechnung ${year}</h1>
                <p style="color: #777; margin-top: 0;">Erstellt am ${today}</p>
            </div>
            
            <div style="margin-bottom: 30px; display: flex; justify-content: space-between;">
                <div>
                    <p style="margin: 2px 0;"><strong>Mieter:</strong> ${targetTenant.name}</p>
                    <p style="margin: 2px 0;"><strong>Objekt:</strong> ${property.name} ${targetTenant.room ? '('+targetTenant.room+')' : ''}</p>
                </div>
                <div style="text-align: right;">
                    <p style="margin: 2px 0;"><strong>Abrechnungszeitraum:</strong></p>
                    <p style="margin: 2px 0;">01.01.${year} - 31.12.${year} (${targetMonths} Monate)</p>
                </div>
            </div>

            <p style="margin-bottom: 20px;">Sehr geehrte(r) Herr/Frau ${targetTenant.name.split(' ').pop()},</p>
            <p style="margin-bottom: 20px;">anbei erhalten Sie Ihre Betriebskostenabrechnung für das Jahr ${year}. Die Gesamtkosten des Hauses wurden anteilig auf Ihre Mietzeit und den gesetzlichen Umlageschlüssel umgelegt.</p>

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
                        <td style="padding: 5px 0; border-bottom: 1px solid #ccc;">Abzüglich geleisteter Vorauszahlungen (Soll: ${targetMonths}x ${ImmoApp.ui.formatCurrency(targetTenant.prepayment)}):</td>
                        <td style="text-align: right; padding: 5px 0; border-bottom: 1px solid #ccc;">- ${ImmoApp.ui.formatCurrency(expectedPrepayment)}</td>
                    </tr>
                    <tr>
                        <td style="padding: 15px 0 5px 0; font-weight: bold; font-size: 18px;">Ergebnis:</td>
                        <td style="text-align: right; padding: 15px 0 5px 0; font-size: 18px;">${balanceText}</td>
                    </tr>
                </table>
            </div>
            
            <p style="margin-top: 40px;">Wir bitten Sie, eine eventuelle Nachzahlung innerhalb von 14 Tagen auf das bekannte Mietkonto zu überweisen. Ein eventuelles Guthaben wird Ihnen erstattet.</p>
            <p style="margin-top: 40px;">Mit freundlichen Grüßen</p>
            <p style="margin-top: 10px;">Ihre Hausverwaltung</p>
        `;

        document.getElementById('statement-doc').innerHTML = docHTML;
        document.getElementById('statement-preview-container').classList.remove('hidden');
    },

    generateFlatRateStatement: function(tenant, property, year) {
        const today = new Date().toLocaleDateString('de-DE');
        const docHTML = `
            <div style="margin-bottom: 40px;">
                <h1 style="font-size: 24px; color: #333; margin-bottom: 5px;">Mietbescheinigung ${year}</h1>
                <p style="color: #777; margin-top: 0;">Erstellt am ${today}</p>
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