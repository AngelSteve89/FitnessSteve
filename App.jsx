import React from 'react'

export default function App() {
  return (
    <div style={{minHeight:'100vh', background:'#0b1220', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', padding:24}}>
      <div style={{maxWidth:720, width:'100%'}}>
        <h1 style={{margin:0, fontSize:36}}>Fitness Journey Tracker</h1>
        <p style={{opacity:0.9}}>
          Your app is live. This starter is set up as a Progressive Web App (PWA) and ready for Vercel.
          Replace this screen with your real components when you’re ready.
        </p>
        <ul>
          <li>Install on phone: Share / Add to Home Screen</li>
          <li>Works offline for cached pages</li>
        </ul>
      </div>
    </div>
  )
}
