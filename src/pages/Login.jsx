import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { authService } from '../services/authService'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { data } = await authService.login(email, password)
      login(data)
      if (data.role === 'USER') navigate('/user/dashboard')
      else if (data.role === 'DRIVER') navigate('/driver/dashboard')
      else navigate('/admin/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center',
      background:'var(--dark)', padding:20 }}>

      <div style={{ position:'fixed', top:0, left:0, right:0, bottom:0, overflow:'hidden', pointerEvents:'none' }}>
        <div style={{ position:'absolute', top:'-20%', left:'-10%', width:600, height:600,
          borderRadius:'50%', background:'radial-gradient(circle, rgba(230,57,70,0.08) 0%, transparent 70%)' }} />
        <div style={{ position:'absolute', bottom:'-20%', right:'-10%', width:500, height:500,
          borderRadius:'50%', background:'radial-gradient(circle, rgba(67,97,238,0.06) 0%, transparent 70%)' }} />
      </div>

      <div style={{ width:'100%', maxWidth:440, position:'relative', zIndex:1 }}>
        <div style={{ textAlign:'center', marginBottom:40 }}>
          <div style={{ fontSize:48, marginBottom:12 }}>🚑</div>
          <h1 style={{ fontSize:28, fontWeight:800, marginBottom:8 }}>AmbulanceX</h1>
          <p style={{ color:'var(--gray)', fontSize:15 }}>Emergency Dispatch System</p>
        </div>

        <div className="card">
          <h2 style={{ fontSize:22, fontWeight:700, marginBottom:24 }}>Sign In</h2>

          {error && <div className="error-msg">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Email Address</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com" required />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                placeholder="••••••••" required />
            </div>
            <button className="btn btn-primary" type="submit" disabled={loading}
              style={{ width:'100%', justifyContent:'center', marginTop:8, padding:'14px 24px', fontSize:16 }}>
              {loading ? <><span className="spinner" style={{ width:18, height:18, borderWidth:2 }} /> Signing in...</> : '→ Sign In'}
            </button>
          </form>
        </div>

        <p style={{ textAlign:'center', marginTop:24, color:'var(--gray)', fontSize:14 }}>
          Don't have an account? <Link to="/register" style={{ color:'var(--red)', fontWeight:600 }}>Register</Link>
        </p>

        <div style={{ marginTop:24, padding:16, background:'var(--dark-2)', borderRadius:12,
          border:'1px solid var(--dark-4)', fontSize:12, color:'var(--gray)' }}>
          <div style={{ fontWeight:600, marginBottom:8, color:'var(--white)' }}>Demo Accounts</div>
          <div>👤 User: user@demo.com / password123</div>
          <div>🚑 Driver: driver@demo.com / password123</div>
          <div>🔧 Admin: admin@demo.com / password123</div>
        </div>
      </div>
    </div>
  )
}
