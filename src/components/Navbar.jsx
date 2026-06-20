import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Cookies from 'js-cookie'
import './Navbar.css'

export default function Navbar() {
  const navigate = useNavigate()

  function handleLogout() {
    Cookies.remove('jwt_token')
    navigate('/login')
  }

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-brand" aria-label="Go to dashboard home">
          <span className="brand-icon">G</span>
          Go Business
        </Link>
        <nav className="navbar-nav" aria-label="Primary">
          <Link to="/" className="nav-link">Home</Link>
        </nav>
        <button className="logout-btn" onClick={handleLogout}>
          Log out
        </button>
      </div>
    </header>
  )
}
