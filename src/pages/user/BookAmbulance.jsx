import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { bookingService } from '../../services/bookingService'
import Sidebar from '../../components/Navbar/Sidebar'

export default function BookAmbulance() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    pickupAddress: '',
    destinationAddress: '',
    pickupLat: 17.385,
    pickupLng: 78.4867,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [locating, setLocating] = useState(false)

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const useCurrentLocation = () => {
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setForm(f => ({ ...f, pickupLat: pos.coords.latitude, pickupLng: pos.coords.longitude,
          pickupAddress: `${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}` }))
        setLocating(false)
      },
      () => { setError('Location access denied. Please enter manually.'); setLocating(false) }
    )
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { data } = await bookingService.create({
        userId: user.userId,
        pickupLat: form.pickupLat,
        pickupLng: form.pickupLng,
        pickupAddress: form.pickupAddress,
        destinationAddress: form.destinationAddress,
      })
      navigate(`/user/track/${data.id}`)
    } catch (err) {
      setError(err.response?.data?.message || 'Booking failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page-layout">
      <Sidebar />
      <main className="main-content">
        <div style={{ maxWidth:560 }}>
          <button onClick={() => navigate('/user/dashboard')}
            style={{ background:'none', border:'none', color:'var(--gray)', cursor:'pointer', marginBottom:24, fontSize:14 }}>
            ← Back to Dashboard
          </button>

          <h1 style={{ fontSize:28, fontWeight:800, marginBottom:8 }}>🚑 Book Ambulance</h1>
          <p style={{ color:'var(--gray)', marginBottom:32 }}>Request emergency ambulance service</p>

          <div className="card">
            {error && <div className="error-msg">{error}</div>}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Pickup Location</label>
                <div style={{ display:'flex', gap:8 }}>
                  <input value={form.pickupAddress} onChange={set('pickupAddress')}
                    placeholder="Enter pickup address" required style={{ flex:1 }} />
                  <button type="button" className="btn btn-outline" onClick={useCurrentLocation}
                    disabled={locating} style={{ whiteSpace:'nowrap', padding:'12px 14px' }}>
                    {locating ? '...' : '📍 GPS'}
                  </button>
                </div>
              </div>

              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                <div className="form-group">
                  <label>Latitude</label>
                  <input type="number" step="any" value={form.pickupLat}
                    onChange={e => setForm(f => ({ ...f, pickupLat: parseFloat(e.target.value) }))} required />
                </div>
                <div className="form-group">
                  <label>Longitude</label>
                  <input type="number" step="any" value={form.pickupLng}
                    onChange={e => setForm(f => ({ ...f, pickupLng: parseFloat(e.target.value) }))} required />
                </div>
              </div>

              <div className="form-group">
                <label>Destination / Hospital (optional)</label>
                <input value={form.destinationAddress} onChange={set('destinationAddress')}
                  placeholder="Enter destination hospital or address" />
              </div>

              <div style={{ background:'rgba(230,57,70,0.08)', border:'1px solid rgba(230,57,70,0.2)',
                borderRadius:12, padding:16, marginBottom:24 }}>
                <div style={{ display:'flex', gap:12, alignItems:'flex-start' }}>
                  <span style={{ fontSize:24 }}>⚠️</span>
                  <div>
                    <div style={{ fontWeight:600, marginBottom:4 }}>Emergency Notice</div>
                    <div style={{ fontSize:13, color:'var(--gray)' }}>
                      This service is for medical emergencies only. False alarms may result in legal action.
                      The nearest available ambulance will be dispatched immediately.
                    </div>
                  </div>
                </div>
              </div>

              <button className="btn btn-primary" type="submit" disabled={loading}
                style={{ width:'100%', justifyContent:'center', padding:'16px 24px', fontSize:17, fontWeight:700 }}>
                {loading
                  ? <><span className="spinner" style={{ width:20, height:20, borderWidth:2 }} /> Dispatching...</>
                  : '🚨 Request Ambulance Now'}
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  )
}
