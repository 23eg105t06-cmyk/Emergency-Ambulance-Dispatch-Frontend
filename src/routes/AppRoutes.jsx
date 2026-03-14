import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Login from '../pages/Login'
import Register from '../pages/Register'
import UserDashboard from '../pages/user/UserDashboard'
import BookAmbulance from '../pages/user/BookAmbulance'
import TrackAmbulance from '../pages/user/TrackAmbulance'
import DriverDashboard from '../pages/driver/DriverDashboard'
import AdminDashboard from '../pages/admin/AdminDashboard'
import ManageDrivers from '../pages/admin/ManageDrivers'
import ManageBookings from '../pages/admin/ManageBookings'

function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        height: '100vh', background: '#0a0a0f'
      }}>
        <div style={{
          width: 40, height: 40, border: '3px solid #22223a',
          borderTopColor: '#E63946', borderRadius: '50%',
          animation: 'spin 0.8s linear infinite'
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  if (!user) return <Navigate to="/login" replace />
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/login" replace />
  return children
}

function RoleRedirect() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        height: '100vh', background: '#0a0a0f'
      }}>
        <div style={{
          width: 40, height: 40, border: '3px solid #22223a',
          borderTopColor: '#E63946', borderRadius: '50%',
          animation: 'spin 0.8s linear infinite'
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  if (!user) return <Navigate to="/login" replace />
  if (user.role === 'USER') return <Navigate to="/user/dashboard" replace />
  if (user.role === 'DRIVER') return <Navigate to="/driver/dashboard" replace />
  if (user.role === 'ADMIN') return <Navigate to="/admin/dashboard" replace />
  return <Navigate to="/login" replace />
}

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RoleRedirect />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* User Routes */}
        <Route path="/user/dashboard" element={
          <ProtectedRoute allowedRoles={['USER']}>
            <UserDashboard />
          </ProtectedRoute>
        } />
        <Route path="/user/book" element={
          <ProtectedRoute allowedRoles={['USER']}>
            <BookAmbulance />
          </ProtectedRoute>
        } />
        <Route path="/user/track/:bookingId" element={
          <ProtectedRoute allowedRoles={['USER']}>
            <TrackAmbulance />
          </ProtectedRoute>
        } />

        {/* Driver Routes */}
        <Route path="/driver/dashboard" element={
          <ProtectedRoute allowedRoles={['DRIVER']}>
            <DriverDashboard />
          </ProtectedRoute>
        } />

        {/* Admin Routes */}
        <Route path="/admin/dashboard" element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AdminDashboard />
          </ProtectedRoute>
        } />
        <Route path="/admin/drivers" element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <ManageDrivers />
          </ProtectedRoute>
        } />
        <Route path="/admin/bookings" element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <ManageBookings />
          </ProtectedRoute>
        } />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}