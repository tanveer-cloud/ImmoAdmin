window.ImmoApp = window.ImmoApp || {};

window.ImmoApp.meters = {
    METER_TYPES: [
        { val: "STROM", label: "Strom", unit: "kWh" },
        { val: "GAS", label: "Gas", unit: "m³" },
        { val: "WASSER", label: "Wasser", unit: "m³" }
    ],

    setupHTML: function() {
        const container = document.getElementById("meters-content");
        if (!container || !container.innerHTML.includes("Lade Module...")) return;
        container.innerHTML = `
            <div class="space-y-8">
                <!-- Verteilung WG: A oder B -->
                <div class="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                    <h3 class="text-sm font-bold text-gray-800 mb-2">WG-Verteilung Verbrauch (Strom/Gas/Wasser)</h3>
                    <div class="flex flex-wrap gap-4 items-center">
                        <label class="flex items-center gap-2 cursor-pointer">
                            <input type="radio" name="wg-dist-mode" value="PERSON_DAYS" checked class="w-4 h-4">
                            <span class="text-sm">Variante A: Nach Personentagen (Köpfe)</span>
                        </label>
                        <label class="flex items-center gap-2 cursor-pointer">
                            <input type="radio" name="wg-dist-mode" value="PERSON_DAYS_SQM" class="w-4 h-4">
                            <span class="text-sm">Variante B: Nach Personentagen × Zimmerfläche (m²)</span>
                        </label>
                        <button onclick="ImmoApp.meters.saveDistributionMode()" class="text-xs bg-gray-200 text-gray-800 px-3 py-1.5 rounded font-bold hover:bg-gray-300">Speichern</button>
                    </div>
                    <p class="text-xs text-gray-500 mt-1">Für Variante B bitte bei den Mietern optional die Wohnfläche (m²) hinterlegen.</p>
                </div>

                <!-- Zähler -->
                <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <h3 class="text-lg font-bold text-gray-800 mb-4">Zähler</h3>
                    <div class="grid grid-cols-1 md:grid-cols-4 gap-3 items-end mb-4">
                        <div>
                            <label class="block text-xs font-bold text-gray-600 mb-1">Objekt</label>
                            <select id="meter-prop" class="w-full border rounded p-2 text-sm bg-white"></select>
                        </div>
                        <div>
                            <label class="block text-xs font-bold text-gray-600 mb-1">Typ</label>
                            <select id="meter-type" class="w-full border rounded p-2 text-sm">
                                <option value="STROM">Strom</option>
                                <option value="GAS">Gas</option>
                                <option value="WASSER">Wasser</option>
                            </select>
                        </div>
                        <div>
                            <label class="block text-xs font-bold text-gray-600 mb-1">Bezeichnung (z.B. WG EG Strom)</label>
                            <input type="text" id="meter-name" class="w-full border rounded p-2 text-sm" placeholder="WG EG Strom">
                        </div>
                        <div>
                            <button onclick="ImmoApp.meters.addMeter()" class="w-full bg-blue-600 text-white px-4 py-2 rounded text-sm font-bold hover:bg-blue-700">+ Zähler</button>
                        </div>
                    </div>
                    <ul id="meters-list" class="space-y-2 text-sm"></ul>
                </div>

                <!-- Tarife -->
                <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <h3 class="text-lg font-bold text-gray-800 mb-4">Tarife (Strom / Gas / Wasser)</h3>
                    <div class="grid grid-cols-1 md:grid-cols-5 gap-3 items-end mb-4">
                        <div>
                            <label class="block text-xs font-bold text-gray-600 mb-1">Typ</label>
                            <select id="tariff-type" class="w-full border rounded p-2 text-sm">
                                <option value="STROM">Strom</option>
                                <option value="GAS">Gas</option>
                                <option value="WASSER">Wasser</option>
                            </select>
                        </div>
                        <div>
                            <label class="block text-xs font-bold text-gray-600 mb-1">Gültig ab (Datum)</label>
                            <input type="date" id="tariff-validFrom" class="w-full border rounded p-2 text-sm">
                        </div>
                        <div>
                            <label class="block text-xs font-bold text-gray-600 mb-1">Preis pro Einheit (€)</label>
                            <input type="number" step="0.0001" id="tariff-pricePerUnit" class="w-full border rounded p-2 text-sm" placeholder="0.35">
                        </div>
                        <div>
                            <label class="block text-xs font-bold text-gray-600 mb-1">Grundpreis/Monat (€, optional)</label>
                            <input type="number" step="0.01" id="tariff-basicFee" class="w-full border rounded p-2 text-sm" placeholder="0">
                        </div>
                        <div>
                            <button onclick="ImmoApp.meters.addTariff()" class="w-full bg-green-600 text-white px-4 py-2 rounded text-sm font-bold hover:bg-green-700">+ Tarif</button>
                        </div>
                    </div>
                    <ul id="tariffs-list" class="space-y-2 text-sm"></ul>
                </div>

                <!-- Ablesungen -->
                <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <h3 class="text-lg font-bold text-gray-800 mb-4">Zählerstände (monatlich oder nach Bedarf)</h3>
                    <div class="grid grid-cols-1 md:grid-cols-4 gap-3 items-end mb-4">
                        <div>
                            <label class="block text-xs font-bold text-gray-600 mb-1">Zähler</label>
                            <select id="reading-meter" class="w-full border rounded p-2 text-sm bg-white"></select>
                        </div>
                        <div>
                            <label class="block text-xs font-bold text-gray-600 mb-1">Datum</label>
                            <input type="date" id="reading-date" class="w-full border rounded p-2 text-sm">
                        </div>
                        <div>
                            <label class="block text-xs font-bold text-gray-600 mb-1">Zählerstand</label>
                            <input type="number" step="0.001" id="reading-value" class="w-full border rounded p-2 text-sm" placeholder="12345.6">
                        </div>
                        <div>
                            <button onclick="ImmoApp.meters.addReading()" class="w-full bg-amber-600 text-white px-4 py-2 rounded text-sm font-bold hover:bg-amber-700">+ Ablesung</button>
                        </div>
                    </div>
                    <div id="readings-by-meter" class="space-y-4"></div>
                </div>

                <!-- Berechnen -->
                <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <h3 class="text-lg font-bold text-gray-800 mb-4">Verbrauch & Anteile berechnen</h3>
                    <p class="text-sm text-gray-600 mb-4">Zeitraum wählen; Start- und Endablesung werden automatisch ermittelt. Anteile werden nach Personentagen (Variante A) oder Personentagen × m² (Variante B) verteilt.</p>
                    <div class="grid grid-cols-1 md:grid-cols-4 gap-3 items-end mb-4">
                        <div>
                            <label class="block text-xs font-bold text-gray-600 mb-1">Zähler</label>
                            <select id="calc-meter" class="w-full border rounded p-2 text-sm bg-white"></select>
                        </div>
                        <div>
                            <label class="block text-xs font-bold text-gray-600 mb-1">Von (Datum)</label>
                            <input type="date" id="calc-start" class="w-full border rounded p-2 text-sm">
                        </div>
                        <div>
                            <label class="block text-xs font-bold text-gray-600 mb-1">Bis (Datum)</label>
                            <input type="date" id="calc-end" class="w-full border rounded p-2 text-sm">
                        </div>
                        <div>
                            <button onclick="ImmoApp.meters.calcAndShow()" class="w-full bg-indigo-600 text-white px-4 py-2 rounded text-sm font-bold hover:bg-indigo-700">Berechnen</button>
                        </div>
                    </div>
                    <div id="calc-result" class="hidden mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200 text-sm"></div>
                </div>
            </div>
        `;
        this.loadDistributionMode();
        this.renderLists();
    },

    loadDistributionMode: async function() {
        if (!ImmoApp.db || !ImmoApp.db.instance) return;
        try {
            const r = await ImmoApp.db.instance.settings.get("wgDistributionMode");
            const val = (r && r.value) || "PERSON_DAYS";
            const radio = document.querySelector('input[name="wg-dist-mode"][value="' + val + '"]');
            if (radio) radio.checked = true;
        } catch (e) { /* ignore */ }
    },

    saveDistributionMode: async function() {
        const radio = document.querySelector('input[name="wg-dist-mode"]:checked');
        if (!radio || !ImmoApp.db || !ImmoApp.db.instance) return;
        await ImmoApp.db.instance.settings.put({ key: "wgDistributionMode", value: radio.value });
        alert("Verteilungsart gespeichert.");
    },

    renderLists: async function() {
        const db = ImmoApp.db.instance;
        const props = await db.properties.toArray();
        const meters = await db.meters.toArray();
        const tariffs = await db.tariffs.toArray();
        const readings = await db.meterReadings.toArray();

        const propSelect = document.getElementById("meter-prop");
        const readingMeterSelect = document.getElementById("reading-meter");
        const calcMeterSelect = document.getElementById("calc-meter");
        [propSelect, readingMeterSelect, calcMeterSelect].forEach(el => {
            if (!el) return;
            el.innerHTML = '<option value="">-- Zähler/Objekt wählen --</option>';
        });
        props.forEach(p => {
            if (propSelect) propSelect.innerHTML += '<option value="' + p.id + '">' + p.name + '</option>';
        });
        meters.forEach(m => {
            const p = props.find(x => x.id === m.propertyId);
            const typeLabel = this.METER_TYPES.find(t => t.val === m.type)?.label || m.type;
            const label = (p ? p.name + " – " : "") + (m.name || m.type) + " (" + typeLabel + ")";
            if (readingMeterSelect) readingMeterSelect.innerHTML += '<option value="' + m.id + '">' + label + '</option>';
            if (calcMeterSelect) calcMeterSelect.innerHTML += '<option value="' + m.id + '">' + label + '</option>';
        });

        const metersList = document.getElementById("meters-list");
        if (metersList) {
            metersList.innerHTML = "";
            meters.forEach(m => {
                const p = props.find(x => x.id === m.propertyId);
                const typeLabel = this.METER_TYPES.find(t => t.val === m.type)?.label || m.type;
                metersList.innerHTML += '<li class="flex justify-between items-center py-1 border-b border-gray-100">' +
                    '<span class="font-medium">' + (p ? p.name : "?") + ' – ' + (m.name || m.type) + ' <span class="text-gray-500">(' + typeLabel + ')</span></span>' +
                    '<button onclick="ImmoApp.meters.deleteMeter(' + m.id + ')" class="text-red-600 text-xs hover:underline">Löschen</button></li>';
            });
            if (meters.length === 0) metersList.innerHTML = '<li class="text-gray-500 italic">Noch keine Zähler angelegt.</li>';
        }

        const tariffsList = document.getElementById("tariffs-list");
        if (tariffsList) {
            tariffsList.innerHTML = "";
            tariffs.sort((a, b) => (a.validFrom || "").localeCompare(b.validFrom || ""));
            tariffs.forEach(t => {
                const typeLabel = this.METER_TYPES.find(x => x.val === t.type)?.label || t.type;
                const unit = this.METER_TYPES.find(x => x.val === t.type)?.unit || "";
                tariffsList.innerHTML += '<li class="flex justify-between items-center py-1 border-b border-gray-100">' +
                    '<span>' + typeLabel + ' ab ' + (t.validFrom || "–") + ': ' + (t.pricePerUnit != null ? t.pricePerUnit + ' €/' + unit : "–") + (t.basicFeePerMonth ? ', Grundpreis ' + ImmoApp.ui.formatCurrency(t.basicFeePerMonth) + '/Monat' : '') + '</span>' +
                    '<button onclick="ImmoApp.meters.deleteTariff(' + t.id + ')" class="text-red-600 text-xs hover:underline">Löschen</button></li>';
            });
            if (tariffs.length === 0) tariffsList.innerHTML = '<li class="text-gray-500 italic">Noch keine Tarife angelegt.</li>';
        }

        const readingsByMeter = document.getElementById("readings-by-meter");
        if (readingsByMeter) {
            readingsByMeter.innerHTML = "";
            const byMeter = {};
            readings.forEach(r => {
                if (!byMeter[r.meterId]) byMeter[r.meterId] = [];
                byMeter[r.meterId].push(r);
            });
            meters.forEach(m => {
                const list = (byMeter[m.id] || []).sort((a, b) => (a.date || "").localeCompare(b.date || ""));
                const p = props.find(x => x.id === m.propertyId);
                const label = (p ? p.name + " – " : "") + (m.name || m.type);
                let rows = list.map(r => '<tr class="border-b border-gray-100"><td class="py-1 pr-4">' + (r.date || "") + '</td><td class="py-1 text-right font-mono">' + (r.value != null ? r.value : "") + '</td><td class="py-1 pl-2"><button onclick="ImmoApp.meters.deleteReading(' + r.id + ')" class="text-red-600 text-xs hover:underline">Löschen</button></td></tr>').join("");
                readingsByMeter.innerHTML += '<div><h4 class="font-bold text-gray-700 text-sm mb-1">' + label + '</h4><table class="w-full max-w-md text-sm"><thead><tr class="text-left text-gray-500"><th>Datum</th><th class="text-right">Stand</th><th></th></tr></thead><tbody>' + rows + '</tbody></table></div>';
            });
            if (meters.length === 0) readingsByMeter.innerHTML = '<p class="text-gray-500 italic">Zuerst Zähler anlegen.</p>';
        }
    },

    addMeter: async function() {
        const db = ImmoApp.db.instance;
        const propertyId = document.getElementById("meter-prop")?.value;
        const type = document.getElementById("meter-type")?.value;
        const name = document.getElementById("meter-name")?.value?.trim();
        if (!propertyId || !type) {
            alert("Bitte Objekt und Typ wählen.");
            return;
        }
        await db.meters.add({ propertyId: parseInt(propertyId), type: type, name: name || type });
        document.getElementById("meter-name").value = "";
        this.renderLists();
    },

    deleteMeter: async function(id) {
        if (!confirm("Zähler und alle zugehörigen Ablesungen wirklich löschen?")) return;
        const db = ImmoApp.db.instance;
        const readings = await db.meterReadings.where("meterId").equals(id).toArray();
        for (const r of readings) await db.meterReadings.delete(r.id);
        await db.meters.delete(id);
        this.renderLists();
    },

    addTariff: async function() {
        const db = ImmoApp.db.instance;
        const type = document.getElementById("tariff-type")?.value;
        const validFrom = document.getElementById("tariff-validFrom")?.value;
        const pricePerUnit = parseFloat(document.getElementById("tariff-pricePerUnit")?.value || "0");
        const basicFeePerMonth = parseFloat(document.getElementById("tariff-basicFee")?.value || "0") || null;
        if (!type || !validFrom || isNaN(pricePerUnit) || pricePerUnit < 0) {
            alert("Bitte Typ, Gültig-ab-Datum und Preis pro Einheit angeben.");
            return;
        }
        await db.tariffs.add({ type: type, validFrom: validFrom, pricePerUnit: pricePerUnit, basicFeePerMonth: basicFeePerMonth });
        document.getElementById("tariff-validFrom").value = "";
        document.getElementById("tariff-pricePerUnit").value = "";
        document.getElementById("tariff-basicFee").value = "";
        this.renderLists();
    },

    deleteTariff: async function(id) {
        if (!confirm("Tarif wirklich löschen?")) return;
        await ImmoApp.db.instance.tariffs.delete(id);
        this.renderLists();
    },

    addReading: async function() {
        const db = ImmoApp.db.instance;
        const meterId = document.getElementById("reading-meter")?.value;
        const date = document.getElementById("reading-date")?.value;
        const value = parseFloat(document.getElementById("reading-value")?.value?.replace(",", "."));
        if (!meterId || !date || isNaN(value)) {
            alert("Bitte Zähler, Datum und Zählerstand angeben.");
            return;
        }
        await db.meterReadings.add({ meterId: parseInt(meterId), date: date, value: value });
        document.getElementById("reading-date").value = "";
        document.getElementById("reading-value").value = "";
        this.renderLists();
    },

    deleteReading: async function(id) {
        if (!confirm("Ablesung wirklich löschen?")) return;
        await ImmoApp.db.instance.meterReadings.delete(id);
        this.renderLists();
    },

    getTariffFor: function(type, dateStr) {
        return ImmoApp.db.instance.tariffs.where("type").equals(type).toArray().then(list => {
            const d = dateStr ? new Date(dateStr) : new Date(0);
            const valid = list.filter(t => new Date(t.validFrom || 0) <= d);
            valid.sort((a, b) => new Date(b.validFrom || 0) - new Date(a.validFrom || 0));
            return valid[0] || null;
        });
    },

    calcMeterPeriod: async function(meterId, startDate, endDate) {
        const db = ImmoApp.db.instance;
        const meter = await db.meters.get(meterId);
        if (!meter) return null;
        const readings = await db.meterReadings.where("meterId").equals(meterId).toArray();
        readings.sort((a, b) => (a.date || "").localeCompare(b.date || ""));
        const start = startDate || readings[0]?.date;
        const end = endDate || readings[readings.length - 1]?.date;
        if (!start || !end) return null;
        const rStart = readings.filter(r => r.date <= start).pop() || readings[0];
        const rEnd = readings.filter(r => r.date >= end).shift() || readings[readings.length - 1];
        if (!rStart || !rEnd || rStart.date > rEnd.date) return null;
        const consumption = (rEnd.value != null && rStart.value != null) ? (rEnd.value - rStart.value) : 0;
        if (consumption < 0) return null;

        const tariff = await this.getTariffFor(meter.type, start);
        const pricePerUnit = tariff ? (tariff.pricePerUnit || 0) : 0;
        const basicFeePerMonth = tariff ? (tariff.basicFeePerMonth || 0) : 0;
        const startD = new Date(start);
        const endD = new Date(end);
        const daysInPeriod = Math.max(0, (endD - startD) / (24 * 60 * 60 * 1000));
        const monthsInPeriod = daysInPeriod / 30.44;
        const totalCost = consumption * pricePerUnit + (basicFeePerMonth || 0) * monthsInPeriod;

        const tenants = await db.tenants.where("propertyId").equals(meter.propertyId).toArray();
        const periodStart = new Date(start);
        const periodEnd = new Date(end);
        const mode = (await db.settings.get("wgDistributionMode"))?.value || "PERSON_DAYS";

        const shares = [];
        let totalWeight = 0;
        for (const t of tenants) {
            const moveIn = t.moveIn ? new Date(t.moveIn) : new Date(0);
            const moveOut = t.moveOut ? new Date(t.moveOut) : new Date(8640000000000000);
            const from = moveIn > periodStart ? moveIn : periodStart;
            const to = moveOut < periodEnd ? moveOut : periodEnd;
            const days = to > from ? Math.round((to - from) / (24 * 60 * 60 * 1000)) : 0;
            const sqm = (t.sqm != null && t.sqm > 0) ? parseFloat(t.sqm) : 1;
            const weight = mode === "PERSON_DAYS_SQM" ? (days * sqm) : days;
            totalWeight += weight;
            shares.push({ tenant: t, days: days, sqm: sqm, weight: weight });
        }
        shares.forEach(s => {
            s.share = totalWeight > 0 ? s.weight / totalWeight : 0;
            s.cost = totalCost * s.share;
        });
        const tenantSharesInPeriod = shares.filter(s => s.days > 0);

        return {
            meter: meter,
            start: start,
            end: end,
            rStart: rStart,
            rEnd: rEnd,
            consumption: consumption,
            totalCost: totalCost,
            tariff: tariff,
            unit: this.METER_TYPES.find(t => t.val === meter.type)?.unit || "",
            tenantShares: tenantSharesInPeriod,
            mode: mode
        };
    },

    calcAndShow: async function() {
        const meterId = document.getElementById("calc-meter")?.value;
        const start = document.getElementById("calc-start")?.value;
        const end = document.getElementById("calc-end")?.value;
        if (!meterId || !start || !end) {
            alert("Bitte Zähler sowie Von- und Bis-Datum wählen.");
            return;
        }
        const result = await this.calcMeterPeriod(parseInt(meterId), start, end);
        const box = document.getElementById("calc-result");
        if (!box) return;
        box.classList.remove("hidden");
        if (!result) {
            box.innerHTML = '<p class="text-red-600">Keine gültigen Ablesungen für den Zeitraum oder Zähler nicht gefunden.</p>';
            return;
        }
        const unit = result.unit;
        let html = '<p class="font-bold text-gray-800">' + (result.meter.name || result.meter.type) + ': ' + result.start + ' bis ' + result.end + '</p>';
        html += '<p>Verbrauch: <strong>' + result.consumption.toFixed(2) + ' ' + unit + '</strong> (Stand ' + result.rStart.date + ' → ' + result.rEnd.date + ')</p>';
        html += '<p>Gesamtkosten: <strong>' + ImmoApp.ui.formatCurrency(result.totalCost) + '</strong>' + (result.tariff ? ' (Tarif ab ' + result.tariff.validFrom + ')' : '') + '</p>';
        html += '<p class="mt-2 text-gray-600">Verteilung: ' + (result.mode === "PERSON_DAYS_SQM" ? "Variante B (Personentage × m²)" : "Variante A (Personentage)") + '</p>';
        html += '<table class="mt-3 w-full max-w-xl border border-gray-200"><thead><tr class="bg-gray-100 text-left"><th class="p-2">Mieter</th><th class="p-2 text-right">Tage</th><th class="p-2 text-right">Anteil</th><th class="p-2 text-right">Kosten</th></tr></thead><tbody>';
        result.tenantShares.forEach(s => {
            html += '<tr class="border-t border-gray-100"><td class="p-2">' + (s.tenant.name || "?") + (s.tenant.room ? ' (' + s.tenant.room + ')' : '') + '</td><td class="p-2 text-right">' + s.days + '</td><td class="p-2 text-right">' + (s.share * 100).toFixed(1) + ' %</td><td class="p-2 text-right font-bold">' + ImmoApp.ui.formatCurrency(s.cost) + '</td></tr>';
        });
        html += '</tbody></table>';
        box.innerHTML = html;
    },

    render: function() {
        this.setupHTML();
        this.renderLists();
    }
};
