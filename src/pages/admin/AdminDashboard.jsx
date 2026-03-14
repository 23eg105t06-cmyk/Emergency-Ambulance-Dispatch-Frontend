import { useEffect, useState } from 'react'
import api from '../../services/api'
import Sidebar from '../../components/Navbar/Sidebar'

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([api.get('/admin/stats'), api.get('/bookings')])
      .then(([s, b]) => { setStats(s.data); setBookings(b.data.slice(0, 10)) })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const statusClass = (s) => ({
    SEARCHING: 'badge-amber', ACCEPTED: 'badge-blue', DISPATCHED: 'badge-blue',
    COMPLETED: 'badge-green', CANCELLED: 'badge-red', PICKED_UP: 'badge-green',
    PENDING: 'badge-gray'
  })[s] || 'badge-gray'

  return (
    <div className="page-layout">
      <Sidebar />
      <main className="main-content">
        <h1 style={{ fontSize:28, fontWeight:800, marginBottom:8 }}>Admin Dashboard</h1>
        <p style={{ color:'var(--gray)', marginBottom:32 }}>System overview & control center</p>

        {loading ? (
          <div style={{ display:'flex', justifyContent:'center', padding:80 }}><div className="spinner" /></div>
        ) : (
          <>
            <div className="stat-grid" style={{ marginBottom:32 }}>
              {[
                { icon:'📋', label:'Total Bookings', value: stats?.totalBookings ?? 0 },
                { icon:'🟢', label:'Active Bookings', value: stats?.activeBookings ?? 0 },
                { icon:'🚑', label:'Total Drivers', value: stats?.totalDrivers ?? 0 },
                { icon:'✅', label:'Available Drivers', value: stats?.availableDrivers ?? 0 },
              ].map(s => (
                <div key={s.label} className="stat-card">
                  <div className="stat-icon">{s.icon}</div>
                  <div className="stat-value">{s.value}</div>
                  <div className="stat-label">{s.label}</div>
                </div>
              ))}
            </div>

            <h2 className="section-title">Recent Bookings</h2>
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>ID</th><th>Patient</th><th>Driver</th><th>Pickup</th><th>Status</th><th>Time</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map(b => (
                    <tr key={b.id}>
                      <td style={{ fontFamily:'var(--font-mono)', color:'var(--gray)' }}>#{String(b.id).padStart(6,'0')}</td>
                      <td>{b.userName}</td>
                      <td>{b.driverName || '—'}</td>
                      <td style={{ maxWidth:180, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                        {b.pickupAddress || `${b.pickupLat?.toFixed(4)}, ${b.pickupLng?.toFixed(4)}`}
                      </td>
                      <td><span className={`badge ${statusClass(b.status)}`}>{b.status}</span></td>
                      <td style={{ color:'var(--gray)', fontSize:13 }}>
                        {b.createdTime ? new Date(b.createdTime).toLocaleString() : '—'}
                      </td>
                    </tr>
                  ))}
                  {bookings.length === 0 && (
                    <tr><td colSpan={6} style={{ textAlign:'center', color:'var(--gray)', padding:40 }}>No bookings yet</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </main>
    </div>
  )
}
