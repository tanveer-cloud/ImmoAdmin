window.ImmoApp = window.ImmoApp || {};

window.ImmoApp.tenants = {
    showAll: false,

    setupHTML: function() {
        const container = document.getElementById("tenants-content");
        if (container.innerHTML.includes("Lade Module...")) {
            container.innerHTML = `
                <div class="flex justify-between items-center mb-4 mt-2">
                    <h3 class="text-lg font-bold text-gray-800">Verwaltete Objekte & WGs</h3>
                    <button onclick="ImmoApp.tenants.showPropertyModal()" class="bg-blue-600 text-white px-3 py-1.5 rounded shadow hover:bg-blue-700 text-sm">+ Neues Objekt / WG</button>
                </div>
                <div class="bg-white rounded-lg shadow-sm border border-gray-100 mb-8">
                    <ul id="properties-list" class="divide-y divide-gray-200"></ul>
                </div>

                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-lg font-bold text-green-700">Aktuelle Mieter (<span class="year-label"></span>)</h3>
                    <button onclick="ImmoApp.tenants.showTenantModal()" class="bg-blue-600 text-white px-3 py-1.5 rounded shadow hover:bg-blue-700 text-sm">+ Neuer Mieter</button>
                </div>
                <div class="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden overflow-x-auto mb-8">
                    <table class="min-w-full divide-y divide-gray-200">
                        <thead class="bg-green-50">
                            <tr>
                                <th class="px-4 py-3 text-left text-xs font-bold text-green-800 uppercase">Objekt & Zimmer</th>
                                <th class="px-4 py-3 text-left text-xs font-bold text-green-800 uppercase">Mieter (Klick = Historie)</th>
                                <th class="px-4 py-3 text-left text-xs font-bold text-green-800 uppercase">Miete & Kaution</th>
                                <th class="px-4 py-3 text-left text-xs font-bold text-green-800 uppercase">Zeitraum</th>
                                <th class="px-4 py-3 text-right text-xs font-bold text-green-800 uppercase">Aktion</th>
                            </tr>
                        </thead>
                        <tbody id="tenants-table-body-active" class="bg-white divide-y divide-gray-200 text-sm"></tbody>
                    </table>
                </div>

                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-lg font-bold text-gray-500">Ausgezogene / Ehemalige Mieter</h3>
                </div>
                <div class="bg-gray-50 rounded-lg shadow-sm border border-gray-200 overflow-hidden overflow-x-auto opacity-75">
                    <table class="min-w-full divide-y divide-gray-200">
                        <thead class="bg-gray-200">
                            <tr>
                                <th class="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase">Objekt & Zimmer</th>
                                <th class="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase">Mieter</th>
                                <th class="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase">Kaution Status</th>
                                <th class="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase">Zeitraum</th>
                                <th class="px-4 py-3 text-right text-xs font-bold text-gray-600 uppercase">Aktion</th>
                            </tr>
                        </thead>
                        <tbody id="tenants-table-body-past" class="bg-gray-50 divide-y divide-gray-200 text-sm"></tbody>
                    </table>
                </div>

                <div id="modal-tenant-history" class="fixed inset-0 bg-black bg-opacity-50 hidden flex items-center justify-center z-50 overflow-y-auto">
                    <div class="bg-white p-6 rounded-lg shadow-lg w-full max-w-4xl my-8">
                        <div class="flex justify-between items-center mb-6">
                            <div>
                                <h3 class="text-xl font-bold">Gesamte Zahlungshistorie: <span id="history-tenant-name" class="text-blue-600"></span></h3>
                                <p class="text-sm text-gray-500 mt-1" id="history-months-info"></p>
                            </div>
                            <div class="flex gap-2">
                                <button id="btn-add-history-manual" class="bg-blue-100 text-blue-800 px-3 py-1.5 rounded font-bold hover:bg-blue-200 border border-blue-300 shadow-sm text-sm">+ Manuelle Korrekturbuchung</button>
                                <button onclick="document.getElementById('modal-tenant-history').classList.add('hidden')" class="text-gray-500 hover:text-gray-800 font-bold text-2xl ml-4">&times;</button>
                            </div>
                        </div>
                        
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                            <div class="bg-gray-50 p-4 rounded border">
                                <div class="text-sm text-gray-500 font-bold">Soll (Miete x Monate gesamt)</div>
                                <div class="text-2xl font-bold text-gray-800" id="history-total-expected">0,00 €</div>
                            </div>
                            <div class="bg-blue-50 p-4 rounded border border-blue-100">
                                <div class="text-sm text-blue-800 font-bold">Ist (Miete)</div>
                                <div class="text-2xl font-bold text-blue-700" id="history-total-paid">0,00 €</div>
                                <div class="text-xs text-blue-700 mt-1" id="history-deposit-info">Kaution: 0,00 € eingezahlt / 0,00 € erstattet</div>
                            </div>
                            <div class="bg-white p-4 rounded border shadow-sm" id="history-diff-box">
                                <div class="text-sm text-gray-500 font-bold">Bilanz (Gesamte Mietdauer)</div>
                                <div class="text-2xl font-bold" id="history-total-diff">0,00 €</div>
                            </div>
                        </div>

                        <div class="bg-white border rounded-lg overflow-hidden max-h-96 overflow-y-auto">
                            <table class="min-w-full divide-y divide-gray-200 text-sm">
                                <thead class="bg-gray-100 sticky top-0">
                                    <tr>
                                        <th class="px-4 py-2 text-left font-bold text-gray-600 w-24">Datum</th>
                                        <th class="px-4 py-2 text-left font-bold text-gray-600 w-16">Jahr</th>
                                        <th class="px-4 py-2 text-left font-bold text-gray-600">Typ & Zweck</th>
                                        <th class="px-4 py-2 text-right font-bold text-gray-600 w-32">Betrag</th>
                                        <th class="px-4 py-2 text-right font-bold text-gray-600 w-16">Aktion</th>
                                    </tr>
                                </thead>
                                <tbody id="history-table-body" class="bg-white divide-y divide-gray-200"></tbody>
                            </table>
                        </div>
                        
                        <div class="mt-6 flex justify-end">
                            <button onclick="document.getElementById('modal-tenant-history').classList.add('hidden')" class="px-6 py-2 bg-gray-800 text-white rounded font-bold hover:bg-gray-900">Schließen</button>
                        </div>
                    </div>
                </div>
            `;
            ImmoApp.ui.updateYearLabels();
        }
    },

    // NEU: Direkte Löschfunktion aus der Historie
    deleteHistoryTx: async function(txId, tenantId) {
        if(confirm("ACHTUNG: Willst du diesen Eintrag wirklich aus der Historie (und dem Kontoauszug) LÖSCHEN?")) {
            await ImmoApp.db.instance.transactions.delete(txId);
            this.showHistoryModal(tenantId);
            this.render();
            if(window.ImmoApp.dashboard) ImmoApp.dashboard.render();
            if(window.ImmoApp.banking) ImmoApp.banking.render();
        }
    },

    // NEU: Manuelle Korrektur direkt in der Historie eintragen
    addHistoryManualTx: async function(tenantId) {
        const amountStr = prompt("Bitte Betrag eingeben:\n\nBeispiel: '150' für eine Zahlung des Mieters\nBeispiel: '-50' für einen Abzug / Rückzahlung", "0");
        if (!amountStr) return;
        
        const amount = parseFloat(amountStr.replace(',', '.'));
        if (isNaN(amount) || amount === 0) return alert("Ungültiger Betrag.");
        
        const purpose = prompt("Verwendungszweck (z.B. 'Barzahlung' oder 'Korrektur'):", "Manuelle Korrektur");
        
        const db = ImmoApp.db.instance;
        const tenant = await db.tenants.get(tenantId);
        const date = new Date().toLocaleDateString('de-DE'); // Heutiges Datum
        const year = ImmoApp.ui.currentYear;
        
        await db.transactions.add({
            date: date,
            amount: amount, 
            name: tenant.name, 
            purpose: purpose || 'Manuelle Korrektur',
            iban: 'MANUELL', 
            matchedTenantId: tenantId, 
            category: 'RENT', 
            year: year, 
            importBatchId: 'manual_history'
        });
        
        this.showHistoryModal(tenantId);
        this.render();
        if(window.ImmoApp.dashboard) ImmoApp.dashboard.render();
        if(window.ImmoApp.banking) ImmoApp.banking.render();
    },

    showHistoryModal: async function(tenantId) {
        const db = ImmoApp.db.instance;
        const tenant = await db.tenants.get(tenantId);
        
        // Button verknüpfen
        document.getElementById('btn-add-history-manual').onclick = () => ImmoApp.tenants.addHistoryManualTx(tenantId);
        
        const allTrans = await db.transactions.where('matchedTenantId').equals(tenantId).toArray();
        
        allTrans.sort((a, b) => {
            const parseDate = (dStr) => {
                if(!dStr) return 0;
                const parts = dStr.split('.');
                if(parts.length === 3) {
                    let year = parts[2];
                    if (year.length === 2) year = "20" + year;
                    return new Date(`${year}-${parts[1]}-${parts[0]}`).getTime();
                }
                return 0;
            };
            return parseDate(b.date) - parseDate(a.date);
        });

        let totalExpected = 0;
        const moveIn = tenant.moveIn ? new Date(tenant.moveIn) : new Date('2000-01-01');
        let moveOut = tenant.moveOut ? new Date(tenant.moveOut) : new Date(); 
        
        if (moveOut > new Date()) moveOut = new Date(); 
        
        let monthsActive = 0;
        if (moveIn <= moveOut) {
            monthsActive = (moveOut.getFullYear() - moveIn.getFullYear()) * 12;
            monthsActive -= moveIn.getMonth();
            monthsActive += moveOut.getMonth() + 1;
        }
        if (monthsActive < 0) monthsActive = 0;
        
        totalExpected = monthsActive * tenant.rent;

        let totalPaidRent = 0;
        let totalDepositIn = 0;
        let totalDepositOut = 0;
        let tbody = '';
        
        allTrans.forEach(tx => {
            const isRent = tx.category === 'RENT';
            const isDeposit = tx.category === 'DEPOSIT';
            if (isRent) {
                totalPaidRent += tx.amount;
            }
            if (isDeposit) {
                if (tx.amount > 0) totalDepositIn += tx.amount;
                else totalDepositOut += Math.abs(tx.amount);
            }
            
            const isNegative = tx.amount < 0;
            const color = isNegative ? 'text-red-600' : 'text-green-600';
            let icon = isNegative ? '📉 Ausgang' : '📈 Eingang';
            let badgeClass = isNegative ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800';
            if (isDeposit) {
                icon = '🔒 Kaution';
                badgeClass = 'bg-yellow-100 text-yellow-800';
            }
            
            tbody += `
                <tr class="hover:bg-gray-50 border-b">
                    <td class="px-4 py-3 whitespace-nowrap text-gray-600">${tx.date}</td>
                    <td class="px-4 py-3 font-bold text-gray-500">${tx.year}</td>
                    <td class="px-4 py-3">
                        <span class="text-[10px] px-1.5 py-0.5 rounded mr-2 font-bold uppercase tracking-wide ${badgeClass}">${icon}</span>
                        <span class="text-gray-800 text-xs">${tx.purpose || 'Kein Verwendungszweck'}</span>
                    </td>
                    <td class="px-4 py-3 text-right font-bold ${color}">${ImmoApp.ui.formatCurrency(tx.amount)}</td>
                    <td class="px-4 py-3 text-right">
                        <button onclick="ImmoApp.tenants.deleteHistoryTx(${tx.id}, ${tenant.id})" class="text-red-500 hover:bg-red-50 p-1 rounded" title="Diesen Eintrag löschen">🗑️</button>
                    </td>
                </tr>
            `;
        });

        if (allTrans.length === 0) {
            tbody = `<tr><td colspan="5" class="px-4 py-8 text-center text-gray-500 italic">Es wurden noch keine Zahlungen für diesen Mieter erfasst.</td></tr>`;
        }

        const diff = totalPaidRent - totalExpected;
        
        document.getElementById('history-tenant-name').innerText = tenant.name;
        document.getElementById('history-months-info').innerText = `Info: Dieser Mieter hat seit Einzug ${monthsActive} Monatsmieten angesammelt.`;
        document.getElementById('history-total-expected').innerText = ImmoApp.ui.formatCurrency(totalExpected);
        document.getElementById('history-total-paid').innerText = ImmoApp.ui.formatCurrency(totalPaidRent);

        const depositInfoEl = document.getElementById('history-deposit-info');
        if (depositInfoEl) {
            depositInfoEl.innerText = `Kaution: ${ImmoApp.ui.formatCurrency(totalDepositIn)} eingezahlt / ${ImmoApp.ui.formatCurrency(totalDepositOut)} erstattet`;
        }
        
        const diffEl = document.getElementById('history-total-diff');
        const diffBox = document.getElementById('history-diff-box');
        
        if (diff < -10) { 
            diffEl.innerText = ImmoApp.ui.formatCurrency(diff) + " (Rückstand)";
            diffEl.className = "text-2xl font-bold text-red-600";
            diffBox.className = "bg-red-50 p-4 rounded border border-red-200 shadow-sm";
        } else if (diff > 10) {
            diffEl.innerText = "+" + ImmoApp.ui.formatCurrency(diff) + " (Guthaben)";
            diffEl.className = "text-2xl font-bold text-green-600";
            diffBox.className = "bg-green-50 p-4 rounded border border-green-200 shadow-sm";
        } else {
            diffEl.innerText = "0,00 € (Ausgeglichen)";
            diffEl.className = "text-2xl font-bold text-gray-800";
            diffBox.className = "bg-white p-4 rounded border border-gray-200 shadow-sm";
        }

        document.getElementById('history-table-body').innerHTML = tbody;
        document.getElementById('modal-tenant-history').classList.remove('hidden');
    },

    showPropertyModal: async function(id = '', name = '', totalRooms = '') {
        document.getElementById('modal-prop-id').value = id;
        document.getElementById('modal-prop-name').value = name;
        
        let contentHtml = document.getElementById('modal-property-content');
        if(!contentHtml) {
            const modalBody = document.querySelector('#modal-property .space-y-3');
            modalBody.innerHTML = `
                <div id="modal-property-content">
                    <div class="mb-3">
                        <label class="block text-sm font-medium">Name / Adresse (z.B. Forststraße 18)</label>
                        <input type="text" id="modal-prop-name" class="w-full border p-2 rounded">
                    </div>
                    <div>
                        <label class="block text-sm font-medium">Anzahl der Zimmer (für WG-Leerstands-Radar)</label>
                        <input type="number" id="modal-prop-rooms" class="w-full border p-2 rounded" placeholder="z.B. 4">
                        <p class="text-xs text-gray-500 mt-1">Lass es leer, wenn es eine normale Wohnung ist.</p>
                    </div>
                </div>
            `;
            document.getElementById('modal-prop-name').value = name;
        }
        document.getElementById('modal-prop-rooms').value = totalRooms || '';
        document.getElementById('modal-property').classList.remove('hidden');
    },

    saveProperty: async function() {
        const db = ImmoApp.db.instance;
        const id = document.getElementById('modal-prop-id').value;
        const name = document.getElementById('modal-prop-name').value;
        const totalRooms = document.getElementById('modal-prop-rooms').value;
        
        if(!name) return alert("Der Name des Objekts darf nicht leer sein.");
        
        const data = { name, totalRooms: totalRooms ? parseInt(totalRooms) : null };
        if(id) await db.properties.update(parseInt(id), data);
        else await db.properties.add(data);
        
        document.getElementById('modal-property').classList.add('hidden');
        this.render();
        if(window.ImmoApp.dashboard) ImmoApp.dashboard.render();
    },

    showTenantModal: async function(tenantId = null, defaultName = '', defaultIban = '', defaultDate = '', defaultRent = '') {
        const db = ImmoApp.db.instance;
        const props = await db.properties.toArray();
        const propSelect = document.getElementById('modal-tenant-property');
        
        propSelect.innerHTML = `<option value="">-- Bitte Objekt wählen --</option>`;
        props.forEach(p => {
            propSelect.innerHTML += `<option value="${p.id}">${p.name}</option>`;
        });

        let modalHtml = document.getElementById('modal-tenant-content');
        if(!modalHtml) {
            const modalBody = document.querySelector('#modal-tenant .space-y-4');
            modalBody.innerHTML = `
                <input type="hidden" id="modal-tenant-id">
                <div id="modal-tenant-content" class="space-y-4">
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium">Zugewiesenes Objekt *</label>
                            <select id="modal-tenant-property" class="w-full border p-2 rounded bg-white"></select>
                        </div>
                        <div>
                            <label class="block text-sm font-medium">Zimmer (optional)</label>
                            <input type="text" id="modal-tenant-room" class="w-full border p-2 rounded" placeholder="z.B. Zimmer 1">
                        </div>
                        <div>
                            <label class="block text-sm font-medium">Wohnfläche (m², optional)</label>
                            <input type="number" id="modal-tenant-sqm" class="w-full border p-2 rounded" step="0.01" placeholder="z.B. 15" title="Für Zähler-Verteilung Variante B">
                        </div>
                    </div>
                    <div>
                        <label class="block text-sm font-medium">Name des Mieters *</label>
                        <input type="text" id="modal-tenant-name" class="w-full border p-2 rounded" placeholder="z.B. Max Mustermann">
                    </div>
                    <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-blue-700">Kaltmiete (€) *</label>
                            <input type="number" id="modal-tenant-baserent" class="w-full border p-2 rounded bg-blue-50" step="0.01">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-orange-700">Nebenkosten (€) *</label>
                            <input type="number" id="modal-tenant-prepayment" class="w-full border p-2 rounded bg-orange-50" step="0.01">
                        </div>
                        <div>
                            <label class="block text-sm font-medium">Mietanpassung gültig ab</label>
                            <input type="date" id="modal-tenant-rentfrom" class="w-full border p-2 rounded" title="Optional: Datum ab dem diese Miete gelten soll">
                        </div>
                    </div>
                    <div class="flex items-center gap-2 bg-gray-100 p-2 rounded border">
                        <input type="checkbox" id="modal-tenant-isflatrate" class="w-4 h-4">
                        <label for="modal-tenant-isflatrate" class="text-sm font-bold text-gray-700">Pauschalmiete / Warmmiete (Es erfolgt keine NK-Abrechnung für diesen Mieter!)</label>
                    </div>
                    <div class="grid grid-cols-2 gap-4 border-t pt-4">
                        <div>
                            <label class="block text-sm font-medium">Hinterlegte Kaution (€)</label>
                            <input type="number" id="modal-tenant-deposit" class="w-full border p-2 rounded" step="0.01">
                        </div>
                        <div class="flex items-end pb-2">
                            <div class="flex items-center gap-2">
                                <input type="checkbox" id="modal-tenant-depositreturned" class="w-4 h-4 text-green-600">
                                <label for="modal-tenant-depositreturned" class="text-sm font-bold text-gray-700">Kaution wurde zurückgezahlt</label>
                            </div>
                        </div>
                    </div>
                    <div class="grid grid-cols-2 gap-4 border-t pt-4">
                        <div>
                            <label class="block text-sm font-medium">Einzugsdatum *</label>
                            <input type="date" id="modal-tenant-movein" class="w-full border p-2 rounded">
                        </div>
                        <div>
                            <label class="block text-sm font-medium">Auszugsdatum</label>
                            <input type="date" id="modal-tenant-moveout" class="w-full border p-2 rounded">
                        </div>
                    </div>
                    <div>
                        <label class="block text-sm font-medium">IBAN für Auto-Zuweisung</label>
                        <input type="text" id="modal-tenant-iban" class="w-full border p-2 rounded font-mono text-sm" placeholder="DE...">
                    </div>
                </div>
            `;
            const propSelectNew = document.getElementById('modal-tenant-property');
            propSelectNew.innerHTML = `<option value="">-- Bitte Objekt wählen --</option>`;
            props.forEach(p => {
                propSelectNew.innerHTML += `<option value="${p.id}">${p.name}</option>`;
            });
        }

        if (tenantId) {
            const t = await db.tenants.get(tenantId);
            document.getElementById('modal-tenant-id').value = t.id;
            document.getElementById('modal-tenant-property').value = t.propertyId || '';
            document.getElementById('modal-tenant-room').value = t.room || '';
            document.getElementById('modal-tenant-sqm').value = (t.sqm != null && t.sqm !== '') ? t.sqm : '';
            document.getElementById('modal-tenant-name').value = t.name;
            document.getElementById('modal-tenant-baserent').value = t.baseRent !== undefined ? t.baseRent : t.rent;
            document.getElementById('modal-tenant-prepayment').value = t.prepayment || 0;
            document.getElementById('modal-tenant-isflatrate').checked = t.isFlatRate || false;
            document.getElementById('modal-tenant-deposit').value = t.deposit || '';
            document.getElementById('modal-tenant-depositreturned').checked = t.depositReturned || false;
            document.getElementById('modal-tenant-iban').value = t.iban || '';
            document.getElementById('modal-tenant-movein').value = t.moveIn || '';
            document.getElementById('modal-tenant-moveout').value = t.moveOut || '';
        } else {
            document.getElementById('modal-tenant-id').value = '';
            document.getElementById('modal-tenant-property').value = '';
            document.getElementById('modal-tenant-room').value = '';
            document.getElementById('modal-tenant-sqm').value = '';
            document.getElementById('modal-tenant-name').value = defaultName;
            document.getElementById('modal-tenant-baserent').value = defaultRent || '';
            document.getElementById('modal-tenant-prepayment').value = 0;
            document.getElementById('modal-tenant-isflatrate').checked = false;
            document.getElementById('modal-tenant-deposit').value = '';
            document.getElementById('modal-tenant-depositreturned').checked = false;
            document.getElementById('modal-tenant-iban').value = defaultIban;
            
            let moveInDate = '';
            if (defaultDate) {
                const parts = defaultDate.split('.');
                if (parts.length === 3) {
                    const year = (parseInt(parts[2]) > 50 ? "19" : "20") + parts[2];
                    moveInDate = `${year}-${parts[1]}-${parts[0]}`;
                }
            }
            document.getElementById('modal-tenant-movein').value = moveInDate;
            document.getElementById('modal-tenant-moveout').value = '';
        }
        document.getElementById('modal-tenant').classList.remove('hidden');
    },

    saveTenant: async function() {
        const db = ImmoApp.db.instance;
        const id = document.getElementById('modal-tenant-id').value;
        const propertyId = document.getElementById('modal-tenant-property').value;
        const room = document.getElementById('modal-tenant-room').value;
        const sqmRaw = document.getElementById('modal-tenant-sqm').value;
        const sqm = (sqmRaw !== '' && !isNaN(parseFloat(sqmRaw))) ? parseFloat(sqmRaw) : null;
        const name = document.getElementById('modal-tenant-name').value;
        
        const baseRent = parseFloat(document.getElementById('modal-tenant-baserent').value || 0);
        const prepayment = parseFloat(document.getElementById('modal-tenant-prepayment').value || 0);
        const totalRent = baseRent + prepayment;
        const rentFromInput = document.getElementById('modal-tenant-rentfrom').value;
        
        const isFlatRate = document.getElementById('modal-tenant-isflatrate').checked;
        const deposit = parseFloat(document.getElementById('modal-tenant-deposit').value || 0);
        const depositReturned = document.getElementById('modal-tenant-depositreturned').checked;
        
        const iban = document.getElementById('modal-tenant-iban').value.replace(/\s+/g, '').toUpperCase();
        const moveIn = document.getElementById('modal-tenant-movein').value;
        const moveOut = document.getElementById('modal-tenant-moveout').value;

        if (!name || !propertyId || isNaN(parseInt(propertyId)) || !moveIn) {
            return alert("Bitte fülle Name, Einzugsdatum UND das zugeordnete Objekt aus!");
        }

        // Miet-Historie: einfache Staffel, aktuell nur technisch gespeichert,
        // die Berechnung wird in einem späteren Schritt umgestellt.
        let rentHistory = [];
        if (id) {
            const existing = await db.tenants.get(parseInt(id));
            if (existing && Array.isArray(existing.rentHistory)) {
                rentHistory = existing.rentHistory;
            }
            // Wenn sich die Miete geändert hat, füge einen neuen Eintrag an
            const prevRent = existing ? (existing.rent || 0) : 0;
            const prevPrepay = existing ? (existing.prepayment || 0) : 0;
            if (prevRent !== totalRent || prevPrepay !== prepayment) {
                rentHistory = rentHistory || [];
                const fromDate = rentFromInput || new Date().toISOString().split('T')[0];
                rentHistory.push({
                    from: fromDate,
                    rent: totalRent,
                    baseRent: baseRent,
                    prepayment: prepayment
                });
            }
        } else {
            // Neuer Mieter: initiale Miete als erster Eintrag hinterlegen
            rentHistory.push({
                from: moveIn,
                rent: totalRent,
                baseRent: baseRent,
                prepayment: prepayment
            });
        }

        const data = { 
            propertyId: parseInt(propertyId), 
            room,
            sqm,
            name, 
            rent: totalRent, 
            baseRent,
            prepayment,
            isFlatRate,
            deposit,
            depositReturned,
            iban, 
            moveIn, 
            moveOut,
            rentHistory
        };

        if (id) await db.tenants.update(parseInt(id), data);
        else await db.tenants.add(data);
        
        document.getElementById('modal-tenant').classList.add('hidden');
        if(window.ImmoApp.banking) await window.ImmoApp.banking.runAutoMatch();
        this.render();
        if(window.ImmoApp.dashboard) ImmoApp.dashboard.render();
    },

    deleteTenant: async function(id) {
        if(confirm("ACHTUNG: Willst du diesen Mieter wirklich löschen?\n\nAlle bisher zugeordneten Buchungen dieses Mieters werden dadurch wieder auf 'Offen' gesetzt!")) {
            const db = ImmoApp.db.instance;
            const txs = await db.transactions.where('matchedTenantId').equals(id).toArray();
            for(let tx of txs) {
                await db.transactions.update(tx.id, { matchedTenantId: null, category: 'UNMATCHED' });
            }
            await db.tenants.delete(id);
            this.render();
            if(window.ImmoApp.dashboard) ImmoApp.dashboard.render();
            if(window.ImmoApp.banking) ImmoApp.banking.render();
        }
    },

    render: async function() {
        this.setupHTML();
        const db = ImmoApp.db.instance;
        const currentYear = ImmoApp.ui.currentYear;
        
        const props = await db.properties.toArray();
        const propList = document.getElementById("properties-list");
        propList.innerHTML = "";
        props.forEach(p => {
            const roomBadge = p.totalRooms ? `<span class="bg-gray-200 text-xs px-2 py-1 rounded ml-2">${p.totalRooms} Zimmer (WG)</span>` : '';
            propList.innerHTML += `
                <li class="px-4 py-3 flex justify-between items-center hover:bg-gray-50">
                    <div>
                        <span class="font-bold text-gray-700">${p.name}</span>
                        ${roomBadge}
                    </div>
                    <button onclick="ImmoApp.tenants.showPropertyModal(${p.id}, '${p.name}', '${p.totalRooms || ''}')" class="text-blue-600 text-xs bg-blue-50 px-2 py-1 rounded">Bearbeiten</button>
                </li>
            `;
        });
        
        let list = await db.tenants.toArray();
        list.sort((a,b) => a.propertyId - b.propertyId);
        
        const tbodyActive = document.getElementById("tenants-table-body-active");
        const tbodyPast = document.getElementById("tenants-table-body-past");
        tbodyActive.innerHTML = "";
        tbodyPast.innerHTML = "";
        
        let pastCount = 0;

        list.forEach(t => {
            const inDate = t.moveIn ? new Date(t.moveIn) : new Date('2000-01-01');
            const yearEnd = new Date(parseInt(currentYear), 11, 31);
            if (inDate > yearEnd) return;

            const prop = props.find(p => p.id === parseInt(t.propertyId));
            const propName = prop ? prop.name : `<span class="text-red-500">Fehler</span>`;
            const roomTxt = t.room ? `<span class="text-xs bg-yellow-100 text-yellow-800 px-1 rounded ml-1 border border-yellow-200">${t.room}</span>` : '';
            
            const moveInFormat = t.moveIn ? new Date(t.moveIn).toLocaleDateString('de-DE') : '-';
            const moveOutFormat = t.moveOut ? new Date(t.moveOut).toLocaleDateString('de-DE') : 'Aktiv';
            
            const isActive = ImmoApp.utils.getActiveMonthsInYear(t.moveIn, t.moveOut, currentYear) > 0;
            
            const base = t.baseRent !== undefined ? t.baseRent : t.rent;
            const prep = t.prepayment || 0;
            const flatBadge = t.isFlatRate ? `<span class="text-[10px] bg-purple-100 text-purple-800 px-1 rounded block w-max mt-1">Pauschal / Warm</span>` : '';
            const depTxt = t.deposit ? `Kaution: ${ImmoApp.ui.formatCurrency(t.deposit)}` : 'Keine Kaution';
            
            let depBadge = '';
            if(t.deposit > 0) {
                depBadge = t.depositReturned 
                    ? `<span class="text-xs text-green-600 font-bold">✅ Erstattet</span>` 
                    : `<span class="text-xs text-orange-600 font-bold">⏳ Einbehalten (${ImmoApp.ui.formatCurrency(t.deposit)})</span>`;
            }

            const actionBtns = `
                <button onclick="ImmoApp.tenants.showHistoryModal(${t.id})" class="text-purple-600 text-xs bg-purple-50 px-2 py-1.5 rounded shadow-sm hover:bg-purple-100 mr-2" title="Zahlungshistorie aller Jahre">📊 Historie</button>
                <button onclick="ImmoApp.tenants.showTenantModal(${t.id})" class="text-blue-600 text-xs bg-blue-50 px-2 py-1.5 rounded shadow-sm hover:bg-blue-100 mr-2" title="Bearbeiten">✏️</button>
                <button onclick="ImmoApp.tenants.deleteTenant(${t.id})" class="text-red-600 text-xs bg-red-50 px-2 py-1.5 rounded shadow-sm hover:bg-red-100" title="Löschen">🗑️</button>
            `;

            const nameLink = `<span class="font-medium text-blue-600 cursor-pointer hover:underline" onclick="ImmoApp.tenants.showHistoryModal(${t.id})" title="Klicken für gesamte Zahlungshistorie">${t.name}</span>`;

            if(isActive) {
                tbodyActive.innerHTML += `
                    <tr class="hover:bg-gray-100 border-b">
                        <td class="px-4 py-3 align-top whitespace-nowrap">
                            <span class="block text-xs font-bold text-gray-500">${propName}</span>
                            ${roomTxt}
                        </td>
                        <td class="px-4 py-3 align-top whitespace-nowrap">
                            ${nameLink}
                            ${flatBadge}
                        </td>
                        <td class="px-4 py-3 align-top whitespace-nowrap text-xs text-gray-600">
                            <strong class="text-sm text-gray-800">${ImmoApp.ui.formatCurrency(t.rent)}</strong> mtl.<br>
                            Kalt: ${ImmoApp.ui.formatCurrency(base)} | NK: ${ImmoApp.ui.formatCurrency(prep)}<br>
                            <span class="text-gray-400">${depTxt}</span>
                        </td>
                        <td class="px-4 py-3 align-top whitespace-nowrap text-xs text-gray-500">${moveInFormat} <br>bis ${moveOutFormat}</td>
                        <td class="px-4 py-3 align-top whitespace-nowrap text-right">
                            ${actionBtns}
                        </td>
                    </tr>
                `;
            } else {
                tbodyPast.innerHTML += `
                    <tr class="hover:bg-gray-100 border-b opacity-80">
                        <td class="px-4 py-3 align-top whitespace-nowrap">
                            <span class="block text-xs font-bold text-gray-500">${propName}</span>
                            ${roomTxt}
                        </td>
                        <td class="px-4 py-3 align-top whitespace-nowrap">${nameLink}</td>
                        <td class="px-4 py-3 align-top whitespace-nowrap">${depBadge}</td>
                        <td class="px-4 py-3 align-top whitespace-nowrap text-xs text-gray-500">${moveInFormat} <br>bis ${moveOutFormat}</td>
                        <td class="px-4 py-3 align-top whitespace-nowrap text-right">
                            ${actionBtns}
                        </td>
                    </tr>
                `;
                pastCount++;
            }
        });

        if(pastCount === 0) tbodyPast.innerHTML = `<tr><td colspan="5" class="px-4 py-4 text-center text-gray-500 italic">Keine ausgezogenen Mieter vorhanden.</td></tr>`;
        if(tbodyActive.innerHTML === "") tbodyActive.innerHTML = `<tr><td colspan="5" class="px-4 py-4 text-center text-gray-500 italic">Keine aktiven Mieter in diesem Jahr.</td></tr>`;
    }
};