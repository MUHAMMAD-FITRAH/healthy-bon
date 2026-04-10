"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { loadWeekData, saveWeekData, addEntry, getWeekId, formatDate, scoreColor, scoreBg, scoreHex, scoreLabel } from "@/lib/utils";

const DAYS = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
const CAT_COLORS = ["#16a34a", "#0d9488", "#7c3aed", "#d97706", "#db2777", "#2563eb", "#f97316", "#06b6d4"];

/* ─── Sub-components ─── */
function Gauge({ score, size = "lg" }) {
  const [v, setV] = useState(0);
  useEffect(() => { const t = setTimeout(() => setV(score), 200); return () => clearTimeout(t); }, [score]);
  const sm = size === "sm";
  const W = sm ? 120 : 190, H = sm ? 72 : 112, R = sm ? 44 : 74;
  const c = Math.PI * R, off = c - (v / 100) * c, col = scoreHex(score);
  const sw = sm ? 10 : 14, cx = W / 2, cy = H - (sm ? 8 : 14);
  return (
    <div className="text-center">
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        <defs><linearGradient id={`gg-${size}`} x1="0%" y1="0%" x2="100%"><stop offset="0%" stopColor="#D32F2F" /><stop offset="45%" stopColor="#FF8F00" /><stop offset="100%" stopColor="#00C853" /></linearGradient></defs>
        <path d={`M ${cx - R} ${cy} A ${R} ${R} 0 0 1 ${cx + R} ${cy}`} fill="none" stroke="currentColor" className="text-gray-200 dark:text-gray-800" strokeWidth={sw} strokeLinecap="round" />
        <path d={`M ${cx - R} ${cy} A ${R} ${R} 0 0 1 ${cx + R} ${cy}`} fill="none" stroke={`url(#gg-${size})`}
          strokeWidth={sw} strokeLinecap="round" strokeDasharray={c} strokeDashoffset={off}
          style={{ transition: "stroke-dashoffset 1.8s cubic-bezier(.4,0,.2,1)", filter: `drop-shadow(0 0 6px ${col}40)` }} />
        <text x={cx} y={cy - (sm ? 8 : 16)} textAnchor="middle" fill={col} fontSize={sm ? 24 : 38} fontWeight="900" fontFamily="'DM Mono',monospace">{v}</text>
        <text x={cx} y={cy + (sm ? 6 : 4)} textAnchor="middle" className="fill-gray-400" fontSize={sm ? 9 : 11} fontFamily="'DM Mono',monospace">/100</text>
      </svg>
      <div className={`inline-block mt-1 px-3 py-0.5 rounded-full text-xs font-extrabold tracking-widest font-mono ${scoreBg(score)} ${scoreColor(score)}`}>{scoreLabel(score)}</div>
    </div>
  );
}

function NutrBar({ label, val, max, unit, color }) {
  const [w, setW] = useState(0);
  useEffect(() => { setTimeout(() => setW(Math.min((val / max) * 100, 115)), 300); }, [val, max]);
  const over = val > max * 0.75;
  return (
    <div className="mb-2.5">
      <div className="flex justify-between text-xs mb-1">
        <span className="text-gray-500 dark:text-gray-400">{label}</span>
        <span className="font-mono font-bold" style={{ color: over ? "#D32F2F" : undefined }}>{val}{unit} <span className="font-normal text-gray-400">/ {max}{unit}</span></span>
      </div>
      <div className="h-2 rounded-full bg-gray-200 dark:bg-gray-800 overflow-hidden">
        <div className="h-full rounded-full transition-all duration-1000 ease-out" style={{ width: `${Math.min(w, 100)}%`, background: over ? `linear-gradient(90deg,${color},#D32F2F)` : color }} />
      </div>
    </div>
  );
}

function PipelineStep({ n, label, sub, active, done }) {
  return (
    <div className={`flex items-center gap-3 px-3 py-2 rounded-lg border transition-all duration-300 ${active ? "bg-green-50 dark:bg-green-950/30 border-green-400/50" : done ? "bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800" : "border-transparent opacity-30"}`}>
      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold font-mono ${done ? "bg-health-green text-white" : active ? "bg-green-100 dark:bg-green-900 text-health-green" : "bg-gray-200 dark:bg-gray-800 text-gray-400"}`}>
        {done ? "✓" : n}
      </div>
      <div className="flex-1">
        <div className={`text-xs font-bold ${active ? "text-health-green" : done ? "" : "text-gray-400"}`}>{label}</div>
        {sub && <div className="text-[10px] text-gray-400">{sub}</div>}
      </div>
      {active && <div className="w-3.5 h-3.5 border-2 border-health-green border-t-transparent rounded-full animate-hb-spin" />}
    </div>
  );
}

function WeekChart({ entries }) {
  const dayMap = {};
  entries.forEach(e => { const d = new Date(e.timestamp); const k = DAYS[d.getDay()]; if (!dayMap[k]) dayMap[k] = []; dayMap[k].push(e.overall_score); });
  const scores = DAYS.map(d => { const s = dayMap[d] || []; return s.length ? Math.round(s.reduce((a, b) => a + b, 0) / s.length) : null; });
  return (
    <div className="flex items-end gap-2 h-32 px-1">
      {DAYS.map((day, i) => {
        const s = scores[i], h = s ? (s / 100) * 100 : 0, today = new Date().getDay() === i;
        return (
          <div key={day} className="flex-1 flex flex-col items-center gap-1">
            {s !== null && <div className="text-[10px] font-bold font-mono" style={{ color: scoreHex(s) }}>{s}</div>}
            <div className="w-full max-w-[32px] rounded-md transition-all duration-1000" style={{ height: h || 4, background: s !== null ? `linear-gradient(180deg, ${scoreHex(s)}, ${scoreHex(s)}50)` : undefined }} />
            <div className={`text-[10px] ${today ? "font-extrabold text-health-green" : "text-gray-400"}`}>{day}</div>
          </div>
        );
      })}
    </div>
  );
}

/* ─── Main Component ─── */
export default function HealthyBon() {
  const [dark, setDark] = useState(false);
  const [view, setView] = useState("scan");
  const [mode, setMode] = useState("idle");
  const [imgSrc, setImgSrc] = useState(null);
  const [step, setStep] = useState(-1);
  const [ocrText, setOcrText] = useState([]);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [camReady, setCamReady] = useState(false);
  const [weekData, setWeekData] = useState({ weekId: getWeekId(), entries: [] });

  const vidRef = useRef(null);
  const canRef = useRef(null);
  const streamRef = useRef(null);
  const fileRef = useRef(null);

  // Load data on mount
  useEffect(() => { setWeekData(loadWeekData()); }, []);

  // Dark mode toggle
  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  // Camera
  const startCam = useCallback(async () => {
    setMode("camera"); setError(null);
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment", width: { ideal: 1280 } } });
      streamRef.current = s;
      if (vidRef.current) { vidRef.current.srcObject = s; vidRef.current.onloadedmetadata = () => setCamReady(true); }
    } catch { setError("Kamera tidak dapat diakses. Gunakan opsi upload gambar."); setMode("idle"); }
  }, []);

  const stopCam = useCallback(() => {
    if (streamRef.current) { streamRef.current.getTracks().forEach(t => t.stop()); streamRef.current = null; }
    setCamReady(false);
  }, []);

  const capture = useCallback(() => {
    if (!vidRef.current || !canRef.current) return;
    const v = vidRef.current, c = canRef.current;
    c.width = v.videoWidth; c.height = v.videoHeight;
    c.getContext("2d").drawImage(v, 0, 0);
    setImgSrc(c.toDataURL("image/jpeg", 0.85));
    stopCam(); setMode("preview");
  }, [stopCam]);

  const onFile = useCallback(e => {
    const f = e.target.files?.[0]; if (!f) return;
    const r = new FileReader();
    r.onload = ev => { setImgSrc(ev.target.result); setMode("preview"); };
    r.readAsDataURL(f);
    e.target.value = "";
  }, []);

  // Analysis
  const analyze = useCallback(async () => {
    if (!imgSrc) return;
    setMode("analyzing"); setStep(0); setOcrText([]); setResult(null); setError(null);

    const b64 = imgSrc.split(",")[1];
    const mt = imgSrc.startsWith("data:image/png") ? "image/png" : "image/jpeg";

    await delay(600); setStep(1);

    try {
      // Pastikan Puter.js sudah ter-load
      if (typeof window === "undefined" || !window.puter) {
        throw new Error("Puter.js belum ter-load. Refresh halaman dan coba lagi.");
      }

      const prompt = `Analisis struk belanja Indonesia ini. Ekstrak SEMUA item makanan/minuman.

BALAS HANYA JSON VALID (tanpa backtick, tanpa markdown, tanpa teks lain):
{
  "store_name": "nama toko",
  "date": "tanggal",
  "ocr_raw": ["baris teks per item"],
  "items": [{
    "raw_text": "teks asli",
    "product_name": "nama lengkap",
    "category": "Mie Instan/Snack/Minuman Manis/Susu/Buah/Sayur/Daging/Roti/dll",
    "calories": 0, "sugar_g": 0, "sodium_mg": 0, "fat_g": 0, "fiber_g": 0, "protein_g": 0,
    "health_score": 0
  }],
  "recommendations": [{"icon": "emoji", "text": "saran spesifik", "priority": "high/medium/good"}],
  "overall_score": 0,
  "summary": "ringkasan 1 kalimat"
}

PANDUAN SCORING:
- Buah/Sayur segar: 80-95
- Susu/Yogurt: 60-75
- Daging segar: 55-70
- Mie instan: 20-35
- Snack kemasan: 20-35
- Minuman manis: 15-30`;

      // Panggil Puter.js dengan gambar
      const puterRes = await window.puter.ai.chat(prompt, imgSrc, false, {
        model: "claude-sonnet-4",
      });

      // Ekstrak text response
      let text = "";
      if (typeof puterRes === "string") {
        text = puterRes;
      } else if (puterRes?.message?.content) {
        text = Array.isArray(puterRes.message.content)
          ? puterRes.message.content.map(c => c.text || "").join("")
          : puterRes.message.content;
      } else if (puterRes?.text) {
        text = puterRes.text;
      } else {
        text = JSON.stringify(puterRes);
      }

      // Parse JSON
      let parsed;
      try {
        parsed = JSON.parse(text.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim());
      } catch {
        const m = text.match(/\{[\s\S]*\}/);
        if (m) { try { parsed = JSON.parse(m[0]); } catch {} }
      }

      if (!parsed || !parsed.items) {
        parsed = {
          store_name: "-", date: "-", ocr_raw: ["Struk tidak terbaca"], items: [],
          recommendations: [{ icon: "📸", text: "Coba foto ulang dengan pencahayaan lebih baik", priority: "medium" }],
          overall_score: 0, summary: "Struk tidak dapat dibaca.",
        };
      }

      // Animasi OCR
      setStep(1);
      for (let i = 0; i < (parsed.ocr_raw || []).length; i++) {
        await delay(120);
        setOcrText(p => [...p, parsed.ocr_raw[i]]);
      }

      await delay(600); setStep(2);
      await delay(800); setStep(3);
      await delay(1000); setStep(4);
      setStep(5);

      setResult(parsed);
      const updated = addEntry(weekData, parsed);
      setWeekData(updated);
      setMode("result");
    } catch (err) {
      console.error("Puter.js error:", err);
      setError(err?.message || "Analisis gagal. Pastikan koneksi internet stabil dan coba lagi.");
      setMode("preview"); setStep(-1);
    }
  }, [imgSrc, weekData]);

  const reset = useCallback(() => {
    stopCam(); setMode("idle"); setImgSrc(null); setStep(-1); setOcrText([]); setResult(null); setError(null);
  }, [stopCam]);

  const clearData = useCallback(() => {
    const fresh = { weekId: getWeekId(), entries: [] };
    setWeekData(fresh); saveWeekData(fresh);
  }, []);

  useEffect(() => () => stopCam(), [stopCam]);

  // Computed
  const items = result?.items || [];
  const tC = items.reduce((a, b) => a + (b.calories || 0), 0);
  const tS = items.reduce((a, b) => a + (b.sugar_g || 0), 0);
  const tN = items.reduce((a, b) => a + (b.sodium_mg || 0), 0);
  const tF = items.reduce((a, b) => a + (b.fat_g || 0), 0);
  const tFi = items.reduce((a, b) => a + (b.fiber_g || 0), 0);
  const cats = {}; items.forEach(i => { if (i.category) cats[i.category] = (cats[i.category] || 0) + 1; });

  const we = weekData.entries;
  const wAvg = we.length ? Math.round(we.reduce((a, e) => a + e.overall_score, 0) / we.length) : 0;
  const wItems = we.flatMap(e => e.items || []);
  const wCats = {}; wItems.forEach(i => { if (i.category) wCats[i.category] = (wCats[i.category] || 0) + 1; });
  const wBest = [...wItems].sort((a, b) => (b.health_score || 0) - (a.health_score || 0))[0];
  const wWorst = [...wItems].sort((a, b) => (a.health_score || 0) - (b.health_score || 0))[0];
  const trend = we.length >= 2 ? we[we.length - 1].overall_score - we[0].overall_score : 0;
  const wTC = we.reduce((a, e) => a + (e.totals?.calories || 0), 0);
  const wTS = we.reduce((a, e) => a + (e.totals?.sugar || 0), 0);
  const wTN = we.reduce((a, e) => a + (e.totals?.sodium || 0), 0);
  const wTF = we.reduce((a, e) => a + (e.totals?.fat || 0), 0);
  const wTFi = we.reduce((a, e) => a + (e.totals?.fiber || 0), 0);

  return (
    <div className="min-h-screen transition-colors duration-300">
      <canvas ref={canRef} className="hidden" />
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onFile} />

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-forest-950/80 backdrop-blur-xl">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-health-green to-health-teal flex items-center justify-center text-lg shadow-lg shadow-green-500/20">🥗</div>
            <div>
              <h1 className="text-lg font-black tracking-tight">Healthy<span className="text-health-green">Bon</span></h1>
              <p className="text-[9px] text-gray-400 tracking-[0.2em] uppercase">Pemantau Gizi Cerdas</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <nav className="flex gap-1 bg-gray-100 dark:bg-gray-900 rounded-xl p-1 border border-gray-200 dark:border-gray-800">
              {[{ id: "scan", label: "📸 Pindai" }, { id: "recap", label: "📊 Rekap", badge: we.length || null }].map(tab => (
                <button key={tab.id} onClick={() => { if (mode === "idle" || mode === "result" || view === "recap") setView(tab.id); }}
                  className={`px-4 py-1.5 rounded-lg text-xs font-extrabold transition-all ${view === tab.id ? "bg-white dark:bg-gray-800 text-health-green shadow-sm" : "text-gray-400 hover:text-gray-600"}`}>
                  {tab.label}
                  {tab.badge && <span className="ml-1.5 bg-health-green text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full font-mono">{tab.badge}</span>}
                </button>
              ))}
            </nav>
            <button onClick={() => setDark(!dark)} className="w-9 h-9 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 flex items-center justify-center text-sm transition-all hover:scale-105">
              {dark ? "☀️" : "🌙"}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6">
        {/* ═══ SCAN VIEW ═══ */}
        {view === "scan" && (<>
          {mode === "idle" && (
            <div className="animate-hb-fade max-w-xl mx-auto text-center py-8">
              <div className="bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-forest-950 dark:via-emerald-950 dark:to-teal-950 rounded-3xl p-10 border border-gray-200 dark:border-gray-800 shadow-xl">
                <div className="text-5xl mb-4">🛒</div>
                <h2 className="text-2xl font-black mb-2">Pindai Struk, Lihat <span className="text-health-green underline decoration-wavy decoration-green-300/40 underline-offset-4">Kesehatanmu</span></h2>
                <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed mb-8 max-w-md mx-auto">
                  Foto atau upload struk belanja — AI menganalisis item pangan dan memberikan skor kesehatan personal secara instan.
                </p>
                <div className="flex gap-3 justify-center flex-wrap">
                  <button onClick={startCam} className="px-6 py-3 rounded-xl bg-gradient-to-r from-health-green to-emerald-600 text-white font-extrabold shadow-lg shadow-green-500/25 hover:shadow-green-500/40 transition-all hover:-translate-y-0.5">
                    📷 Buka Kamera
                  </button>
                  <button onClick={() => fileRef.current?.click()} className="px-6 py-3 rounded-xl border-2 border-health-teal text-health-teal font-extrabold hover:bg-teal-50 dark:hover:bg-teal-950/30 transition-all">
                    🖼️ Upload Gambar
                  </button>
                </div>
              </div>

              {error && <div className="mt-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/30 text-health-red text-xs border border-red-200 dark:border-red-900">{error}</div>}

              {we.length > 0 && (
                <button onClick={() => setView("recap")} className="mt-6 w-full p-4 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-md flex items-center gap-4 text-left hover:shadow-lg transition-all">
                  <Gauge score={wAvg} size="sm" />
                  <div className="flex-1">
                    <div className="text-sm font-extrabold">Rekap Minggu Ini</div>
                    <div className="text-xs text-gray-400">{we.length} struk · {wItems.length} produk</div>
                    <div className="flex gap-1 mt-2 flex-wrap">
                      {we.slice(-6).map(e => <div key={e.id} className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${scoreBg(e.overall_score)} ${scoreColor(e.overall_score)}`}>{e.overall_score}</div>)}
                    </div>
                  </div>
                  <span className="text-health-green text-xl">→</span>
                </button>
              )}

              <div className="mt-8 flex justify-center gap-3 flex-wrap">
                {[{ i: "🔍", l: "OCR" }, { i: "🧠", l: "NLP" }, { i: "📊", l: "Database" }, { i: "⚙️", l: "ML" }].map(s => (
                  <div key={s.l} className="flex flex-col items-center gap-1 px-4 py-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm min-w-[80px]">
                    <div className="text-xl">{s.i}</div>
                    <div className="text-[10px] font-extrabold text-health-green">{s.l}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {mode === "camera" && (
            <div className="animate-hb-fade max-w-lg mx-auto text-center">
              <div className="relative rounded-2xl overflow-hidden border-2 border-green-400/50 bg-black">
                <video ref={vidRef} autoPlay playsInline muted className="w-full block min-h-[260px]" />
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-health-green to-transparent animate-hb-scan shadow-[0_0_12px_#00C853]" />
                </div>
              </div>
              <p className="text-gray-400 text-xs mt-3 mb-4">Arahkan kamera ke struk belanja</p>
              <div className="flex gap-3 justify-center">
                <button onClick={capture} disabled={!camReady} className="px-6 py-3 rounded-xl bg-gradient-to-r from-health-green to-emerald-600 text-white font-extrabold disabled:opacity-40 shadow-lg">
                  {camReady ? "📸 Ambil Foto" : "Memuat..."}
                </button>
                <button onClick={() => { stopCam(); setMode("idle"); }} className="px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 text-gray-400 text-sm">✕ Batal</button>
              </div>
            </div>
          )}

          {mode === "preview" && imgSrc && (
            <div className="animate-hb-fade max-w-lg mx-auto text-center">
              <div className="rounded-2xl overflow-hidden border-2 border-teal-400/40 shadow-xl">
                <img src={imgSrc} alt="Receipt" className="w-full block" />
              </div>
              <p className="text-gray-400 text-xs mt-3 mb-4">Gambar siap dianalisis oleh AI</p>
              <div className="flex gap-3 justify-center">
                <button onClick={analyze} className="px-6 py-3 rounded-xl bg-gradient-to-r from-health-green to-emerald-600 text-white font-extrabold shadow-lg shadow-green-500/25">
                  🤖 Analisis dengan AI
                </button>
                <button onClick={reset} className="px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 text-gray-400 text-sm">↺ Ulang</button>
              </div>
              {error && <div className="mt-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/30 text-health-red text-xs">{error}</div>}
            </div>
          )}

          {mode === "analyzing" && (
            <div className="animate-hb-fade">
              <div className="text-center mb-5">
                <span className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-green-50 dark:bg-green-950/30 border border-green-400/40 text-sm font-extrabold text-health-green">
                  <span className="animate-hb-pulse">●</span> Menganalisis struk...
                </span>
              </div>
              <div className="grid gap-4 max-w-3xl mx-auto" style={{ gridTemplateColumns: imgSrc ? "220px 1fr" : "1fr" }}>
                {imgSrc && (
                  <div>
                    <div className="text-[10px] font-bold text-gray-400 mb-1.5 tracking-widest">📸 INPUT</div>
                    <div className="rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800 relative shadow-lg">
                      <img src={imgSrc} alt="" className="w-full block opacity-75" />
                      {step <= 2 && <div className="absolute inset-0"><div className="absolute left-0 right-0 h-0.5 bg-health-green animate-hb-scan shadow-[0_0_10px_#00C853]" /></div>}
                    </div>
                  </div>
                )}
                <div>
                  <div className="text-[10px] font-bold text-gray-400 mb-1.5 tracking-widest">🔄 PIPELINE AI</div>
                  <div className="bg-white dark:bg-gray-900 rounded-xl p-3 border border-gray-200 dark:border-gray-800 shadow-md space-y-1.5">
                    <PipelineStep n={1} label="Upload & Preprocessing" sub="Kompresi gambar" active={step === 0} done={step > 0} />
                    <PipelineStep n={2} label="OCR — Ekstraksi Teks" sub="Vision AI membaca struk" active={step === 1} done={step > 1} />
                    <PipelineStep n={3} label="NLP — Identifikasi Produk" sub="Klasifikasi item pangan" active={step === 2} done={step > 2} />
                    <PipelineStep n={4} label="Database Gizi" sub="Matching nutrisi per produk" active={step === 3} done={step > 3} />
                    <PipelineStep n={5} label="ML — Scoring" sub="Analisis pola + skor" active={step === 4} done={step > 4} />
                    <PipelineStep n={6} label="Health Receipt" active={false} done={step >= 5} />
                  </div>
                  {ocrText.length > 0 && (
                    <div className="mt-3 bg-gray-50 dark:bg-gray-950 rounded-lg p-3 border border-gray-200 dark:border-gray-800 font-mono text-[10px] max-h-40 overflow-auto">
                      <div className="text-health-green text-[9px] tracking-widest mb-1">// OCR OUTPUT</div>
                      {ocrText.map((l, i) => <div key={i} className="text-health-teal animate-hb-slide">[{String(i + 1).padStart(2, "0")}] &quot;{l}&quot;</div>)}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {mode === "result" && result && (
            <div className="animate-hb-fade">
              <div className="text-center mb-5">
                <span className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-green-100 dark:bg-green-950/40 border border-health-green text-sm font-extrabold text-health-green">
                  ✅ {items.length} produk terdeteksi — Tersimpan
                </span>
              </div>
              <div className="grid gap-4 items-start" style={{ gridTemplateColumns: imgSrc ? "200px 1fr" : "1fr" }}>
                {imgSrc && (
                  <div className="space-y-3">
                    <div className="rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800 shadow-lg"><img src={imgSrc} alt="" className="w-full block" /></div>
                    <div className="bg-white dark:bg-gray-900 rounded-xl p-3 border border-gray-200 dark:border-gray-800 shadow-sm">
                      <div className="font-extrabold text-sm">{result.store_name}</div>
                      <div className="text-xs text-gray-400">{result.date}</div>
                      <div className="text-xs text-gray-500 mt-1 italic">{result.summary}</div>
                    </div>
                    <button onClick={reset} className="w-full py-2.5 rounded-lg border border-gray-200 dark:border-gray-800 text-gray-400 text-xs font-bold hover:bg-gray-50 dark:hover:bg-gray-900">📸 Pindai Lagi</button>
                    <button onClick={() => setView("recap")} className="w-full py-2.5 rounded-lg border border-green-300 dark:border-green-800 bg-green-50 dark:bg-green-950/30 text-health-green text-xs font-bold">📊 Rekap Minggu</button>
                  </div>
                )}
                <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-800 shadow-xl">
                  <div className="text-center mb-5">
                    <div className="text-[10px] text-gray-400 tracking-widest mb-1">SKOR KESEHATAN TRANSAKSI</div>
                    <Gauge score={result.overall_score || 0} />
                  </div>
                  {items.length > 0 && (<>
                    <div className="grid grid-cols-2 gap-3 mb-5">
                      {[{ l: "Kalori", v: tC, u: " kkal", m: "2.150", c: "#2563eb" }, { l: "Gula", v: tS, u: "g", m: "50g", c: "#FF8F00" }, { l: "Natrium", v: tN, u: "mg", m: "2.000mg", c: "#7c3aed" }, { l: "Lemak", v: tF, u: "g", m: "65g", c: "#db2777" }].map((x, i) => (
                        <div key={i} className="bg-gray-50 dark:bg-gray-950 rounded-xl p-3 border border-gray-100 dark:border-gray-800">
                          <div className="text-[9px] text-gray-400 tracking-widest mb-0.5">{x.l.toUpperCase()}</div>
                          <div className="text-xl font-black font-mono" style={{ color: x.c }}>{x.v}<span className="text-[10px] font-normal text-gray-400">{x.u}</span></div>
                          <div className="text-[9px] text-gray-400">AKG: {x.m}</div>
                        </div>
                      ))}
                    </div>
                    <div className="mb-5">
                      <NutrBar label="Kalori" val={tC} max={2150} unit=" kkal" color="#2563eb" />
                      <NutrBar label="Gula" val={tS} max={50} unit="g" color="#FF8F00" />
                      <NutrBar label="Natrium" val={tN} max={2000} unit="mg" color="#7c3aed" />
                      <NutrBar label="Lemak" val={tF} max={65} unit="g" color="#db2777" />
                      <NutrBar label="Serat" val={tFi} max={25} unit="g" color="#00C853" />
                    </div>
                    {Object.keys(cats).length > 0 && (
                      <div className="mb-5">
                        <div className="text-xs font-extrabold mb-2">Kategori Pangan</div>
                        <div className="flex flex-wrap gap-1.5">
                          {Object.entries(cats).map(([n, c], i) => (
                            <span key={n} className="px-3 py-1 rounded-full text-[10px] font-bold border" style={{ color: CAT_COLORS[i % CAT_COLORS.length], borderColor: CAT_COLORS[i % CAT_COLORS.length] + "40", background: CAT_COLORS[i % CAT_COLORS.length] + "12" }}>
                              {n} <span className="font-mono">×{c}</span>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    <div className="mb-5">
                      <div className="text-xs font-extrabold mb-2">Detail Produk</div>
                      <div className="space-y-1">
                        {[...items].sort((a, b) => (a.health_score || 0) - (b.health_score || 0)).map((it, i) => (
                          <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-gray-50 dark:bg-gray-950 border border-gray-100 dark:border-gray-800 text-xs animate-hb-slide">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full" style={{ background: scoreHex(it.health_score || 0), boxShadow: `0 0 6px ${scoreHex(it.health_score || 0)}40` }} />
                              <div><div className="font-bold">{it.product_name}</div><div className="text-[9px] text-gray-400">{it.category} · {it.calories || 0} kkal</div></div>
                            </div>
                            <div className="font-mono font-black text-sm" style={{ color: scoreHex(it.health_score || 0) }}>{it.health_score || 0}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>)}
                  {result.recommendations?.length > 0 && (
                    <div className="bg-green-50 dark:bg-green-950/20 rounded-xl p-4 border border-green-200/50 dark:border-green-800/30">
                      <div className="text-sm font-extrabold text-health-green mb-3">🎯 Rekomendasi Belanja Berikutnya</div>
                      {result.recommendations.map((r, i) => (
                        <div key={i} className="flex gap-2 mb-1.5 text-xs animate-hb-slide">
                          <span>{r.icon}</span>
                          <span className={r.priority === "good" ? "text-health-green" : r.priority === "high" ? "text-health-red" : ""}>{r.text}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </>)}

        {/* ═══ RECAP VIEW ═══ */}
        {view === "recap" && (
          <div className="animate-hb-fade">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-black">📊 Rekap Mingguan</h2>
                <p className="text-xs text-gray-400 mt-1">{weekData.weekId} · {we.length} struk dipindai</p>
              </div>
              {we.length > 0 && <button onClick={clearData} className="text-[10px] px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-800 text-gray-400 hover:text-health-red">🗑 Reset</button>}
            </div>

            {we.length === 0 ? (
              <div className="text-center py-16 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xl">
                <div className="text-5xl mb-4">📭</div>
                <div className="text-lg font-extrabold mb-2">Belum ada data</div>
                <div className="text-gray-400 text-sm mb-6">Pindai struk belanja untuk memulai rekap</div>
                <button onClick={() => setView("scan")} className="px-6 py-3 rounded-xl bg-gradient-to-r from-health-green to-emerald-600 text-white font-extrabold shadow-lg">📸 Pindai Struk</button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Top overview */}
                <div className="md:col-span-2 bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-800 shadow-xl grid grid-cols-[auto_1fr_auto] gap-6 items-center">
                  <Gauge score={wAvg} />
                  <div>
                    <div className="text-sm font-extrabold mb-1">Skor Rata-Rata Minggu Ini</div>
                    <div className="text-xs text-gray-500">{we.length} transaksi dipindai.
                      {trend > 0 && <span className="text-health-green font-extrabold"> Tren naik +{trend} ↑</span>}
                      {trend < 0 && <span className="text-health-red font-extrabold"> Tren turun {trend} ↓</span>}
                    </div>
                    <div className="flex gap-1 mt-3 flex-wrap">
                      {we.map(e => <div key={e.id} title={formatDate(e.timestamp)} className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${scoreBg(e.overall_score)} ${scoreColor(e.overall_score)}`}>{e.overall_score}</div>)}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-black font-mono text-health-teal">{wItems.length}</div>
                    <div className="text-[10px] text-gray-400">produk</div>
                  </div>
                </div>

                {/* Chart */}
                <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-200 dark:border-gray-800 shadow-md">
                  <div className="text-sm font-extrabold mb-4">📈 Skor per Hari</div>
                  <WeekChart entries={we} />
                </div>

                {/* Nutrition */}
                <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-200 dark:border-gray-800 shadow-md">
                  <div className="text-sm font-extrabold mb-4">🥗 Total Nutrisi Minggu</div>
                  <NutrBar label="Kalori" val={wTC} max={2150 * 7} unit=" kkal" color="#2563eb" />
                  <NutrBar label="Gula" val={wTS} max={50 * 7} unit="g" color="#FF8F00" />
                  <NutrBar label="Natrium" val={wTN} max={2000 * 7} unit="mg" color="#7c3aed" />
                  <NutrBar label="Lemak" val={wTF} max={65 * 7} unit="g" color="#db2777" />
                  <NutrBar label="Serat" val={wTFi} max={25 * 7} unit="g" color="#00C853" />
                </div>

                {/* Categories */}
                <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-200 dark:border-gray-800 shadow-md">
                  <div className="text-sm font-extrabold mb-3">🏷 Distribusi Kategori</div>
                  {Object.entries(wCats).sort((a, b) => b[1] - a[1]).map(([n, c], i) => {
                    const pct = Math.round((c / wItems.length) * 100);
                    const col = CAT_COLORS[i % CAT_COLORS.length];
                    return (<div key={n} className="mb-2.5">
                      <div className="flex justify-between text-[11px] mb-1"><span className="font-bold" style={{ color: col }}>{n}</span><span className="text-gray-400 font-mono">{c}× ({pct}%)</span></div>
                      <div className="h-1.5 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden"><div className="h-full rounded-full transition-all duration-1000" style={{ width: `${pct}%`, background: col }} /></div>
                    </div>);
                  })}
                </div>

                {/* Highlights */}
                <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-200 dark:border-gray-800 shadow-md">
                  <div className="text-sm font-extrabold mb-3">🏆 Highlight</div>
                  {wBest && <div className="p-3 rounded-xl bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800/30 mb-3">
                    <div className="text-[9px] text-health-green font-extrabold tracking-widest mb-1">✨ PILIHAN TERBAIK</div>
                    <div className="text-sm font-extrabold">{wBest.product_name}</div>
                    <div className="text-xs text-gray-500">{wBest.category} · Skor: <span className="text-health-green font-bold font-mono">{wBest.health_score}</span></div>
                  </div>}
                  {wWorst && <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/30">
                    <div className="text-[9px] text-health-red font-extrabold tracking-widest mb-1">⚠️ PERLU DIKURANGI</div>
                    <div className="text-sm font-extrabold">{wWorst.product_name}</div>
                    <div className="text-xs text-gray-500">{wWorst.category} · Skor: <span className="text-health-red font-bold font-mono">{wWorst.health_score}</span></div>
                  </div>}
                </div>

                {/* History */}
                <div className="md:col-span-2 bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-200 dark:border-gray-800 shadow-md">
                  <div className="text-sm font-extrabold mb-3">🧾 Riwayat Struk</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {[...we].reverse().map(e => (
                      <div key={e.id} className="p-3 rounded-xl bg-gray-50 dark:bg-gray-950 border border-gray-100 dark:border-gray-800 flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg font-black font-mono ${scoreBg(e.overall_score)} ${scoreColor(e.overall_score)}`}>{e.overall_score}</div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-extrabold truncate">{e.store}</div>
                          <div className="text-[10px] text-gray-400">{formatDate(e.timestamp)} · {e.items.length} produk</div>
                          <div className="text-[10px] text-gray-500 truncate">{e.summary}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="md:col-span-2 text-center py-4">
                  <button onClick={() => { setView("scan"); reset(); }} className="px-6 py-3 rounded-xl bg-gradient-to-r from-health-green to-emerald-600 text-white font-extrabold shadow-lg">📸 Pindai Struk Berikutnya</button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="text-center py-6 text-[10px] text-gray-400 border-t border-gray-200 dark:border-gray-800 mt-8">
        <p>Healthy Bon — AI Nutrition Monitor · Muhammad Fitrah · IPB University · ONTEL 2026</p>
        <p className="mt-1">Data diproses secara lokal. Privasi Anda terjaga.</p>
      </footer>
    </div>
  );
}

function delay(ms) { return new Promise(r => setTimeout(r, ms)); }
