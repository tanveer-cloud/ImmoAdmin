window.ImmoApp = window.ImmoApp || {};

window.ImmoApp.tenants = {
    showAll: false,

    setupHTML: function() {
        const container = document.getElementById("tenants-content");
        if (container.innerHTML.includes("Lade Module...")) {
            container.innerHTML = `
                <div class="flex flex-col sm:flex-row justify-between sm:items-center mb-4 mt-2 gap-2">
                    <h3 class="text-lg font-bold text-gray-800">Verwaltete Objekte & WGs</h3>
                    <button onclick="ImmoApp.tenants.showPropertyModal()" class="bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 text-sm w-full sm:w-auto">+ Neues Objekt / WG</button>
                </div>
                <div class="bg-white rounded-xl shadow-sm border border-gray-100 mb-8">
                    <ul id="properties-list" class="divide-y divide-gray-200"></ul>
                </div>

                <div class="flex flex-col sm:flex-row justify-between sm:items-center mb-4 gap-2">
                    <h3 class="text-lg font-bold text-green-700">Aktuelle Mieter (<span class="year-label"></span>)</h3>
                    <button onclick="ImmoApp.tenants.showTenantModal()" class="bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 text-sm w-full sm:w-auto">+ Neuer Mieter</button>
                </div>
                <div class="hidden md:block bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden overflow-x-auto mb-8">
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
                <div id="tenants-cards-active" class="md:hidden space-y-3 mb-8"></div>

                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-lg font-bold text-gray-500">Ausgezogene / Ehemalige Mieter</h3>
                </div>
                <div class="hidden md:block bg-gray-50 rounded-xl shadow-sm border border-gray-200 overflow-hidden overflow-x-auto opacity-75">
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
                <div id="tenants-cards-past" class="md:hidden space-y-3 opacity-85"></div>

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
                        
                        <div class="mt-6 flex justify-end gap-2">
                            <button onclick="ImmoApp.tenants.openUtilitiesStatementForTenant()" class="px-4 py-2 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 text-sm">🧾 NK-Abrechnung öffnen</button>
                            <button onclick="ImmoApp.tenants.openLetterForTenant()" class="px-4 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 text-sm">📄 Anschreiben öffnen</button>
                            <button onclick="document.getElementById('modal-tenant-history').classList.add('hidden')" class="px-6 py-2 bg-gray-800 text-white rounded font-bold hover:bg-gray-900">Schließen</button>
                        </div>
                    </div>
                </div>
            `;
            ImmoApp.ui.updateYearLabels();
        }
    },

    openLetterForTenant: async function() {
        const nameEl = document.getElementById('history-tenant-name');
        const tenantIdAttr = nameEl ? nameEl.dataset.tenantId : null;
        if (!tenantIdAttr) {
            alert("Kein Mieter ausgewählt.");
            return;
        }
        const tenantId = parseInt(tenantIdAttr, 10);
        const db = ImmoApp.db.instance;
        const tenant = await db.tenants.get(tenantId);
        if (!tenant) {
            alert("Mieter nicht gefunden.");
            return;
        }

        const sender = (ImmoApp.settings && ImmoApp.settings.getSenderConfig) ? await ImmoApp.settings.getSenderConfig() : {};
        const senderLines = [sender.name, sender.street, [sender.zip, sender.city].filter(Boolean).join(' '), sender.country].filter(Boolean);
        const safeSenderLinesHtml = senderLines.map(l => (l || '').replace(/</g, '&lt;')).join('<br>');
        const logoBlock = sender.logoDataUrl
            ? `<div style="display:flex;justify-content:flex-start;margin-bottom:10px;">
                    <img src="${sender.logoDataUrl}" alt="Logo" style="max-height:60px;max-width:220px;object-fit:contain;">
               </div>`
            : '';
        const senderBlock = (logoBlock || senderLines.length > 0)
            ? `<div class="letterhead">${logoBlock}${safeSenderLinesHtml}</div>`
            : '';
        const today = new Date();
        const dateStr = today.toLocaleDateString('de-DE');
        const placeStr = (sender.place || sender.city || '').trim();
        const placeDate = placeStr ? `${placeStr}, ${dateStr}` : dateStr;
        const footerText = (sender.footer || '').trim();
        const footerBlock = footerText
            ? `<div class="footer" id="letter-footer" contenteditable="true" style="outline:none;white-space:pre-line;">${footerText.replace(/</g,'&lt;')}</div>`
            : `<div class="footer" id="letter-footer" contenteditable="true" style="outline:none;white-space:pre-line;"></div>`;

        const street = tenant.street || '';
        const zip = tenant.zip || '';
        const city = tenant.city || '';
        const country = tenant.country || 'Deutschland';

        const addressBlock = `
${tenant.name}
${street}
${zip} ${city}
${country}`.trim();

        const subject = `Mietangelegenheiten / Nebenkosten - ${today.getFullYear()}`;

        const emailHint = tenant.email
            ? `<a href="#" onclick="(function(){ const s=(document.getElementById('letter-subject')?.innerText||'').trim(); const b=(document.getElementById('letter-content')?.innerText||'').trim(); window.opener?.ImmoApp?.tenants?.openMailDraft(${tenant.id}, s, b); return false; })()" style="font-size:12px;color:#2563eb;">E‑Mail vorbereiten (Anhang manuell)</a>`
            : `<span style="font-size:12px;color:#6b7280;">Keine E‑Mail beim Mieter hinterlegt.</span>`;

        const html = `
<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <title>Schreiben an ${tenant.name}</title>
    <style>
        body { font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; margin: 40px; background:#f8fafc; color:#111827; }
        .letter { max-width: 800px; margin: 0 auto; background:#fff; border:1px solid #e5e7eb; border-radius:12px; box-shadow:0 8px 24px rgba(15,23,42,0.06); padding:26px; }
        .letterhead { font-size: 12px; color: #374151; line-height: 1.4; margin-bottom: 8px; }
        .header { display: flex; justify-content: space-between; font-size: 12px; color: #475569; align-items:center; gap:12px; }
        .address { margin-top: 40px; white-space: pre-line; }
        .subject { margin-top: 30px; font-weight: 700; color:#111827; }
        .content { margin-top: 20px; line-height: 1.6; font-size: 14px; }
        .signature { margin-top: 40px; }
        .anlagen { margin-top: 24px; font-size: 12px; color: #6b7280; }
        .footer { margin-top: 28px; padding-top: 10px; border-top: 1px solid #e5e7eb; font-size: 11px; color: #6b7280; }
        @media print {
            button { display: none; }
            body { margin: 20mm; background:#fff; }
            .letter { border:0; box-shadow:none; border-radius:0; padding:0; }
        }
    </style>
</head>
<body>
    <div class="letter">
        ${senderBlock}
        <div class="header">
            <div>${placeDate}</div>
            <div>${emailHint}</div>
        </div>

        <div class="address">
${addressBlock}
        </div>

        <div class="subject">
            <div><strong>Betreff:</strong></div>
            <div id="letter-subject" contenteditable="true" style="outline:none;border:1px dashed #c7d2fe;background:#eef2ff;border-radius:8px;padding:8px;font-size:12px;color:#312e81;">${subject}</div>
        </div>

        <div class="content">
            <div id="letter-content" contenteditable="true" style="outline:none;">
Sehr geehrte/r ${tenant.name},

hiermit informiere ich Sie über Ihr Mietverhältnis für die Wohnung / das Zimmer im Objekt ${tenant.propertyId || ''}.

Dies ist ein Platzhaltertext. Du kannst diesen Text im Browser direkt bearbeiten und anschließend über den Druckdialog als PDF speichern oder als DOCX herunterladen.

Mit freundlichen Grüßen
__________________________
            </div>
        </div>

        <div class="signature">
            <div style="margin-top:10px;white-space:pre-line;">${(sender.name || '').replace(/</g,'&lt;')}</div>
        </div>

        <div class="anlagen">
            <div style="font-weight:700;margin-bottom:4px;">Anlagen (editierbar):</div>
            <div id="letter-attachments" contenteditable="true" style="outline:none;border:1px dashed #e5e7eb;border-radius:6px;padding:8px;white-space:pre-line;">
· Anschreiben (dieses Schreiben)
            </div>
        </div>

        <button onclick="window.print()" style="margin-top:20px;padding:9px 16px;border-radius:8px;border:1px solid #d1d5db;background:#f8fafc;color:#111827;font-weight:600;cursor:pointer;">
            Als PDF drucken / speichern
        </button>
        <button onclick="(function(){ const s=(document.getElementById('letter-subject')?.innerText||'').trim(); const b=(document.getElementById('letter-content')?.innerText||'').trim(); const a=(document.getElementById('letter-attachments')?.innerText||'').trim(); const f=(document.getElementById('letter-footer')?.innerText||'').trim(); window.opener?.ImmoApp?.tenants?.downloadLetterDocx(${tenant.id}, s, b, a, f); })()" style="margin-top:10px;margin-left:10px;padding:9px 16px;border-radius:8px;border:1px solid #2563eb;background:#eff6ff;color:#1d4ed8;font-weight:600;cursor:pointer;">
            Als DOCX herunterladen
        </button>

        ${footerBlock}
    </div>
</body>
</html>
        `;

        const win = window.open('', '_blank');
        if (!win) {
            alert("Pop-up Blocker verhindert das Öffnen des Schreibens. Bitte Pop-ups für diese Seite erlauben.");
            return;
        }
        win.document.open();
        win.document.write(html);
        win.document.close();
    },

    downloadLetterDocx: async function(tenantId, subjectOverride = null, bodyOverride = null, attachmentsOverride = null, footerOverride = null) {
        if (typeof docx === "undefined" || !docx || !docx.Document) {
            alert("DOCX-Bibliothek ist noch nicht geladen. Bitte Seite neu laden.");
            return;
        }
        const db = ImmoApp.db.instance;
        const tenant = await db.tenants.get(parseInt(tenantId, 10));
        if (!tenant) return alert("Mieter nicht gefunden.");

        const sender = (ImmoApp.settings && ImmoApp.settings.getSenderConfig) ? await ImmoApp.settings.getSenderConfig() : {};
        const senderLines = [sender.name, sender.street, [sender.zip, sender.city].filter(Boolean).join(' '), sender.country].filter(Boolean);

        const today = new Date();
        const dateStr = today.toLocaleDateString('de-DE');
        const subject = (subjectOverride && subjectOverride.trim()) ? subjectOverride.trim() : `Mietangelegenheiten / Nebenkosten - ${today.getFullYear()}`;
        const bodyText = (bodyOverride && bodyOverride.trim()) ? bodyOverride.trim() : `Sehr geehrte/r ${tenant.name || ""},\n\nmit diesem Schreiben informiere ich Sie über Ihr Mietverhältnis.\n\nMit freundlichen Grüßen\n__________________________`;

        const lines = [
            tenant.name || "",
            tenant.street || "",
            `${tenant.zip || ""} ${tenant.city || ""}`.trim(),
            tenant.country || "Deutschland"
        ].filter(Boolean);

        const { Document, Packer, Paragraph, TextRun, ImageRun } = docx;

        const footerText = (footerOverride && String(footerOverride).trim()) ? String(footerOverride).trim() : ((sender.footer || "").trim());
        const footerLines = footerText
            ? footerText.split(/\r?\n/g).map(l => l.trim()).filter(Boolean)
            : [];

        const dataUrlToBytes = (dataUrl) => {
            try {
                const parts = String(dataUrl || "").split(",");
                if (parts.length < 2) return null;
                const b64 = parts[1];
                const bin = atob(b64);
                const bytes = new Uint8Array(bin.length);
                for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
                return bytes;
            } catch { return null; }
        };

        const attachmentsText = (attachmentsOverride && String(attachmentsOverride).trim()) ? String(attachmentsOverride).trim() : "· Anschreiben (dieses Schreiben)";
        const attachmentsLines = attachmentsText
            .split(/\r?\n/g)
            .map(l => l.trim())
            .filter(Boolean)
            .map(l => l.replace(/^Anlagen\s*:?/i, '').trim())
            .filter(Boolean)
            .map(l => (l.startsWith("·") || l.startsWith("-")) ? l : ("· " + l));

        const bodyParagraphs = bodyText
            .split(/\n{2,}/g)
            .map(p => p.trim())
            .filter(Boolean)
            .map(p => new Paragraph({ text: p }));

        const headerChildren = [];
        // Logo oben (optional)
        if (sender.logoDataUrl && ImageRun) {
            const bytes = dataUrlToBytes(sender.logoDataUrl);
            if (bytes) {
                headerChildren.push(new Paragraph({
                    children: [new ImageRun({ data: bytes, transformation: { width: 180, height: 60 } })]
                }));
            }
        }
        if (senderLines.length > 0) {
            headerChildren.push(...senderLines.map(l => new Paragraph({ children: [new TextRun({ text: l, size: 20, color: "374151" })] })));
            headerChildren.push(new Paragraph({ text: "" }));
        }

        const placeStr = (sender.place || sender.city || "").trim();
        const placeDate = placeStr ? `${placeStr}, ${dateStr}` : dateStr;
        headerChildren.push(
            new Paragraph({ children: [new TextRun({ text: placeDate, size: 18, color: "555555" })] }),
            new Paragraph({ text: "" }),
            ...lines.map(l => new Paragraph({ text: l })),
            new Paragraph({ text: "" }),
            new Paragraph({ children: [new TextRun({ text: `Betreff: ${subject}`, bold: true })] }),
            new Paragraph({ text: "" }),
            ...bodyParagraphs,
            new Paragraph({ text: "" }),
            ...(sender.name ? [new Paragraph({ text: sender.name })] : []),
            new Paragraph({ text: "" }),
            new Paragraph({ children: [new TextRun({ text: "Anlagen:", bold: true })] }),
            ...attachmentsLines.map(l => new Paragraph({ text: l }))
        );

        if (footerLines.length > 0) {
            headerChildren.push(
                new Paragraph({ text: "" }),
                ...footerLines.map(l => new Paragraph({ children: [new TextRun({ text: l, size: 16, color: "6b7280" })] }))
            );
        }

        const doc = new Document({
            sections: [{
                properties: {},
                children: headerChildren
            }]
        });

        const blob = await Packer.toBlob(doc);
        const fileName = `Anschreiben_${(tenant.name || 'Mieter').replace(/\s+/g, '_')}_${today.toISOString().split('T')[0]}.docx`;
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    },

    openMailDraft: async function(tenantId, subjectText, bodyText) {
        const db = ImmoApp.db.instance;
        const tenant = await db.tenants.get(parseInt(tenantId, 10));
        if (!tenant) return alert("Mieter nicht gefunden.");
        if (!tenant.email) {
            alert("Keine E‑Mail beim Mieter hinterlegt.");
            return;
        }

        const subject = (subjectText || "").trim() || "Nachricht der Hausverwaltung";
        const body = (bodyText || "").trim() || "";

        // mailto: kann keine Anhänge automatisch hinzufügen (Browser-Sicherheit)
        const mailto = `mailto:${encodeURIComponent(tenant.email)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        window.location.href = mailto;
    },

    _getActiveMonthsInYearForTenant: function(tenant, yearStr) {
        const year = parseInt(yearStr, 10);
        const yearStart = new Date(year, 0, 1);
        const yearEnd = new Date(year, 11, 31);
        const moveIn = tenant.moveIn ? new Date(tenant.moveIn) : new Date(2000, 0, 1);
        const moveOut = tenant.moveOut ? new Date(tenant.moveOut) : new Date(2099, 11, 31);
        if (moveIn > yearEnd || moveOut < yearStart) return [];
        const start = moveIn > yearStart ? moveIn : yearStart;
        const end = moveOut < yearEnd ? moveOut : yearEnd;
        const months = [];
        for (let m = 0; m < 12; m++) {
            const check = new Date(year, m, 15);
            if (check >= start && check <= end) months.push(m);
        }
        return months; // monthIndex 0..11
    },

    _getPrepaymentForMonth: function(tenant, yearStr, monthIndex) {
        const year = parseInt(yearStr, 10);
        const checkDate = new Date(year, monthIndex, 15);
        const moveIn = tenant.moveIn ? new Date(tenant.moveIn) : new Date(2000, 0, 1);
        const moveOut = tenant.moveOut ? new Date(tenant.moveOut) : new Date(2099, 11, 31);
        if (checkDate < moveIn || checkDate > moveOut) return 0;

        const history = Array.isArray(tenant.rentHistory) ? tenant.rentHistory : null;
        if (!history || history.length === 0) {
            return tenant.prepayment || 0;
        }
        let best = null;
        history.forEach(h => {
            if (!h.from) return;
            const d = new Date(h.from);
            if (d <= checkDate) {
                if (!best || d > new Date(best.from)) best = h;
            }
        });
        return best ? (best.prepayment || 0) : (tenant.prepayment || 0);
    },

    _calcTenantWeightForYear: function(tenant, yearStr, mode) {
        const year = parseInt(yearStr, 10);
        const periodStart = new Date(year, 0, 1);
        const periodEnd = new Date(year, 11, 31);

        const moveIn = tenant.moveIn ? new Date(tenant.moveIn) : new Date(0);
        const moveOut = tenant.moveOut ? new Date(tenant.moveOut) : new Date(8640000000000000);

        const from = moveIn > periodStart ? moveIn : periodStart;
        const to = moveOut < periodEnd ? moveOut : periodEnd;
        const days = to > from ? Math.round((to - from) / (24 * 60 * 60 * 1000)) : 0;
        const sqm = (tenant.sqm != null && !isNaN(parseFloat(tenant.sqm)) && parseFloat(tenant.sqm) > 0) ? parseFloat(tenant.sqm) : 1;
        const weight = mode === "PERSON_DAYS_SQM" ? (days * sqm) : days;
        return { days, sqm, weight };
    },

    openUtilitiesStatementForTenant: async function() {
        const nameEl = document.getElementById('history-tenant-name');
        const tenantIdAttr = nameEl ? nameEl.dataset.tenantId : null;
        if (!tenantIdAttr) {
            alert("Kein Mieter ausgewählt.");
            return;
        }
        const tenantId = parseInt(tenantIdAttr, 10);
        const db = ImmoApp.db.instance;
        const tenant = await db.tenants.get(tenantId);
        if (!tenant) {
            alert("Mieter nicht gefunden.");
            return;
        }

        const year = ImmoApp.ui.currentYear;
        const nkStartISO = document.getElementById('nk-period-start')?.value || '';
        const nkEndISO = document.getElementById('nk-period-end')?.value || '';

        const parseISODate = (s) => {
            if (!s) return null;
            const parts = String(s).split('-');
            if (parts.length !== 3) return null;
            const y = parseInt(parts[0], 10);
            const m = parseInt(parts[1], 10);
            const d = parseInt(parts[2], 10);
            if (!Number.isFinite(y) || !Number.isFinite(m) || !Number.isFinite(d)) return null;
            return new Date(y, m - 1, d);
        };

        const periodStart = parseISODate(nkStartISO);
        const periodEnd = parseISODate(nkEndISO);
        const usePeriod = !!(periodStart && periodEnd);
        const fmtDE = (dt) => {
            const dd = String(dt.getDate()).padStart(2, '0');
            const mm = String(dt.getMonth() + 1).padStart(2, '0');
            const yy = dt.getFullYear();
            return `${dd}.${mm}.${yy}`;
        };
        const periodLabel = usePeriod ? `${fmtDE(periodStart)} - ${fmtDE(periodEnd)}` : String(year);
        const periodEndYear = usePeriod ? periodEnd.getFullYear() : year;

        const propId = tenant.propertyId || null;
        const property = propId ? await db.properties.get(propId) : null;

        const mode = (await db.settings.get("wgDistributionMode"))?.value || "PERSON_DAYS";
        const allTenantsInProp = propId ? await db.tenants.where("propertyId").equals(propId).toArray() : [];

        const msDay = 24 * 60 * 60 * 1000;
        const calcWeightForTenantPeriod = (t) => {
            const moveIn = t.moveIn ? new Date(t.moveIn) : new Date(0);
            const moveOut = t.moveOut ? new Date(t.moveOut) : new Date(8640000000000000);
            const from = moveIn > periodStart ? moveIn : periodStart;
            const to = moveOut < periodEnd ? moveOut : periodEnd;
            const days = (to > from) ? Math.round((to - from) / msDay) : 0;
            const sqm = (t.sqm != null && !isNaN(parseFloat(t.sqm)) && parseFloat(t.sqm) > 0) ? parseFloat(t.sqm) : 1;
            const weight = mode === "PERSON_DAYS_SQM" ? (days * sqm) : days;
            return { days, sqm, weight };
        };

        let weights = [];
        let totalWeight = 0;
        let selfW = null;
        if (usePeriod) {
            weights = allTenantsInProp
                .map(t => ({ tenant: t, ...calcWeightForTenantPeriod(t) }))
                .filter(w => w.days > 0 && w.weight > 0);
            totalWeight = weights.reduce((sum, w) => sum + w.weight, 0);
            selfW = weights.find(w => w.tenant.id === tenant.id) || null;
        } else {
            weights = allTenantsInProp
                .map(t => ({ tenant: t, ...this._calcTenantWeightForYear(t, year, mode) }))
                .filter(w => w.days > 0 && w.weight > 0);
            totalWeight = weights.reduce((sum, w) => sum + w.weight, 0);
            selfW = weights.find(w => w.tenant.id === tenant.id) || null;
        }

        const allUtils = usePeriod
            ? (await (async () => {
                const res = [];
                for (let y = periodStart.getFullYear(); y <= periodEnd.getFullYear(); y++) {
                    const arr = await db.utilities.where('year').equals(String(y)).toArray();
                    res.push(...arr);
                }
                return res;
            })())
            : await db.utilities.where('year').equals(year).toArray();

        const utilsForProp = allUtils.filter(u => (u.propertyId != null && propId != null && u.propertyId === propId));
        const unassignedForYear = allUtils.filter(u => u.propertyId == null);

        const totalCosts = utilsForProp.reduce((sum, u) => sum + (parseFloat(u.amount) || 0), 0);

        let activeMonths = [];
        let totalPrepay = 0;
        if (usePeriod) {
            const moveIn = tenant.moveIn ? new Date(tenant.moveIn) : new Date(2000, 0, 1);
            const moveOut = tenant.moveOut ? new Date(tenant.moveOut) : new Date(2099, 11, 31);
            for (let y = periodStart.getFullYear(); y <= periodEnd.getFullYear(); y++) {
                for (let m = 0; m < 12; m++) {
                    const check = new Date(y, m, 15);
                    if (check < periodStart || check > periodEnd) continue;
                    if (check < moveIn || check > moveOut) continue;
                    activeMonths.push({ year: String(y), monthIndex: m });
                    totalPrepay += this._getPrepaymentForMonth(tenant, String(y), m);
                }
            }
        } else {
            activeMonths = this._getActiveMonthsInYearForTenant(tenant, year);
            totalPrepay = activeMonths.reduce((sum, m) => sum + this._getPrepaymentForMonth(tenant, year, m), 0);
        }

        const share = (selfW && totalWeight > 0) ? (selfW.weight / totalWeight) : 0;
        const allocatedCosts = totalCosts * share;
        const balance = totalPrepay - allocatedCosts; // positiv = Guthaben, negativ = Nachzahlung

        const sender = (ImmoApp.settings && ImmoApp.settings.getSenderConfig) ? await ImmoApp.settings.getSenderConfig() : {};
        const senderLines = [sender.name, sender.street, [sender.zip, sender.city].filter(Boolean).join(' '), sender.country].filter(Boolean);
        const safeSenderLinesHtml = senderLines.map(l => (l || '').replace(/</g, '&lt;')).join('<br>');
        const logoBlock = sender.logoDataUrl
            ? `<div style="display:flex;justify-content:flex-start;margin-bottom:10px;">
                    <img src="${sender.logoDataUrl}" alt="Logo" style="max-height:60px;max-width:220px;object-fit:contain;">
               </div>`
            : '';
        const senderBlock = (logoBlock || senderLines.length > 0)
            ? `<div class="letterhead">${logoBlock}${safeSenderLinesHtml}</div>`
            : '';
        const bankLine = sender.iban ? `- Bankverbindung: ${(sender.iban || '').replace(/</g, '&lt;')}` : '- Bankverbindung: _______________________';
        const placeStr = (sender.place || sender.city || '').trim();
        const placeDate = placeStr ? `${placeStr}, ${dateStr}` : dateStr;
        const footerText = (sender.footer || '').trim();
        const footerBlock = footerText
            ? `<div class="footer" id="nk-footer" contenteditable="true" style="outline:none;white-space:pre-line;">${footerText.replace(/</g,'&lt;')}</div>`
            : `<div class="footer" id="nk-footer" contenteditable="true" style="outline:none;white-space:pre-line;"></div>`;

        const today = new Date();
        const dateStr = today.toLocaleDateString('de-DE');

        const street = tenant.street || '';
        const zip = tenant.zip || '';
        const city = tenant.city || '';
        const country = tenant.country || 'Deutschland';
        const addressBlock = `
${tenant.name}
${street}
${zip} ${city}
${country}`.trim();

        const costsRows = utilsForProp.length > 0
            ? utilsForProp
                .slice()
                .sort((a, b) => (a.name || '').localeCompare(b.name || ''))
                .map(u => {
                    const total = parseFloat(u.amount) || 0;
                    const mine = total * share;
                    const safeName = (u.name || '').replace(/</g,'&lt;');
                    return `
                        <tr>
                            <td style="padding:6px 8px;border-bottom:1px solid #eee;">${safeName}</td>
                            <td style="padding:6px 8px;border-bottom:1px solid #eee;text-align:right;white-space:nowrap;">${ImmoApp.ui.formatCurrency(total)}</td>
                            <td style="padding:6px 8px;border-bottom:1px solid #eee;text-align:right;white-space:nowrap;">${(share * 100).toFixed(2).replace('.', ',')} %</td>
                            <td style="padding:6px 8px;border-bottom:1px solid #eee;text-align:right;white-space:nowrap;font-weight:700;">${ImmoApp.ui.formatCurrency(mine)}</td>
                        </tr>
                    `;
                })
                .join('')
            : `<tr><td colspan="4" style="padding:10px 8px;color:#666;">Keine Nebenkosten im Zeitraum ${periodLabel} für dieses Objekt zugewiesen.</td></tr>`;

        const hintUnassigned = unassignedForYear.length > 0
            ? `<div style="margin-top:12px;padding:10px;border:1px solid #fde68a;background:#fffbeb;border-radius:6px;font-size:12px;color:#92400e;">
                Hinweis: Es gibt im Zeitraum ${periodLabel} noch <strong>${unassignedForYear.length}</strong> Nebenkosten‑Einträge ohne Objekt‑Zuordnung.
                Diese fehlen ggf. in der Abrechnung. Bitte im Tab „📊 Nebenkosten“ nachpflegen.
               </div>`
            : '';

        const balanceLabel = balance < -0.01
            ? `<span style="color:#b91c1c;font-weight:700;">Nachzahlung: ${ImmoApp.ui.formatCurrency(Math.abs(balance))}</span>`
            : (balance > 0.01
                ? `<span style="color:#1d4ed8;font-weight:700;">Guthaben: ${ImmoApp.ui.formatCurrency(balance)}</span>`
                : `<span style="color:#111827;font-weight:700;">Ausgeglichen: ${ImmoApp.ui.formatCurrency(0)}</span>`);

        const subject = `Nebenkostenabrechnung ${periodLabel} – ${property ? property.name : 'Objekt'} – ${tenant.name}`;

        const emailLink = tenant.email
            ? `<a href="#" onclick="(function(){ const s=(document.getElementById('nk-subject')?.innerText||'').trim(); const n=(document.getElementById('nk-note')?.innerText||'').trim(); const body=('Hallo ' + ${JSON.stringify(tenant.name)} + ',\\n\\n' + 'anbei erhalten Sie die Nebenkostenabrechnung für ' + ${JSON.stringify(periodLabel)} + '.\\n\\n' + (n ? ('Hinweise:\\n' + n + '\\n\\n') : '') + 'Viele Grüße\\n'); window.opener?.ImmoApp?.tenants?.openMailDraft(${tenant.id}, s, body); return false; })()" style="font-size:12px;color:#2563eb;">E‑Mail vorbereiten (Anhang manuell)</a>`
            : `<span style="font-size:12px;color:#6b7280;">Keine E‑Mail beim Mieter hinterlegt.</span>`;

        const html = `
<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <title>NK-Abrechnung ${periodLabel} – ${tenant.name}</title>
    <style>
        body { font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; margin: 40px; background:#f8fafc; color:#111827; }
        .doc { max-width: 900px; margin: 0 auto; background:#fff; border:1px solid #e5e7eb; border-radius:12px; box-shadow:0 8px 24px rgba(15,23,42,0.06); padding:26px; }
        .header { display:flex; justify-content:space-between; font-size:12px; color:#475569; align-items:center; gap:12px; }
        .address { margin-top: 40px; white-space: pre-line; }
        .title { margin-top: 24px; font-weight: 800; font-size: 18px; }
        .meta { margin-top: 6px; font-size: 12px; color: #374151; }
        table { width: 100%; border-collapse: collapse; margin-top: 14px; font-size: 13px; }
        th { text-align: left; background: #f3f4f6; padding: 8px; border:1px solid #e5e7eb; }
        td { padding: 8px; border-left:1px solid #e5e7eb; border-right:1px solid #e5e7eb; }
        .summary { margin-top: 16px; padding: 12px; border: 1px solid #e5e7eb; border-radius: 8px; background: #fafafa; }
        .row { display:flex; justify-content:space-between; gap: 12px; margin: 6px 0; }
        .row strong { white-space: nowrap; }
        .letterhead { font-size: 12px; color: #374151; line-height: 1.4; margin-bottom: 8px; }
        .anlagen { margin-top: 14px; font-size: 12px; color: #6b7280; }
        .footer { margin-top: 18px; padding-top: 10px; border-top: 1px solid #e5e7eb; font-size: 11px; color: #6b7280; }
        @media print {
            button { display:none; }
            body { margin: 20mm; background:#fff; }
            .doc { border:0; box-shadow:none; border-radius:0; padding:0; }
        }
    </style>
</head>
<body>
    <div class="doc">
        ${senderBlock}
        <div class="header">
            <div>${placeDate}</div>
            <div>${emailLink}</div>
        </div>

        <div class="address">${addressBlock}</div>

        <div class="title">Nebenkostenübersicht ${periodLabel}</div>
        <div class="meta">
            Objekt: <strong>${property ? property.name : (propId ? ('#' + propId) : '—')}</strong><br>
            Zeitraum: <strong>${periodLabel}</strong> · Aktive Monate: <strong>${activeMonths.length}</strong><br>
            Verteilungsmodus: <strong>${mode === "PERSON_DAYS_SQM" ? "Person‑Tage × m²" : "Person‑Tage"}</strong>
        </div>

        <div style="margin-top:14px;">
            <div style="font-size:12px;color:#374151;font-weight:700;">Betreff (editierbar):</div>
            <div id="nk-subject" contenteditable="true" style="outline:none;border:1px dashed #c7d2fe;background:#eef2ff;border-radius:6px;padding:8px;font-size:12px;color:#312e81;">${subject}</div>
        </div>

        <div class="summary">
            <div class="row"><span>Gesamte Nebenkosten (Objekt, zugewiesen):</span><strong>${ImmoApp.ui.formatCurrency(totalCosts)}</strong></div>
            <div class="row"><span>Dein Anteil (Schlüssel):</span><strong>${(share * 100).toFixed(2).replace('.', ',')} %</strong></div>
            <div class="row"><span>Deine umgelegten Nebenkosten:</span><strong>${ImmoApp.ui.formatCurrency(allocatedCosts)}</strong></div>
            <div class="row"><span>Gezahlte Vorauszahlungen (aus Vertrag/Historie):</span><strong>${ImmoApp.ui.formatCurrency(totalPrepay)}</strong></div>
            <div class="row"><span>Ergebnis:</span><strong>${balanceLabel}</strong></div>
        </div>

        <div style="margin-top:12px;font-size:12px;color:#374151;border:1px solid #e5e7eb;border-radius:8px;padding:10px;background:#fff;">
            <div style="font-weight:800;margin-bottom:6px;">Details Verteilungs‑Schlüssel</div>
            <div>Deine Tage im Zeitraum: <strong>${selfW ? selfW.days : 0}</strong> · m²: <strong>${selfW ? selfW.sqm : 0}</strong> · Gewicht: <strong>${selfW ? selfW.weight : 0}</strong></div>
            <div>Summe Gewicht (alle aktiven Mieter im Objekt): <strong>${totalWeight}</strong> · aktive Mieter: <strong>${weights.length}</strong></div>
            <div style="margin-top:6px;color:#6b7280;">Hinweis: Wenn Gewicht=0 (z.B. kein Ein-/Auszug im Zeitraum erkennbar), ist keine Umlage möglich.</div>
        </div>

        <h3 style="margin-top:18px;font-size:14px;font-weight:800;">Kostenpositionen (detailliert)</h3>
        <div style="font-size:12px;color:#6b7280;margin-top:4px;">
            Jede Position wird mit demselben Umlageschlüssel auf dich umgelegt (dein Anteil in € je Position).
        </div>
        <table>
            <thead>
                <tr>
                    <th>Position</th>
                    <th style="text-align:right;">Gesamt</th>
                    <th style="text-align:right;">Schlüssel</th>
                    <th style="text-align:right;">Dein Anteil</th>
                </tr>
            </thead>
            <tbody>
                ${costsRows}
            </tbody>
            <tfoot>
                <tr>
                    <th style="text-align:right;">Summe</th>
                    <th style="text-align:right;">${ImmoApp.ui.formatCurrency(totalCosts)}</th>
                    <th style="text-align:right;">${(share * 100).toFixed(2).replace('.', ',')} %</th>
                    <th style="text-align:right;">${ImmoApp.ui.formatCurrency(allocatedCosts)}</th>
                </tr>
            </tfoot>
        </table>

        ${hintUnassigned}

        <div style="margin-top:16px;border:1px solid #e5e7eb;border-radius:8px;padding:12px;background:#f9fafb;" contenteditable="true" id="nk-payment">
Zahlungshinweise (editierbar):
- Nachzahlung bitte innerhalb von 14 Tagen überweisen (falls Nachzahlung).
- Ein Guthaben wird erstattet oder mit der nächsten Zahlung verrechnet (falls Guthaben).
- Verwendungszweck: Nebenkosten ${periodLabel} – ${tenant.name}
${bankLine}
        </div>

        <div class="anlagen">
            <div style="font-weight:700;margin-bottom:4px;">Anlagen (editierbar):</div>
            <div id="nk-attachments" contenteditable="true" style="outline:none;border:1px dashed #e5e7eb;border-radius:6px;padding:8px;white-space:pre-line;">
· Kostenaufstellung (dieses Schreiben)
· Zählerabrechnungen (falls vorhanden)
            </div>
        </div>

        <div id="nk-note" style="margin-top:18px;font-size:12px;color:#6b7280;white-space:pre-line;outline:none;border:1px dashed #e5e7eb;border-radius:6px;padding:10px;" contenteditable="true">
Hinweistext (editierbar):
- Zahlungsfrist: __.__.${periodEndYear}
- Verwendungszweck: Nebenkosten ${periodLabel} – ${tenant.name}
- Rückfragen: __________
        </div>

        <button onclick="window.print()" style="margin-top:18px;padding:9px 16px;border-radius:8px;border:1px solid #d1d5db;background:#f8fafc;color:#111827;font-weight:600;cursor:pointer;">
            Als PDF drucken / speichern
        </button>
        <button onclick="(function(){ const s=(document.getElementById('nk-subject')?.innerText||'').trim(); const n=(document.getElementById('nk-note')?.innerText||'').trim(); const a=(document.getElementById('nk-attachments')?.innerText||'').trim(); const f=(document.getElementById('nk-footer')?.innerText||'').trim(); window.opener?.ImmoApp?.tenants?.downloadUtilitiesDocx(${tenant.id}, s, n, a, f, ${JSON.stringify(nkStartISO)}, ${JSON.stringify(nkEndISO)}); })()" style="margin-top:18px;margin-left:10px;padding:9px 16px;border-radius:8px;border:1px solid #4f46e5;background:#eef2ff;color:#3730a3;font-weight:600;cursor:pointer;">
            Als DOCX herunterladen
        </button>

        ${footerBlock}
    </div>
</body>
</html>
        `;

        const win = window.open('', '_blank');
        if (!win) {
            alert("Pop-up Blocker verhindert das Öffnen der Abrechnung. Bitte Pop-ups für diese Seite erlauben.");
            return;
        }
        win.document.open();
        win.document.write(html);
        win.document.close();
    },

    downloadUtilitiesDocx: async function(tenantId, subjectOverride = null, noteOverride = null, attachmentsOverride = null, footerOverride = null, periodStartISO = null, periodEndISO = null) {
        if (typeof docx === "undefined" || !docx || !docx.Document) {
            alert("DOCX-Bibliothek ist noch nicht geladen. Bitte Seite neu laden.");
            return;
        }
        const db = ImmoApp.db.instance;
        const tenant = await db.tenants.get(parseInt(tenantId, 10));
        if (!tenant) return alert("Mieter nicht gefunden.");

        const sender = (ImmoApp.settings && ImmoApp.settings.getSenderConfig) ? await ImmoApp.settings.getSenderConfig() : {};
        const senderLines = [sender.name, sender.street, [sender.zip, sender.city].filter(Boolean).join(' '), sender.country].filter(Boolean);

        const year = ImmoApp.ui.currentYear;
        const propId = tenant.propertyId || null;
        const property = propId ? await db.properties.get(propId) : null;

        const allUtils = usePeriod
            ? (await (async () => {
                const res = [];
                for (let y = periodStart.getFullYear(); y <= periodEnd.getFullYear(); y++) {
                    const arr = await db.utilities.where('year').equals(String(y)).toArray();
                    res.push(...arr);
                }
                return res;
            })())
            : await db.utilities.where('year').equals(year).toArray();
        const utilsForProp = allUtils.filter(u => (u.propertyId != null && propId != null && u.propertyId === propId));

        const totalCosts = utilsForProp.reduce((sum, u) => sum + (parseFloat(u.amount) || 0), 0);
        const mode = (await db.settings.get("wgDistributionMode"))?.value || "PERSON_DAYS";
        const allTenantsInProp = propId ? await db.tenants.where("propertyId").equals(propId).toArray() : [];

        const msDay = 24 * 60 * 60 * 1000;
        const weights = usePeriod
            ? allTenantsInProp.map(t => {
                const moveIn = t.moveIn ? new Date(t.moveIn) : new Date(0);
                const moveOut = t.moveOut ? new Date(t.moveOut) : new Date(8640000000000000);
                const from = moveIn > periodStart ? moveIn : periodStart;
                const to = moveOut < periodEnd ? moveOut : periodEnd;
                const days = (to > from) ? Math.round((to - from) / msDay) : 0;
                const sqm = (t.sqm != null && !isNaN(parseFloat(t.sqm)) && parseFloat(t.sqm) > 0) ? parseFloat(t.sqm) : 1;
                const weight = mode === "PERSON_DAYS_SQM" ? (days * sqm) : days;
                return { tenant: t, days, sqm, weight };
            }).filter(w => w.days > 0 && w.weight > 0)
            : allTenantsInProp.map(t => ({ tenant: t, ...this._calcTenantWeightForYear(t, year, mode) })).filter(w => w.days > 0 && w.weight > 0);

        const totalWeight = weights.reduce((sum, w) => sum + w.weight, 0);
        const selfW = weights.find(w => w.tenant.id === tenant.id);
        const share = (selfW && totalWeight > 0) ? (selfW.weight / totalWeight) : 0;

        const allocatedCosts = totalCosts * share;
        let totalPrepay = 0;
        if (usePeriod) {
            const moveIn = tenant.moveIn ? new Date(tenant.moveIn) : new Date(2000, 0, 1);
            const moveOut = tenant.moveOut ? new Date(tenant.moveOut) : new Date(2099, 11, 31);
            for (let y = periodStart.getFullYear(); y <= periodEnd.getFullYear(); y++) {
                for (let m = 0; m < 12; m++) {
                    const check = new Date(y, m, 15);
                    if (check < periodStart || check > periodEnd) continue;
                    if (check < moveIn || check > moveOut) continue;
                    totalPrepay += this._getPrepaymentForMonth(tenant, String(y), m);
                }
            }
        } else {
            const activeMonths = this._getActiveMonthsInYearForTenant(tenant, year);
            totalPrepay = activeMonths.reduce((sum, m) => sum + this._getPrepaymentForMonth(tenant, year, m), 0);
        }
        const balance = totalPrepay - allocatedCosts;

        const today = new Date();
        const dateStr = today.toLocaleDateString('de-DE');
        const subject = (subjectOverride && subjectOverride.trim())
            ? subjectOverride.trim()
            : `Nebenkostenabrechnung ${periodLabel} – ${property ? property.name : 'Objekt'} – ${tenant.name}`;
        const noteText = (noteOverride && noteOverride.trim()) ? noteOverride.trim() : "";

        const attachmentsText = (attachmentsOverride && String(attachmentsOverride).trim())
            ? String(attachmentsOverride).trim()
            : "· Kostenaufstellung (dieses Schreiben)\n· Zählerabrechnungen (falls vorhanden)";
        const attachmentsLines = attachmentsText
            .split(/\r?\n/g)
            .map(l => l.trim())
            .filter(Boolean)
            .map(l => l.replace(/^Anlagen\s*:?/i, '').trim())
            .filter(Boolean)
            .map(l => (l.startsWith("·") || l.startsWith("-")) ? l : ("· " + l));

        const footerText = (footerOverride && String(footerOverride).trim()) ? String(footerOverride).trim() : ((sender.footer || "").trim());
        const footerLines = footerText ? footerText.split(/\r?\n/g).map(l => l.trim()).filter(Boolean) : [];

        const paymentLines = [
            "Zahlungshinweise:",
            "- Nachzahlung bitte innerhalb von 14 Tagen überweisen (falls Nachzahlung).",
            "- Ein Guthaben wird erstattet oder mit der nächsten Zahlung verrechnet (falls Guthaben).",
            `- Verwendungszweck: Nebenkosten ${periodLabel} – ${tenant.name}`,
            sender.iban ? `- Bankverbindung: ${sender.iban}` : "- Bankverbindung: _______________________"
        ];

        const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, ImageRun } = docx;

        const topChildren = [];
        // Logo oben (optional)
        const dataUrlToBytes = (dataUrl) => {
            try {
                const parts = String(dataUrl || "").split(",");
                if (parts.length < 2) return null;
                const b64 = parts[1];
                const bin = atob(b64);
                const bytes = new Uint8Array(bin.length);
                for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
                return bytes;
            } catch { return null; }
        };
        if (sender.logoDataUrl && ImageRun) {
            const bytes = dataUrlToBytes(sender.logoDataUrl);
            if (bytes) {
                topChildren.push(new Paragraph({
                    children: [new ImageRun({ data: bytes, transformation: { width: 180, height: 60 } })]
                }));
            }
        }
        if (senderLines.length > 0) {
            topChildren.push(...senderLines.map(l => new Paragraph({ children: [new TextRun({ text: l, size: 20, color: "374151" })] })));
            topChildren.push(new Paragraph({ text: "" }));
        }
        const placeStr = (sender.place || sender.city || "").trim();
        const placeDate = placeStr ? `${placeStr}, ${dateStr}` : dateStr;
        topChildren.push(new Paragraph({ children: [new TextRun({ text: placeDate, size: 18, color: "555555" })] }));
        const header = new Paragraph({ children: [new TextRun({ text: subject, bold: true, size: 28 })] });
        const meta = new Paragraph({
            children: [
                new TextRun({ text: `Objekt: ${property ? property.name : (propId ? ('#' + propId) : '—')} · Datum: ${dateStr}`, size: 18, color: "555555" })
            ]
        });

        const summaryLines = [
            new Paragraph({ children: [new TextRun({ text: `Gesamte Nebenkosten (Objekt, zugewiesen): ${ImmoApp.ui.formatCurrency(totalCosts)}`, bold: true })] }),
            new Paragraph({ children: [new TextRun({ text: `Dein Anteil (Schlüssel): ${(share * 100).toFixed(2).replace('.', ',')} %`, bold: true })] }),
            new Paragraph({ children: [new TextRun({ text: `Deine umgelegten Nebenkosten: ${ImmoApp.ui.formatCurrency(allocatedCosts)}`, bold: true })] }),
            new Paragraph({ children: [new TextRun({ text: `Gezahlte Vorauszahlungen (aus Vertrag/Historie): ${ImmoApp.ui.formatCurrency(totalPrepay)}`, bold: true })] }),
            new Paragraph({
                children: [new TextRun({
                    text: balance < -0.01
                        ? `Ergebnis: Nachzahlung ${ImmoApp.ui.formatCurrency(Math.abs(balance))}`
                        : (balance > 0.01 ? `Ergebnis: Guthaben ${ImmoApp.ui.formatCurrency(balance)}` : `Ergebnis: Ausgeglichen ${ImmoApp.ui.formatCurrency(0)}`),
                    bold: true
                })]
            })
        ];

        const rows = [
            new TableRow({
                children: [
                    new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Position", bold: true })] })] }),
                    new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Gesamt", bold: true })] })] }),
                    new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Schlüssel", bold: true })] })] }),
                    new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Dein Anteil", bold: true })] })] })
                ]
            }),
            ...utilsForProp.map(u => new TableRow({
                children: [
                    new TableCell({ children: [new Paragraph({ text: (u.name || '') })] }),
                    new TableCell({ children: [new Paragraph({ text: ImmoApp.ui.formatCurrency(u.amount || 0) })] }),
                    new TableCell({ children: [new Paragraph({ text: `${(share * 100).toFixed(2).replace('.', ',')} %` })] }),
                    new TableCell({ children: [new Paragraph({ text: ImmoApp.ui.formatCurrency((parseFloat(u.amount) || 0) * share) })] })
                ]
            }))
        ];

        const table = new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows
        });

        const doc = new Document({
            sections: [{
                children: [
                    ...topChildren,
                    header,
                    meta,
                    new Paragraph({ text: "" }),
                    new Paragraph({ children: [new TextRun({ text: `Verteilungsmodus: ${mode === "PERSON_DAYS_SQM" ? "Person‑Tage × m²" : "Person‑Tage"}`, color: "555555" })] }),
                    new Paragraph({ children: [new TextRun({ text: `Schlüssel: Tage=${selfW ? selfW.days : 0}, m²=${selfW ? selfW.sqm : 0}, Gewicht=${selfW ? selfW.weight : 0} · Summe Gewicht=${totalWeight} (Mieter=${weights.length})`, color: "555555" })] }),
                    new Paragraph({ text: "" }),
                    ...summaryLines,
                    new Paragraph({ text: "" }),
                    new Paragraph({ children: [new TextRun({ text: "Kostenpositionen", bold: true })] }),
                    table,
                    new Paragraph({ text: "" }),
                    new Paragraph({ children: [new TextRun({ text: `Summe Gesamt: ${ImmoApp.ui.formatCurrency(totalCosts)} · Dein Anteil: ${ImmoApp.ui.formatCurrency(allocatedCosts)}`, bold: true })] }),
                    new Paragraph({ text: "" }),
                    ...paymentLines.map(l => new Paragraph({ text: l })),
                    new Paragraph({ text: "" }),
                    new Paragraph({ children: [new TextRun({ text: "Anlagen:", bold: true })] }),
                    ...attachmentsLines.map(l => new Paragraph({ text: l })),
                    ...(footerLines.length > 0
                        ? [new Paragraph({ text: "" }), ...footerLines.map(l => new Paragraph({ children: [new TextRun({ text: l, size: 16, color: "6b7280" })] }))]
                        : []),
                    ...(noteText ? [new Paragraph({ text: "" }), new Paragraph({ children: [new TextRun({ text: "Hinweise", bold: true })] }), ...noteText.split(/\n/g).map(l => new Paragraph({ text: l }))] : [])
                ]
            }]
        });

        const blob = await Packer.toBlob(doc);
        const fileName = `Nebenkosten_${periodLabel.replace(/[^a-zA-Z0-9]+/g, '_')}_${(tenant.name || 'Mieter').replace(/\s+/g, '_')}.docx`;
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
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
        document.getElementById('history-tenant-name').dataset.tenantId = tenant.id;
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
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-4">
                        <div>
                            <label class="block text-sm font-medium">Straße & Hausnummer</label>
                            <input type="text" id="modal-tenant-street" class="w-full border p-2 rounded" placeholder="z.B. Musterstraße 1">
                        </div>
                        <div class="grid grid-cols-3 gap-2">
                            <div class="col-span-1">
                                <label class="block text-sm font-medium">PLZ</label>
                                <input type="text" id="modal-tenant-zip" class="w-full border p-2 rounded" placeholder="12345">
                            </div>
                            <div class="col-span-2">
                                <label class="block text-sm font-medium">Ort</label>
                                <input type="text" id="modal-tenant-city" class="w-full border p-2 rounded" placeholder="z.B. Berlin">
                            </div>
                        </div>
                        <div>
                            <label class="block text-sm font-medium">Land (optional)</label>
                            <input type="text" id="modal-tenant-country" class="w-full border p-2 rounded" placeholder="z.B. Deutschland">
                        </div>
                        <div>
                            <label class="block text-sm font-medium">E-Mail (optional)</label>
                            <input type="email" id="modal-tenant-email" class="w-full border p-2 rounded" placeholder="z.B. max@example.com">
                        </div>
                    </div>
                    <div class="grid grid-cols-2 md:grid-cols-3 gap-4 border-t pt-4">
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
            document.getElementById('modal-tenant-street').value = t.street || '';
            document.getElementById('modal-tenant-zip').value = t.zip || '';
            document.getElementById('modal-tenant-city').value = t.city || '';
            document.getElementById('modal-tenant-country').value = t.country || 'Deutschland';
            document.getElementById('modal-tenant-email').value = t.email || '';
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
            document.getElementById('modal-tenant-street').value = '';
            document.getElementById('modal-tenant-zip').value = '';
            document.getElementById('modal-tenant-city').value = '';
            document.getElementById('modal-tenant-country').value = 'Deutschland';
            document.getElementById('modal-tenant-email').value = '';
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
        const street = document.getElementById('modal-tenant-street').value.trim();
        const zip = document.getElementById('modal-tenant-zip').value.trim();
        const city = document.getElementById('modal-tenant-city').value.trim();
        const country = document.getElementById('modal-tenant-country').value.trim();
        const email = document.getElementById('modal-tenant-email').value.trim();
        
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
            street,
            zip,
            city,
            country,
            email,
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
        const cardsActive = document.getElementById("tenants-cards-active");
        const cardsPast = document.getElementById("tenants-cards-past");
        tbodyActive.innerHTML = "";
        tbodyPast.innerHTML = "";
        if (cardsActive) cardsActive.innerHTML = "";
        if (cardsPast) cardsPast.innerHTML = "";
        
        let pastCount = 0;
        let activeCount = 0;

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
                activeCount++;
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
                if (cardsActive) {
                    cardsActive.innerHTML += `
                        <div class="bg-white border border-gray-100 rounded-xl shadow-sm p-3">
                            <div class="flex justify-between items-start gap-3">
                                <div>
                                    <div class="text-xs font-bold text-gray-500">${propName} ${roomTxt}</div>
                                    <div class="mt-1 text-sm font-semibold text-blue-700 cursor-pointer hover:underline" onclick="ImmoApp.tenants.showHistoryModal(${t.id})">${t.name}</div>
                                    ${flatBadge}
                                </div>
                                <div class="text-right">
                                    <div class="text-sm font-bold text-gray-800">${ImmoApp.ui.formatCurrency(t.rent)} mtl.</div>
                                    <div class="text-[11px] text-gray-500">${moveInFormat} bis ${moveOutFormat}</div>
                                </div>
                            </div>
                            <div class="mt-2 text-xs text-gray-600">
                                Kalt: ${ImmoApp.ui.formatCurrency(base)} | NK: ${ImmoApp.ui.formatCurrency(prep)}<br>
                                <span class="text-gray-500">${depTxt}</span>
                            </div>
                            <div class="mt-3 flex gap-2">
                                <button onclick="ImmoApp.tenants.showHistoryModal(${t.id})" class="flex-1 text-purple-700 text-xs bg-purple-50 px-2 py-2 rounded-lg border border-purple-100">Historie</button>
                                <button onclick="ImmoApp.tenants.showTenantModal(${t.id})" class="flex-1 text-blue-700 text-xs bg-blue-50 px-2 py-2 rounded-lg border border-blue-100">Bearbeiten</button>
                                <button onclick="ImmoApp.tenants.deleteTenant(${t.id})" class="flex-1 text-red-700 text-xs bg-red-50 px-2 py-2 rounded-lg border border-red-100">Löschen</button>
                            </div>
                        </div>
                    `;
                }
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
                if (cardsPast) {
                    cardsPast.innerHTML += `
                        <div class="bg-gray-50 border border-gray-200 rounded-xl shadow-sm p-3">
                            <div class="flex justify-between items-start gap-3">
                                <div>
                                    <div class="text-xs font-bold text-gray-500">${propName} ${roomTxt}</div>
                                    <div class="mt-1 text-sm font-semibold text-blue-700 cursor-pointer hover:underline" onclick="ImmoApp.tenants.showHistoryModal(${t.id})">${t.name}</div>
                                    <div class="text-[11px] text-gray-500 mt-1">${moveInFormat} bis ${moveOutFormat}</div>
                                </div>
                                <div class="text-right text-xs">${depBadge || '<span class="text-gray-400">Keine Kaution</span>'}</div>
                            </div>
                            <div class="mt-3 flex gap-2">
                                <button onclick="ImmoApp.tenants.showHistoryModal(${t.id})" class="flex-1 text-purple-700 text-xs bg-purple-50 px-2 py-2 rounded-lg border border-purple-100">Historie</button>
                                <button onclick="ImmoApp.tenants.showTenantModal(${t.id})" class="flex-1 text-blue-700 text-xs bg-blue-50 px-2 py-2 rounded-lg border border-blue-100">Bearbeiten</button>
                                <button onclick="ImmoApp.tenants.deleteTenant(${t.id})" class="flex-1 text-red-700 text-xs bg-red-50 px-2 py-2 rounded-lg border border-red-100">Löschen</button>
                            </div>
                        </div>
                    `;
                }
                pastCount++;
            }
        });

        if(pastCount === 0) tbodyPast.innerHTML = `<tr><td colspan="5" class="px-4 py-4 text-center text-gray-500 italic">Keine ausgezogenen Mieter vorhanden.</td></tr>`;
        if(tbodyActive.innerHTML === "") tbodyActive.innerHTML = `<tr><td colspan="5" class="px-4 py-4 text-center text-gray-500 italic">Keine aktiven Mieter in diesem Jahr.</td></tr>`;
        if (cardsPast && pastCount === 0) cardsPast.innerHTML = `<div class="bg-gray-50 border border-gray-200 rounded-xl p-3 text-center text-gray-500 italic text-sm">Keine ausgezogenen Mieter vorhanden.</div>`;
        if (cardsActive && activeCount === 0) cardsActive.innerHTML = `<div class="bg-white border border-gray-100 rounded-xl p-3 text-center text-gray-500 italic text-sm">Keine aktiven Mieter in diesem Jahr.</div>`;
    }
};