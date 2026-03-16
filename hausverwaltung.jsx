import { useState, useEffect } from "react";

// ─── Data ────────────────────────────────────────────────────────────────────
const initialData = {
  gebaeude: [
    { id: 1, name: "Musterstraße 12", adresse: "Musterstraße 12, 10115 Berlin", baujahr: 1985, einheiten: 8, wohnflaeche: 640 },
    { id: 2, name: "Gartenweg 5", adresse: "Gartenweg 5, 10117 Berlin", baujahr: 2001, einheiten: 4, wohnflaeche: 320 },
  ],
  wohnungen: [
    { id: 1, gebaeudeId: 1, bezeichnung: "WE 01 - EG links", flaeche: 78, zimmer: 3, mieter: 1, kaltmiete: 850, status: "vermietet" },
    { id: 2, gebaeudeId: 1, bezeichnung: "WE 02 - EG rechts", flaeche: 65, zimmer: 2, mieter: 2, kaltmiete: 720, status: "vermietet" },
    { id: 3, gebaeudeId: 1, bezeichnung: "WE 03 - 1.OG links", flaeche: 82, zimmer: 3, mieter: null, kaltmiete: 900, status: "leerstand" },
    { id: 4, gebaeudeId: 1, bezeichnung: "WE 04 - 1.OG rechts", flaeche: 70, zimmer: 3, mieter: 3, kaltmiete: 780, status: "vermietet" },
    { id: 5, gebaeudeId: 2, bezeichnung: "WE 01 - EG", flaeche: 90, zimmer: 4, mieter: 4, kaltmiete: 1100, status: "vermietet" },
    { id: 6, gebaeudeId: 2, bezeichnung: "WE 02 - OG", flaeche: 85, zimmer: 3, mieter: null, kaltmiete: 950, status: "leerstand" },
  ],
  mieter: [
    { id: 1, vorname: "Maria", nachname: "Müller", email: "m.mueller@email.de", telefon: "030 12345678", einzug: "2020-03-01", wohnungId: 1, kaution: 2550, kautionGezahlt: true },
    { id: 2, vorname: "Thomas", nachname: "Schmidt", email: "t.schmidt@email.de", telefon: "030 23456789", einzug: "2021-06-15", wohnungId: 2, kaution: 2160, kautionGezahlt: true },
    { id: 3, vorname: "Anna", nachname: "Weber", email: "a.weber@email.de", telefon: "030 34567890", einzug: "2019-01-01", wohnungId: 4, kaution: 2340, kautionGezahlt: true },
    { id: 4, vorname: "Klaus", nachname: "Fischer", email: "k.fischer@email.de", telefon: "030 45678901", einzug: "2022-09-01", wohnungId: 5, kaution: 3300, kautionGezahlt: false },
  ],
  zahlungen: [
    { id: 1, mieter: 1, wohnungId: 1, datum: "2024-01-05", betrag: 1050, typ: "miete", status: "erhalten", monat: "Januar 2024" },
    { id: 2, mieter: 2, wohnungId: 2, datum: "2024-01-03", betrag: 900, typ: "miete", status: "erhalten", monat: "Januar 2024" },
    { id: 3, mieter: 3, wohnungId: 4, datum: "2024-01-07", betrag: 960, typ: "miete", status: "erhalten", monat: "Januar 2024" },
    { id: 4, mieter: 4, wohnungId: 5, datum: "2024-01-02", betrag: 1350, typ: "miete", status: "erhalten", monat: "Januar 2024" },
    { id: 5, mieter: 1, wohnungId: 1, datum: "2024-02-05", betrag: 1050, typ: "miete", status: "erhalten", monat: "Februar 2024" },
    { id: 6, mieter: 2, wohnungId: 2, datum: "2024-02-10", betrag: 900, typ: "miete", status: "ausstehend", monat: "Februar 2024" },
    { id: 7, mieter: 3, wohnungId: 4, datum: "2024-02-07", betrag: 960, typ: "miete", status: "erhalten", monat: "Februar 2024" },
  ],
  wartungen: [
    { id: 1, gebaeudeId: 1, titel: "Heizungsinspektion", beschreibung: "Jährliche Wartung der Zentralheizung", datum: "2024-02-15", status: "abgeschlossen", kosten: 380, prioritaet: "mittel" },
    { id: 2, gebaeudeId: 1, titel: "Dachrinne reinigen", beschreibung: "Verstopfte Dachrinne Nordseite", datum: "2024-03-10", status: "offen", kosten: 150, prioritaet: "niedrig" },
    { id: 3, gebaeudeId: 2, titel: "Aufzug defekt", beschreibung: "Aufzug bleibt im 2. OG hängen", datum: "2024-02-20", status: "in_bearbeitung", kosten: 1200, prioritaet: "hoch" },
    { id: 4, gebaeudeId: 1, titel: "Wasserschaden WE03", beschreibung: "Rohrbruch im Badezimmer", datum: "2024-02-22", status: "in_bearbeitung", kosten: 2500, prioritaet: "hoch" },
  ],
  nebenkosten: {
    2023: {
      gebaeudeId: 1,
      heizkosten: 18500,
      wasserGrundkosten: 3200,
      muellabfuhr: 1800,
      strassreinigung: 600,
      hausmeister: 4800,
      versicherung: 2400,
      allgemeinstrom: 980,
      verwaltung: 2400,
      gesamt: 34680,
    },
  },
};

// ─── Icons ───────────────────────────────────────────────────────────────────
const icons = {
  home: "🏠", building: "🏢", users: "👥", euro: "💶", wrench: "🔧",
  chart: "📊", file: "📄", bell: "🔔", plus: "➕", edit: "✏️",
  trash: "🗑️", check: "✅", warning: "⚠️", error: "❌", info: "ℹ️",
  key: "🔑", calendar: "📅", phone: "📞", mail: "📧", search: "🔍",
  arrow: "→", settings: "⚙️", logout: "🚪", menu: "☰",
};

// ─── Helpers ─────────────────────────────────────────────────────────────────
const fmt = (n) => new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(n);
const fmtDate = (d) => d ? new Date(d).toLocaleDateString("de-DE") : "–";
const statusColor = { vermietet: "#22c55e", leerstand: "#ef4444", offen: "#f59e0b", abgeschlossen: "#22c55e", in_bearbeitung: "#3b82f6", erhalten: "#22c55e", ausstehend: "#f59e0b", hoch: "#ef4444", mittel: "#f59e0b", niedrig: "#22c55e" };
const statusLabel = { vermietet: "Vermietet", leerstand: "Leerstand", offen: "Offen", abgeschlossen: "Abgeschlossen", in_bearbeitung: "In Bearbeitung", erhalten: "Erhalten", ausstehend: "Ausstehend", hoch: "Hoch", mittel: "Mittel", niedrig: "Niedrig" };

// ─── Components ──────────────────────────────────────────────────────────────
const Badge = ({ status }) => (
  <span style={{ background: statusColor[status] + "22", color: statusColor[status], border: `1px solid ${statusColor[status]}44`, padding: "2px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600, letterSpacing: 0.3 }}>
    {statusLabel[status] || status}
  </span>
);

const Card = ({ children, style = {} }) => (
  <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #e8eaf0", boxShadow: "0 2px 8px rgba(0,0,0,0.04)", padding: "24px", ...style }}>
    {children}
  </div>
);

const StatCard = ({ label, value, sub, icon, color = "#2563eb" }) => (
  <Card style={{ display: "flex", alignItems: "center", gap: 16, padding: "20px 24px" }}>
    <div style={{ width: 52, height: 52, borderRadius: 14, background: color + "15", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, flexShrink: 0 }}>{icon}</div>
    <div>
      <div style={{ fontSize: 26, fontWeight: 800, color: "#0f172a", fontFamily: "'Playfair Display', serif", lineHeight: 1.1 }}>{value}</div>
      <div style={{ fontSize: 13, color: "#64748b", fontWeight: 500, marginTop: 2 }}>{label}</div>
      {sub && <div style={{ fontSize: 11, color: color, fontWeight: 600, marginTop: 2 }}>{sub}</div>}
    </div>
  </Card>
);

const Modal = ({ title, onClose, children }) => (
  <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
    <div style={{ background: "#fff", borderRadius: 20, width: "100%", maxWidth: 560, maxHeight: "85vh", overflow: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>
      <div style={{ padding: "24px 28px", borderBottom: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, fontFamily: "'Playfair Display', serif", color: "#0f172a" }}>{title}</h2>
        <button onClick={onClose} style={{ border: "none", background: "#f1f5f9", borderRadius: 8, width: 32, height: 32, cursor: "pointer", fontSize: 16 }}>✕</button>
      </div>
      <div style={{ padding: "24px 28px" }}>{children}</div>
    </div>
  </div>
);

const Input = ({ label, ...props }) => (
  <div style={{ marginBottom: 16 }}>
    <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>{label}</label>
    <input {...props} style={{ width: "100%", padding: "10px 14px", border: "1.5px solid #e2e8f0", borderRadius: 10, fontSize: 14, outline: "none", boxSizing: "border-box", background: "#fafbfc", transition: "border-color 0.2s", ...props.style }} onFocus={e => e.target.style.borderColor = "#2563eb"} onBlur={e => e.target.style.borderColor = "#e2e8f0"} />
  </div>
);

const Select = ({ label, children, ...props }) => (
  <div style={{ marginBottom: 16 }}>
    <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>{label}</label>
    <select {...props} style={{ width: "100%", padding: "10px 14px", border: "1.5px solid #e2e8f0", borderRadius: 10, fontSize: 14, outline: "none", boxSizing: "border-box", background: "#fafbfc" }}>
      {children}
    </select>
  </div>
);

const Btn = ({ children, onClick, variant = "primary", style = {}, disabled }) => {
  const styles = {
    primary: { background: "#2563eb", color: "#fff", border: "none" },
    secondary: { background: "#f1f5f9", color: "#374151", border: "1px solid #e2e8f0" },
    danger: { background: "#fef2f2", color: "#ef4444", border: "1px solid #fecaca" },
    success: { background: "#f0fdf4", color: "#22c55e", border: "1px solid #bbf7d0" },
  };
  return (
    <button onClick={onClick} disabled={disabled} style={{ padding: "10px 20px", borderRadius: 10, cursor: disabled ? "not-allowed" : "pointer", fontWeight: 600, fontSize: 14, transition: "all 0.15s", opacity: disabled ? 0.5 : 1, ...styles[variant], ...style }}>
      {children}
    </button>
  );
};

// ─── Dashboard ───────────────────────────────────────────────────────────────
function Dashboard({ data }) {
  const totalWE = data.wohnungen.length;
  const vermietet = data.wohnungen.filter(w => w.status === "vermietet").length;
  const leerstand = totalWE - vermietet;
  const monatlicheEinnahmen = data.wohnungen.filter(w => w.status === "vermietet").reduce((s, w) => s + w.kaltmiete, 0);
  const offeneWartungen = data.wartungen.filter(w => w.status !== "abgeschlossen").length;
  const ausstehend = data.zahlungen.filter(z => z.status === "ausstehend").reduce((s, z) => s + z.betrag, 0);

  const recentAktionen = [
    { text: "Zahlung erhalten – Thomas Schmidt (WE 02)", zeit: "Heute, 09:14", icon: "💶", color: "#22c55e" },
    { text: "Wartungsauftrag: Dachrinne erstellt", zeit: "Gestern, 14:30", icon: "🔧", color: "#f59e0b" },
    { text: "Mieterin Maria Müller – Adressänderung", zeit: "23. Feb, 11:00", icon: "👤", color: "#2563eb" },
    { text: "Nebenkostenabrechnung 2023 erstellt", zeit: "20. Feb, 16:45", icon: "📄", color: "#8b5cf6" },
  ];

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ margin: 0, fontSize: 30, fontWeight: 800, fontFamily: "'Playfair Display', serif", color: "#0f172a" }}>Dashboard</h1>
        <p style={{ margin: "4px 0 0", color: "#64748b", fontSize: 15 }}>Übersicht Ihrer Immobilien — {new Date().toLocaleDateString("de-DE", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 16, marginBottom: 28 }}>
        <StatCard label="Wohneinheiten gesamt" value={totalWE} sub={`${data.gebaeude.length} Gebäude`} icon="🏢" color="#2563eb" />
        <StatCard label="Vermietet" value={vermietet} sub={`${Math.round(vermietet / totalWE * 100)}% Auslastung`} icon="✅" color="#22c55e" />
        <StatCard label="Leerstand" value={leerstand} sub={leerstand > 0 ? "Handlungsbedarf" : "Alles vermietet"} icon="🔑" color="#ef4444" />
        <StatCard label="Monatl. Einnahmen" value={fmt(monatlicheEinnahmen)} sub="Kaltmieten" icon="💶" color="#2563eb" />
        <StatCard label="Ausstehende Zahlungen" value={fmt(ausstehend)} sub={ausstehend > 0 ? "Mahnwesen prüfen" : "Alles beglichen"} icon="⚠️" color="#f59e0b" />
        <StatCard label="Offene Wartungen" value={offeneWartungen} sub="Aufgaben" icon="🔧" color="#8b5cf6" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <Card>
          <h3 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 700, color: "#0f172a" }}>📋 Letzte Aktivitäten</h3>
          {recentAktionen.map((a, i) => (
            <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start", padding: "12px 0", borderBottom: i < recentAktionen.length - 1 ? "1px solid #f1f5f9" : "none" }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: a.color + "15", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>{a.icon}</div>
              <div>
                <div style={{ fontSize: 14, color: "#1e293b", fontWeight: 500 }}>{a.text}</div>
                <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>{a.zeit}</div>
              </div>
            </div>
          ))}
        </Card>

        <Card>
          <h3 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 700, color: "#0f172a" }}>🏠 Gebäudeübersicht</h3>
          {data.gebaeude.map(g => {
            const we = data.wohnungen.filter(w => w.gebaeudeId === g.id);
            const verm = we.filter(w => w.status === "vermietet").length;
            const pct = Math.round(verm / we.length * 100);
            return (
              <div key={g.id} style={{ padding: "14px 0", borderBottom: "1px solid #f1f5f9" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14, color: "#1e293b" }}>{g.name}</div>
                    <div style={{ fontSize: 12, color: "#94a3b8" }}>{we.length} Einheiten · {g.wohnflaeche} m²</div>
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 700, color: pct === 100 ? "#22c55e" : "#f59e0b" }}>{pct}%</span>
                </div>
                <div style={{ background: "#f1f5f9", borderRadius: 6, height: 6, overflow: "hidden" }}>
                  <div style={{ width: pct + "%", height: "100%", background: pct === 100 ? "#22c55e" : "#2563eb", borderRadius: 6, transition: "width 0.8s ease" }} />
                </div>
              </div>
            );
          })}
        </Card>
      </div>
    </div>
  );
}

// ─── Wohnungen ───────────────────────────────────────────────────────────────
function Wohnungen({ data, setData }) {
  const [filter, setFilter] = useState("alle");
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ gebaeudeId: 1, bezeichnung: "", flaeche: "", zimmer: "", kaltmiete: "", status: "leerstand" });

  const filtered = data.wohnungen.filter(w => {
    const g = data.gebaeude.find(b => b.id === w.gebaeudeId);
    const m = data.mieter.find(m => m.id === w.mieter);
    const txt = [w.bezeichnung, g?.name, m?.nachname].join(" ").toLowerCase();
    return (filter === "alle" || w.status === filter) && txt.includes(search.toLowerCase());
  });

  const save = () => {
    const neu = { ...form, id: Date.now(), flaeche: +form.flaeche, zimmer: +form.zimmer, kaltmiete: +form.kaltmiete, gebaeudeId: +form.gebaeudeId, mieter: null };
    setData(d => ({ ...d, wohnungen: [...d.wohnungen, neu] }));
    setShowModal(false);
    setForm({ gebaeudeId: 1, bezeichnung: "", flaeche: "", zimmer: "", kaltmiete: "", status: "leerstand" });
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 28, fontWeight: 800, fontFamily: "'Playfair Display', serif", color: "#0f172a" }}>Wohneinheiten</h1>
          <p style={{ margin: "4px 0 0", color: "#64748b" }}>{data.wohnungen.length} Einheiten in {data.gebaeude.length} Gebäuden</p>
        </div>
        <Btn onClick={() => setShowModal(true)}>➕ Neue Wohnung</Btn>
      </div>

      <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 200, position: "relative" }}>
          <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }}>🔍</span>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Suchen..." style={{ width: "100%", padding: "10px 14px 10px 38px", border: "1.5px solid #e2e8f0", borderRadius: 10, fontSize: 14, boxSizing: "border-box", background: "#fff" }} />
        </div>
        {["alle", "vermietet", "leerstand"].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{ padding: "10px 18px", borderRadius: 10, border: "1.5px solid", borderColor: filter === f ? "#2563eb" : "#e2e8f0", background: filter === f ? "#eff6ff" : "#fff", color: filter === f ? "#2563eb" : "#64748b", fontWeight: 600, cursor: "pointer", fontSize: 14 }}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
        {filtered.map(w => {
          const g = data.gebaeude.find(b => b.id === w.gebaeudeId);
          const m = data.mieter.find(mt => mt.id === w.mieter);
          const nebenkostenpauschale = w.kaltmiete * 0.2;
          return (
            <Card key={w.id}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 16, color: "#0f172a" }}>{w.bezeichnung}</div>
                  <div style={{ fontSize: 13, color: "#64748b", marginTop: 2 }}>{g?.name}</div>
                </div>
                <Badge status={w.status} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 14 }}>
                {[["Fläche", w.flaeche + " m²"], ["Zimmer", w.zimmer], ["Kaltmiete", fmt(w.kaltmiete)], ["NK-Pauschale", fmt(nebenkostenpauschale)]].map(([l, v]) => (
                  <div key={l} style={{ background: "#f8fafc", borderRadius: 8, padding: "8px 12px" }}>
                    <div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600 }}>{l}</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "#1e293b" }}>{v}</div>
                  </div>
                ))}
              </div>
              {m ? (
                <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", background: "#f0fdf4", borderRadius: 10, border: "1px solid #bbf7d0" }}>
                  <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#22c55e22", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, color: "#22c55e" }}>{m.vorname[0]}{m.nachname[0]}</div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14, color: "#166534" }}>{m.vorname} {m.nachname}</div>
                    <div style={{ fontSize: 12, color: "#4ade80" }}>Eingezogen: {fmtDate(m.einzug)}</div>
                  </div>
                </div>
              ) : (
                <div style={{ padding: "10px 12px", background: "#fef2f2", borderRadius: 10, border: "1px solid #fecaca", color: "#ef4444", fontSize: 14, fontWeight: 500 }}>
                  🔑 Keine Belegung
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {showModal && (
        <Modal title="Neue Wohneinheit" onClose={() => setShowModal(false)}>
          <Select label="Gebäude" value={form.gebaeudeId} onChange={e => setForm(f => ({ ...f, gebaeudeId: +e.target.value }))}>
            {data.gebaeude.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
          </Select>
          <Input label="Bezeichnung (z.B. WE 05 - 2.OG)" value={form.bezeichnung} onChange={e => setForm(f => ({ ...f, bezeichnung: e.target.value }))} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Input label="Fläche (m²)" type="number" value={form.flaeche} onChange={e => setForm(f => ({ ...f, flaeche: e.target.value }))} />
            <Input label="Zimmer" type="number" value={form.zimmer} onChange={e => setForm(f => ({ ...f, zimmer: e.target.value }))} />
          </div>
          <Input label="Kaltmiete (€)" type="number" value={form.kaltmiete} onChange={e => setForm(f => ({ ...f, kaltmiete: e.target.value }))} />
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 8 }}>
            <Btn variant="secondary" onClick={() => setShowModal(false)}>Abbrechen</Btn>
            <Btn onClick={save} disabled={!form.bezeichnung || !form.flaeche || !form.kaltmiete}>Speichern</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── Mieter ──────────────────────────────────────────────────────────────────
function Mieter({ data, setData }) {
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({ vorname: "", nachname: "", email: "", telefon: "", wohnungId: "", einzug: "", kaution: "" });

  const filtered = data.mieter.filter(m => [m.vorname, m.nachname, m.email].join(" ").toLowerCase().includes(search.toLowerCase()));

  const save = () => {
    const neu = { ...form, id: Date.now(), wohnungId: +form.wohnungId, kaution: +form.kaution, kautionGezahlt: false };
    setData(d => {
      const ws = d.wohnungen.map(w => w.id === neu.wohnungId ? { ...w, mieter: neu.id, status: "vermietet" } : w);
      return { ...d, mieter: [...d.mieter, neu], wohnungen: ws };
    });
    setShowModal(false);
  };

  const freieWohnungen = data.wohnungen.filter(w => !w.mieter);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 28, fontWeight: 800, fontFamily: "'Playfair Display', serif", color: "#0f172a" }}>Mieterverwaltung</h1>
          <p style={{ margin: "4px 0 0", color: "#64748b" }}>{data.mieter.length} aktive Mieter</p>
        </div>
        <Btn onClick={() => setShowModal(true)}>➕ Neuer Mieter</Btn>
      </div>

      <div style={{ position: "relative", marginBottom: 20 }}>
        <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }}>🔍</span>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Mieter suchen..." style={{ width: "100%", padding: "10px 14px 10px 40px", border: "1.5px solid #e2e8f0", borderRadius: 10, fontSize: 14, boxSizing: "border-box" }} />
      </div>

      <Card style={{ padding: 0, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e8eaf0" }}>
              {["Mieter", "Wohnung", "Gebäude", "Eingezogen", "Kaltmiete", "Kaution", "Status"].map(h => (
                <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: 12, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: 0.5 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((m, i) => {
              const w = data.wohnungen.find(x => x.id === m.wohnungId);
              const g = data.gebaeude.find(x => x.id === w?.gebaeudeId);
              return (
                <tr key={m.id} style={{ borderBottom: "1px solid #f1f5f9", background: i % 2 === 0 ? "#fff" : "#fafbfc" }}>
                  <td style={{ padding: "14px 16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#2563eb22", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, color: "#2563eb", fontSize: 13 }}>{m.vorname[0]}{m.nachname[0]}</div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 14 }}>{m.vorname} {m.nachname}</div>
                        <div style={{ fontSize: 12, color: "#94a3b8" }}>{m.email}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: "14px 16px", fontSize: 14, color: "#374151" }}>{w?.bezeichnung || "–"}</td>
                  <td style={{ padding: "14px 16px", fontSize: 14, color: "#374151" }}>{g?.name || "–"}</td>
                  <td style={{ padding: "14px 16px", fontSize: 14, color: "#374151" }}>{fmtDate(m.einzug)}</td>
                  <td style={{ padding: "14px 16px", fontSize: 14, fontWeight: 600, color: "#1e293b" }}>{fmt(w?.kaltmiete || 0)}</td>
                  <td style={{ padding: "14px 16px" }}>
                    <div style={{ fontSize: 14, color: "#374151" }}>{fmt(m.kaution)}</div>
                    <Badge status={m.kautionGezahlt ? "erhalten" : "ausstehend"} />
                  </td>
                  <td style={{ padding: "14px 16px" }}>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button style={{ background: "none", border: "1px solid #e2e8f0", borderRadius: 7, padding: "4px 10px", cursor: "pointer", fontSize: 13 }} title="E-Mail">📧</button>
                      <button style={{ background: "none", border: "1px solid #e2e8f0", borderRadius: 7, padding: "4px 10px", cursor: "pointer", fontSize: 13 }} title="Anrufen">📞</button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>

      {showModal && (
        <Modal title="Neuen Mieter anlegen" onClose={() => setShowModal(false)}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Input label="Vorname" value={form.vorname} onChange={e => setForm(f => ({ ...f, vorname: e.target.value }))} />
            <Input label="Nachname" value={form.nachname} onChange={e => setForm(f => ({ ...f, nachname: e.target.value }))} />
          </div>
          <Input label="E-Mail" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
          <Input label="Telefon" value={form.telefon} onChange={e => setForm(f => ({ ...f, telefon: e.target.value }))} />
          <Select label="Wohnung zuweisen" value={form.wohnungId} onChange={e => setForm(f => ({ ...f, wohnungId: e.target.value }))}>
            <option value="">– Wohnung wählen –</option>
            {freieWohnungen.map(w => { const g = data.gebaeude.find(b => b.id === w.gebaeudeId); return <option key={w.id} value={w.id}>{g?.name} – {w.bezeichnung}</option>; })}
          </Select>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Input label="Einzugsdatum" type="date" value={form.einzug} onChange={e => setForm(f => ({ ...f, einzug: e.target.value }))} />
            <Input label="Kaution (€)" type="number" value={form.kaution} onChange={e => setForm(f => ({ ...f, kaution: e.target.value }))} />
          </div>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 8 }}>
            <Btn variant="secondary" onClick={() => setShowModal(false)}>Abbrechen</Btn>
            <Btn onClick={save} disabled={!form.vorname || !form.nachname || !form.wohnungId}>Speichern</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── Zahlungen ───────────────────────────────────────────────────────────────
function Zahlungen({ data, setData }) {
  const [filter, setFilter] = useState("alle");
  const total = data.zahlungen.reduce((s, z) => s + z.betrag, 0);
  const erhalten = data.zahlungen.filter(z => z.status === "erhalten").reduce((s, z) => s + z.betrag, 0);
  const ausstehend = data.zahlungen.filter(z => z.status === "ausstehend").reduce((s, z) => s + z.betrag, 0);

  const filtered = filter === "alle" ? data.zahlungen : data.zahlungen.filter(z => z.status === filter);

  const toggleStatus = (id) => {
    setData(d => ({ ...d, zahlungen: d.zahlungen.map(z => z.id === id ? { ...z, status: z.status === "erhalten" ? "ausstehend" : "erhalten" } : z) }));
  };

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontSize: 28, fontWeight: 800, fontFamily: "'Playfair Display', serif", color: "#0f172a" }}>Zahlungsverwaltung</h1>
        <p style={{ margin: "4px 0 0", color: "#64748b" }}>Mieteinnahmen & Zahlungsstatus</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 24 }}>
        <StatCard label="Gesamteinnahmen" value={fmt(total)} icon="💶" color="#2563eb" />
        <StatCard label="Erhalten" value={fmt(erhalten)} icon="✅" color="#22c55e" />
        <StatCard label="Ausstehend" value={fmt(ausstehend)} sub={ausstehend > 0 ? "Mahnung senden?" : ""} icon="⚠️" color="#f59e0b" />
      </div>

      <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
        {["alle", "erhalten", "ausstehend"].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{ padding: "8px 18px", borderRadius: 10, border: "1.5px solid", borderColor: filter === f ? "#2563eb" : "#e2e8f0", background: filter === f ? "#eff6ff" : "#fff", color: filter === f ? "#2563eb" : "#64748b", fontWeight: 600, cursor: "pointer" }}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      <Card style={{ padding: 0, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e8eaf0" }}>
              {["Mieter", "Wohnung", "Monat", "Betrag", "Fälligkeitsdatum", "Status", "Aktion"].map(h => (
                <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: 12, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: 0.5 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((z, i) => {
              const m = data.mieter.find(x => x.id === z.mieter);
              const w = data.wohnungen.find(x => x.id === z.wohnungId);
              return (
                <tr key={z.id} style={{ borderBottom: "1px solid #f1f5f9", background: i % 2 === 0 ? "#fff" : "#fafbfc" }}>
                  <td style={{ padding: "14px 16px", fontWeight: 600, fontSize: 14 }}>{m ? `${m.vorname} ${m.nachname}` : "–"}</td>
                  <td style={{ padding: "14px 16px", fontSize: 14, color: "#64748b" }}>{w?.bezeichnung || "–"}</td>
                  <td style={{ padding: "14px 16px", fontSize: 14 }}>{z.monat}</td>
                  <td style={{ padding: "14px 16px", fontSize: 15, fontWeight: 700, color: "#1e293b" }}>{fmt(z.betrag)}</td>
                  <td style={{ padding: "14px 16px", fontSize: 14, color: "#64748b" }}>{fmtDate(z.datum)}</td>
                  <td style={{ padding: "14px 16px" }}><Badge status={z.status} /></td>
                  <td style={{ padding: "14px 16px" }}>
                    <button onClick={() => toggleStatus(z.id)} style={{ fontSize: 12, padding: "5px 12px", border: "1px solid #e2e8f0", borderRadius: 7, cursor: "pointer", background: "#fff" }}>
                      {z.status === "erhalten" ? "Als ausstehend" : "Als erhalten"}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

// ─── Nebenkostenabrechnung ───────────────────────────────────────────────────
function Nebenkostenabrechnung({ data }) {
  const [jahr, setJahr] = useState(2023);
  const [ausgewaehltesGebaeude, setGebaeude] = useState(1);
  const [showErgebnis, setShowErgebnis] = useState(false);

  const nk = data.nebenkosten[jahr];
  const gebaeude = data.gebaeude.find(g => g.id === ausgewaehltesGebaeude);
  const wohnungen = data.wohnungen.filter(w => w.gebaeudeId === ausgewaehltesGebaeude && w.status === "vermietet");
  const gesamtflaeche = data.wohnungen.filter(w => w.gebaeudeId === ausgewaehltesGebaeude).reduce((s, w) => s + w.flaeche, 0);

  const kostenpositionen = nk ? [
    { name: "Heizkosten", betrag: nk.heizkosten, schluessel: "Verbrauch/Fläche" },
    { name: "Wassergrundkosten", betrag: nk.wasserGrundkosten, schluessel: "Wohnfläche" },
    { name: "Müllabfuhr", betrag: nk.muellabfuhr, schluessel: "Wohneinheiten" },
    { name: "Straßenreinigung", betrag: nk.strassreinigung, schluessel: "Wohnfläche" },
    { name: "Hausmeisterservice", betrag: nk.hausmeister, schluessel: "Wohnfläche" },
    { name: "Versicherungen", betrag: nk.versicherung, schluessel: "Wohnfläche" },
    { name: "Allgemeinstrom", betrag: nk.allgemeinstrom, schluessel: "Wohnfläche" },
    { name: "Verwaltungskosten", betrag: nk.verwaltung, schluessel: "Wohnfläche" },
  ] : [];

  const abrechnungen = wohnungen.map(w => {
    const anteil = w.flaeche / gesamtflaeche;
    const nkAnteil = nk ? nk.gesamt * anteil : 0;
    const gezahlt = w.kaltmiete * 0.2 * 12;
    const differenz = gezahlt - nkAnteil;
    const m = data.mieter.find(x => x.id === w.mieter);
    return { wohnung: w, mieter: m, anteil, nkAnteil, gezahlt, differenz };
  });

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontSize: 28, fontWeight: 800, fontFamily: "'Playfair Display', serif", color: "#0f172a" }}>Nebenkostenabrechnung</h1>
        <p style={{ margin: "4px 0 0", color: "#64748b" }}>Jährliche Betriebskostenabrechnung nach BGB § 556</p>
      </div>

      <Card style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", gap: 20, alignItems: "flex-end", flexWrap: "wrap" }}>
          <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>Abrechnungsjahr</label>
            <select value={jahr} onChange={e => setJahr(+e.target.value)} style={{ padding: "10px 16px", border: "1.5px solid #e2e8f0", borderRadius: 10, fontSize: 14, background: "#fafbfc" }}>
              <option value={2023}>2023</option>
              <option value={2022}>2022</option>
            </select>
          </div>
          <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>Gebäude</label>
            <select value={ausgewaehltesGebaeude} onChange={e => setGebaeude(+e.target.value)} style={{ padding: "10px 16px", border: "1.5px solid #e2e8f0", borderRadius: 10, fontSize: 14, background: "#fafbfc" }}>
              {data.gebaeude.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
            </select>
          </div>
          <Btn onClick={() => setShowErgebnis(true)}>Abrechnung erstellen</Btn>
        </div>
      </Card>

      {nk && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          <Card>
            <h3 style={{ margin: "0 0 16px", fontFamily: "'Playfair Display', serif", fontSize: 18 }}>📊 Kostenpositionen {jahr}</h3>
            <div style={{ marginBottom: 12, padding: "10px 14px", background: "#f8fafc", borderRadius: 10, display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontWeight: 700 }}>Gesamtkosten</span>
              <span style={{ fontWeight: 800, fontSize: 18, color: "#2563eb" }}>{fmt(nk.gesamt)}</span>
            </div>
            {kostenpositionen.map(k => (
              <div key={k.name} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid #f1f5f9" }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 500, color: "#1e293b" }}>{k.name}</div>
                  <div style={{ fontSize: 11, color: "#94a3b8" }}>Verteilung: {k.schluessel}</div>
                </div>
                <div style={{ fontWeight: 700, color: "#374151" }}>{fmt(k.betrag)}</div>
              </div>
            ))}
          </Card>

          <Card>
            <h3 style={{ margin: "0 0 16px", fontFamily: "'Playfair Display', serif", fontSize: 18 }}>📋 Individuelle Abrechnungen</h3>
            <div style={{ display: "flex", gap: 8, marginBottom: 12, fontSize: 12, fontWeight: 600, color: "#64748b", paddingBottom: 8, borderBottom: "1px solid #f1f5f9" }}>
              <div style={{ flex: 1 }}>Mieter / Wohnung</div>
              <div style={{ width: 80, textAlign: "right" }}>NK-Anteil</div>
              <div style={{ width: 80, textAlign: "right" }}>Gezahlt</div>
              <div style={{ width: 90, textAlign: "right" }}>Ergebnis</div>
            </div>
            {abrechnungen.map(a => (
              <div key={a.wohnung.id} style={{ display: "flex", gap: 8, alignItems: "center", padding: "10px 0", borderBottom: "1px solid #f1f5f9" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{a.mieter ? `${a.mieter.vorname} ${a.mieter.nachname}` : "–"}</div>
                  <div style={{ fontSize: 11, color: "#94a3b8" }}>{a.wohnung.bezeichnung} · {a.wohnung.flaeche}m²</div>
                </div>
                <div style={{ width: 80, textAlign: "right", fontSize: 13, fontWeight: 600 }}>{fmt(a.nkAnteil)}</div>
                <div style={{ width: 80, textAlign: "right", fontSize: 13 }}>{fmt(a.gezahlt)}</div>
                <div style={{ width: 90, textAlign: "right" }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: a.differenz >= 0 ? "#22c55e" : "#ef4444" }}>
                    {a.differenz >= 0 ? "+" : ""}{fmt(a.differenz)}
                  </span>
                  <div style={{ fontSize: 10, color: "#94a3b8" }}>{a.differenz >= 0 ? "Guthaben" : "Nachzahlung"}</div>
                </div>
              </div>
            ))}
          </Card>
        </div>
      )}

      {showErgebnis && (
        <Modal title={`📄 Nebenkostenabrechnung ${jahr} – ${gebaeude?.name}`} onClose={() => setShowErgebnis(false)}>
          <div style={{ background: "#f8fafc", borderRadius: 12, padding: 16, marginBottom: 16 }}>
            <div style={{ fontWeight: 700, marginBottom: 8 }}>Abrechnungszeitraum: 01.01.{jahr} – 31.12.{jahr}</div>
            <div style={{ fontSize: 13, color: "#64748b" }}>Gebäude: {gebaeude?.name} · Gesamtfläche: {gesamtflaeche} m²</div>
          </div>
          {abrechnungen.map(a => (
            <div key={a.wohnung.id} style={{ border: "1px solid #e2e8f0", borderRadius: 12, padding: 16, marginBottom: 12 }}>
              <div style={{ fontWeight: 700, marginBottom: 4 }}>{a.mieter?.vorname} {a.mieter?.nachname}</div>
              <div style={{ fontSize: 13, color: "#64748b", marginBottom: 12 }}>{a.wohnung.bezeichnung} · {a.wohnung.flaeche} m² · Flächenanteil: {(a.anteil * 100).toFixed(1)}%</div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, marginBottom: 6 }}>
                <span>Ihr Anteil Betriebskosten:</span><strong>{fmt(a.nkAnteil)}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, marginBottom: 8 }}>
                <span>Bereits geleistet (Vorauszahlungen):</span><strong style={{ color: "#22c55e" }}>- {fmt(a.gezahlt)}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 16, fontWeight: 800, padding: "10px 0", borderTop: "2px solid #e2e8f0", color: a.differenz >= 0 ? "#22c55e" : "#ef4444" }}>
                <span>{a.differenz >= 0 ? "Ihr Guthaben:" : "Ihre Nachzahlung:"}</span>
                <span>{a.differenz >= 0 ? "+" : ""}{fmt(a.differenz)}</span>
              </div>
            </div>
          ))}
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 8 }}>
            <Btn variant="secondary" onClick={() => setShowErgebnis(false)}>Schließen</Btn>
            <Btn onClick={() => { alert("PDF-Export würde hier starten..."); }}>📥 Als PDF exportieren</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── Wartung ─────────────────────────────────────────────────────────────────
function Wartung({ data, setData }) {
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState("alle");
  const [form, setForm] = useState({ gebaeudeId: 1, titel: "", beschreibung: "", datum: "", kosten: "", prioritaet: "mittel", status: "offen" });

  const filtered = filter === "alle" ? data.wartungen : data.wartungen.filter(w => w.status === filter || w.prioritaet === filter);

  const save = () => {
    const neu = { ...form, id: Date.now(), gebaeudeId: +form.gebaeudeId, kosten: +form.kosten };
    setData(d => ({ ...d, wartungen: [...d.wartungen, neu] }));
    setShowModal(false);
  };

  const updateStatus = (id, status) => {
    setData(d => ({ ...d, wartungen: d.wartungen.map(w => w.id === id ? { ...w, status } : w) }));
  };

  const gesamtkosten = data.wartungen.reduce((s, w) => s + w.kosten, 0);
  const offen = data.wartungen.filter(w => w.status === "offen").length;
  const hoch = data.wartungen.filter(w => w.prioritaet === "hoch" && w.status !== "abgeschlossen").length;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 28, fontWeight: 800, fontFamily: "'Playfair Display', serif", color: "#0f172a" }}>Wartung & Instandhaltung</h1>
          <p style={{ margin: "4px 0 0", color: "#64748b" }}>Reparaturen, Wartungen & Handwerkeraufträge</p>
        </div>
        <Btn onClick={() => setShowModal(true)}>➕ Neuer Auftrag</Btn>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 24 }}>
        <StatCard label="Offene Aufgaben" value={offen} icon="🔧" color="#f59e0b" />
        <StatCard label="Hohe Priorität" value={hoch} sub={hoch > 0 ? "Sofortiger Handlungsbedarf" : ""} icon="🚨" color="#ef4444" />
        <StatCard label="Kosten gesamt" value={fmt(gesamtkosten)} icon="💶" color="#2563eb" />
      </div>

      <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
        {["alle", "offen", "in_bearbeitung", "abgeschlossen", "hoch", "mittel", "niedrig"].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{ padding: "7px 14px", borderRadius: 10, border: "1.5px solid", borderColor: filter === f ? "#2563eb" : "#e2e8f0", background: filter === f ? "#eff6ff" : "#fff", color: filter === f ? "#2563eb" : "#64748b", fontWeight: 600, cursor: "pointer", fontSize: 13 }}>
            {statusLabel[f] || f}
          </button>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 16 }}>
        {filtered.map(w => {
          const g = data.gebaeude.find(b => b.id === w.gebaeudeId);
          return (
            <Card key={w.id}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 16, color: "#0f172a", marginBottom: 2 }}>{w.titel}</div>
                  <div style={{ fontSize: 13, color: "#64748b" }}>{g?.name} · {fmtDate(w.datum)}</div>
                </div>
                <div style={{ display: "flex", gap: 6, marginLeft: 12 }}>
                  <Badge status={w.prioritaet} />
                </div>
              </div>
              <p style={{ fontSize: 14, color: "#475569", margin: "0 0 14px", lineHeight: 1.5 }}>{w.beschreibung}</p>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <Badge status={w.status} />
                  <span style={{ marginLeft: 10, fontWeight: 700, color: "#1e293b" }}>{fmt(w.kosten)}</span>
                </div>
                <select value={w.status} onChange={e => updateStatus(w.id, e.target.value)} style={{ padding: "6px 12px", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 13, cursor: "pointer" }}>
                  <option value="offen">Offen</option>
                  <option value="in_bearbeitung">In Bearbeitung</option>
                  <option value="abgeschlossen">Abgeschlossen</option>
                </select>
              </div>
            </Card>
          );
        })}
      </div>

      {showModal && (
        <Modal title="Neuer Wartungsauftrag" onClose={() => setShowModal(false)}>
          <Select label="Gebäude" value={form.gebaeudeId} onChange={e => setForm(f => ({ ...f, gebaeudeId: e.target.value }))}>
            {data.gebaeude.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
          </Select>
          <Input label="Titel" value={form.titel} onChange={e => setForm(f => ({ ...f, titel: e.target.value }))} placeholder="z.B. Heizung defekt" />
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>Beschreibung</label>
            <textarea value={form.beschreibung} onChange={e => setForm(f => ({ ...f, beschreibung: e.target.value }))} rows={3} style={{ width: "100%", padding: "10px 14px", border: "1.5px solid #e2e8f0", borderRadius: 10, fontSize: 14, boxSizing: "border-box", resize: "vertical" }} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Input label="Datum" type="date" value={form.datum} onChange={e => setForm(f => ({ ...f, datum: e.target.value }))} />
            <Input label="Geschätzte Kosten (€)" type="number" value={form.kosten} onChange={e => setForm(f => ({ ...f, kosten: e.target.value }))} />
          </div>
          <Select label="Priorität" value={form.prioritaet} onChange={e => setForm(f => ({ ...f, prioritaet: e.target.value }))}>
            <option value="niedrig">Niedrig</option>
            <option value="mittel">Mittel</option>
            <option value="hoch">Hoch</option>
          </Select>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 8 }}>
            <Btn variant="secondary" onClick={() => setShowModal(false)}>Abbrechen</Btn>
            <Btn onClick={save} disabled={!form.titel || !form.datum}>Speichern</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── Dokumente ───────────────────────────────────────────────────────────────
function Dokumente() {
  const docs = [
    { name: "Mietvertrag_Müller_2020.pdf", typ: "Mietvertrag", datum: "2020-03-01", mieter: "Maria Müller", groesse: "245 KB" },
    { name: "Mietvertrag_Schmidt_2021.pdf", typ: "Mietvertrag", datum: "2021-06-15", mieter: "Thomas Schmidt", groesse: "238 KB" },
    { name: "NK-Abrechnung_2023_MST12.pdf", typ: "Nebenkostenabrechnung", datum: "2024-02-20", mieter: "Alle Mieter", groesse: "312 KB" },
    { name: "Übergabeprotokoll_WE03.pdf", typ: "Übergabeprotokoll", datum: "2023-11-30", mieter: "Leer", groesse: "180 KB" },
    { name: "Hausordnung_2024.pdf", typ: "Hausordnung", datum: "2024-01-01", mieter: "Allgemein", groesse: "95 KB" },
    { name: "Versicherungspolice_2024.pdf", typ: "Versicherung", datum: "2024-01-01", mieter: "Gebäude", groesse: "520 KB" },
  ];

  const typIcon = { "Mietvertrag": "📝", "Nebenkostenabrechnung": "📊", "Übergabeprotokoll": "🔑", "Hausordnung": "📋", "Versicherung": "🛡️" };
  const typColor = { "Mietvertrag": "#2563eb", "Nebenkostenabrechnung": "#8b5cf6", "Übergabeprotokoll": "#f59e0b", "Hausordnung": "#22c55e", "Versicherung": "#ef4444" };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 28, fontWeight: 800, fontFamily: "'Playfair Display', serif", color: "#0f172a" }}>Dokumentenarchiv</h1>
          <p style={{ margin: "4px 0 0", color: "#64748b" }}>Verträge, Abrechnungen & wichtige Unterlagen</p>
        </div>
        <Btn>📤 Dokument hochladen</Btn>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
        {docs.map((d, i) => (
          <Card key={i} style={{ cursor: "pointer", transition: "box-shadow 0.2s" }}>
            <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
              <div style={{ width: 48, height: 56, borderRadius: 10, background: (typColor[d.typ] || "#2563eb") + "15", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>{typIcon[d.typ] || "📄"}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: 14, color: "#0f172a", marginBottom: 4, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{d.name}</div>
                <div style={{ display: "inline-block", background: (typColor[d.typ] || "#2563eb") + "15", color: typColor[d.typ] || "#2563eb", padding: "2px 8px", borderRadius: 6, fontSize: 11, fontWeight: 700, marginBottom: 6 }}>{d.typ}</div>
                <div style={{ fontSize: 12, color: "#94a3b8" }}>{d.mieter} · {fmtDate(d.datum)} · {d.groesse}</div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
              <button style={{ flex: 1, padding: "7px", border: "1px solid #e2e8f0", borderRadius: 8, cursor: "pointer", fontSize: 13, background: "#fff" }}>👁 Ansehen</button>
              <button style={{ flex: 1, padding: "7px", border: "1px solid #e2e8f0", borderRadius: 8, cursor: "pointer", fontSize: 13, background: "#fff" }}>📥 Download</button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ─── Navigation ──────────────────────────────────────────────────────────────
const navItems = [
  { id: "dashboard", label: "Dashboard", icon: "📊" },
  { id: "wohnungen", label: "Wohneinheiten", icon: "🏢" },
  { id: "mieter", label: "Mieter", icon: "👥" },
  { id: "zahlungen", label: "Zahlungen", icon: "💶" },
  { id: "nebenkosten", label: "Nebenkostenabr.", icon: "🧾" },
  { id: "wartung", label: "Wartung", icon: "🔧" },
  { id: "dokumente", label: "Dokumente", icon: "📁" },
];

// ─── App ─────────────────────────────────────────────────────────────────────
export default function HausverwaltungApp() {
  const [data, setData] = useState(initialData);
  const [page, setPage] = useState("dashboard");

  const renderPage = () => {
    switch (page) {
      case "dashboard": return <Dashboard data={data} />;
      case "wohnungen": return <Wohnungen data={data} setData={setData} />;
      case "mieter": return <Mieter data={data} setData={setData} />;
      case "zahlungen": return <Zahlungen data={data} setData={setData} />;
      case "nebenkosten": return <Nebenkostenabrechnung data={data} />;
      case "wartung": return <Wartung data={data} setData={setData} />;
      case "dokumente": return <Dokumente />;
      default: return <Dashboard data={data} />;
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700;800&family=DM+Sans:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        body { margin: 0; font-family: 'DM Sans', sans-serif; background: #f0f2f7; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #f1f5f9; }
        ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 3px; }
      `}</style>
      <div style={{ display: "flex", minHeight: "100vh" }}>
        {/* Sidebar */}
        <aside style={{ width: 240, background: "#0f172a", display: "flex", flexDirection: "column", flexShrink: 0, position: "sticky", top: 0, height: "100vh" }}>
          <div style={{ padding: "28px 20px 20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg, #2563eb, #7c3aed)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🏠</div>
              <div>
                <div style={{ color: "#fff", fontWeight: 800, fontSize: 15, fontFamily: "'Playfair Display', serif", lineHeight: 1.1 }}>ImmoAdmin</div>
                <div style={{ color: "#475569", fontSize: 11 }}>Hausverwaltung Pro</div>
              </div>
            </div>
          </div>

          <nav style={{ flex: 1, padding: "0 10px" }}>
            {navItems.map(item => (
              <button key={item.id} onClick={() => setPage(item.id)} style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", border: "none", borderRadius: 10, cursor: "pointer", background: page === item.id ? "#1e3a5f" : "transparent", color: page === item.id ? "#60a5fa" : "#94a3b8", fontWeight: page === item.id ? 700 : 500, fontSize: 14, fontFamily: "'DM Sans', sans-serif", marginBottom: 2, transition: "all 0.15s", textAlign: "left" }}>
                <span style={{ fontSize: 16 }}>{item.icon}</span>
                {item.label}
                {page === item.id && <div style={{ marginLeft: "auto", width: 5, height: 5, borderRadius: "50%", background: "#60a5fa" }} />}
              </button>
            ))}
          </nav>

          <div style={{ padding: "16px 20px", borderTop: "1px solid #1e293b" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 34, height: 34, borderRadius: "50%", background: "linear-gradient(135deg, #2563eb, #7c3aed)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, color: "#fff", fontSize: 13 }}>VW</div>
              <div>
                <div style={{ color: "#e2e8f0", fontWeight: 600, fontSize: 13 }}>Verwaltung GmbH</div>
                <div style={{ color: "#475569", fontSize: 11 }}>Admin</div>
              </div>
            </div>
          </div>
        </aside>

        {/* Main */}
        <main style={{ flex: 1, padding: "32px", overflow: "auto" }}>
          {renderPage()}
        </main>
      </div>
    </>
  );
}
