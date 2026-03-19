window.ImmoApp = window.ImmoApp || {};

window.ImmoApp.ui = {
    // 1. Jahr aus dem Speicher laden (falls vorhanden), ansonsten das aktuelle Jahr nehmen
    currentYear: localStorage.getItem("immo_app_year") || new Date().getFullYear().toString(),
    activeTab: 'dashboard',

    init: function() {
        // Jahres-Toggle (← Jahr →)
        const yearPrevBtn = document.getElementById('year-prev-btn');
        const yearNextBtn = document.getElementById('year-next-btn');
        if (yearPrevBtn) {
            yearPrevBtn.addEventListener('click', () => this.changeYearBy(-1));
        }
        if (yearNextBtn) {
            yearNextBtn.addEventListener('click', () => this.changeYearBy(1));
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
        const globalYearDisplay = document.getElementById('global-year-display');
        if (globalYearDisplay) globalYearDisplay.innerText = this.currentYear;
    },

    changeYearBy: function(delta) {
        const current = parseInt(this.currentYear, 10);
        const safeCurrent = Number.isFinite(current) ? current : new Date().getFullYear();
        this.currentYear = String(safeCurrent + delta);
        localStorage.setItem("immo_app_year", this.currentYear);
        this.updateYearLabels();
        this.refreshCurrentTab();
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

        // 3. Tab-Button optisch hervorheben (Desktop + Mobile)
        document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('tab-active'));
        document.querySelectorAll(`.nav-btn[data-tab="${tabId}"]`).forEach(btn => btn.classList.add('tab-active'));

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