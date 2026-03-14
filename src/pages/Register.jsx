import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { authService } from '../services/authService'

export default function Register() {
  const [form, setForm] = useState({ name:'', email:'', password:'', role:'USER' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { data } = await authService.register(form.name, form.email, form.password, form.role)
      login(data)
      if (data.role === 'USER') navigate('/user/dashboard')
      else if (data.role === 'DRIVER') navigate('/driver/dashboard')
      else navigate('/admin/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center',
      background:'var(--dark)', padding:20 }}>
      <div style={{ width:'100%', maxWidth:440 }}>
        <div style={{ textAlign:'center', marginBottom:40 }}>
          <div style={{ fontSize:48, marginBottom:12 }}>🚑</div>
          <h1 style={{ fontSize:28, fontWeight:800, marginBottom:8 }}>AmbulanceX</h1>
          <p style={{ color:'var(--gray)', fontSize:15 }}>Create your account</p>
        </div>

        <div className="card">
          <h2 style={{ fontSize:22, fontWeight:700, marginBottom:24 }}>Register</h2>
          {error && <div className="error-msg">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Full Name</label>
              <input value={form.name} onChange={set('name')} placeholder="John Doe" required />
            </div>
            <div className="form-group">
              <label>Email Address</label>
              <input type="email" value={form.email} onChange={set('email')} placeholder="you@example.com" required />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input type="password" value={form.password} onChange={set('password')} placeholder="Min 6 characters" required minLength={6} />
            </div>
            <div className="form-group">
              <label>Role</label>
              <select value={form.role} onChange={set('role')}>
                <option value="USER">Patient / User</option>
                <option value="DRIVER">Ambulance Driver</option>
              </select>
            </div>
            <button className="btn btn-primary" type="submit" disabled={loading}
              style={{ width:'100%', justifyContent:'center', marginTop:8, padding:'14px 24px', fontSize:16 }}>
              {loading ? 'Creating account...' : '→ Create Account'}
            </button>
          </form>
        </div>

        <p style={{ textAlign:'center', marginTop:24, color:'var(--gray)', fontSize:14 }}>
          Already have an account? <Link to="/login" style={{ color:'var(--red)', fontWeight:600 }}>Sign In</Link>
        </p>
      </div>
    </div>
  )
}
