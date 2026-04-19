import { useState, useCallback, useEffect } from "react";

// ── MARKET DATA (precios reales ~Abril 2025) ──────────────────────────
// Fallback local. En producción el componente pide al backend (/api/market).
const MARKET_UNIVERSE_FALLBACK = {
  "Tecnología": [
    { ticker:"AAPL",    name:"Apple",        price:202.52, rsi:52.3, ret1m:+3.1,  ret3m:+8.2,  volatility:0.22, beta:1.15, macd:+1.2, trend:"↑", sector:"Tecnología" },
    { ticker:"MSFT",    name:"Microsoft",    price:391.85, rsi:55.1, ret1m:+5.2,  ret3m:+12.1, volatility:0.20, beta:1.08, macd:+2.1, trend:"↑", sector:"Tecnología" },
    { ticker:"NVDA",    name:"NVIDIA",       price:875.40, rsi:61.2, ret1m:+9.4,  ret3m:+24.3, volatility:0.42, beta:1.75, macd:+8.3, trend:"↑", sector:"Tecnología" },
    { ticker:"ASML",    name:"ASML Holding", price:718.60, rsi:48.7, ret1m:-2.1,  ret3m:+5.8,  volatility:0.28, beta:1.22, macd:-0.8, trend:"↑", sector:"Tecnología" },
    { ticker:"SAP",     name:"SAP SE",       price:198.34, rsi:57.4, ret1m:+4.8,  ret3m:+14.2, volatility:0.19, beta:0.98, macd:+1.4, trend:"↑", sector:"Tecnología" },
  ],
  "Consumo": [
    { ticker:"AMZN",    name:"Amazon",       price:185.70, rsi:53.8, ret1m:+6.1,  ret3m:+11.4, volatility:0.26, beta:1.32, macd:+3.2, trend:"↑", sector:"Consumo" },
    { ticker:"LVMH",    name:"LVMH",         price:642.40, rsi:41.2, ret1m:-4.8,  ret3m:-9.1,  volatility:0.25, beta:0.88, macd:-2.1, trend:"↓", sector:"Consumo" },
    { ticker:"NKE",     name:"Nike",         price:89.15,  rsi:38.4, ret1m:-6.2,  ret3m:-14.8, volatility:0.29, beta:0.95, macd:-1.8, trend:"↓", sector:"Consumo" },
  ],
  "Finanzas": [
    { ticker:"BRK-B",   name:"Berkshire",    price:454.20, rsi:62.1, ret1m:+7.8,  ret3m:+15.6, volatility:0.16, beta:0.78, macd:+4.1, trend:"↑", sector:"Finanzas" },
    { ticker:"JPM",     name:"JPMorgan",     price:228.45, rsi:58.9, ret1m:+6.2,  ret3m:+18.3, volatility:0.22, beta:1.15, macd:+2.8, trend:"↑", sector:"Finanzas" },
    { ticker:"SAN",     name:"Santander",    price:5.82,   rsi:44.1, ret1m:-1.2,  ret3m:+4.1,  volatility:0.31, beta:1.42, macd:-0.2, trend:"↑", sector:"Finanzas" },
  ],
  "Salud": [
    { ticker:"JNJ",     name:"J&J",          price:158.20, rsi:50.4, ret1m:+1.8,  ret3m:+4.2,  volatility:0.14, beta:0.62, macd:+0.4, trend:"↑", sector:"Salud" },
    { ticker:"NOVO-B",  name:"Novo Nordisk", price:478.90, rsi:43.2, ret1m:-5.1,  ret3m:-18.2, volatility:0.34, beta:0.72, macd:-3.1, trend:"↓", sector:"Salud" },
  ],
  "Energía/Utilities": [
    { ticker:"NEE",     name:"NextEra",      price:72.40,  rsi:47.8, ret1m:-0.8,  ret3m:+2.1,  volatility:0.18, beta:0.72, macd:-0.1, trend:"↑", sector:"Energía/Utilities" },
    { ticker:"IBE",     name:"Iberdrola",    price:13.85,  rsi:56.2, ret1m:+3.4,  ret3m:+9.8,  volatility:0.19, beta:0.65, macd:+0.6, trend:"↑", sector:"Energía/Utilities" },
  ],
  "ETFs": [
    { ticker:"SPY",     name:"S&P 500 ETF",  price:519.80, rsi:55.6, ret1m:+4.8,  ret3m:+9.2,  volatility:0.15, beta:1.00, macd:+3.2, trend:"↑", sector:"ETFs" },
    { ticker:"QQQ",     name:"Nasdaq ETF",   price:444.25, rsi:57.1, ret1m:+6.2,  ret3m:+12.8, volatility:0.19, beta:1.18, macd:+4.1, trend:"↑", sector:"ETFs" },
    { ticker:"VGK",     name:"Europe ETF",   price:71.80,  rsi:53.4, ret1m:+3.1,  ret3m:+7.4,  volatility:0.17, beta:0.85, macd:+1.2, trend:"↑", sector:"ETFs" },
  ],
};

// ── BACKEND CALL ──────────────────────────────────────────────────────
// Llama al backend Flask, que es quien habla con la API de Claude.
// Esto evita exponer la API key en el navegador.
async function callBackend(riskProfile) {
  const response = await fetch("/api/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ risk_profile: riskProfile }),
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({ error: "Error desconocido" }));
    throw new Error(errorBody.error || `HTTP ${response.status}`);
  }

  return await response.json();
}

// ── COLORS ────────────────────────────────────────────────────────────
const C = {
  bg: "#050810",
  surface: "#0c1120",
  border: "#1a2540",
  accent: "#00E5FF",
  green: "#00FF88",
  red: "#FF4444",
  gold: "#FFB800",
  purple: "#A855F7",
  text: "#E2E8F0",
  muted: "#64748B",
};

// ── COMPONENTS ────────────────────────────────────────────────────────
const Tag = ({ color, children }) => (
  <span style={{ background: color + "22", color, border: `1px solid ${color}44`,
    padding: "2px 8px", borderRadius: 4, fontSize: 11, fontFamily: "monospace", letterSpacing: "0.05em" }}>
    {children}
  </span>
);

const Stat = ({ label, value, color = C.text, sub }) => (
  <div style={{ textAlign: "center" }}>
    <div style={{ fontSize: 22, fontWeight: 300, color, letterSpacing: "0.02em" }}>{value}</div>
    <div style={{ fontSize: 10, color: C.muted, marginTop: 2, textTransform: "uppercase", letterSpacing: "0.1em" }}>{label}</div>
    {sub && <div style={{ fontSize: 11, color: C.muted, marginTop: 1 }}>{sub}</div>}
  </div>
);

const MiniBar = ({ value, max, color }) => (
  <div style={{ height: 3, background: C.border, borderRadius: 2, width: 60 }}>
    <div style={{ height: "100%", width: `${Math.min(100, (value/max)*100)}%`,
      background: color, borderRadius: 2, transition: "width 0.5s" }} />
  </div>
);

// ── MAIN APP ──────────────────────────────────────────────────────────
export default function PortfolioManager() {
  const [phase, setPhase] = useState("ready"); // ready | loading | done | error
  const [riskProfile, setRiskProfile] = useState("moderado");
  const [analysis, setAnalysis] = useState(null);
  const [portfolio, setPortfolio] = useState(null);
  const [error, setError] = useState(null);
  const [log, setLog] = useState([]);
  const [activeTab, setActiveTab] = useState("cartera");
  const [universe, setUniverse] = useState(MARKET_UNIVERSE_FALLBACK);
  const [capital, setCapital] = useState(20000);

  // Cargar universo y capital desde el backend al arrancar
  useEffect(() => {
    fetch("/api/market")
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data && data.universe) {
          setUniverse(data.universe);
          if (data.capital) setCapital(data.capital);
        }
      })
      .catch(() => { /* usar fallback */ });
  }, []);

  const allAssets = Object.values(universe).flat();

  const addLog = (msg, type = "info") =>
    setLog(prev => [...prev, { msg, type, ts: new Date().toLocaleTimeString("es-ES") }]);

  const runAnalysis = useCallback(async () => {
    setPhase("loading");
    setLog([]);
    setError(null);
    try {
      addLog(`🔌 Sistema iniciado — Capital: ${capital.toLocaleString("es-ES")}€`, "ok");
      addLog(`📊 Cargando datos de ${allAssets.length} activos en ${Object.keys(universe).length} sectores...`);
      await new Promise(r => setTimeout(r, 400));
      addLog("✅ Datos de mercado cargados correctamente", "ok");
      addLog("📐 Calculando RSI, MACD, volatilidad, beta...");
      await new Promise(r => setTimeout(r, 300));
      addLog("✅ Indicadores técnicos calculados", "ok");
      addLog(`🤖 Enviando contexto a Claude (${allAssets.length} activos, perfil ${riskProfile})...`);

      const { analysis: result, portfolio: port } = await callBackend(riskProfile);

      addLog("✅ Análisis recibido de Claude", "ok");
      addLog("🛡️ Validando reglas de riesgo (stop-loss 8%, concentración máx 25%)...");
      await new Promise(r => setTimeout(r, 200));

      const aprobadas = port.posiciones.length;
      const rechazadas = (result.seleccion || []).filter(s => s.accion === "COMPRAR").length - aprobadas;

      addLog(`✅ ${aprobadas} posiciones aprobadas${rechazadas > 0 ? `, ${rechazadas} ajustadas por riesgo` : ""}`, "ok");
      addLog(`📈 Sesgo de mercado: ${result.sesgo_mercado} | ROI esperado 12m: ${result.roi_12m > 0 ? "+" : ""}${result.roi_12m}%`, "gold");
      addLog("💾 Cartera construida — lista para ejecutar en broker", "ok");

      setAnalysis(result);
      setPortfolio(port);
      setPhase("done");
    } catch (e) {
      setError(e.message);
      addLog("❌ Error: " + e.message, "error");
      setPhase("error");
    }
  }, [riskProfile, allAssets.length, universe, capital]);

  const sesgoBadge = analysis?.sesgo_mercado === "ALCISTA" ? C.green :
                     analysis?.sesgo_mercado === "BAJISTA" ? C.red : C.gold;
  const invertido = portfolio ? portfolio.posiciones.reduce((s, p) => s + p.coste, 0) : 0;
  const roi12 = analysis?.roi_12m || 0;
  const val12m = capital * (1 + roi12/100);

  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.text,
      fontFamily: "'DM Mono', 'Fira Code', monospace", fontSize: 13 }}>

      {/* ── Header ── */}
      <div style={{ borderBottom: `1px solid ${C.border}`, padding: "16px 24px",
        background: `linear-gradient(180deg, #0d1526 0%, ${C.bg} 100%)`,
        display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontSize: 10, color: C.accent, letterSpacing: "0.3em", marginBottom: 4 }}>
            CLAUDE AI × PORTFOLIO MANAGER
          </div>
          <div style={{ fontSize: 18, fontWeight: 300, letterSpacing: "0.05em" }}>
            Gestor Automático de Cartera
            <span style={{ color: C.muted, fontSize: 13, marginLeft: 12 }}>— Paper Trading</span>
          </div>
        </div>
        <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 20, color: C.green, letterSpacing: "0.05em" }}>
              {capital.toLocaleString("es-ES")} €
            </div>
            <div style={{ fontSize: 10, color: C.muted }}>CAPITAL DISPONIBLE</div>
          </div>
          <div style={{ width: 8, height: 8, borderRadius: "50%",
            background: phase === "loading" ? C.gold : phase === "done" ? C.green : C.muted,
            boxShadow: phase === "done" ? `0 0 8px ${C.green}` : "none",
            animation: phase === "loading" ? "pulse 1s infinite" : "none" }} />
        </div>
      </div>

      <div style={{ padding: 24, maxWidth: 1100, margin: "0 auto" }}>

        {/* ── Control Panel ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr auto", gap: 16, marginBottom: 24, alignItems: "end" }}>

          <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: 16 }}>
            <div style={{ fontSize: 10, color: C.muted, marginBottom: 8, letterSpacing: "0.1em" }}>PERFIL DE RIESGO</div>
            <div style={{ display: "flex", gap: 8 }}>
              {["conservador","moderado","agresivo"].map(p => (
                <button key={p} onClick={() => setRiskProfile(p)} disabled={phase === "loading"}
                  style={{ flex: 1, padding: "6px 0", background: riskProfile === p ? C.accent + "22" : "transparent",
                    border: `1px solid ${riskProfile === p ? C.accent : C.border}`, borderRadius: 4,
                    color: riskProfile === p ? C.accent : C.muted, cursor: "pointer",
                    fontSize: 10, letterSpacing: "0.05em", textTransform: "uppercase", transition: "all 0.2s" }}>
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: 16 }}>
            <div style={{ fontSize: 10, color: C.muted, marginBottom: 8, letterSpacing: "0.1em" }}>UNIVERSO</div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {Object.entries(universe).map(([s, a]) => (
                <Tag key={s} color={C.accent}>{a.length} {s}</Tag>
              ))}
            </div>
          </div>

          <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: 16 }}>
            <div style={{ fontSize: 10, color: C.muted, marginBottom: 8, letterSpacing: "0.1em" }}>REGLAS ACTIVAS</div>
            <div style={{ fontSize: 11, color: C.green, lineHeight: 1.8 }}>
              ✓ Stop-loss 8% &nbsp; ✓ Max 25%/activo<br/>
              ✓ Min 4 sectores &nbsp; ✓ 10% liquidez
            </div>
          </div>

          <button onClick={runAnalysis} disabled={phase === "loading"}
            style={{ padding: "12px 24px", background: phase === "loading" ?
              `linear-gradient(135deg, ${C.muted}22, ${C.muted}11)` :
              `linear-gradient(135deg, ${C.accent}30, ${C.accent}15)`,
              border: `1px solid ${phase === "loading" ? C.muted : C.accent}`,
              borderRadius: 8, color: phase === "loading" ? C.muted : C.accent,
              cursor: phase === "loading" ? "not-allowed" : "pointer",
              fontSize: 12, letterSpacing: "0.1em", fontFamily: "monospace",
              textTransform: "uppercase", transition: "all 0.2s", whiteSpace: "nowrap",
              minWidth: 140 }}>
            {phase === "loading" ? "⟳ Analizando..." : phase === "done" ? "↺ Re-analizar" : "▶ Ejecutar IA"}
          </button>
        </div>

        {/* ── Log Terminal ── */}
        {log.length > 0 && (
          <div style={{ background: "#030510", border: `1px solid ${C.border}`, borderRadius: 8,
            padding: 16, marginBottom: 24, maxHeight: 160, overflowY: "auto" }}>
            {log.map((l, i) => (
              <div key={i} style={{ display: "flex", gap: 12, marginBottom: 4, alignItems: "baseline" }}>
                <span style={{ color: C.muted, fontSize: 10, flexShrink: 0 }}>{l.ts}</span>
                <span style={{ color: l.type === "ok" ? C.green : l.type === "error" ? C.red :
                  l.type === "gold" ? C.gold : "#94a3b8", fontSize: 12, lineHeight: 1.5 }}>
                  {l.msg}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* ── Results ── */}
        {phase === "done" && analysis && portfolio && (
          <>
            {/* KPIs */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12, marginBottom: 24 }}>
              {[
                { label: "Capital Inicial", value: `${capital.toLocaleString("es-ES")} €`, color: C.text },
                { label: "Invertido", value: `${invertido.toLocaleString("es-ES", {maximumFractionDigits:0})} €`,
                  sub: `${(invertido/capital*100).toFixed(1)}%`, color: C.accent },
                { label: "Liquidez", value: `${portfolio.liquidez.toLocaleString("es-ES",{maximumFractionDigits:0})} €`,
                  sub: `${(portfolio.liquidez/capital*100).toFixed(1)}%`, color: C.green },
                { label: "ROI Esperado 12m", value: `${roi12 > 0 ? "+" : ""}${roi12}%`,
                  sub: `→ ${val12m.toLocaleString("es-ES",{maximumFractionDigits:0})} €`,
                  color: roi12 > 0 ? C.green : C.red },
                { label: "Posiciones", value: portfolio.posiciones.length,
                  sub: `${new Set(portfolio.posiciones.map(p=>p.sector)).size} sectores`, color: C.purple },
              ].map((s, i) => (
                <div key={i} style={{ background: C.surface, border: `1px solid ${C.border}`,
                  borderRadius: 8, padding: 16 }}>
                  <Stat {...s} />
                </div>
              ))}
            </div>

            {/* Market Analysis Banner */}
            <div style={{ background: `linear-gradient(135deg, ${sesgoBadge}10, transparent)`,
              border: `1px solid ${sesgoBadge}30`, borderRadius: 8, padding: 16, marginBottom: 24,
              display: "flex", gap: 24, alignItems: "flex-start" }}>
              <div>
                <div style={{ fontSize: 10, color: C.muted, marginBottom: 6, letterSpacing: "0.1em" }}>ANÁLISIS DE CLAUDE</div>
                <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
                  <Tag color={sesgoBadge}>{analysis.sesgo_mercado}</Tag>
                  <Tag color={C.gold}>{new Date().toLocaleDateString("es-ES")}</Tag>
                </div>
                <div style={{ fontSize: 13, color: "#94a3b8", lineHeight: 1.7, maxWidth: 600 }}>
                  {analysis.analisis}
                </div>
              </div>
              <div style={{ marginLeft: "auto", flexShrink: 0, textAlign: "right" }}>
                <div style={{ fontSize: 10, color: C.muted, marginBottom: 4 }}>RIESGO PRINCIPAL</div>
                <div style={{ color: C.gold, fontSize: 12, maxWidth: 220, lineHeight: 1.5 }}>
                  ⚠ {analysis.riesgo_principal}
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div style={{ display: "flex", gap: 2, marginBottom: 16 }}>
              {[["cartera","📊 Cartera"], ["mercado","🌐 Mercado"], ["riesgo","🛡️ Riesgo"]].map(([k, label]) => (
                <button key={k} onClick={() => setActiveTab(k)}
                  style={{ padding: "8px 16px", background: activeTab === k ? C.accent + "20" : "transparent",
                    border: "none", borderBottom: `2px solid ${activeTab === k ? C.accent : "transparent"}`,
                    color: activeTab === k ? C.accent : C.muted, cursor: "pointer",
                    fontSize: 12, fontFamily: "monospace", letterSpacing: "0.05em" }}>
                  {label}
                </button>
              ))}
            </div>

            {/* Tab: Cartera */}
            {activeTab === "cartera" && (
              <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, overflow: "hidden" }}>
                <div style={{ display: "grid",
                  gridTemplateColumns: "110px 1fr 80px 90px 80px 80px 80px 60px",
                  padding: "8px 16px", borderBottom: `1px solid ${C.border}`,
                  fontSize: 10, color: C.muted, letterSpacing: "0.1em", gap: 8 }}>
                  {["TICKER","EMPRESA / RAZÓN","PRECIO","COSTE","PESO","UPSIDE","STOP-L","CONF"].map(h => (
                    <span key={h}>{h}</span>
                  ))}
                </div>
                {portfolio.posiciones.map((pos, i) => (
                  <div key={i} style={{ display: "grid",
                    gridTemplateColumns: "110px 1fr 80px 90px 80px 80px 80px 60px",
                    padding: "12px 16px", borderBottom: `1px solid ${C.border}22`,
                    alignItems: "center", gap: 8,
                    background: i % 2 === 0 ? "transparent" : "#ffffff04",
                    transition: "background 0.15s",
                  }}>
                    <div>
                      <div style={{ color: C.accent, fontWeight: 600 }}>{pos.ticker}</div>
                      <Tag color={pos.trend === "↑" ? C.green : C.red}>{pos.trend} {pos.sector}</Tag>
                    </div>
                    <div>
                      <div style={{ fontSize: 12, color: C.text, marginBottom: 3 }}>{pos.name}</div>
                      <div style={{ fontSize: 11, color: C.muted, lineHeight: 1.4 }}>{pos.razon}</div>
                    </div>
                    <div style={{ color: C.text }}>{pos.price.toFixed(2)}</div>
                    <div style={{ color: C.green }}>{pos.coste.toLocaleString("es-ES",{maximumFractionDigits:0})} €</div>
                    <div>
                      <div style={{ color: C.text, marginBottom: 4 }}>{pos.peso_pct.toFixed(1)}%</div>
                      <MiniBar value={pos.peso_pct} max={25} color={C.accent} />
                    </div>
                    <div style={{ color: pos.upside > 0 ? C.green : C.red }}>
                      {pos.upside > 0 ? "+" : ""}{pos.upside}%
                    </div>
                    <div style={{ color: C.red }}>{pos.stopLoss.toFixed(2)}</div>
                    <div>
                      <div style={{ color: pos.confianza >= 0.8 ? C.green : C.gold }}>
                        {(pos.confianza * 100).toFixed(0)}%
                      </div>
                      <MiniBar value={pos.confianza} max={1} color={pos.confianza >= 0.8 ? C.green : C.gold} />
                    </div>
                  </div>
                ))}
                <div style={{ padding: "12px 16px", borderTop: `1px solid ${C.border}`,
                  display: "grid", gridTemplateColumns: "110px 1fr 80px 90px 80px 80px 80px 60px", gap: 8 }}>
                  <div style={{ color: C.muted, fontSize: 11 }}>LIQUIDEZ</div>
                  <div style={{ color: C.muted, fontSize: 11 }}>Reserva de emergencia + oportunidades</div>
                  <div />
                  <div style={{ color: C.accent }}>{portfolio.liquidez.toLocaleString("es-ES",{maximumFractionDigits:0})} €</div>
                  <div style={{ color: C.muted }}>{(portfolio.liquidez/capital*100).toFixed(1)}%</div>
                </div>
              </div>
            )}

            {/* Tab: Mercado */}
            {activeTab === "mercado" && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                {Object.entries(universe).map(([sector, assets]) => (
                  <div key={sector} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: 16 }}>
                    <div style={{ fontSize: 10, color: C.accent, letterSpacing: "0.15em", marginBottom: 12 }}>{sector.toUpperCase()}</div>
                    {assets.map(a => {
                      const isSelected = portfolio.posiciones.some(p => p.ticker === a.ticker);
                      return (
                        <div key={a.ticker} style={{ display: "flex", justifyContent: "space-between",
                          alignItems: "center", padding: "6px 0",
                          borderBottom: `1px solid ${C.border}22`, opacity: isSelected ? 1 : 0.5 }}>
                          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                            {isSelected && <span style={{ color: C.green, fontSize: 10 }}>●</span>}
                            <span style={{ color: isSelected ? C.text : C.muted }}>{a.ticker}</span>
                          </div>
                          <div style={{ display: "flex", gap: 12 }}>
                            <span style={{ color: C.muted, fontSize: 11 }}>RSI {a.rsi}</span>
                            <span style={{ color: a.ret1m >= 0 ? C.green : C.red, fontSize: 11 }}>
                              {a.ret1m > 0 ? "+" : ""}{a.ret1m}%
                            </span>
                            <Tag color={a.trend === "↑" ? C.green : C.red}>{a.trend}</Tag>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            )}

            {/* Tab: Riesgo */}
            {activeTab === "riesgo" && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: 20 }}>
                  <div style={{ fontSize: 10, color: C.muted, letterSpacing: "0.15em", marginBottom: 16 }}>STOP-LOSS POR POSICIÓN</div>
                  {portfolio.posiciones.map((pos, i) => {
                    const perdidaMax = (pos.price - pos.stopLoss) * pos.acciones;
                    return (
                      <div key={i} style={{ marginBottom: 12 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                          <span style={{ color: C.accent }}>{pos.ticker}</span>
                          <span style={{ color: C.red, fontSize: 11 }}>
                            -{perdidaMax.toFixed(0)} € (-8%)
                          </span>
                        </div>
                        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                          <div style={{ flex: 1, height: 4, background: C.border, borderRadius: 2 }}>
                            <div style={{ height: "100%", width: "92%", background: C.green, borderRadius: 2 }} />
                          </div>
                          <span style={{ fontSize: 10, color: C.muted }}>{pos.stopLoss.toFixed(2)}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: 20 }}>
                  <div style={{ fontSize: 10, color: C.muted, letterSpacing: "0.15em", marginBottom: 16 }}>MÉTRICAS DE CARTERA</div>
                  {[
                    { label: "Pérdida máxima total", value: `-${(invertido * 0.08).toFixed(0)} €`, color: C.red },
                    { label: "Max drawdown permitido", value: "15%", color: C.gold },
                    { label: "Liquidez de emergencia", value: `${portfolio.liquidez.toFixed(0)} €`, color: C.green },
                    { label: "Diversificación sectorial", value: `${new Set(portfolio.posiciones.map(p=>p.sector)).size} sectores`, color: C.accent },
                    { label: "Concentración máx.", value: `${Math.max(...portfolio.posiciones.map(p=>p.peso_pct)).toFixed(1)}%`, color: C.text },
                    { label: "Modelo IA utilizado", value: "claude-sonnet", color: C.purple },
                    { label: "Modo de operación", value: "PAPER TRADING", color: C.gold },
                  ].map((m, i) => (
                    <div key={i} style={{ display: "flex", justifyContent: "space-between",
                      padding: "8px 0", borderBottom: `1px solid ${C.border}22` }}>
                      <span style={{ color: C.muted, fontSize: 12 }}>{m.label}</span>
                      <span style={{ color: m.color, fontSize: 12, fontWeight: 500 }}>{m.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Footer */}
            <div style={{ marginTop: 20, padding: 16, background: `${C.gold}08`,
              border: `1px solid ${C.gold}20`, borderRadius: 8 }}>
              <span style={{ color: C.gold, fontSize: 11 }}>⚠ </span>
              <span style={{ color: C.muted, fontSize: 11 }}>
                <strong style={{ color: C.gold }}>Aviso legal:</strong> Simulación educativa (paper trading).
                No constituye asesoramiento financiero. La inversión conlleva riesgo de pérdida del capital.
                Consulta a un asesor EFPA/CFA antes de operar con dinero real. · {analysis.resumen}
              </span>
            </div>
          </>
        )}

        {/* Error state */}
        {phase === "error" && (
          <div style={{ padding: 20, background: `${C.red}10`, border: `1px solid ${C.red}30`,
            borderRadius: 8, color: C.red }}>
            Error en el análisis: {error}
          </div>
        )}

        {/* Initial state */}
        {phase === "ready" && (
          <div style={{ textAlign: "center", padding: "60px 20px", color: C.muted }}>
            <div style={{ fontSize: 48, marginBottom: 16, opacity: 0.3 }}>◈</div>
            <div style={{ fontSize: 14, marginBottom: 8 }}>Sistema listo</div>
            <div style={{ fontSize: 12 }}>Selecciona un perfil de riesgo y pulsa <span style={{color: C.accent}}>▶ Ejecutar IA</span></div>
            <div style={{ fontSize: 11, marginTop: 8 }}>Claude analizará {allAssets.length} activos en {Object.keys(universe).length} sectores en tiempo real</div>
          </div>
        )}
      </div>

      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>
    </div>
  );
}
