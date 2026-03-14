import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const userNav = [
  { icon: '🏠', label: 'Dashboard', path: '/user/dashboard' },
  { icon: '🚑', label: 'Book Ambulance', path: '/user/book' },
]

const driverNav = [
  { icon: '🏠', label: 'Dashboard', path: '/driver/dashboard' },
]

const adminNav = [
  { icon: '📊', label: 'Dashboard', path: '/admin/dashboard' },
  { icon: '🚗', label: 'Drivers', path: '/admin/drivers' },
  { icon: '📋', label: 'Bookings', path: '/admin/bookings' },
]

export default function Sidebar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const navItems = user?.role === 'USER' ? userNav
    : user?.role === 'DRIVER' ? driverNav
    : adminNav

  const roleBadge = {
    USER: { label: 'Patient', color: '#4361ee' },
    DRIVER: { label: 'Driver', color: '#2ec4b6' },
    ADMIN: { label: 'Admin', color: '#E63946' },
  }[user?.role] || {}

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-icon">🚑</div>
        <div>
          <div className="logo-text">AmbulanceX</div>
          <div className="logo-sub">Emergency Dispatch</div>
        </div>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <button
            key={item.path}
            className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
            onClick={() => navigate(item.path)}
          >
            <span className="icon">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--white)', marginBottom: 4 }}>
            {user?.name}
          </div>
          <div style={{ fontSize: 12, color: 'var(--gray)', marginBottom: 8 }}>{user?.email}</div>
          <span className="badge" style={{ background: `${roleBadge.color}22`, color: roleBadge.color }}>
            {roleBadge.label}
          </span>
        </div>
        <button className="btn btn-outline" style={{ width: '100%', justifyContent: 'center' }}
          onClick={() => { logout(); navigate('/login') }}>
          🚪 Logout
        </button>
      </div>
    </aside>
  )
}