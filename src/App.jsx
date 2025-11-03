import React, { useEffect, useMemo, useState } from "react"
import { getAll, saveAll, todayISO, sum, maxBy, formatDate } from "./storage"

// --------- Minimal styles (kept inline so no setup needed) ----------
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

// ------------- Main App ----------------
export default function App() {
  const [state, setState] = useState(() => getAll())

  // derived stats
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

  // persist whenever state changes
  useEffect(() => { saveAll(state) }, [state])

  // ------- Mutators
  function addWeight(e) {
    e.preventDefault()
    const weight = Number(e.target.weight.value)
    if (!weight) return
    setState(s => ({ ...s, weights: [...s.weights, { date: todayISO(), weight }] }))
    e.target.reset()
  }

  function addPushups(e) {
    e.preventDefault()
    const count = Number(e.target.count.value)
    if (!count) return
    setState(s => ({ ...s, pushups: [...s.pushups, { date: todayISO(), count }] }))
    e.target.reset()
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
    }
    setState(demo)
  }

  function clearAll() {
    if (!confirm("Clear all saved data?")) return
    setState({ weights: [], pushups: [], rides: [] })
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

        {/* Journey Summary */}
        <div style={{...card, marginBottom:16}}>
          <div style={grid}>
            <div style={stat}>
              <div style={label}>Starting Weight</div>
              <div style={big}>{startingWeight}</div>
            </div>
            <div style={stat}>
              <div style={label}>Current Weight</div>
              <div style={big}>{currentWeight}</div>
            </div>
            <div style={stat}>
              <div style={label}>Best Pushups in a Day</div>
              <div style={big}>{bestPushupsDay}</div>
            </div>
            <div style={stat}>
              <div style={label}>Pushups Today</div>
              <div style={big}>{todaysPushups}</div>
            </div>
          </div>
        </div>

        {/* Daily Summary */}
        <div style={{...card, marginBottom:16}}>
          <div style={{display:"flex", justifyContent:"space-between", alignItems:"center"}}>
            <div style={{fontWeight:700}}>Daily Summary</div>
            <div style={{opacity:.75}}>{formatDate(todayISO())}</div>
          </div>
          <div style={{marginTop:8, display:"grid", gap:12, gridTemplateColumns:"repeat(auto-fit, minmax(240px, 1fr))"}}>
            <div style={{background:"#0f172a", border:"1px solid #1f2937", borderRadius:12, padding:12}}>
              <div style={label}>Pushups</div>
              <div style={{fontSize:22, fontWeight:700}}>{todaysPushups}</div>
              <form onSubmit={addPushups} style={{marginTop:10, display:"grid", gap:8}}>
                <input name="count" type="number" min="1" placeholder="Add pushups" style={input}/>
                <button style={btn}>Add</button>
              </form>
            </div>

            <div style={{background:"#0f172a", border:"1px solid #1f2937", borderRadius:12, padding:12}}>
              <div style={label}>Today’s Weight</div>
              <form onSubmit={addWeight} style={{marginTop:10, display:"grid", gap:8}}>
                <input name="weight" type="number" step="0.1" placeholder="Enter weight" style={input}/>
                <button style={btn}>Save</button>
              </form>
            </div>

            <div style={{background:"#0f172a", border:"1px solid #1f2937", borderRadius:12, padding:12}}>
              <div style={label}>Peloton Ride</div>
              <form onSubmit={addRide} style={{marginTop:10, display:"grid", gap:8}}>
                <input name="title" placeholder="Ride title" style={input}/>
                <div style={row}>
                  <input name="minutes" type="number" placeholder="Minutes" style={{...input, flex:"1 1 160px"}}/>
                  <input name="output" type="number" placeholder="Output" style={{...input, flex:"1 1 160px"}}/>
                  <input name="date" type="date" defaultValue={todayISO()} style={{...input, flex:"1 1 160px"}}/>
                </div>
                <button style={btn}>Log Ride</button>
              </form>
            </div>
          </div>
        </div>

        {/* History */}
        <div style={{...card}}>
          <div style={{fontWeight:700, marginBottom:8}}>History</div>
          <div style={{display:"grid", gap:16, gridTemplateColumns:"repeat(auto-fit, minmax(260px, 1fr))"}}>
            <div>
              <div style={{opacity:.8, marginBottom:6}}>Pushups</div>
              <table style={table}>
                <thead>
                  <tr><th style={thtd}>Date</th><th style={thtd}>Count</th></tr>
                </thead>
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
                <thead>
                  <tr><th style={thtd}>Date</th><th style={thtd}>Weight</th></tr>
                </thead>
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
                <thead>
                  <tr><th style={thtd}>Date</th><th style={thtd}>Ride</th><th style={thtd}>Min</th><th style={thtd}>Output</th></tr>
                </thead>
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

        <div style={{opacity:.6, fontSize:12, marginTop:12}}>Data is saved to your device only (localStorage). No account required.</div>
      </div>
    </div>
  )
}

    </div>
  )
}
