window.ImmoApp = window.ImmoApp || {};

window.ImmoApp.ui = {
    // 1. Jahr aus dem Speicher laden (falls vorhanden), ansonsten das aktuelle Jahr nehmen
    currentYear: localStorage.getItem("immo_app_year") || new Date().getFullYear().toString(),
    activeTab: 'dashboard',

    init: function() {
        // Das Jahr Dropdown suchen
        const yearSelect = document.getElementById('global-year-select');
        if(yearSelect) {
            // 2. Das Dropdown-Feld optisch auf unser geladenes/aktuelles Jahr setzen
            yearSelect.value = this.currentYear;
            
            yearSelect.addEventListener('change', (e) => {
                this.currentYear = e.target.value;
                
                // 3. Wenn der Nutzer das Jahr wechselt -> sofort im Browser speichern!
                localStorage.setItem("immo_app_year", this.currentYear);
                
                this.updateYearLabels();
                this.refreshCurrentTab();
            });
        }
        
        this.updateYearLabels();
        
        // Startbildschirm laden
        this.switchTab('dashboard');

        // Mobile-Navigation
        const toggle = document.getElementById('mobile-nav-toggle');
        const menu = document.getElementById('mobile-nav-menu');
        if (toggle && menu) {
            toggle.addEventListener('click', () => {
                menu.classList.toggle('hidden');
            });
            this.closeMobileNav = () => {
                if (!menu.classList.contains('hidden')) menu.classList.add('hidden');
            };
        }
    },

    updateYearLabels: function() {
        document.querySelectorAll('.year-label').forEach(el => {
            el.innerText = this.currentYear;
        });
    },

    refreshCurrentTab: function() {
        // Lädt das aktuelle Modul neu, wenn z.B. das Jahr gewechselt wird
        if(this.activeTab && window.ImmoApp[this.activeTab] && typeof window.ImmoApp[this.activeTab].render === 'function') {
            window.ImmoApp[this.activeTab].render();
        }
    },

    switchTab: function(tabId) {
        this.activeTab = tabId;
        
        // 1. Alle Ansichten (Views) verstecken (deine .active Klasse entfernen)
        document.querySelectorAll('.view-section').forEach(el => {
            el.classList.remove('active');
        });
        
        // 2. Nur die geklickte Ansicht anzeigen (.active Klasse hinzufügen)
        const targetView = document.getElementById('view-' + tabId);
        if (targetView) {
            targetView.classList.add('active');
        }

        // 3. Tab-Button optisch hervorheben (optional, macht das Menü schöner)
        document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('tab-active'));
        const activeBtn = document.getElementById('nav-' + tabId);
        if(activeBtn) activeBtn.classList.add('tab-active');

        // 4. Modul laden und zeichnen
        if (window.ImmoApp[tabId] && typeof window.ImmoApp[tabId].render === 'function') {
            window.ImmoApp[tabId].render();
        }
        
        this.updateYearLabels();
    },

    formatCurrency: function(amount) {
        // Macht aus 1000 -> 1.000,00 €
        return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(amount || 0);
    }
};