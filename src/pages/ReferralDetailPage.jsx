import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import Cookies from 'js-cookie'
import Navbar from '../components/Navbar.jsx'
import './ReferralDetailPage.css'

const BASE_URL = 'https://v9fes04dwf.execute-api.eu-north-1.amazonaws.com/api/referrals'

function formatDate(iso) {
  if (!iso) return ''
  return iso.replace(/-/g, '/')
}

function formatProfit(val) {
  const num = typeof val === 'string' ? parseFloat(val) : val
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(num)
}

export default function ReferralDetailPage() {
  const { id } = useParams()
  const [row, setRow] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    async function fetchReferral() {
      setLoading(true)
      setNotFound(false)
      const token = Cookies.get('jwt_token')
      try {
        const res = await fetch(`${BASE_URL}?id=${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        const json = await res.json()
        const d = json?.data
        // Handle both: data = {id, name, ...} or data = {referrals: [...]}
        if (d) {
          if (Array.isArray(d.referrals)) {
            const found = d.referrals.find(r => String(r.id) === String(id))
            if (found) { setRow(found); return }
          }
          if (d.id !== undefined && String(d.id) === String(id)) {
            setRow(d); return
          }
        }
        setNotFound(true)
      } catch {
        setNotFound(true)
      } finally {
        setLoading(false)
      }
    }
    fetchReferral()
  }, [id])

  return (
    <div className="detail-layout">
      <Navbar />
      <main className="detail-main">
        <div className="detail-container">
          {loading && (
            <div className="detail-loading">
              <div className="spinner" />
              <span>Loading referral…</span>
            </div>
          )}

          {!loading && notFound && (
            <div className="detail-not-found">
              <div className="not-found-code">404</div>
              <h1 className="not-found-heading">Referral not found</h1>
              <p className="not-found-desc">We couldn't find a referral with this ID.</p>
              <Link to="/" className="back-link">← Back to dashboard</Link>
            </div>
          )}

          {!loading && row && (
            <div className="detail-card">
              <Link to="/" className="back-link">← Back to dashboard</Link>
              <h1 className="detail-title">Referral Details</h1>
              <h2 className="detail-name">{row.name}</h2>
              <dl className="detail-list">
                <div className="detail-row">
                  <dt>Referral ID</dt>
                  <dd>#{row.id}</dd>
                </div>
                <div className="detail-row">
                  <dt>Service Name</dt>
                  <dd>{row.serviceName}</dd>
                </div>
                <div className="detail-row">
                  <dt>Date</dt>
                  <dd>{formatDate(row.date)}</dd>
                </div>
                <div className="detail-row">
                  <dt>Profit</dt>
                  <dd className="detail-profit">{formatProfit(row.profit)}</dd>
                </div>
              </dl>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
