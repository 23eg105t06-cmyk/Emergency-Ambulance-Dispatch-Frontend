import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { bookingService } from '../../services/bookingService'
import { connectSocket, subscribeToUserBookings, subscribeToUserTimeout } from '../../services/socket'
import Sidebar from '../../components/Navbar/Sidebar'
import BookingCard from '../../components/BookingCard/BookingCard'

export default function UserDashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchBookings()

    const client = connectSocket((stompClient) => {
      subscribeToUserBookings(user.userId, (updated) => {
        setBookings(prev => {
          const idx = prev.findIndex(b => b.id === updated.id)
          if (idx >= 0) { const copy = [...prev]; copy[idx] = updated; return copy }
          return [updated, ...prev]
        })
      })
      subscribeToUserTimeout(user.userId, () => {
        // Will be shown in tracking page
      })
    })

    return () => client?.deactivate()
  }, [user.userId])

  const fetchBookings = async () => {
    try {
      const { data } = await bookingService.getByUser(user.userId)
      setBookings(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const active = bookings.filter(b => ['SEARCHING','ACCEPTED','DISPATCHED','PICKED_UP'].includes(b.status))
  const history = bookings.filter(b => ['COMPLETED','CANCELLED'].includes(b.status))

  return (
    <div className="page-layout">
      <Sidebar />
      <main className="main-content">
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:32 }}>
          <div>
            <h1 style={{ fontSize:28, fontWeight:800, marginBottom:4 }}>Welcome, {user.name} 👋</h1>
            <p style={{ color:'var(--gray)' }}>Your emergency dashboard</p>
          </div>
          <button className="btn btn-primary" onClick={() => navigate('/user/book')}>
            🚑 Book Ambulance
          </button>
        </div>

        <div className="stat-grid" style={{ marginBottom:32 }}>
          <div className="stat-card">
            <div className="stat-icon">📋</div>
            <div className="stat-value">{bookings.length}</div>
            <div className="stat-label">Total Bookings</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🔴</div>
            <div className="stat-value">{active.length}</div>
            <div className="stat-label">Active Bookings</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">✅</div>
            <div className="stat-value">{bookings.filter(b=>b.status==='COMPLETED').length}</div>
            <div className="stat-label">Completed</div>
          </div>
        </div>

        {active.length > 0 && (
          <div style={{ marginBottom:32 }}>
            <h2 className="section-title">🔴 Active Bookings</h2>
            {active.map(b => <BookingCard key={b.id} booking={b} showTrack />)}
          </div>
        )}

        <div>
          <h2 className="section-title">History</h2>
          {loading ? (
            <div style={{ display:'flex', justifyContent:'center', padding:40 }}><div className="spinner" /></div>
          ) : history.length === 0 ? (
            <div className="card" style={{ textAlign:'center', padding:48, color:'var(--gray)' }}>
              <div style={{ fontSize:48, marginBottom:16 }}>📋</div>
              <p>No past bookings</p>
            </div>
          ) : (
            history.map(b => <BookingCard key={b.id} booking={b} />)
          )}
        </div>
      </main>
    </div>
  )
}
