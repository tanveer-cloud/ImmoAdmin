window.ImmoApp = window.ImmoApp || {};

window.ImmoApp.db = {
    instance: new Dexie("ImmoAdminDB"),
    
    init: async function() {
        // Hier ist das Herzstück! Wir zwingen die Datenbank auf Version 11
        // und legen die neue Tabelle "maintenance" offiziell an.
        this.instance.version(11).stores({
            settings: 'key, value', // Wichtig für deine Backups und Importe
            properties: '++id, name',
            tenants: '++id, propertyId, name, rent, iban, moveIn, moveOut',
            transactions: '++id, date, amount, purpose, iban, name, matchedTenantId, category, year, importBatchId',
            utilities: '++id, name, amount, year, importBatchId, propertyId',
            
            // NEU: Die Wartungs-Tabelle
            maintenance: '++id, recordType, date, propertyId, status, tenantId'
        });

        try {
            await this.instance.open();
            console.log("Datenbank erfolgreich geladen und aktualisiert!");
        } catch (err) {
            console.error("Fehler beim Öffnen der Datenbank:", err);
            alert("Datenbank-Update Fehler: Bitte die Seite mit Strg + F5 neu laden!");
        }
    }
};