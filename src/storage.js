const KEY = "fitness-journey-data-v1"

export function getAll() {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return { weights: [], pushups: [], rides: [] }
    return JSON.parse(raw)
  } catch {
    return { weights: [], pushups: [], rides: [] }
  }
}

export function saveAll(state) {
  try {
    localStorage.setItem(KEY, JSON.stringify(state))
  } catch {}
}

export const todayISO = () => new Date().toISOString().slice(0, 10)
export const sum = arr => arr.reduce((a, b) => a + b, 0)
export const maxBy = (arr, fn) => arr.reduce((best, x) => (best == null || fn(x) > fn(best) ? x : best), null)

export function formatDate(iso) {
  try {
    const d = new Date(iso + "T00:00:00")
    const opts = { month: "short", day: "numeric" }
    return d.toLocaleDateString(undefined, opts)
  } catch { return iso }
}
