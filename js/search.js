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

        // --- 1. DATEN DURCHSUCHEN ---
        
        // a) Mieter und Objekte
        const tenants = await db.tenants.toArray();
        const props = await db.properties.toArray();
        
        const matchedTenants = tenants.filter(t => 
            t.name.toLowerCase().includes(query) || 
            (t.iban && t.iban.toLowerCase().includes(query))
        );
        
        // Falls jemand nach einem Objekt (z.B. "Forststraße") sucht, zeige auch dessen Mieter
        const matchedProps = props.filter(p => p.name.toLowerCase().includes(query));
        matchedProps.forEach(p => {
            tenants.filter(t => t.propertyId === p.id).forEach(t => {
                if(!matchedTenants.find(mt => mt.id === t.id)) matchedTenants.push(t);
            });
        });

        // b) Kontoauszüge (Transaktionen)
        const trans = await db.transactions.toArray();
        const matchedTrans = trans.filter(tx => 
            (tx.name && tx.name.toLowerCase().includes(query)) ||
            (tx.purpose && tx.purpose.toLowerCase().includes(query)) ||
            (tx.amount.toString().includes(query)) ||
            (tx.iban && tx.iban.toLowerCase().includes(query)) ||
            (tx.date.includes(query))
        );

        // c) Wartung
        let matchedMaint = [];
        if(db.tables.find(t => t.name === 'maintenance')) {
            const maint = await db.table('maintenance').toArray();
            matchedMaint = maint.filter(m => m.task.toLowerCase().includes(query));
        }

        // --- 2. ERGEBNISSE ANZEIGEN ---
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
            trans.sort((a,b) => new Date(b.date.split('.').reverse().join('-')) - new Date(a.date.split('.').reverse().join('-')))
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
                listMaint.innerHTML += `
                    <li class="bg-white p-3 rounded-lg shadow-sm border border-gray-100 hover:bg-gray-50 text-sm">
                        <span class="text-gray-500 mr-2 font-mono text-xs">${new Date(m.date).toLocaleDateString('de-DE')}</span>
                        ${m.task} <span class="text-xs font-bold ml-2 ${m.status === 'Erledigt' ? 'text-green-600' : 'text-orange-500'}">[${m.status}]</span>
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