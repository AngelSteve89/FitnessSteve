import React, { useEffect, useMemo, useState } from "react"
import {
  getAll, saveAll, todayISO, sum, maxBy, formatDate,
  presets, mealsForDate, mealTotals
} from "./storage"

// ---- Minimal styles (no extra libraries) ----
const page = { minHeight: "100vh", background: "#0b1220", color: "#e6ecff", padding: 16, fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial" }
const container = { maxWidth: 980, margin: "0 auto" }
const h1 = { fontSize: 28, margin: "12px 0 8px" }
const card = { background: "#111827", border: "1px solid #1f2937", borderRadius: 14, padding: 16, boxShadow: "0 8px 30px rgba(0,0,0,.3)" }
const grid = { display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))" }
const stat = { background: "#0f172a", border: "1px solid #1f2937", borderRadius: 14, padding: 14 }
const label = { fontSize: 12, opacity: 0.7, marginBottom: 4 }
const big = { fontSize: 24, fontWeight: 700 }
const row = { display: "flex", gap: 8, flexWrap: "wrap" }
const input = { background: "#0b1220", color: "#e6ecff", border: "1px solid #243043", borderRadius: 10, padding: "10px 12px", outline: "none", width: "100%" }
const btn = { background: "#2563eb", color: "white", border: "none", borderRadius: 10, padding: "10px 14px", cursor: "pointer" }
const smallBtn = { ...btn, padding: "8px 10px", background: "#334155" }
const table = { width: "100%", borderCollapse: "collapse" }
const thtd = { borderBottom: "1px solid #1f2937", padding: "10px 8px", textAlign: "left", fontSize: 14 }

export default function App() {
  const [state, setState] = useState(() => getAll())
  useEffect(() => { saveAll(state) }, [state])

  // ---- Derived: weights, pushups ----
  const startingWeight = useMemo(() => state.weights[0]?.weight ?? "—", [state.weights])
  const currentWeight  = useMemo(() => state.weights[state.weights.length - 1]?.weight ?? "—", [state.weights])
  const bestPushupsDay = useMemo(() => {
    if (!state.pushups.length) return "—"
    const best = maxBy(state.pushups, x => x.count)
    return `${best.count} (${formatDate(best.date)})`
  }, [state.pushups])
  const todaysPushups = useMemo(() => {
    const todayEntries = state.pushups.filter(p => p.date === todayISO())
    return sum(todayEntries.map(p => p.count))
  }, [state.pushups])

  // ---- Derived: meals ----
  const todaysMeals = useMemo(() => mealsForDate(state.meals, todayISO()), [state.meals])
  const totals = useMemo(() => mealTotals(todaysMeals), [todaysMeals])

  // ---- Actions
  function addWeight(e) {
    e.preventDefault()
    const weight = Number(e.target.weight.value)
    if (!weight) return
    setState(s => ({ ...s, weights: [...s.weights, { date: todayISO(), weight }] }))
    e.target.reset()
  }

  function addPushupsCount(n) {
    setState(s => ({ ...s, pushups: [...s.pushups, { date: todayISO(), count: n }] }))
  }
  function addPushups(e) {
    e.preventDefault()
    const n = Number(e.target.count.value)
    if (!n) return
    addPushupsCount(n)
    e.target.reset()
  }
  function undoLastPushups() {
    setState(s => {
      const i = s.pushups.slice().reverse().findIndex(p => p.date === todayISO())
      if (i === -1) return s
      const idx = s.pushups.length - 1 - i
      return { ...s, pushups: s.pushups.slice(0, idx).concat(s.pushups.slice(idx + 1)) }
    })
  }

  function addRide(e) {
    e.preventDefault()
    const form = new FormData(e.target)
    const ride = {
      date: form.get("date") || todayISO(),
      title: form.get("title"),
      minutes: Number(form.get("minutes") || 0),
      output: Number(form.get("output") || 0)
    }
    if (!ride.title) return
    setState(s => ({ ...s, rides: [ride, ...s.rides] }))
    e.target.reset()
  }

  function addMeal(e) {
    e.preventDefault()
    const form = new FormData(e.target)
    const meal = {
      date: todayISO(),
      name: form.get("name"),
      calories: Number(form.get("calories") || 0),
      protein: Number(form.get("protein") || 0),
      carbs: Number(form.get("carbs") || 0),
      fats: Number(form.get("fats") || 0),
    }
    if (!meal.name) return
    setState(s => ({ ...s, meals: [meal, ...s.meals] }))
    e.target.reset()
  }
  function quickAddMeal(preset) {
    const meal = { date: todayISO(), ...preset }
    setState(s => ({ ...s, meals: [meal, ...s.meals] }))
  }
  function removeMeal(indexTodayList) {
    // remove by index from today's filtered list
    const target = todaysMeals[indexTodayList]
    if (!target) return
    setState(s => {
      const idx = s.meals.findIndex(m =>
        m === target ||
        (m.date === target.date && m.name === target.name && m.calories === target.calories && m.protein === target.protein && m.carbs === target.carbs && m.fats === target.fats)
      )
      if (idx === -1) return s
      const copy = s.meals.slice(); copy.splice(idx, 1)
      return { ...s, meals: copy }
    })
  }

  function loadDemo() {
    const demo = {
      weights: [
        { date: "2025-09-01", weight: 212 },
        { date: "2025-10-01", weight: 204 },
        { date: todayISO(), weight: 200 },
      ],
      pushups: [
        { date: todayISO(), count: 35 },
        { date: todayISO(), count: 40 },
        { date: "2025-10-31", count: 55 },
      ],
      rides: [
        { date: todayISO(), title: "20-min Pop Ride", minutes: 20, output: 235 },
        { date: "2025-10-29", title: "30-min Climb", minutes: 30, output: 310 }
      ],
      meals: [
        { date: todayISO(), name: "Factor: Grilled Chicken", calories: 520, protein: 45, carbs: 34, fats: 21 },
        { date: todayISO(), name: "Protein Shake", calories: 180, protein: 30, carbs: 6, fats: 3 },
      ]
    }
    setState(demo)
  }

  function clearAll() {
    if (!confirm("Clear all saved data?")) return
    setState({ weights: [], pushups: [], rides: [], meals: [] })
  }

  return (
    <div style={page}>
      <div style={container}>
        {/* Header */}
        <div style={{display:"flex", alignItems:"center", justifyContent:"space-between", gap:12, marginBottom:16}}>
          <h1 style={h1}>Fitness Journey</h1>
          <div style={{display:"flex", gap:8}}>
            <button style={smallBtn} onClick={loadDemo}>Load demo</button>
            <button style={smallBtn} onClick={clearAll}>Clear</button>
          </div>
        </div>

        {/* Journey Summary + Weight Trend */}
        <div style={{...card, marginBottom:16}}>
          <div style={grid}>
            <div style={stat}><div style={label}>Starting Weight</div><div style={big}>{startingWeight}</div></div>
            <div style={stat}><div style={label}>Current Weight</div><div style={big}>{currentWeight}</div></div>
            <div style={stat}><div style={label}>Best Pushups in a Day</div><div style={big}>{bestPushupsDay}</div></div>
            <div style={stat}>
              <div style={{...label, display:"flex", justifyContent:"space-between"}}>
                <span>Weight Trend</span><span style={{opacity:.6, fontSize:11}}>last {state.weights.length}</span>
              </div>
              <Sparkline data={state.weights.map(w => w.weight)} />
            </div>
          </div>
        </div>

        {/* Daily Summary */}
        <div style={{...card, marginBottom:16}}>
          <div style={{display:"flex", justifyContent:"space-between", alignItems:"center"}}>
            <div style={{fontWeight:700}}>Daily Summary</div>
            <div style={{opacity:.75}}>{formatDate(todayISO())}</div>
          </div>

          <div style={{marginTop:8, display:"grid", gap:12, gridTemplateColumns:"repeat(auto-fit, minmax(260px, 1fr))"}}>

            {/* Pushups — clearer UI */}
            <div style={{background:"#0f172a", border:"1px solid #1f2937", borderRadius:12, padding:12}}>
              <div style={label}>Pushups</div>
              <div style={{fontSize:28, fontWeight:800, marginBottom:8}}>{todaysPushups}</div>
              <form onSubmit={addPushups} style={{display:"grid", gap:8}}>
                <input name="count" type="number" min="1" placeholder="Add pushups" style={input}/>
                <div style={{display:"flex", gap:8, flexWrap:"wrap"}}>
                  {[10,20,30,40].map(n =>
                    <button key={n} type="button" style={smallBtn} onClick={() => addPushupsCount(n)}>+{n}</button>
                  )}
                  <button type="button" style={{...smallBtn, background:"#7c3aed"}} onClick={undoLastPushups}>Undo last</button>
                </div>
                <button style={btn}>Add</button>
              </form>
            </div>

            {/* Today's Weight */}
            <div style={{background:"#0f172a", border:"1px solid #1f2937", borderRadius:12, padding:12}}>
              <div style={label}>Today’s Weight</div>
              <form onSubmit={addWeight} style={{display:"grid", gap:8}}>
                <input name="weight" type="number" step="0.1" placeholder="Enter weight" style={input}/>
                <button style={btn}>Save</button>
              </form>
            </div>

            {/* Peloton Ride */}
            <div style={{background:"#0f172a", border:"1px solid #1f2937", borderRadius:12, padding:12}}>
              <div style={label}>Peloton Ride</div>
              <form onSubmit={addRide} style={{display:"grid", gap:8}}>
                <input name="title" placeholder="Ride title" style={input}/>
                <div style={row}>
                  <input name="minutes" type="number" placeholder="Minutes" style={{...input, flex:"1 1 120px"}}/>
                  <input name="output" type="number" placeholder="Output" style={{...input, flex:"1 1 120px"}}/>
                  <input name="date" type="date" defaultValue={todayISO()} style={{...input, flex:"1 1 140px"}}/>
                </div>
                <button style={btn}>Log Ride</button>
              </form>
            </div>
          </div>
        </div>

        {/* Food Intake (Factor-style) */}
        <div style={{...card, marginBottom:16}}>
          <div style={{display:"flex", justifyContent:"space-between", alignItems:"center"}}>
            <div style={{fontWeight:700}}>Food Intake</div>
            <div style={{opacity:.75}}>{formatDate(todayISO())}</div>
          </div>

          {/* Quick presets */}
          <div style={{display:"flex", flexWrap:"wrap", gap:8, marginTop:10}}>
            {presets.map(p =>
              <button key={p.name} type="button" style={smallBtn} onClick={() => quickAddMeal(p)}>
                + {p.name}
              </button>
            )}
          </div>

          {/* Custom add */}
          <form onSubmit={addMeal} style={{marginTop:10, display:"grid", gap:8, gridTemplateColumns:"repeat(auto-fit, minmax(140px, 1fr))"}}>
            <input name="name" placeholder="Meal name" style={input}/>
            <input name="calories" type="number" placeholder="Calories" style={input}/>
            <input name="protein"  type="number" placeholder="Protein (g)" style={input}/>
            <input name="carbs"    type="number" placeholder="Carbs (g)" style={input}/>
            <input name="fats"     type="number" placeholder="Fats (g)" style={input}/>
            <button style={btn}>Add Meal</button>
          </form>

          {/* Table + Totals */}
          <div style={{marginTop:10}}>
            <table style={table}>
              <thead>
                <tr>
                  <th style={thtd}>Meal</th>
                  <th style={thtd}>Calories</th>
                  <th style={thtd}>Protein</th>
                  <th style={thtd}>Carbs</th>
                  <th style={thtd}>Fats</th>
                  <th style={thtd}></th>
                </tr>
              </thead>
              <tbody>
                {todaysMeals.map((m, i) => (
                  <tr key={i}>
                    <td style={thtd}>{m.name}</td>
                    <td style={thtd}>{m.calories}</td>
                    <td style={thtd}>{m.protein}g</td>
                    <td style={thtd}>{m.carbs}g</td>
                    <td style={thtd}>{m.fats}g</td>
                    <td style={thtd}><button style={smallBtn} onClick={() => removeMeal(i)}>Remove</button></td>
                  </tr>
                ))}
                <tr>
                  <td style={{...thtd, fontWeight:700}}>Total</td>
                  <td style={thtd}>{totals.calories}</td>
                  <td style={thtd}>{totals.protein}g</td>
                  <td style={thtd}>{totals.carbs}g</td>
                  <td style={thtd}>{totals.fats}g</td>
                  <td style={thtd}></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* History */}
        <div style={{...card}}>
          <div style={{fontWeight:700, marginBottom:8}}>History</div>
          <div style={{display:"grid", gap:16, gridTemplateColumns:"repeat(auto-fit, minmax(260px, 1fr))"}}>
            <div>
              <div style={{opacity:.8, marginBottom:6}}>Pushups</div>
              <table style={table}>
                <thead><tr><th style={thtd}>Date</th><th style={thtd}>Count</th></tr></thead>
                <tbody>
                  {state.pushups.slice().reverse().map((p, i) => (
                    <tr key={i}><td style={thtd}>{formatDate(p.date)}</td><td style={thtd}>{p.count}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div>
              <div style={{opacity:.8, marginBottom:6}}>Weights</div>
              <table style={table}>
                <thead><tr><th style={thtd}>Date</th><th style={thtd}>Weight</th></tr></thead>
                <tbody>
                  {state.weights.slice().reverse().map((w, i) => (
                    <tr key={i}><td style={thtd}>{formatDate(w.date)}</td><td style={thtd}>{w.weight}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div>
              <div style={{opacity:.8, marginBottom:6}}>Peloton Rides</div>
              <table style={table}>
                <thead><tr><th style={thtd}>Date</th><th style={thtd}>Ride</th><th style={thtd}>Min</th><th style={thtd}>Output</th></tr></thead>
                <tbody>
                  {state.rides.map((r, i) => (
                    <tr key={i}>
                      <td style={thtd}>{formatDate(r.date)}</td>
                      <td style={thtd}>{r.title}</td>
                      <td style={thtd}>{r.minutes}</td>
                      <td style={thtd}>{r.output}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div style={{opacity:.6, fontSize:12, marginTop:12}}>
          Data is saved to your device only (localStorage). No account required.
        </div>
      </div>
    </div>
  )
}

/** Tiny inline sparkline (no libraries) */
function Sparkline({ data }) {
  if (!data || data.length < 2) return <div style={{opacity:.6}}>No data yet</div>
  const w = 280, h = 60, p = 4
  const min = Math.min(...data), max = Math.max(...data)
  const range = max - min || 1
  const stepX = (w - p*2) / (data.length - 1)
  const pts = data.map((v, i) => {
    const x = p + i * stepX
    const y = p + (h - p*2) * (1 - (v - min) / range)
    return `${x},${y}`
  }).join(" ")
  return (
    <svg width="100%" viewBox={`0 0 ${w} ${h}`} role="img" aria-label="Weight trend">
      <polyline fill="none" stroke="#60a5fa" strokeWidth="2" points={pts} />
      <circle r="3" cx={p + (data.length - 1) * stepX} cy={p + (h - p*2) * (1 - (data[data.length-1]-min)/range)} fill="#60a5fa" />
    </svg>
  )
}
