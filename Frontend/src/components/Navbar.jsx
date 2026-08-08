import React, { useContext } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import { Sparkles, LogOut, User, LayoutDashboard } from 'lucide-react'

const Navbar = () => {
  const { user, logout } = useContext(AuthContext)
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <nav className="glass-card" style={{ borderRadius: 0, borderTop: 'none', borderLeft: 'none', borderRight: 'none', padding: '16px 0', marginBottom: '32px' }}>
      <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link to="/" style={{ textDecoration: 'none', color: '#fff', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ background: 'linear-gradient(135deg, #6366f1, #06b6d4)', padding: '8px', borderRadius: '10px', display: 'flex' }}>
            <Sparkles size={22} color="#fff" />
          </div>
          <span className="brand-font" style={{ fontSize: '1.4rem', fontWeight: 800, letterSpacing: '-0.5px' }}>
            Interview<span style={{ color: '#06b6d4' }}>AI</span> <span style={{ fontSize: '0.85rem', color: '#6366f1', background: 'rgba(99, 102, 241, 0.15)', padding: '2px 8px', borderRadius: '12px', border: '1px solid rgba(99,102,241,0.3)' }}>PRO</span>
          </span>
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {user ? (
            <>
              <Link to="/dashboard" className="btn-secondary" style={{ textDecoration: 'none', fontSize: '0.9rem' }}>
                <LayoutDashboard size={16} /> Dashboard
              </Link>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255, 255, 255, 0.05)', padding: '6px 14px', borderRadius: '20px', border: '1px solid var(--border-glass)' }}>
                <User size={16} color="#6366f1" />
                <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>{user.username}</span>
              </div>
              <button onClick={handleLogout} className="btn-secondary" style={{ padding: '8px 14px', color: '#f87171' }} title="Log out">
                <LogOut size={16} />
              </button>
            </>


          ) : (
            <>
              <Link to="/login" className="btn-secondary" style={{ textDecoration: 'none' }}>Sign In</Link>
              <Link to="/register" className="btn-primary" style={{ textDecoration: 'none' }}>Get Started</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}

export default Navbar
