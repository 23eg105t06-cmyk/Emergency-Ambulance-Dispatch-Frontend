import { useNavigate } from 'react-router-dom'

const STATUS_MAP = {
  PENDING: { label: 'Pending', cls: 'badge-gray', icon: '⏳' },
  SEARCHING: { label: 'Searching Driver', cls: 'badge-amber', icon: '🔍' },
  ACCEPTED: { label: 'Driver Accepted', cls: 'badge-blue', icon: '✅' },
  DISPATCHED: { label: 'En Route', cls: 'badge-blue', icon: '🚑' },
  PICKED_UP: { label: 'Patient Picked Up', cls: 'badge-green', icon: '🏥' },
  COMPLETED: { label: 'Completed', cls: 'badge-green', icon: '✔️' },
  CANCELLED: { label: 'Cancelled', cls: 'badge-red', icon: '❌' },
}

export default function BookingCard({ booking, showTrack }) {
  const navigate = useNavigate()
  const s = STATUS_MAP[booking.status] || STATUS_MAP.PENDING
  const isActive = ['SEARCHING', 'ACCEPTED', 'DISPATCHED', 'PICKED_UP'].includes(booking.status)

  return (
    <div className="card" style={{ marginBottom: 16, position: 'relative' }}>
      {isActive && (
        <div style={{ position:'absolute', top:16, right:16, width:10, height:10,
          borderRadius:'50%', background:'var(--red)', animation:'pulse 1.5s infinite' }} />
      )}

      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:16 }}>
        <div>
          <div style={{ fontFamily:'var(--font-mono)', fontSize:12, color:'var(--gray)', marginBottom:4 }}>
            #{String(booking.id).padStart(6,'0')}
          </div>
          <span className={`badge ${s.cls}`}>{s.icon} {s.label}</span>
        </div>
        <div style={{ fontSize:12, color:'var(--gray)' }}>
          {booking.createdTime ? new Date(booking.createdTime).toLocaleString() : '—'}
        </div>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:16 }}>
        <div>
          <div style={{ fontSize:11, color:'var(--gray)', textTransform:'uppercase', letterSpacing:'0.5px', marginBottom:4 }}>Pickup</div>
          <div style={{ fontSize:14 }}>{booking.pickupAddress || `${booking.pickupLat?.toFixed(4)}, ${booking.pickupLng?.toFixed(4)}`}</div>
        </div>
        <div>
          <div style={{ fontSize:11, color:'var(--gray)', textTransform:'uppercase', letterSpacing:'0.5px', marginBottom:4 }}>Destination</div>
          <div style={{ fontSize:14 }}>{booking.destinationAddress || '—'}</div>
        </div>
        {booking.driverName && (
          <div>
            <div style={{ fontSize:11, color:'var(--gray)', textTransform:'uppercase', letterSpacing:'0.5px', marginBottom:4 }}>Driver</div>
            <div style={{ fontSize:14 }}>{booking.driverName}</div>
          </div>
        )}
        {booking.vehicleNumber && (
          <div>
            <div style={{ fontSize:11, color:'var(--gray)', textTransform:'uppercase', letterSpacing:'0.5px', marginBottom:4 }}>Vehicle</div>
            <div style={{ fontSize:14, fontFamily:'var(--font-mono)' }}>{booking.vehicleNumber}</div>
          </div>
        )}
      </div>

      {showTrack && isActive && (
        <button className="btn btn-primary" style={{ width:'100%', justifyContent:'center' }}
          onClick={() => navigate(`/user/track/${booking.id}`)}>
          🗺️ Track Ambulance
        </button>
      )}
    </div>
  )
}
