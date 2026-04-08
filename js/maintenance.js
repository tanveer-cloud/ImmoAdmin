window.ImmoApp = window.ImmoApp || {};

window.ImmoApp.maintenance = {
    setupHTML: function() {
        const container = document.getElementById("maintenance-content");
        if (container.innerHTML.includes("Lade Module...")) {
            container.innerHTML = `
                <div class="flex justify-between items-center mb-6">
                    <div>
                        <p class="text-sm text-gray-500 mt-1">Behalte Reparaturen, Handwerker-Termine und wichtige Infos im Blick.</p>
                    </div>
                    <button onclick="ImmoApp.maintenance.showModal()" class="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700 font-bold">+ Neuer Eintrag</button>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div class="bg-red-50 p-4 rounded-lg border border-red-200">
                        <h3 class="font-bold text-red-800 text-sm uppercase">⚠️ Offene To-Dos</h3>
                        <p class="text-3xl font-bold text-red-600 mt-1" id="maint-open-count">0</p>
                    </div>
                    <div class="bg-green-50 p-4 rounded-lg border border-green-200">
                        <h3 class="font-bold text-green-800 text-sm uppercase">✅ Erledigt</h3>
                        <p class="text-3xl font-bold text-green-600 mt-1" id="maint-done-count">0</p>
                    </div>
                </div>

                <div class="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden overflow-x-auto">
                    <table class="min-w-full divide-y divide-gray-200 text-sm">
                        <thead class="bg-gray-50">
                            <tr>
                                <th class="px-4 py-3 text-left w-24 font-bold text-gray-600">Datum</th>
                                <th class="px-4 py-3 text-left w-1/4 font-bold text-gray-600">Betrifft Objekt</th>
                                <th class="px-4 py-3 text-left font-bold text-gray-600">Aufgabe / Notiz</th>
                                <th class="px-4 py-3 text-center w-32 font-bold text-gray-600">Status</th>
                                <th class="px-4 py-3 text-right w-32 font-bold text-gray-600">Aktion</th>
                            </tr>
                        </thead>
                        <tbody id="maintenance-table-body" class="bg-white divide-y divide-gray-200"></tbody>
                    </table>
                </div>

                <div id="modal-maintenance" class="fixed inset-0 bg-black bg-opacity-50 hidden flex items-center justify-center z-50 overflow-y-auto">
                    <div class="bg-white p-6 rounded-lg shadow-lg w-full max-w-md my-8">
                        <h3 class="text-xl font-bold mb-4">Notiz / Aufgabe bearbeiten</h3>
                        <input type="hidden" id="modal-maint-id">
                        
                        <div class="space-y-4">
                            <div>
                                <label class="block text-sm font-medium">Datum</label>
                                <input type="date" id="modal-maint-date" class="w-full border p-2 rounded">
                            </div>
                            <div>
                                <label class="block text-sm font-medium">Betrifft Objekt (optional)</label>
                                <select id="modal-maint-prop" class="w-full border p-2 rounded bg-white"></select>
                            </div>
                            <div>
                                <label class="block text-sm font-medium">Beschreibung <span class="text-red-500">*</span></label>
                                <textarea id="modal-maint-task" rows="4" class="w-full border p-2 rounded" placeholder="z.B. Heizung im 2. OG rechts entlüften / Handwerker am 15.03. um 08:00 Uhr einlassen..."></textarea>
                            </div>
                            <div>
                                <label class="block text-sm font-medium">Status</label>
                                <select id="modal-maint-status" class="w-full border p-2 rounded bg-white font-bold">
                                    <option value="OPEN">⚠️ Offen / Zu erledigen</option>
                                    <option value="DONE">✅ Erledigt</option>
                                </select>
                            </div>
                        </div>
                        
                        <div class="mt-6 flex justify-end gap-2">
                            <button onclick="document.getElementById('modal-maintenance').classList.add('hidden')" class="px-4 py-2 bg-gray-200 rounded text-gray-800">Abbrechen</button>
                            <button onclick="ImmoApp.maintenance.saveTask()" class="px-4 py-2 bg-blue-600 text-white rounded font-bold">Speichern</button>
                        </div>
                    </div>
                </div>
            `;
        }
    },

    showModal: async function(id = null) {
        const useApi = ImmoApp.api && ImmoApp.api.useApiData();
        let props;
        if (useApi) {
            const r = await ImmoApp.api.getProperties({ limit: 500 });
            props = (r.data || []).map(ImmoApp.api.mapPropertyFromApi);
        } else {
            props = await ImmoApp.db.instance.properties.toArray();
        }

        const propSelect = document.getElementById('modal-maint-prop');
        propSelect.innerHTML = `<option value="">-- Allgemein / Kein spezielles Objekt --</option>`;
        props.forEach(p => {
            propSelect.innerHTML += `<option value="${p.id}">${p.name}</option>`;
        });

        if (id) {
            let task;
            if (useApi) {
                const row = await ImmoApp.api.getMaintenanceById(id);
                task = row ? ImmoApp.api.mapMaintenanceFromApi(row) : null;
            } else {
                task = await ImmoApp.db.instance.maintenance.get(id);
            }
            if (!task) {
                alert("Eintrag nicht gefunden.");
                return;
            }
            document.getElementById('modal-maint-id').value = task.id;
            document.getElementById('modal-maint-date').value = task.date || '';
            document.getElementById('modal-maint-prop').value = task.propertyId || '';
            document.getElementById('modal-maint-task').value = task.task || '';
            document.getElementById('modal-maint-status').value = task.status || 'OPEN';
        } else {
            document.getElementById('modal-maint-id').value = '';
            document.getElementById('modal-maint-date').value = new Date().toISOString().split('T')[0];
            document.getElementById('modal-maint-prop').value = '';
            document.getElementById('modal-maint-task').value = '';
            document.getElementById('modal-maint-status').value = 'OPEN';
        }
        
        document.getElementById('modal-maintenance').classList.remove('hidden');
    },

    saveTask: async function() {
        const useApi = ImmoApp.api && ImmoApp.api.useApiData();
        const id = document.getElementById('modal-maint-id').value;
        const date = document.getElementById('modal-maint-date').value;
        const propertyId = document.getElementById('modal-maint-prop').value;
        const task = document.getElementById('modal-maint-task').value;
        const status = document.getElementById('modal-maint-status').value;

        if (!task.trim()) return alert("Bitte eine Beschreibung eingeben.");

        try {
            if (useApi) {
                const body = {
                    date_value: date || null,
                    property_id: propertyId ? parseInt(propertyId, 10) : null,
                    tenant_id: null,
                    task: task.trim(),
                    status: status
                };
                if (id) {
                    await ImmoApp.api.patchMaintenance(parseInt(id, 10), body);
                } else {
                    await ImmoApp.api.postMaintenance(Object.assign({ record_type: null }, body));
                }
            } else {
                const db = ImmoApp.db.instance;
                const data = {
                    date,
                    propertyId: propertyId ? parseInt(propertyId) : null,
                    task,
                    status
                };
                if (id) await db.maintenance.update(parseInt(id, 10), data);
                else await db.maintenance.add(data);
            }
        } catch (e) {
            alert(e.message || "Speichern fehlgeschlagen.");
            return;
        }

        document.getElementById('modal-maintenance').classList.add('hidden');
        this.render();
    },

    deleteTask: async function(id) {
        if (!confirm("Möchtest du diesen Eintrag wirklich löschen?")) return;
        try {
            if (ImmoApp.api && ImmoApp.api.useApiData()) {
                await ImmoApp.api.deleteMaintenance(id);
            } else {
                await ImmoApp.db.instance.maintenance.delete(id);
            }
        } catch (e) {
            alert(e.message || "Löschen fehlgeschlagen (ggf. nur ADMIN).");
            return;
        }
        this.render();
    },

    toggleStatus: async function(id) {
        try {
            if (ImmoApp.api && ImmoApp.api.useApiData()) {
                const row = await ImmoApp.api.getMaintenanceById(id);
                const task = row ? ImmoApp.api.mapMaintenanceFromApi(row) : null;
                if (!task) return;
                const newStatus = task.status === 'OPEN' ? 'DONE' : 'OPEN';
                await ImmoApp.api.patchMaintenance(id, { status: newStatus });
            } else {
                const db = ImmoApp.db.instance;
                const task = await db.maintenance.get(id);
                const newStatus = task.status === 'OPEN' ? 'DONE' : 'OPEN';
                await db.maintenance.update(id, { status: newStatus });
            }
        } catch (e) {
            alert(e.message || "Status konnte nicht geändert werden.");
            return;
        }
        this.render();
    },

    render: async function() {
        this.setupHTML();
        const useApi = ImmoApp.api && ImmoApp.api.useApiData();
        let tasks;
        let props;
        if (useApi) {
            const [mr, pr] = await Promise.all([
                ImmoApp.api.getMaintenance({ limit: 5000 }),
                ImmoApp.api.getProperties({ limit: 500 })
            ]);
            tasks = (mr.data || []).map(ImmoApp.api.mapMaintenanceFromApi);
            props = (pr.data || []).map(ImmoApp.api.mapPropertyFromApi);
        } else {
            const db = ImmoApp.db.instance;
            tasks = await db.maintenance.toArray();
            props = await db.properties.toArray();
        }

        // Nach Datum sortieren (neueste zuerst)
        tasks.sort((a, b) => new Date(b.date || '2000-01-01') - new Date(a.date || '2000-01-01'));

        const openCount = tasks.filter(t => t.status === 'OPEN').length;
        const doneCount = tasks.filter(t => t.status === 'DONE').length;

        document.getElementById("maint-open-count").innerText = openCount;
        document.getElementById("maint-done-count").innerText = doneCount;

        const tbody = document.getElementById("maintenance-table-body");
        tbody.innerHTML = "";

        if (tasks.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5" class="px-4 py-8 text-center text-gray-500 italic">Noch keine Notizen oder Wartungsaufgaben erfasst. Alles läuft rund! 🎉</td></tr>`;
            return;
        }

        tasks.forEach(t => {
            const prop = props.find(p => p.id === t.propertyId);
            const propName = prop ? prop.name : `<span class="text-gray-400 italic">Allgemein</span>`;
            
            const dateFmt = t.date ? new Date(t.date).toLocaleDateString('de-DE') : '-';
            
            let statusBadge, rowClass;
            // Wenn erledigt, blassen wir die Zeile etwas aus, damit die offenen ToDos ins Auge stechen.
            if (t.status === 'DONE') {
                statusBadge = `<button onclick="ImmoApp.maintenance.toggleStatus(${t.id})" class="text-xs bg-green-100 text-green-800 border border-green-200 px-3 py-1.5 rounded shadow-sm hover:bg-green-200 font-bold transition-colors">✅ Erledigt</button>`;
                rowClass = "opacity-60 bg-gray-50 hover:bg-gray-100";
            } else {
                statusBadge = `<button onclick="ImmoApp.maintenance.toggleStatus(${t.id})" class="text-xs bg-red-100 text-red-800 border border-red-200 px-3 py-1.5 rounded shadow-sm hover:bg-red-200 font-bold transition-colors">⚠️ Offen</button>`;
                rowClass = "hover:bg-gray-50";
            }

            tbody.innerHTML += `
                <tr class="${rowClass} border-b transition-all">
                    <td class="px-4 py-3 whitespace-nowrap text-xs text-gray-500 align-top">${dateFmt}</td>
                    <td class="px-4 py-3 align-top text-xs font-medium text-gray-700">${propName}</td>
                    <td class="px-4 py-3 align-top text-sm text-gray-800 whitespace-pre-wrap">${t.task}</td>
                    <td class="px-4 py-3 text-center align-top">${statusBadge}</td>
                    <td class="px-4 py-3 text-right whitespace-nowrap align-top">
                        <button onclick="ImmoApp.maintenance.showModal(${t.id})" class="text-blue-600 text-xs bg-blue-50 px-2 py-1.5 rounded shadow-sm hover:bg-blue-100 mr-2" title="Bearbeiten">✏️</button>
                        <button onclick="ImmoApp.maintenance.deleteTask(${t.id})" class="text-red-600 text-xs bg-red-50 px-2 py-1.5 rounded shadow-sm hover:bg-red-100" title="Löschen">🗑️</button>
                    </td>
                </tr>
            `;
        });
    }
};