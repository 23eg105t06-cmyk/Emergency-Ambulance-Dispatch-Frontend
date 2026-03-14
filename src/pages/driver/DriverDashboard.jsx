import { useEffect, useState, useRef } from 'react'
import { useAuth } from '../../context/AuthContext'
import { bookingService } from '../../services/bookingService'
import { connectSocket, subscribeToDriverBookings } from '../../services/socket'
import Sidebar from '../../components/Navbar/Sidebar'
import MapView from '../../components/MapView/MapView'

const TIMEOUT_SECS = 60

export default function DriverDashboard() {
  const { user } = useAuth()
  const [status, setStatus] = useState('OFFLINE')
  const [incomingRequest, setIncomingRequest] = useState(null)
  const [activeBooking, setActiveBooking] = useState(null)
  const [bookingHistory, setBookingHistory] = useState([])
  const [driverLoc, setDriverLoc] = useState(null)
  const [countdown, setCountdown] = useState(0)
  const [accepting, setAccepting] = useState(false)
  const countdownRef = useRef(null)
  const locationRef = useRef(null)
  const clientRef = useRef(null)

  useEffect(() => {
    fetchDriverData()
    startLocationTracking()
    const client = connectSocket((stomp) => {
      clientRef.current = stomp
      subscribeToDriverBookings(user.driverId, (booking) => {
        if (['SEARCHING'].includes(booking.status)) {
          setIncomingRequest(booking)
          startCountdown()
        }
      })
    })
    return () => {
      client?.deactivate()
      clearInterval(locationRef.current)
      clearInterval(countdownRef.current)
    }
  }, [user.driverId])

  const fetchDriverData = async () => {
    try {
      const { data } = await bookingService.getByDriver(user.driverId)
      const active = data.find(b => ['ACCEPTED','DISPATCHED','PICKED_UP'].includes(b.status))
      setActiveBooking(active || null)
      setBookingHistory(data.filter(b => ['COMPLETED','CANCELLED'].includes(b.status)))
    } catch (err) { console.error(err) }
  }

  const startLocationTracking = () => {
    navigator.geolocation.getCurrentPosition((pos) => {
      setDriverLoc({ lat: pos.coords.latitude, lng: pos.coords.longitude })
    })
    locationRef.current = setInterval(() => {
      navigator.geolocation.getCurrentPosition(async (pos) => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude }
        setDriverLoc(loc)
        if (user.driverId && status === 'AVAILABLE') {
          try {
            await bookingService.updateLocation(user.driverId, loc.lat, loc.lng)
          } catch {}
        }
      })
    }, 3000)
  }

  const startCountdown = () => {
    setCountdown(TIMEOUT_SECS)
    clearInterval(countdownRef.current)
    countdownRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownRef.current)
          setIncomingRequest(null)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  const toggleStatus = async () => {
    const newStatus = status === 'AVAILABLE' ? 'OFFLINE' : 'AVAILABLE'
    try {
      await bookingService.updateDriverStatus(user.driverId, newStatus)
      setStatus(newStatus)
    } catch (err) { console.error(err) }
  }

  const acceptBooking = async () => {
    if (!incomingRequest) return
    setAccepting(true)
    try {
      const { data } = await bookingService.acceptBooking(incomingRequest.id, user.driverId)
      clearInterval(countdownRef.current)
      setIncomingRequest(null)
      setActiveBooking(data)
      setStatus('BUSY')
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to accept booking')
    } finally {
      setAccepting(false)
    }
  }

  const declineBooking = () => {
    clearInterval(countdownRef.current)
    setIncomingRequest(null)
    setCountdown(0)
  }

  const updateBookingStatus = async (newStatus) => {
    if (!activeBooking) return
    try {
      const { data } = await bookingService.updateStatus(activeBooking.id, newStatus)
      if (newStatus === 'COMPLETED') {
        setActiveBooking(null)
        setStatus('AVAILABLE')
        fetchDriverData()
      } else {
        setActiveBooking(data)
      }
    } catch (err) { console.error(err) }
  }

  const countdownPct = (countdown / TIMEOUT_SECS) * 100
  const countdownColor = countdown > 30 ? 'var(--green)' : countdown > 10 ? 'var(--amber)' : 'var(--red)'

  return (
    <div className="page-layout">
      <Sidebar />
      <main className="main-content">
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:32 }}>
          <div>
            <h1 style={{ fontSize:28, fontWeight:800, marginBottom:4 }}>Driver Dashboard</h1>
            <p style={{ color:'var(--gray)' }}>Welcome back, {user.name}</p>
          </div>
          <button
            className={`btn ${status === 'AVAILABLE' ? 'btn-green' : 'btn-outline'}`}
            onClick={toggleStatus}
            style={{ fontWeight:700 }}>
            {status === 'AVAILABLE' ? '🟢 Go Offline' : '⚫ Go Online'}
          </button>
        </div>

        <div className="stat-grid" style={{ marginBottom:24 }}>
          <div className="stat-card">
            <div className="stat-icon">📡</div>
            <div className="stat-value" style={{ color: status === 'AVAILABLE' ? 'var(--green)' : status === 'BUSY' ? 'var(--amber)' : 'var(--gray)' }}>
              {status}
            </div>
            <div className="stat-label">Current Status</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">✅</div>
            <div className="stat-value">{bookingHistory.filter(b=>b.status==='COMPLETED').length}</div>
            <div className="stat-label">Completed Rides</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">📍</div>
            <div className="stat-value" style={{ fontSize:16, marginTop:8 }}>
              {driverLoc ? `${driverLoc.lat.toFixed(3)}, ${driverLoc.lng.toFixed(3)}` : 'Unknown'}
            </div>
            <div className="stat-label">Current Location</div>
          </div>
        </div>

        {/* Incoming Request Alert */}
        {incomingRequest && (
          <div style={{ background:'var(--dark-2)', border:'2px solid var(--red)',
            borderRadius:16, padding:24, marginBottom:24, animation:'pulse 1s infinite' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:20 }}>
              <div>
                <div style={{ fontSize:12, color:'var(--red)', fontWeight:700, textTransform:'uppercase',
                  letterSpacing:'1px', marginBottom:8 }}>🚨 Incoming Emergency</div>
                <h2 style={{ fontSize:22, fontWeight:800 }}>New Booking Request</h2>
              </div>
              {/* Countdown ring */}
              <div style={{ position:'relative', width:72, height:72 }}>
                <svg width="72" height="72" style={{ transform:'rotate(-90deg)' }}>
                  <circle cx="36" cy="36" r="32" fill="none" stroke="var(--dark-4)" strokeWidth="4" />
                  <circle cx="36" cy="36" r="32" fill="none" stroke={countdownColor} strokeWidth="4"
                    strokeDasharray={`${2 * Math.PI * 32}`}
                    strokeDashoffset={`${2 * Math.PI * 32 * (1 - countdownPct / 100)}`}
                    style={{ transition:'stroke-dashoffset 1s linear, stroke 0.3s' }} />
                </svg>
                <div style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)',
                  fontFamily:'var(--font-mono)', fontWeight:700, fontSize:18, color:countdownColor }}>
                  {countdown}
                </div>
              </div>
            </div>

            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:20 }}>
              <InfoBox icon="👤" label="Patient" value={incomingRequest.userName} />
              <InfoBox icon="📍" label="Pickup" value={incomingRequest.pickupAddress || `${incomingRequest.pickupLat?.toFixed(4)}, ${incomingRequest.pickupLng?.toFixed(4)}`} />
              {incomingRequest.destinationAddress && <InfoBox icon="🏥" label="Destination" value={incomingRequest.destinationAddress} />}
            </div>

            <div style={{ display:'flex', gap:12 }}>
              <button className="btn btn-primary" onClick={acceptBooking} disabled={accepting}
                style={{ flex:1, justifyContent:'center', padding:'14px', fontSize:16, fontWeight:700 }}>
                {accepting ? '...' : '✅ Accept Request'}
              </button>
              <button className="btn btn-outline" onClick={declineBooking}
                style={{ flex:1, justifyContent:'center', padding:'14px', fontSize:16 }}>
                ❌ Decline
              </button>
            </div>
          </div>
        )}

        {/* Active Booking */}
        {activeBooking && (
          <div className="card" style={{ marginBottom:24, border:'1px solid var(--green)' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
              <h2 style={{ fontWeight:800, fontSize:20 }}>🟢 Active Booking</h2>
              <span className="badge badge-green">{activeBooking.status}</span>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:20 }}>
              <InfoBox icon="👤" label="Patient" value={activeBooking.userName} />
              <InfoBox icon="📍" label="Pickup" value={activeBooking.pickupAddress || 'Location set'} />
              {activeBooking.destinationAddress && <InfoBox icon="🏥" label="Destination" value={activeBooking.destinationAddress} />}
            </div>

            <div className="map-container" style={{ height:280, marginBottom:20 }}>
              <MapView
                pickupLat={activeBooking.pickupLat}
                pickupLng={activeBooking.pickupLng}
                driverLat={driverLoc?.lat}
                driverLng={driverLoc?.lng}
                showRoute
              />
            </div>

            <div style={{ display:'flex', gap:12, flexWrap:'wrap' }}>
              {activeBooking.status === 'ACCEPTED' && (
                <button className="btn btn-primary" onClick={() => updateBookingStatus('DISPATCHED')} style={{ flex:1, justifyContent:'center' }}>
                  🚑 Start Driving
                </button>
              )}
              {activeBooking.status === 'DISPATCHED' && (
                <button className="btn btn-amber" onClick={() => updateBookingStatus('PICKED_UP')} style={{ flex:1, justifyContent:'center' }}>
                  👤 Patient Picked Up
                </button>
              )}
              {activeBooking.status === 'PICKED_UP' && (
                <button className="btn btn-green" onClick={() => updateBookingStatus('COMPLETED')} style={{ flex:1, justifyContent:'center' }}>
                  ✅ Complete Ride
                </button>
              )}
            </div>
          </div>
        )}

        {!incomingRequest && !activeBooking && status === 'OFFLINE' && (
          <div className="card" style={{ textAlign:'center', padding:48, marginBottom:24 }}>
            <div style={{ fontSize:48, marginBottom:16 }}>⚫</div>
            <h3 style={{ fontWeight:700, marginBottom:8 }}>You're Offline</h3>
            <p style={{ color:'var(--gray)', marginBottom:20 }}>Go online to start receiving emergency requests</p>
            <button className="btn btn-green" onClick={toggleStatus} style={{ margin:'0 auto' }}>
              🟢 Go Online
            </button>
          </div>
        )}

        {!incomingRequest && !activeBooking && status === 'AVAILABLE' && (
          <div className="card" style={{ textAlign:'center', padding:48, marginBottom:24 }}>
            <div style={{ fontSize:48, marginBottom:16 }}>📡</div>
            <h3 style={{ fontWeight:700, marginBottom:8 }}>Waiting for Requests</h3>
            <p style={{ color:'var(--gray)' }}>You'll receive emergency alerts here. Stay close to your device.</p>
          </div>
        )}

        {bookingHistory.length > 0 && (
          <div>
            <h2 className="section-title">Ride History</h2>
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>ID</th><th>Patient</th><th>Pickup</th><th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {bookingHistory.map(b => (
                    <tr key={b.id}>
                      <td style={{ fontFamily:'var(--font-mono)', color:'var(--gray)' }}>#{String(b.id).padStart(6,'0')}</td>
                      <td>{b.userName}</td>
                      <td>{b.pickupAddress || 'N/A'}</td>
                      <td><span className={`badge ${b.status==='COMPLETED' ? 'badge-green' : 'badge-red'}`}>{b.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

function InfoBox({ icon, label, value }) {
  return (
    <div style={{ background:'var(--dark-3)', borderRadius:10, padding:14 }}>
      <div style={{ fontSize:11, color:'var(--gray)', marginBottom:4 }}>{icon} {label}</div>
      <div style={{ fontSize:14, fontWeight:500 }}>{value || '—'}</div>
    </div>
  )
}
