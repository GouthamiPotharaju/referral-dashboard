import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import Cookies from 'js-cookie'
import Navbar from '../components/Navbar.jsx'
import './DashboardPage.css'

const BASE_URL = 'https://v9fes04dwf.execute-api.eu-north-1.amazonaws.com/api/referrals'
const PAGE_SIZE = 10

function formatDate(iso) {
  if (!iso) return ''
  return iso.replace(/-/g, '/')
}

function formatProfit(val) {
  const num = typeof val === 'string' ? parseFloat(val) : val
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(num)
}

function useFetchReferrals() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchData = useCallback(async ({ search = '', sort = 'desc' } = {}) => {
    setLoading(true)
    setError(null)
    const token = Cookies.get('jwt_token')
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (sort) params.set('sort', sort)
    const url = params.toString() ? `${BASE_URL}?${params}` : BASE_URL
    try {
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const json = await res.json()
      if (!res.ok) {
        throw new Error(json?.message ? `${json.message} (${res.status})` : `Request failed (${res.status})`)
      }
      setData(json.data || json)
    } catch (err) {
      setError(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }, [])

  return { data, loading, error, fetchData }
}

export default function DashboardPage() {
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState('desc')
  const [page, setPage] = useState(1)
  const [copiedLink, setCopiedLink] = useState(false)
  const [copiedCode, setCopiedCode] = useState(false)
  const { data, loading, error, fetchData } = useFetchReferrals()
  const navigate = useNavigate()

  useEffect(() => {
    fetchData({ search, sort })
    setPage(1)
  }, [search, sort])

  function handleSearchChange(e) {
    setSearch(e.target.value)
  }

  function handleSortChange(e) {
    setSort(e.target.value)
  }

  function copyToClipboard(text, setCopied) {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  // Pagination
  const referrals = data?.referrals || []
  const total = referrals.length
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const from = total === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1
  const to = Math.min(safePage * PAGE_SIZE, total)
  const pageRows = referrals.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

  const metrics = data?.metrics || []
  const serviceSummary = data?.serviceSummary || {}
  const referral = data?.referral || {}

  return (
    <div className="dashboard-layout">
      <Navbar />
      <main className="dashboard-main">
        <div className="dashboard-container">
          {/* Header */}
          <div className="dashboard-header">
            <h1 className="dashboard-title">Referral Dashboard</h1>
            <p className="dashboard-subtitle">Track your referrals, earnings, and partner activity in one place.</p>
          </div>

          {/* Loading / Error */}
          {loading && (
            <div className="state-loading">
              <div className="spinner" />
              <span>Loading your data…</span>
            </div>
          )}
          {error && !loading && (
            <div className="state-error" role="alert">
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/><path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
              {error}
            </div>
          )}

          {data && !loading && (
            <>
              {/* Overview */}
              <section className="section" role="region" aria-label="Overview metrics">
                <h2 className="section-title">Overview</h2>
                <div className="metrics-grid">
                  {metrics.map(m => (
                    <div className="metric-card" key={m.id}>
                      <span className="metric-label">{m.label}</span>
                      <span className="metric-value">{m.value}</span>
                    </div>
                  ))}
                </div>
              </section>

              {/* Service Summary */}
              <section className="section" aria-label="Service summary">
                <h2 className="section-title">Service summary</h2>
                <div className="service-summary-card">
                  <div className="service-summary-grid">
                    <div className="summary-item">
                      <span className="summary-label">Service</span>
                      <span className="summary-value">{serviceSummary.service}</span>
                    </div>
                    <div className="summary-item">
                      <span className="summary-label">Your Referrals</span>
                      <span className="summary-value">{serviceSummary.yourReferrals}</span>
                    </div>
                    <div className="summary-item">
                      <span className="summary-label">Active Referrals</span>
                      <span className="summary-value">{serviceSummary.activeReferrals}</span>
                    </div>
                    <div className="summary-item">
                      <span className="summary-label">Total Ref. Earnings</span>
                      <span className="summary-value highlight">{serviceSummary.totalRefEarnings}</span>
                    </div>
                  </div>
                </div>
              </section>

              {/* Share Referral */}
              <section className="section" aria-label="Share referral">
                <h2 className="section-title">Refer friends and earn more</h2>
                <div className="share-card">
                  <div className="share-field">
                    <label className="share-label">Your Referral Link</label>
                    <div className="share-input-row">
                      <input
                        type="text"
                        readOnly
                        value={referral.link || ''}
                        className="share-input"
                        aria-label="Your referral link"
                      />
                      <button
                        className={`copy-btn${copiedLink ? ' copied' : ''}`}
                        onClick={() => copyToClipboard(referral.link || '', setCopiedLink)}
                      >
                        {copiedLink ? 'Copied!' : 'Copy'}
                      </button>
                    </div>
                  </div>
                  <div className="share-field">
                    <label className="share-label">Your Referral Code</label>
                    <div className="share-input-row">
                      <input
                        type="text"
                        readOnly
                        value={referral.code || ''}
                        className="share-input share-input--code"
                        aria-label="Your referral code"
                      />
                      <button
                        className={`copy-btn${copiedCode ? ' copied' : ''}`}
                        onClick={() => copyToClipboard(referral.code || '', setCopiedCode)}
                      >
                        {copiedCode ? 'Copied!' : 'Copy'}
                      </button>
                    </div>
                  </div>
                </div>
              </section>

              {/* All Referrals Table */}
              <section className="section">
                <h2 className="section-title">All referrals</h2>
                <div className="table-card">
                  <div className="table-controls">
                    <input
                      type="search"
                      className="search-input"
                      placeholder="Name or service…"
                      value={search}
                      onChange={handleSearchChange}
                      aria-label="Search referrals"
                    />
                    <label className="sort-label">
                      Sort by date
                      <select
                        className="sort-select"
                        value={sort}
                        onChange={handleSortChange}
                      >
                        <option value="desc">Newest first</option>
                        <option value="asc">Oldest first</option>
                      </select>
                    </label>
                  </div>

                  <div className="table-wrapper">
                    <table className="referrals-table">
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Service</th>
                          <th>Date</th>
                          <th>Profit</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pageRows.length === 0 ? (
                          <tr>
                            <td colSpan={4} className="empty-state">No matching entries</td>
                          </tr>
                        ) : (
                          pageRows.map(row => (
                            <tr
                              key={row.id}
                              className="table-row"
                              onClick={() => navigate(`/referral/${row.id}`)}
                              tabIndex={0}
                              onKeyDown={e => e.key === 'Enter' && navigate(`/referral/${row.id}`)}
                              role="button"
                              aria-label={`View referral details for ${row.name}`}
                            >
                              <td className="td-name">{row.name}</td>
                              <td>{row.serviceName}</td>
                              <td>{formatDate(row.date)}</td>
                              <td className="td-profit">{formatProfit(row.profit)}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  <div className="pagination">
                    <span className="pagination-info">
                      {total === 0
                        ? 'No entries'
                        : `Showing ${from}–${to} of ${total} entries`}
                    </span>
                    <div className="pagination-controls">
                      <button
                        className="page-btn"
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={safePage === 1}
                      >
                        Previous
                      </button>
                      {totalPages > 1 && Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                        <button
                          key={p}
                          className={`page-btn page-num${safePage === p ? ' active' : ''}`}
                          onClick={() => setPage(p)}
                          aria-current={safePage === p ? 'page' : undefined}
                        >
                          {p}
                        </button>
                      ))}
                      <button
                        className="page-btn"
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        disabled={safePage === totalPages}
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </div>
              </section>
            </>
          )}
        </div>
      </main>

      <footer className="dashboard-footer">
        <div className="footer-inner">
          <div className="footer-brand">
            <span className="footer-brand-icon">G</span>
            Go Business
          </div>
          <nav className="footer-nav" aria-label="Footer">
            <a href="#">About</a>
            <a href="#">Privacy</a>
          </nav>
          <span className="footer-copy">© 2024 Go Business</span>
        </div>
      </footer>
    </div>
  )
}
