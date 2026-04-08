window.ImmoApp = window.ImmoApp || {};

window.ImmoApp.search = {
    setupHTML: function() {
        const container = document.getElementById("search-content");
        if (container.innerHTML.includes("Lade Module...")) {
            container.innerHTML = `
                <div class="space-y-8">
                    <div id="search-results-tenants" class="hidden">
                        <h3 class="text-lg font-bold border-b-2 border-blue-200 pb-2 mb-4 text-blue-800">👤 Mieter & Objekte</h3>
                        <ul class="space-y-2" id="list-search-tenants"></ul>
                    </div>
                    
                    <div id="search-results-transactions" class="hidden">
                        <h3 class="text-lg font-bold border-b-2 border-green-200 pb-2 mb-4 text-green-800">💶 Kontoauszüge & Buchungen</h3>
                        <ul class="space-y-2" id="list-search-transactions"></ul>
                    </div>

                    <div id="search-results-maintenance" class="hidden">
                        <h3 class="text-lg font-bold border-b-2 border-orange-200 pb-2 mb-4 text-orange-800">🛠️ Wartung & Notizen</h3>
                        <ul class="space-y-2" id="list-search-maintenance"></ul>
                    </div>

                    <div id="search-no-results" class="hidden text-gray-500 italic p-6 bg-white rounded-lg border text-center shadow-sm">
                        Keine passenden Einträge in der Datenbank gefunden.
                    </div>
                </div>
            `;
        }
    },

    // Wird bei jedem Tastendruck im Suchfeld aufgerufen
    handleInput: function(e) {
        if(e.key === 'Enter') { // Erst suchen, wenn Enter gedrückt wird (besser für Performance bei großen Daten)
            this.executeSearch(e.target.value);
        }
    },

    executeSearch: async function(query) {
        if(!query || query.trim().length < 2) return;
        query = query.toLowerCase().trim();

        // Ansicht auf den Such-Tab wechseln
        ImmoApp.ui.switchTab('search');
        document.getElementById('search-query-display').innerText = query;
        
        this.setupHTML();
        const db = ImmoApp.db.instance;

        let tenants;
        let props;
        let trans;
        let maintRows;

        if (ImmoApp.api && ImmoApp.api.useApiData()) {
            try {
                const [tn, pr, tr, mr] = await Promise.all([
                    ImmoApp.api.getTenants({ limit: 500 }),
                    ImmoApp.api.getProperties({ limit: 500 }),
                    ImmoApp.api.getTransactions({ limit: 8000 }),
                    ImmoApp.api.getMaintenance({ limit: 5000 })
                ]);
                tenants = (tn.data || []).map(ImmoApp.api.mapTenantFromApi);
                props = (pr.data || []).map(ImmoApp.api.mapPropertyFromApi);
                trans = (tr.data || []).map(ImmoApp.api.mapTransactionFromApi);
                maintRows = (mr.data || []).map(ImmoApp.api.mapMaintenanceFromApi);
            } catch (e) {
                alert(e.message || "API-Suche fehlgeschlagen.");
                return;
            }
        } else {
            tenants = await db.tenants.toArray();
            props = await db.properties.toArray();
            trans = await db.transactions.toArray();
            maintRows = db.tables.find(t => t.name === "maintenance")
                ? await db.table("maintenance").toArray()
                : [];
        }

        const matchedTenants = tenants.filter(t =>
            t.name.toLowerCase().includes(query) ||
            (t.iban && t.iban.toLowerCase().includes(query))
        );

        const matchedProps = props.filter(p => p.name.toLowerCase().includes(query));
        matchedProps.forEach(p => {
            tenants.filter(t => t.propertyId === p.id).forEach(t => {
                if (!matchedTenants.find(mt => mt.id === t.id)) matchedTenants.push(t);
            });
        });

        const matchedTrans = trans.filter(tx =>
            (tx.name && tx.name.toLowerCase().includes(query)) ||
            (tx.purpose && tx.purpose.toLowerCase().includes(query)) ||
            (tx.amount.toString().includes(query)) ||
            (tx.iban && tx.iban.toLowerCase().includes(query)) ||
            (tx.date && tx.date.includes(query))
        );

        const matchedMaint = maintRows.filter(m =>
            (m.task || "").toLowerCase().includes(query)
        );

        this.renderResults(matchedTenants, matchedTrans, matchedMaint, props);
    },

    renderResults: function(tenants, trans, maint, props) {
        const elTenants = document.getElementById('search-results-tenants');
        const elTrans = document.getElementById('search-results-transactions');
        const elMaint = document.getElementById('search-results-maintenance');
        const elNoRes = document.getElementById('search-no-results');

        const listTenants = document.getElementById('list-search-tenants');
        const listTrans = document.getElementById('list-search-transactions');
        const listMaint = document.getElementById('list-search-maintenance');

        listTenants.innerHTML = '';
        listTrans.innerHTML = '';
        listMaint.innerHTML = '';

        let hasResults = false;

        // Mieter Rendern
        if(tenants.length > 0) {
            hasResults = true;
            elTenants.classList.remove('hidden');
            tenants.forEach(t => {
                const propName = props.find(p => p.id === t.propertyId)?.name || 'Kein Objekt';
                listTenants.innerHTML += `
                    <li class="bg-white p-4 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition flex justify-between items-center">
                        <div>
                            <strong class="text-blue-700 text-lg">${t.name}</strong>
                            <span class="text-sm text-gray-500 ml-2 bg-gray-100 px-2 py-0.5 rounded">🏠 ${propName}</span>
                            <div class="text-xs text-gray-400 mt-1">Soll-Miete: ${ImmoApp.ui.formatCurrency(t.rent)} | IBAN: ${t.iban || '-'}</div>
                        </div>
                        <button onclick="ImmoApp.ui.switchTab('tenants'); setTimeout(()=>ImmoApp.tenants.showTenantModal(${t.id}), 100);" class="text-sm bg-blue-50 text-blue-600 font-bold px-3 py-1.5 rounded hover:bg-blue-100">Zum Mieter</button>
                    </li>
                `;
            });
        } else elTenants.classList.add('hidden');

        // Buchungen Rendern
        if(trans.length > 0) {
            hasResults = true;
            elTrans.classList.remove('hidden');
            // Zeige max 50 Buchungen, damit der Browser nicht überlastet wird, chronologisch sortiert
            trans.sort((a, b) => {
                const pa = (a.date || "").split(".");
                const pb = (b.date || "").split(".");
                const da = pa.length === 3 ? new Date(pa[2].length === 2 ? "20" + pa[2] : pa[2], parseInt(pa[1], 10) - 1, parseInt(pa[0], 10)) : 0;
                const dbi = pb.length === 3 ? new Date(pb[2].length === 2 ? "20" + pb[2] : pb[2], parseInt(pb[1], 10) - 1, parseInt(pb[0], 10)) : 0;
                return dbi - da;
            })
                 .slice(0, 50).forEach(tx => {
                const amountColor = tx.amount >= 0 ? 'text-green-600' : 'text-gray-800';
                listTrans.innerHTML += `
                    <li class="bg-white p-3 rounded-lg shadow-sm border border-gray-100 hover:bg-gray-50 flex justify-between items-center">
                        <div class="text-sm w-3/4">
                            <span class="text-gray-500 mr-2 font-mono text-xs">${tx.date}</span>
                            <strong class="text-gray-800">${tx.name || 'Unbekannt'}</strong>
                            <p class="text-xs text-gray-500 truncate mt-1" title="${tx.purpose}">${tx.purpose}</p>
                        </div>
                        <div class="font-bold ${amountColor} whitespace-nowrap text-right">
                            ${ImmoApp.ui.formatCurrency(tx.amount)}
                        </div>
                    </li>
                `;
            });
        } else elTrans.classList.add('hidden');

        // Wartung Rendern
        if(maint.length > 0) {
            hasResults = true;
            elMaint.classList.remove('hidden');
            maint.forEach(m => {
                const done = m.status === "DONE" || m.status === "Erledigt";
                const stLabel = done ? "Erledigt" : "Offen";
                const dateStr = m.date ? new Date(m.date).toLocaleDateString("de-DE") : "–";
                listMaint.innerHTML += `
                    <li class="bg-white p-3 rounded-lg shadow-sm border border-gray-100 hover:bg-gray-50 text-sm">
                        <span class="text-gray-500 mr-2 font-mono text-xs">${dateStr}</span>
                        ${m.task} <span class="text-xs font-bold ml-2 ${done ? 'text-green-600' : 'text-orange-500'}">[${stLabel}]</span>
                    </li>
                `;
            });
        } else elMaint.classList.add('hidden');

        // Keine Ergebnisse
        if(!hasResults) elNoRes.classList.remove('hidden');
        else elNoRes.classList.add('hidden');
    },
    
    render: function() {
        this.setupHTML();
    }
};