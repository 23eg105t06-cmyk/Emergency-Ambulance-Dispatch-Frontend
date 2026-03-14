import { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { bookingService } from '../../services/bookingService'
import { connectSocket, subscribeToUserBookings, subscribeToBookingLocation, subscribeToUserTimeout } from '../../services/socket'
import Sidebar from '../../components/Navbar/Sidebar'
import MapView from '../../components/MapView/MapView'

const STATUS_STEPS = [
  { key: 'SEARCHING', label: 'Finding Driver', icon: '🔍' },
  { key: 'ACCEPTED', label: 'Driver Accepted', icon: '✅' },
  { key: 'DISPATCHED', label: 'En Route to You', icon: '🚑' },
  { key: 'PICKED_UP', label: 'Heading to Hospital', icon: '🏥' },
  { key: 'COMPLETED', label: 'Completed', icon: '🎉' },
]

export default function TrackAmbulance() {
  const { bookingId } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [booking, setBooking] = useState(null)
  const [driverLoc, setDriverLoc] = useState(null)
  const [timeoutMsg, setTimeoutMsg] = useState('')
  const [loading, setLoading] = useState(true)
  const clientRef = useRef(null)

  useEffect(() => {
    fetchBooking()
    const client = connectSocket((stomp) => {
      clientRef.current = stomp
      subscribeToUserBookings(user.userId, (updated) => {
        if (updated.id === parseInt(bookingId)) {
          setBooking(updated)
          if (updated.driverLat && updated.driverLng)
            setDriverLoc({ lat: updated.driverLat, lng: updated.driverLng })
        }
      })
      subscribeToBookingLocation(bookingId, (loc) => {
        setDriverLoc({ lat: loc.lat, lng: loc.lng })
      })
      subscribeToUserTimeout(user.userId, () => {
        setTimeoutMsg('Previous driver did not respond. Searching for another driver...')
        setTimeout(() => setTimeoutMsg(''), 5000)
      })
    })
    return () => client?.deactivate()
  }, [bookingId, user.userId])

  const fetchBooking = async () => {
    try {
      const { data } = await bookingService.getById(bookingId)
      setBooking(data)
      if (data.driverLat && data.driverLng) setDriverLoc({ lat: data.driverLat, lng: data.driverLng })
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const currentStep = booking ? STATUS_STEPS.findIndex(s => s.key === booking.status) : 0

  if (loading) return (
    <div className="page-layout">
      <Sidebar />
      <main className="main-content" style={{ display:'flex', alignItems:'center', justifyContent:'center' }}>
        <div className="spinner" />
      </main>
    </div>
  )

  return (
    <div className="page-layout">
      <Sidebar />
      <main className="main-content">
        <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:24 }}>
          <button onClick={() => navigate('/user/dashboard')}
            style={{ background:'none', border:'none', color:'var(--gray)', cursor:'pointer', fontSize:14 }}>
            ← Back
          </button>
          <h1 style={{ fontSize:24, fontWeight:800 }}>
            🚑 Booking #{String(bookingId).padStart(6, '0')}
          </h1>
        </div>

        {timeoutMsg && (
          <div className="error-msg" style={{ marginBottom:16 }}>
            ⏱️ {timeoutMsg}
          </div>
        )}

        {/* Progress Steps */}
        <div className="card" style={{ marginBottom:24 }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', position:'relative' }}>
            <div style={{ position:'absolute', top:'50%', left:0, right:0, height:2,
              background:'var(--dark-4)', transform:'translateY(-50%)', zIndex:0 }} />
            <div style={{ position:'absolute', top:'50%', left:0, height:2, zIndex:1,
              background:'var(--red)', transform:'translateY(-50%)',
              width: `${Math.min(100, (currentStep / (STATUS_STEPS.length - 1)) * 100)}%`,
              transition:'width 0.5s ease' }} />
            {STATUS_STEPS.map((step, idx) => (
              <div key={step.key} style={{ display:'flex', flexDirection:'column', alignItems:'center',
                gap:8, position:'relative', zIndex:2 }}>
                <div style={{ width:40, height:40, borderRadius:'50%', display:'flex', alignItems:'center',
                  justifyContent:'center', fontSize:18, transition:'all 0.3s',
                  background: idx <= currentStep ? 'var(--red)' : 'var(--dark-3)',
                  border: `2px solid ${idx <= currentStep ? 'var(--red)' : 'var(--dark-4)'}` }}>
                  {step.icon}
                </div>
                <div style={{ fontSize:11, fontWeight:600, color: idx <= currentStep ? 'var(--white)' : 'var(--gray)',
                  textAlign:'center', maxWidth:80 }}>
                  {step.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 350px', gap:24 }}>
          {/* Map */}
          <div className="map-container">
            <MapView
              pickupLat={booking?.pickupLat}
              pickupLng={booking?.pickupLng}
              driverLat={driverLoc?.lat}
              driverLng={driverLoc?.lng}
              showRoute={!!driverLoc}
            />
          </div>

          {/* Info Panel */}
          <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
            <div className="card">
              <h3 style={{ fontWeight:700, marginBottom:16 }}>Booking Details</h3>
              <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                <InfoRow icon="📍" label="Pickup" value={booking?.pickupAddress || 'Location set'} />
                <InfoRow icon="🏥" label="Destination" value={booking?.destinationAddress || 'Not specified'} />
                {booking?.driverName && <InfoRow icon="👤" label="Driver" value={booking.driverName} />}
                {booking?.vehicleNumber && <InfoRow icon="🚑" label="Vehicle" value={booking.vehicleNumber} />}
              </div>
            </div>

            {booking?.status === 'SEARCHING' && (
              <div className="card" style={{ textAlign:'center' }}>
                <div style={{ fontSize:40, marginBottom:12 }}>🔍</div>
                <div style={{ fontWeight:700, marginBottom:8 }}>Searching for Driver</div>
                <div style={{ color:'var(--gray)', fontSize:13, marginBottom:16 }}>
                  Driver has 60 seconds to accept. If not, we'll find another.
                </div>
                <div style={{ display:'flex', justifyContent:'center' }}>
                  <div className="spinner" />
                </div>
              </div>
            )}

            {driverLoc && (
              <div className="card">
                <h3 style={{ fontWeight:700, marginBottom:12 }}>Live Driver Location</h3>
                <div style={{ fontFamily:'var(--font-mono)', fontSize:13, color:'var(--green)' }}>
                  <div>LAT: {driverLoc.lat?.toFixed(6)}</div>
                  <div>LNG: {driverLoc.lng?.toFixed(6)}</div>
                </div>
                <div style={{ fontSize:11, color:'var(--gray)', marginTop:8 }}>
                  🔴 Live • Updates every 3s
                </div>
              </div>
            )}

            {booking?.status === 'COMPLETED' && (
              <div className="card" style={{ textAlign:'center', border:'1px solid rgba(46,196,182,0.3)' }}>
                <div style={{ fontSize:40, marginBottom:8 }}>🎉</div>
                <div style={{ fontWeight:700, color:'var(--green)', marginBottom:8 }}>Booking Completed</div>
                <button className="btn btn-outline" onClick={() => navigate('/user/dashboard')} style={{ width:'100%', justifyContent:'center' }}>
                  Back to Dashboard
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

function InfoRow({ icon, label, value }) {
  return (
    <div style={{ display:'flex', gap:12, alignItems:'flex-start' }}>
      <span style={{ fontSize:16 }}>{icon}</span>
      <div>
        <div style={{ fontSize:11, color:'var(--gray)', marginBottom:2 }}>{label}</div>
        <div style={{ fontSize:14 }}>{value}</div>
      </div>
    </div>
  )
}
