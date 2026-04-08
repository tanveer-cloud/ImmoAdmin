window.ImmoApp = window.ImmoApp || {};

window.ImmoApp.utils = {
    getActiveMonthsInYear: function(moveInStr, moveOutStr, targetYear) {
        const year = parseInt(targetYear);
        const yearStart = new Date(year, 0, 1);
        const yearEnd = new Date(year, 11, 31);
        
        const moveIn = moveInStr ? new Date(moveInStr) : new Date(2000, 0, 1);
        const moveOut = moveOutStr ? new Date(moveOutStr) : new Date(2099, 11, 31);

        if (moveIn > yearEnd || moveOut < yearStart) return 0;

        const effectiveStart = moveIn > yearStart ? moveIn : yearStart;
        const effectiveEnd = moveOut < yearEnd ? moveOut : yearEnd;

        let months = (effectiveEnd.getFullYear() - effectiveStart.getFullYear()) * 12;
        months -= effectiveStart.getMonth();
        months += effectiveEnd.getMonth() + 1;
        return months <= 0 ? 0 : months;
    }
};

window.ImmoApp.dashboard = {
    setupHTML: function() {
        const container = document.getElementById("dashboard-content");
        if (container.innerHTML.includes("Lade Module...")) {
            container.innerHTML = `
                <div id="dash-alerts-container" class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 hidden">
                    <div class="bg-amber-50 p-6 rounded-lg shadow-sm border border-amber-200">
                        <h3 class="text-amber-800 text-sm font-bold mb-2 uppercase flex items-center gap-2"><span>💰</span> Ausstehende Kautionen</h3>
                        <ul id="dash-deposit-alerts" class="space-y-2 text-sm"></ul>
                    </div>
                    <div class="bg-red-50 p-6 rounded-lg shadow-sm border border-red-200">
                        <h3 class="text-red-800 text-sm font-bold mb-2 uppercase flex items-center gap-2"><span>🛏️</span> WG-Leerstands-Radar</h3>
                        <ul id="dash-vacancy-alerts" class="space-y-2 text-sm"></ul>
                    </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div class="bg-green-50 p-6 rounded-lg shadow-sm border border-green-100 border-t-[3px] border-t-green-500">
                        <h3 class="text-gray-600 text-sm font-semibold mb-1">Soll-Miete</h3>
                        <p class="text-3xl font-bold text-green-600" id="dash-expected-rent">0,00 €</p>
                        <p class="text-xs text-green-700 mt-1" id="dash-expected-sub">0 aktive Mieter</p>
                    </div>
                    <div class="bg-blue-50 p-6 rounded-lg shadow-sm border border-blue-100 border-t-[3px] border-t-blue-500">
                        <h3 class="text-gray-600 text-sm font-semibold mb-1">Ist-Einnahmen</h3>
                        <p class="text-3xl font-bold text-blue-600" id="dash-actual-rent">0,00 €</p>
                        <p class="text-xs text-blue-700 mt-1" id="dash-actual-sub">0 % erreicht</p>
                    </div>
                    <div class="bg-red-50 p-6 rounded-lg shadow-sm border border-red-100 border-t-[3px] border-t-red-500">
                        <h3 class="text-gray-600 text-sm font-semibold mb-1">Ausstehend</h3>
                        <p class="text-3xl font-bold text-red-500" id="dash-missing-rent">0,00 €</p>
                        <p class="text-xs text-red-700 mt-1" id="dash-missing-sub">0 Mieter im Rückstand</p>
                    </div>
                </div>
                
                <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-100 space-y-4">
                    <div>
                        <h3 class="text-lg font-bold mb-2 text-gray-800">📊 Mietstatus im gewählten Jahr</h3>
                        <ul id="dash-status-list" class="space-y-2 text-sm"></ul>
                    </div>
                    <div class="border-t pt-4">
                        <h3 class="text-lg font-bold mb-2 text-gray-800">💶 Bilanz je Mieter (Jahr)</h3>
                        <div class="overflow-x-auto">
                            <table class="min-w-full text-xs md:text-sm border border-gray-200 rounded">
                                <thead class="bg-gray-50 text-gray-600">
                                    <tr>
                                        <th class="px-3 py-2 text-left">Mieter</th>
                                        <th class="px-3 py-2 text-right">Soll</th>
                                        <th class="px-3 py-2 text-right">Ist</th>
                                        <th class="px-3 py-2 text-right">Bilanz</th>
                                    </tr>
                                </thead>
                                <tbody id="dash-bilanz-body" class="bg-white"></tbody>
                            </table>
                        </div>
                    </div>
                </div>
                
                <div id="modal-monthly-details" class="fixed inset-0 bg-black bg-opacity-50 hidden flex items-center justify-center z-50 overflow-y-auto">
                    <div class="bg-white p-6 rounded-lg shadow-lg w-full max-w-4xl my-8">
                        <div class="flex justify-between items-center mb-4">
                            <h3 class="text-xl font-bold">Zahlungen: <span id="monthly-tenant-name" class="text-blue-600"></span></h3>
                            <span id="monthly-year-label" class="font-bold bg-gray-200 px-2 py-1 rounded"></span>
                        </div>
                        <div class="border rounded-lg overflow-hidden">
                            <table class="min-w-full divide-y divide-gray-200 text-sm">
                                <thead class="bg-gray-50">
                                    <tr>
                                        <th class="px-4 py-2 text-left w-16">Monat</th>
                                        <th class="px-4 py-2 text-right">Soll</th>
                                        <th class="px-4 py-2 text-right">Ist (Klicken für Details)</th>
                                        <th class="px-4 py-2 text-right">Diff.</th>
                                        <th class="px-4 py-2 text-right w-64">Status & Aktion</th>
                                    </tr>
                                </thead>
                                <tbody id="monthly-table-body" class="bg-white divide-y divide-gray-200"></tbody>
                            </table>
                        </div>
                        <div class="mt-6 flex justify-between items-center">
                            <div class="flex gap-2">
                                <button id="btn-jump-banking" class="text-sm bg-blue-50 text-blue-600 font-bold px-4 py-2 rounded hover:bg-blue-100 border border-blue-200">🔍 Kontoauszug</button>
                                <button id="btn-jump-history" class="text-sm bg-purple-50 text-purple-600 font-bold px-4 py-2 rounded hover:bg-purple-100 border border-purple-200">📊 Historie (Alle Jahre)</button>
                            </div>
                            <button onclick="document.getElementById('modal-monthly-details').classList.add('hidden')" class="px-6 py-2 bg-gray-800 text-white rounded hover:bg-gray-900 font-bold">Schließen</button>
                        </div>
                    </div>
                </div>
            `;
        }
    },

    _loadDashboardCore: async function (currentYear) {
        const db = ImmoApp.db.instance;
        if (ImmoApp.api && ImmoApp.api.useApiData()) {
            const [tr, tn, pr] = await Promise.all([
                ImmoApp.api.getTransactions({ limit: 8000 }),
                ImmoApp.api.getTenants({ limit: 500 }),
                ImmoApp.api.getProperties({ limit: 500 })
            ]);
            const allTrans = (tr.data || [])
                .map(ImmoApp.api.mapTransactionFromApi)
                .filter(function (tx) { return String(tx.year) === String(currentYear); });
            const allTenants = (tn.data || []).map(ImmoApp.api.mapTenantFromApi);
            const allProps = (pr.data || []).map(ImmoApp.api.mapPropertyFromApi);
            return { allTrans: allTrans, allTenants: allTenants, allProps: allProps };
        }
        const allTenants = await db.tenants.toArray();
        const allTrans = await db.transactions.where("year").equals(currentYear).toArray();
        const allProps = await db.properties.toArray();
        return { allTrans: allTrans, allTenants: allTenants, allProps: allProps };
    },

    jumpToBanking: function(tenantName) {
        document.getElementById('modal-monthly-details').classList.add('hidden');
        ImmoApp.ui.switchTab('banking');
        setTimeout(() => {
            if(ImmoApp.banking) {
                const filterInput = document.getElementById('banking-text-filter');
                const statusFilter = document.getElementById('banking-status-filter');
                if(filterInput && statusFilter) {
                    // Auf Namen filtern (Textsuche), keinen harten Tenant-Filter setzen
                    filterInput.value = tenantName;
                    statusFilter.value = "ALL";
                    ImmoApp.banking.tenantFilterId = null;
                    ImmoApp.banking.tenantFilterName = null;
                    ImmoApp.banking.render();
                }
            }
        }, 50);
    },

    editTenantDirectly: function(tenantId) {
        ImmoApp.ui.switchTab('tenants');
        setTimeout(() => {
            if(ImmoApp.tenants) ImmoApp.tenants.showTenantModal(tenantId);
        }, 50);
    },

    addManualPayment: async function(tenantId, month, amount) {
        const db = ImmoApp.db.instance;
        let tenant;
        if (ImmoApp.api && ImmoApp.api.useApiData()) {
            const row = await ImmoApp.api.getTenant(tenantId);
            tenant = row ? ImmoApp.api.mapTenantFromApi(row) : null;
        } else {
            tenant = await db.tenants.get(tenantId);
        }
        if (!tenant) {
            alert("Mieter nicht gefunden.");
            return;
        }
        const currentYear = ImmoApp.ui.currentYear;
        const monthStr = month.toString().padStart(2, '0');

        if(confirm(`Möchtest du eine manuelle Korrektur über ${ImmoApp.ui.formatCurrency(amount)} eintragen?`)) {
            try {
                if (ImmoApp.api && ImmoApp.api.useApiData()) {
                    const iso = currentYear + "-" + monthStr + "-15";
                    await ImmoApp.api.postTransaction({
                        tenant_id: tenantId,
                        date_value: iso,
                        amount: amount,
                        name: tenant.name,
                        purpose: "Manuell ausgeglichen für " + monthStr + "/" + currentYear,
                        iban: "MANUELL",
                        category: "RENT",
                        year_value: String(currentYear),
                        import_batch_id: "manual"
                    });
                } else {
                    await db.transactions.add({
                        date: `15.${monthStr}.${currentYear.substring(2)}`,
                        amount: amount,
                        name: tenant.name,
                        purpose: `Manuell ausgeglichen für ${monthStr}/${currentYear}`,
                        iban: 'MANUELL',
                        matchedTenantId: tenantId,
                        category: 'RENT',
                        year: currentYear,
                        importBatchId: 'manual'
                    });
                }
            } catch (e) {
                alert(e.message || "Speichern fehlgeschlagen");
                return;
            }
            this.showMonthlyDetails(tenantId);
            this.render();
            if(window.ImmoApp.banking) ImmoApp.banking.render();
        }
    },

    deleteManualPayment: async function(txId, tenantId) {
        if(confirm("Möchtest du diesen manuellen Eintrag wirklich wieder löschen?")) {
            try {
                if (ImmoApp.api && ImmoApp.api.useApiData()) {
                    await ImmoApp.api.deleteTransaction(txId);
                } else {
                    await ImmoApp.db.instance.transactions.delete(txId);
                }
            } catch (e) {
                alert(e.message || "Löschen fehlgeschlagen");
                return;
            }
            this.showMonthlyDetails(tenantId);
            this.render();
            if(window.ImmoApp.banking) ImmoApp.banking.render();
        }
    },

    markDepositPaid: async function(tenantId) {
        if(confirm("Wurde die Kaution an den Mieter zurücküberwiesen und soll sie aus dieser Warnliste verschwinden?")) {
            try {
                if (ImmoApp.api && ImmoApp.api.useApiData()) {
                    await ImmoApp.api.patchTenant(tenantId, { deposit_returned: true });
                } else {
                    const db = ImmoApp.db.instance;
                    await db.tenants.update(tenantId, { depositReturned: true });
                }
            } catch (e) {
                alert(e.message || "Speichern fehlgeschlagen");
                return;
            }
            this.render();
            if(window.ImmoApp.tenants) ImmoApp.tenants.render();
        }
    },

    render: async function() {
        this.setupHTML();
        const db = ImmoApp.db.instance;
        const currentYear = ImmoApp.ui.currentYear;
        const today = new Date();
        
        let allTenants;
        let allTrans;
        let allProps;
        try {
            const pack = await this._loadDashboardCore(currentYear);
            allTenants = pack.allTenants;
            allTrans = pack.allTrans;
            allProps = pack.allProps;
        } catch (e) {
            console.error(e);
            const statusList = document.getElementById("dash-status-list");
            if (statusList) statusList.innerHTML = '<li class="text-red-600">Daten: ' + (e.message || "Fehler") + "</li>";
            return;
        }
        const now = new Date();
        const realCurrentYear = now.getFullYear();
        const monthLimit = (parseInt(currentYear, 10) === realCurrentYear) ? now.getMonth() : 11; // 0..11 inclusive

        const depositList = document.getElementById("dash-deposit-alerts");
        const vacancyList = document.getElementById("dash-vacancy-alerts");
        depositList.innerHTML = "";
        vacancyList.innerHTML = "";
        let alertsFound = false;

        allTenants.forEach(t => {
            if(t.deposit > 0 && !t.depositReturned && t.moveOut) {
                const outDate = new Date(t.moveOut);
                if(outDate < today) {
                    alertsFound = true;
                    const depositLink = `<button onclick="ImmoApp.dashboard.jumpToBanking('${t.name}')" class="text-blue-600 hover:underline font-bold" title="Klicken, um im Kontoauszug nach der Rückzahlung zu suchen">${ImmoApp.ui.formatCurrency(t.deposit)} 🔍</button>`;
                    
                    depositList.innerHTML += `
                        <li class="flex justify-between items-center bg-white p-2 rounded shadow-sm border border-amber-100">
                            <div>
                                <strong class="text-amber-900 block cursor-pointer hover:underline" onclick="ImmoApp.dashboard.editTenantDirectly(${t.id})">${t.name}</strong>
                                <span class="text-xs text-amber-700">Auszug: ${outDate.toLocaleDateString('de-DE')} | Kaution: ${depositLink}</span>
                            </div>
                            <button onclick="ImmoApp.dashboard.markDepositPaid(${t.id})" class="text-xs bg-amber-100 hover:bg-amber-200 text-amber-800 px-2 py-1 rounded font-bold">Als Erledigt markieren</button>
                        </li>
                    `;
                }
            }
        });

        allProps.forEach(p => {
            if(p.totalRooms && p.totalRooms > 0) {
                const currentlyActive = allTenants.filter(t => {
                    if(t.propertyId !== p.id) return false;
                    const inDate = t.moveIn ? new Date(t.moveIn) : new Date('2000-01-01');
                    const outDate = t.moveOut ? new Date(t.moveOut) : new Date('2099-12-31');
                    return (today >= inDate && today <= outDate);
                });
                
                const emptyRooms = p.totalRooms - currentlyActive.length;
                if(emptyRooms > 0) {
                    alertsFound = true;
                    vacancyList.innerHTML += `
                        <li class="bg-white p-2 rounded shadow-sm border border-red-100 flex justify-between items-center">
                            <div>
                                <strong class="text-red-900 block">${p.name}</strong>
                                <span class="text-xs text-red-700">Aktuell sind ${emptyRooms} von ${p.totalRooms} Zimmern nicht besetzt!</span>
                            </div>
                            <button onclick="ImmoApp.ui.switchTab('tenants')" class="text-xs bg-red-100 text-red-800 px-2 py-1 rounded hover:bg-red-200">Zur Verwaltung</button>
                        </li>
                    `;
                }
            }
        });

        if(!alertsFound) {
            document.getElementById("dash-alerts-container").classList.add("hidden");
        } else {
            document.getElementById("dash-alerts-container").classList.remove("hidden");
            if(depositList.innerHTML === "") depositList.innerHTML = `<li class="text-gray-500 italic text-xs">Alles erledigt.</li>`;
            if(vacancyList.innerHTML === "") vacancyList.innerHTML = `<li class="text-gray-500 italic text-xs">WGs sind voll besetzt!</li>`;
        }

        let expectedYearly = 0;
        const activeTenants = [];

        const getRentForMonth = (tenant, year, monthIndex) => {
            // monthIndex: 0-11
            const checkDate = new Date(year, monthIndex, 15);
            const moveIn = tenant.moveIn ? new Date(tenant.moveIn) : new Date(2000, 0, 1);
            const moveOut = tenant.moveOut ? new Date(tenant.moveOut) : new Date(2099, 11, 31);
            if (checkDate < moveIn || checkDate > moveOut) return 0;

            const history = Array.isArray(tenant.rentHistory) ? tenant.rentHistory : null;
            if (!history || history.length === 0) {
                return tenant.rent || 0;
            }
            // passende Stufe aus rentHistory wählen (letzter Eintrag mit from <= checkDate)
            let best = null;
            history.forEach(h => {
                if (!h.from) return;
                const d = new Date(h.from);
                if (d <= checkDate) {
                    if (!best || d > new Date(best.from)) {
                        best = h;
                    }
                }
            });
            return best ? (best.rent || 0) : (tenant.rent || 0);
        };

        allTenants.forEach(t => {
            // Bei laufendem Jahr: nur bis zum aktuellen Monat bewerten.
            let expectedForTenant = 0;
            let activeMonthsUpTo = 0;
            for (let m = 0; m <= monthLimit; m++) {
                const rent = getRentForMonth(t, parseInt(currentYear, 10), m);
                expectedForTenant += rent;
                if (rent > 0) activeMonthsUpTo++;
            }
            if (activeMonthsUpTo > 0) {
                expectedYearly += expectedForTenant;
                activeTenants.push({ ...t, activeMonths: activeMonthsUpTo, _yearlyExpected: expectedForTenant });
            }
        });

        const parseTxMonthIndex = (tx) => {
            if (!tx?.date) return null;
            const parts = String(tx.date).split('.');
            if (parts.length !== 3) return null;
            const m = parts[1];
            if (!m) return null;
            const mNum = parseInt(m, 10);
            if (!Number.isFinite(mNum)) return null;
            const monthIndex = mNum - 1; // 0..11
            if (monthIndex < 0 || monthIndex > 11) return null;
            return monthIndex;
        };

        const actualRent = allTrans
            .filter(tx => tx.category === 'RENT')
            .reduce((sum, tx) => {
                const monthIndex = parseTxMonthIndex(tx);
                if (monthIndex == null) return sum;
                if (monthIndex > monthLimit) return sum; // nur bis aktuellem Monat
                return sum + tx.amount;
            }, 0);

        document.getElementById("dash-expected-rent").innerText = ImmoApp.ui.formatCurrency(expectedYearly);
        document.getElementById("dash-actual-rent").innerText = ImmoApp.ui.formatCurrency(actualRent);
        const totalMissing = expectedYearly - actualRent;
        document.getElementById("dash-missing-rent").innerText = ImmoApp.ui.formatCurrency(totalMissing);

        const statusList = document.getElementById("dash-status-list");
        const bilanzBody = document.getElementById("dash-bilanz-body");
        statusList.innerHTML = "";
        if (bilanzBody) bilanzBody.innerHTML = "";
        
        if(activeTenants.length === 0) {
            statusList.innerHTML = `<li class="text-gray-500 italic">Keine aktiven Mieter für dieses Jahr gefunden.</li>`;
        }

        const bilanz = [];
        let arrearsCount = 0;
        const getInitials = (name) => {
            const parts = String(name || '').trim().split(/\s+/).filter(Boolean);
            if (parts.length === 0) return '??';
            if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
            return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
        };

        for (let tenant of activeTenants) {
            const expectedForTenant = tenant._yearlyExpected != null ? tenant._yearlyExpected : (tenant.rent * tenant.activeMonths);
            const paid = allTrans
                .filter(tx => tx.matchedTenantId === tenant.id && tx.category === 'RENT')
                .reduce((sum, tx) => {
                    const monthIndex = parseTxMonthIndex(tx);
                    if (monthIndex == null) return sum;
                    if (monthIndex > monthLimit) return sum; // nur bis aktuellem Monat
                    return sum + tx.amount;
                }, 0);
            const diffTenant = paid - expectedForTenant;
            
            const pInfo = tenant.isFlatRate ? '<span class="text-[10px] bg-purple-100 text-purple-800 px-1 rounded ml-2 relative -top-0.5">Pauschalmieter</span>' : '';

            bilanz.push({ tenant, expected: expectedForTenant, paid, diff: diffTenant });

            if (expectedForTenant > 0 && paid < (expectedForTenant - (tenant.rent * 0.5))) {
                arrearsCount++;
                const initials = getInitials(tenant.name);
                statusList.innerHTML += `
                    <li class="p-3 bg-red-50 border border-red-200 rounded cursor-pointer hover:bg-red-100 transition shadow-sm" onclick="ImmoApp.dashboard.showMonthlyDetails(${tenant.id})">
                        <div class="flex justify-between items-start gap-3">
                            <div class="flex items-start gap-3 min-w-0">
                                <div class="w-9 h-9 rounded-full bg-red-200 text-red-800 flex items-center justify-center text-xs font-bold shrink-0">${initials}</div>
                                <div class="min-w-0">
                                    <strong class="text-red-700 text-base leading-tight hover:underline hover:text-blue-800" onclick="event.stopPropagation(); ImmoApp.dashboard.editTenantDirectly(${tenant.id});" title="Mieter direkt bearbeiten">${tenant.name} ${pInfo}</strong>
                                    <div class="mt-1 text-sm text-gray-600">
                                        Soll: ${ImmoApp.ui.formatCurrency(expectedForTenant)} | Ist: <span class="font-bold text-red-600">${ImmoApp.ui.formatCurrency(paid)}</span>
                                    </div>
                                    <span class="text-xs text-red-600 block mt-1">Es fehlen ${ImmoApp.ui.formatCurrency(expectedForTenant - paid)}. Klicke für Details.</span>
                                </div>
                            </div>
                            <span class="text-xs bg-red-600 text-white px-3 py-1 rounded-full self-center whitespace-nowrap">Prüfen ➔</span>
                        </div>
                    </li>`;
            } else if (diffTenant > (tenant.rent * 0.1)) {
                const initials = getInitials(tenant.name);
                statusList.innerHTML += `
                    <li class="p-3 bg-blue-50 border border-blue-200 rounded cursor-pointer hover:bg-blue-100 transition shadow-sm" onclick="ImmoApp.dashboard.showMonthlyDetails(${tenant.id})">
                        <div class="flex justify-between items-start gap-3">
                            <div class="flex items-start gap-3 min-w-0">
                                <div class="w-9 h-9 rounded-full bg-blue-200 text-blue-800 flex items-center justify-center text-xs font-bold shrink-0">${initials}</div>
                                <div class="min-w-0">
                                    <strong class="text-blue-800 text-base leading-tight hover:underline hover:text-blue-900" onclick="event.stopPropagation(); ImmoApp.dashboard.editTenantDirectly(${tenant.id});" title="Mieter direkt bearbeiten">${tenant.name} ${pInfo}</strong>
                                    <div class="mt-1 text-sm text-gray-600">
                                        Soll: ${ImmoApp.ui.formatCurrency(expectedForTenant)} | Ist: <span class="font-bold text-blue-600">${ImmoApp.ui.formatCurrency(paid)}</span>
                                    </div>
                                    <span class="text-xs text-blue-600 block mt-1">Guthaben von ${ImmoApp.ui.formatCurrency(diffTenant)} (zu viel / zu früh bezahlt).</span>
                                </div>
                            </div>
                            <span class="text-xs bg-blue-600 text-white px-3 py-1 rounded-full self-center whitespace-nowrap">Guthaben ➔</span>
                        </div>
                    </li>`;
            } else {
                const initials = getInitials(tenant.name);
                statusList.innerHTML += `
                    <li class="p-3 bg-green-50 border border-green-200 rounded cursor-pointer hover:bg-green-100 transition shadow-sm" onclick="ImmoApp.dashboard.showMonthlyDetails(${tenant.id})">
                        <div class="flex justify-between items-start gap-3">
                            <div class="flex items-start gap-3 min-w-0">
                                <div class="w-9 h-9 rounded-full bg-green-200 text-green-800 flex items-center justify-center text-xs font-bold shrink-0">${initials}</div>
                                <div class="min-w-0">
                                    <strong class="text-green-800 text-base leading-tight hover:underline hover:text-blue-800" onclick="event.stopPropagation(); ImmoApp.dashboard.editTenantDirectly(${tenant.id});" title="Mieter direkt bearbeiten">${tenant.name} ${pInfo}</strong>
                                    <div class="mt-1 text-sm text-gray-600">
                                        Soll: ${ImmoApp.ui.formatCurrency(expectedForTenant)} | Ist: <span class="font-bold text-green-600">${ImmoApp.ui.formatCurrency(paid)}</span>
                                    </div>
                                    <span class="text-xs text-green-600 font-bold block mt-1">✅ Ausgeglichen.</span>
                                </div>
                            </div>
                            <span class="text-xs bg-green-600 text-white px-3 py-1 rounded-full self-center whitespace-nowrap">Details ➔</span>
                        </div>
                    </li>`;
            }
        }

        const reachedPctRaw = expectedYearly > 0 ? (actualRent / expectedYearly) * 100 : 100;
        const reachedPct = Math.max(0, Math.min(999, reachedPctRaw));
        const expectedSub = document.getElementById("dash-expected-sub");
        const actualSub = document.getElementById("dash-actual-sub");
        const missingSub = document.getElementById("dash-missing-sub");
        if (expectedSub) expectedSub.innerText = `${activeTenants.length} aktive Mieter`;
        if (actualSub) actualSub.innerText = `${reachedPct.toFixed(0).replace('.', ',')} % erreicht`;
        if (missingSub) missingSub.innerText = `${arrearsCount} Mieter im Rückstand`;

        if (bilanzBody) {
            bilanz.sort((a, b) => b.diff - a.diff);
            let totalExpected = 0;
            let totalPaid = 0;
            let totalDiff = 0;
            bilanz.forEach(row => {
                totalExpected += row.expected;
                totalPaid += row.paid;
                totalDiff += row.diff;
                const diffClass = row.diff < -0.01 ? 'text-red-600' : (row.diff > 0.01 ? 'text-blue-600' : 'text-gray-700');
                const diffLabel = ImmoApp.ui.formatCurrency(row.diff);
                bilanzBody.innerHTML += `
                    <tr class="border-t border-gray-100">
                        <td class="px-3 py-1 whitespace-nowrap">${row.tenant.name}</td>
                        <td class="px-3 py-1 text-right">${ImmoApp.ui.formatCurrency(row.expected)}</td>
                        <td class="px-3 py-1 text-right">${ImmoApp.ui.formatCurrency(row.paid)}</td>
                        <td class="px-3 py-1 text-right font-semibold ${diffClass}">${diffLabel}</td>
                    </tr>
                `;
            });
            bilanzBody.innerHTML += `
                <tr class="border-t border-gray-300 bg-gray-50 font-bold">
                    <td class="px-3 py-1 text-right">Summe:</td>
                    <td class="px-3 py-1 text-right">${ImmoApp.ui.formatCurrency(totalExpected)}</td>
                    <td class="px-3 py-1 text-right">${ImmoApp.ui.formatCurrency(totalPaid)}</td>
                    <td class="px-3 py-1 text-right ${totalDiff < -0.01 ? 'text-red-600' : (totalDiff > 0.01 ? 'text-blue-600' : 'text-gray-700')}">${ImmoApp.ui.formatCurrency(totalDiff)}</td>
                </tr>
            `;
        }
    },

    showMonthlyDetails: async function(tenantId) {
        const db = ImmoApp.db.instance;
        const currentYear = ImmoApp.ui.currentYear;
        let tenant;
        if (ImmoApp.api && ImmoApp.api.useApiData()) {
            try {
                const row = await ImmoApp.api.getTenant(tenantId);
                tenant = row ? ImmoApp.api.mapTenantFromApi(row) : null;
            } catch (e) {
                alert(e.message || "Mieter nicht geladen.");
                return;
            }
        } else {
            tenant = await db.tenants.get(tenantId);
        }
        if (!tenant) {
            alert("Mieter nicht gefunden.");
            return;
        }

        let allTrans;
        if (ImmoApp.api && ImmoApp.api.useApiData()) {
            try {
                const res = await ImmoApp.api.getTransactions({ limit: 8000 });
                allTrans = (res.data || []).map(ImmoApp.api.mapTransactionFromApi).filter(function (tx) {
                    return Number(tx.matchedTenantId) === Number(tenantId) && tx.category === "RENT";
                });
            } catch (e) {
                alert(e.message || "Buchungen nicht geladen.");
                return;
            }
        } else {
            allTrans = await db.transactions.where("matchedTenantId").equals(tenantId)
                .filter(function (tx) { return tx.category === "RENT"; }).toArray();
        }
        
        document.getElementById('monthly-tenant-name').innerText = tenant.name;
        document.getElementById('monthly-year-label').innerText = currentYear;
        
        document.getElementById('btn-jump-banking').onclick = () => ImmoApp.dashboard.jumpToBanking(tenant.name);
        document.getElementById('btn-jump-history').onclick = () => {
            document.getElementById('modal-monthly-details').classList.add('hidden');
            ImmoApp.ui.switchTab('tenants');
            setTimeout(() => {
                if(ImmoApp.tenants) ImmoApp.tenants.showHistoryModal(tenantId);
            }, 50);
        };
        
        const tbody = document.getElementById('monthly-table-body');
        tbody.innerHTML = "";
        const monthNames = ["Jan", "Feb", "Mär", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"];

        const getRentForMonth = (tenant, year, monthIndex) => {
            const checkDate = new Date(year, monthIndex, 15);
            const moveIn = tenant.moveIn ? new Date(tenant.moveIn) : new Date(2000, 0, 1);
            const moveOut = tenant.moveOut ? new Date(tenant.moveOut) : new Date(2099, 11, 31);
            if (checkDate < moveIn || checkDate > moveOut) return 0;

            const history = Array.isArray(tenant.rentHistory) ? tenant.rentHistory : null;
            if (!history || history.length === 0) return tenant.rent || 0;

            let best = null;
            history.forEach(h => {
                if (!h.from) return;
                const d = new Date(h.from);
                if (d <= checkDate) {
                    if (!best || d > new Date(best.from)) {
                        best = h;
                    }
                }
            });
            return best ? (best.rent || 0) : (tenant.rent || 0);
        };
        
        for(let month = 1; month <= 12; month++) {
            const checkDate = new Date(currentYear, month - 1, 15);
            const moveIn = tenant.moveIn ? new Date(tenant.moveIn) : new Date(2000, 0, 1);
            const moveOut = tenant.moveOut ? new Date(tenant.moveOut) : new Date(2099, 11, 31);
            
            let expected = (checkDate >= moveIn && checkDate <= moveOut) ? getRentForMonth(tenant, parseInt(currentYear, 10), month - 1) : 0;
            const monthStr = month.toString().padStart(2, '0');
            
            // Nur Zahlungen im aktuellen Jahr und entsprechenden Monat berücksichtigen
            const monthTxs = allTrans.filter(tx => {
                if (!tx.date) return false;
                const parts = tx.date.split('.');
                if (parts.length !== 3) return false;
                const m = parts[1];
                let y = parts[2];
                if (y.length === 2) {
                    y = ((parseInt(y, 10) > 50 ? 1900 : 2000) + parseInt(y, 10)).toString();
                }
                return m === monthStr && y === currentYear;
            });
            const manualTxs = monthTxs.filter(tx => tx.importBatchId === 'manual');
            
            const paidThisMonth = monthTxs.reduce((sum, tx) => sum + tx.amount, 0);
            const diff = paidThisMonth - expected;
            
            let statusText = "<span class='text-gray-400'>-</span>";
            let rowClass = "hover:bg-gray-50";
            
            let deleteManualBtn = '';
            let manualAmountSum = 0;
            
            // NEU: Wenn es eine manuelle Buchung gibt, erfassen wir die Summe und blenden den Mülleimer ein
            if (manualTxs.length > 0) {
                manualAmountSum = manualTxs.reduce((sum, tx) => sum + tx.amount, 0);
                deleteManualBtn = `<button onclick="ImmoApp.dashboard.deleteManualPayment(${manualTxs[0].id}, ${tenant.id})" class="ml-2 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-xs px-2 py-1 rounded shadow-sm" title="Manuelle Korrektur rückgängig machen">🗑️</button>`;
            }
            
            if(expected > 0 || paidThisMonth !== 0) {
                if(diff === 0 && expected > 0) {
                    // NEU: Unterscheidung zwischen echter Zahlung und manuellem Ausgleich
                    if(manualTxs.length > 0) {
                        statusText = "✅ <span class='text-blue-600 text-xs font-bold'>Manuell ausgeglichen</span>" + deleteManualBtn;
                    } else {
                        statusText = "✅ <span class='text-green-600 text-xs font-bold'>Bezahlt</span>";
                    }
                } else if (diff < 0) {
                    statusText = `❌ <span class='text-red-600 text-xs font-bold'>Rückstand</span> <button onclick="ImmoApp.dashboard.addManualPayment(${tenant.id}, ${month}, ${Math.abs(diff)})" class="ml-2 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs px-2 py-1 rounded border shadow-sm" title="Mit manueller Zahlung ausgleichen">Ausgleichen</button>` + deleteManualBtn;
                    rowClass = "bg-red-50";
                } else if (diff > 0) {
                    statusText = `⚠️ <span class='text-blue-600 text-xs font-bold'>Guthaben</span> <button onclick="ImmoApp.dashboard.addManualPayment(${tenant.id}, ${month}, -${diff})" class="ml-2 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs px-2 py-1 rounded border shadow-sm" title="Guthaben manuell abziehen">Korrigieren</button>` + deleteManualBtn;
                }
            }

            // NEU: Den manuellen Anteil transparent in der "Ist"-Spalte anzeigen
            let paidColumnHtml = ImmoApp.ui.formatCurrency(paidThisMonth);
            if (paidThisMonth !== 0) {
                paidColumnHtml = `<button onclick="ImmoApp.dashboard.jumpToBanking('${tenant.name}')" class="text-blue-600 hover:underline font-bold block w-full text-right" title="Klicken, um die verbuchten Zahlungen im Kontoauszug zu sehen">${paidColumnHtml}</button>`;
            }
            if (manualTxs.length > 0) {
                paidColumnHtml += `<span class="block text-[10px] text-gray-500 font-normal mt-0.5">(davon ${ImmoApp.ui.formatCurrency(manualAmountSum)} manuell)</span>`;
            }

            tbody.innerHTML += `
                <tr class="${rowClass} border-b">
                    <td class="px-4 py-2 font-bold">${monthNames[month-1]}</td>
                    <td class="px-4 py-2 text-right">${ImmoApp.ui.formatCurrency(expected)}</td>
                    <td class="px-4 py-2 text-right font-medium align-top">${paidColumnHtml}</td>
                    <td class="px-4 py-2 text-right align-top ${diff < 0 ? 'text-red-600 font-bold' : (diff > 0 ? 'text-blue-600 font-bold' : '')}">${diff !== 0 ? ImmoApp.ui.formatCurrency(diff) : '0,00 €'}</td>
                    <td class="px-4 py-2 text-right align-top">${statusText}</td>
                </tr>
            `;
        }
        document.getElementById('modal-monthly-details').classList.remove('hidden');
    }
};