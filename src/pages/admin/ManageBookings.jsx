import { useEffect, useState } from 'react'
import api from '../../services/api'
import Sidebar from '../../components/Navbar/Sidebar'

export default function ManageBookings() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('ALL')

  useEffect(() => {
    api.get('/bookings').then(r => setBookings(r.data)).catch(console.error).finally(() => setLoading(false))
  }, [])

  const statusClass = (s) => ({
    SEARCHING:'badge-amber', ACCEPTED:'badge-blue', DISPATCHED:'badge-blue',
    COMPLETED:'badge-green', CANCELLED:'badge-red', PICKED_UP:'badge-green', PENDING:'badge-gray'
  })[s] || 'badge-gray'

  const statuses = ['ALL','SEARCHING','ACCEPTED','DISPATCHED','PICKED_UP','COMPLETED','CANCELLED']
  const filtered = filter === 'ALL' ? bookings : bookings.filter(b => b.status === filter)

  return (
    <div className="page-layout">
      <Sidebar />
      <main className="main-content">
        <h1 style={{ fontSize:28, fontWeight:800, marginBottom:8 }}>Manage Bookings</h1>
        <p style={{ color:'var(--gray)', marginBottom:24 }}>All emergency booking requests</p>

        <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:24 }}>
          {statuses.map(s => (
            <button key={s} className={`btn ${filter===s ? 'btn-primary' : 'btn-outline'}`}
              style={{ padding:'8px 16px', fontSize:13 }} onClick={() => setFilter(s)}>
              {s}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ display:'flex', justifyContent:'center', padding:80 }}><div className="spinner" /></div>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr><th>ID</th><th>Patient</th><th>Driver</th><th>Pickup</th><th>Status</th><th>Created</th></tr>
              </thead>
              <tbody>
                {filtered.map(b => (
                  <tr key={b.id}>
                    <td style={{ fontFamily:'var(--font-mono)', color:'var(--gray)' }}>#{String(b.id).padStart(6,'0')}</td>
                    <td>{b.userName}</td>
                    <td>{b.driverName || <span style={{ color:'var(--gray)' }}>Not assigned</span>}</td>
                    <td style={{ maxWidth:200, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                      {b.pickupAddress || `${b.pickupLat?.toFixed(4)}, ${b.pickupLng?.toFixed(4)}`}
                    </td>
                    <td><span className={`badge ${statusClass(b.status)}`}>{b.status}</span></td>
                    <td style={{ color:'var(--gray)', fontSize:13 }}>
                      {b.createdTime ? new Date(b.createdTime).toLocaleString() : '—'}
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={6} style={{ textAlign:'center', color:'var(--gray)', padding:40 }}>No bookings found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  )
}
