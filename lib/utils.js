// Weekly data storage utilities

export function getWeekId() {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  const diff = now - start;
  const week = Math.ceil((diff / 86400000 + start.getDay() + 1) / 7);
  return `${now.getFullYear()}-W${String(week).padStart(2, "0")}`;
}

export function formatDate(iso) {
  const DAYS = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
  const d = new Date(iso);
  return `${DAYS[d.getDay()]}, ${d.getDate()}/${d.getMonth() + 1} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

export function scoreColor(s) {
  return s >= 70 ? "text-health-green" : s >= 45 ? "text-health-amber" : "text-health-red";
}

export function scoreBg(s) {
  return s >= 70 ? "bg-green-50 dark:bg-green-950/40" : s >= 45 ? "bg-amber-50 dark:bg-amber-950/40" : "bg-red-50 dark:bg-red-950/40";
}

export function scoreHex(s) {
  return s >= 70 ? "#00C853" : s >= 45 ? "#FF8F00" : "#D32F2F";
}

export function scoreLabel(s) {
  return s >= 70 ? "SEHAT" : s >= 45 ? "PERLU PERHATIAN" : "BERISIKO";
}

const STORAGE_KEY = "healthybon-weekly";

export function loadWeekData() {
  if (typeof window === "undefined") return { weekId: getWeekId(), entries: [] };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const data = JSON.parse(raw);
      if (data.weekId === getWeekId()) return data;
    }
  } catch {}
  return { weekId: getWeekId(), entries: [] };
}

export function saveWeekData(data) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {}
}

export function clearWeekData() {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {}
}

export function addEntry(weekData, analysisResult) {
  const entry = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    timestamp: new Date().toISOString(),
    store: analysisResult.store_name || "Toko",
    overall_score: analysisResult.overall_score || 0,
    items: analysisResult.items || [],
    recommendations: analysisResult.recommendations || [],
    summary: analysisResult.summary || "",
    totals: {
      calories: (analysisResult.items || []).reduce((a, b) => a + (b.calories || 0), 0),
      sugar: (analysisResult.items || []).reduce((a, b) => a + (b.sugar_g || 0), 0),
      sodium: (analysisResult.items || []).reduce((a, b) => a + (b.sodium_mg || 0), 0),
      fat: (analysisResult.items || []).reduce((a, b) => a + (b.fat_g || 0), 0),
      fiber: (analysisResult.items || []).reduce((a, b) => a + (b.fiber_g || 0), 0),
      protein: (analysisResult.items || []).reduce((a, b) => a + (b.protein_g || 0), 0),
    },
  };
  const updated = { ...weekData, entries: [...weekData.entries, entry] };
  saveWeekData(updated);
  return updated;
}
