import React from 'react'
import { Link } from 'react-router-dom'
import './NotFoundPage.css'

export default function NotFoundPage() {
  return (
    <div className="notfound-page">
      <div className="notfound-card">
        <div className="notfound-brand">
          <span className="notfound-brand-icon">G</span>
          <span className="notfound-brand-name">Go Business</span>
        </div>
        <div className="notfound-code">404</div>
        <h1 className="notfound-heading">Page not found</h1>
        <p className="notfound-desc">The page you're looking for doesn't exist or has been moved.</p>
        <Link to="/" className="notfound-back">← Back to dashboard</Link>
      </div>
    </div>
  )
}
