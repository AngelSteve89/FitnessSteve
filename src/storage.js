const KEY = "fitness-journey-data-v2" // bump schema key

export function getAll() {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return { weights: [], pushups: [], rides: [], meals: [] }
    const parsed = JSON.parse(raw)
    // ensure new fields exist
    return {
      weights: parsed.weights || [],
      pushups: parsed.pushups || [],
      rides: parsed.rides || [],
      meals: parsed.meals || [],
    }
  } catch {
    return { weights: [], pushups: [], rides: [], meals: [] }
  }
}

export function saveAll(state) {
  try { localStorage.setItem(KEY, JSON.stringify(state)) } catch {}
}

export const todayISO = () => new Date().toISOString().slice(0, 10)
export const sum = arr => arr.reduce((a, b) => a + b, 0)
export const maxBy = (arr, fn) => arr.reduce((best, x) => (best == null || fn(x) > fn(best) ? x : best), null)

export function formatDate(iso) {
  try {
    const d = new Date(iso + "T00:00:00")
    return d.toLocaleDateString(undefined, { month: "short", day: "numeric" })
  } catch { return iso }
}

// ---- Meals helpers ----
export const presets = [
  // Factor-style quick adds (edit these to your actual favorites)
  { name: "Factor: Keto Bowl", calories: 590, protein: 38, carbs: 18, fats: 42 },
  { name: "Factor: Grilled Chicken", calories: 520, protein: 45, carbs: 34, fats: 21 },
  { name: "Factor: Salmon & Veg", calories: 610, protein: 40, carbs: 28, fats: 35 },
  { name: "Protein Shake", calories: 180, protein: 30, carbs: 6, fats: 3 },
]

export function mealsForDate(meals, iso) {
  return meals.filter(m => m.date === iso)
}

export function mealTotals(meals) {
  const t = { calories: 0, protein: 0, carbs: 0, fats: 0 }
  for (const m of meals) {
    t.calories += Number(m.calories) || 0
    t.protein  += Number(m.protein)  || 0
    t.carbs    += Number(m.carbs)    || 0
    t.fats     += Number(m.fats)     || 0
  }
  return t
}

