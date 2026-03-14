import { useEffect, useState } from 'react'
import api from '../../services/api'
import Sidebar from '../../components/Navbar/Sidebar'

export default function ManageDrivers() {
  const [drivers, setDrivers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/admin/drivers').then(r => setDrivers(r.data)).catch(console.error).finally(() => setLoading(false))
  }, [])

  const statusClass = (s) => ({ AVAILABLE:'badge-green', BUSY:'badge-amber', OFFLINE:'badge-gray' })[s] || 'badge-gray'

  return (
    <div className="page-layout">
      <Sidebar />
      <main className="main-content">
        <h1 style={{ fontSize:28, fontWeight:800, marginBottom:8 }}>Manage Drivers</h1>
        <p style={{ color:'var(--gray)', marginBottom:32 }}>All registered ambulance drivers</p>

        {loading ? (
          <div style={{ display:'flex', justifyContent:'center', padding:80 }}><div className="spinner" /></div>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr><th>ID</th><th>Name</th><th>Email</th><th>Status</th><th>Location</th><th>Ambulance</th></tr>
              </thead>
              <tbody>
                {drivers.map(d => (
                  <tr key={d.id}>
                    <td style={{ fontFamily:'var(--font-mono)', color:'var(--gray)' }}>#{d.id}</td>
                    <td>{d.user?.name || '—'}</td>
                    <td style={{ color:'var(--gray)' }}>{d.user?.email || '—'}</td>
                    <td><span className={`badge ${statusClass(d.status)}`}>{d.status}</span></td>
                    <td style={{ fontFamily:'var(--font-mono)', fontSize:12, color:'var(--gray)' }}>
                      {d.currentLat ? `${d.currentLat.toFixed(4)}, ${d.currentLng.toFixed(4)}` : 'Unknown'}
                    </td>
                    <td>{d.ambulance?.vehicleNumber || <span style={{ color:'var(--gray)' }}>Not assigned</span>}</td>
                  </tr>
                ))}
                {drivers.length === 0 && (
                  <tr><td colSpan={6} style={{ textAlign:'center', color:'var(--gray)', padding:40 }}>No drivers registered</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  )
}
