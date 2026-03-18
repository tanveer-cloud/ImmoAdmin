window.ImmoApp = window.ImmoApp || {};

window.ImmoApp.db = {
    instance: new Dexie("ImmoAdminDB"),
    
    init: async function() {
        // Version 13: erweitert um Zähler, Ablesungen, Tarife & Adressfelder bei Mietern
        this.instance.version(13).stores({
            settings: 'key, value', // Wichtig für deine Backups und Importe
            properties: '++id, name',
            tenants: '++id, propertyId, name, street, zip, city, country, email, rent, iban, moveIn, moveOut',
            transactions: '++id, date, amount, purpose, iban, name, matchedTenantId, category, year, importBatchId',
            utilities: '++id, name, amount, year, importBatchId, propertyId',
            maintenance: '++id, recordType, date, propertyId, status, tenantId',
            meters: '++id, propertyId, type, name',
            meterReadings: '++id, meterId, date',
            tariffs: '++id, type, validFrom'
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