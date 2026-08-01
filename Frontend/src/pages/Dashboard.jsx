import React, { useState, useEffect, useContext, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { InterviewContext } from '../context/InterviewContext'
import { Sparkles, Upload, FileText, Briefcase, ArrowRight, Clock, Award, History, ChevronRight } from 'lucide-react'

const Dashboard = () => {
  const { reports, fetchReports, createReport, loading, error } = useContext(InterviewContext)
  const [jobDescription, setJobDescription] = useState('')
  const [selfDescription, setSelfDescription] = useState('')
  const [selectedFile, setSelectedFile] = useState(null)
  const [localError, setLocalError] = useState('')
  const fileInputRef = useRef()
  const navigate = useNavigate()

  useEffect(() => {
    fetchReports()
  }, [])

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (!file.name.toLowerCase().endsWith('.pdf')) {
        setLocalError('Only PDF files are supported.')
        return
      }
      setSelectedFile(file)
      setLocalError('')
    }
  }

  const handleGenerate = async (e) => {
    e.preventDefault()
    setLocalError('')

    if (!jobDescription.trim()) {
      setLocalError('Please paste the target job description.')
      return
    }

    if (!selectedFile && !selfDescription.trim()) {
      setLocalError('Please upload a resume PDF or enter a quick self-description.')
      return
    }

    try {
      const report = await createReport({
        jobDescription,
        selfDescription,
        resumeFile: selectedFile
      })
      if (report && report._id) {
        navigate(`/plan/${report._id}`)
      }
    } catch (err) {
      setLocalError(err.message || 'Failed to generate strategy.')
    }
  }

  return (
    <div className="container" style={{ paddingBottom: '60px' }}>
      {/* Header Banner */}
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, letterSpacing: '-1px' }}>
          Craft Your Winning <span style={{ background: 'linear-gradient(135deg, #6366f1, #06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Interview Strategy</span>
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', marginTop: '8px', maxWidth: '650px', margin: '8px auto 0' }}>
          Combine AI intelligence with target job requirements to generate custom questions, skill gap roadmaps, and day-by-day prep plans.
        </p>
      </div>

      {/* Main Creation Card */}
      <div className="glass-card animate-fade-in" style={{ padding: '32px', marginBottom: '48px', border: '1px solid var(--border-glow)' }}>
        { (localError || error) && (
          <div style={{ padding: '12px 18px', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid #ef4444', color: '#f87171', borderRadius: '10px', marginBottom: '24px' }}>
            ⚠️ {localError || error}
          </div>
        )}

        <form onSubmit={handleGenerate}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
            {/* Left Column: Job Description */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <Briefcase size={20} color="#06b6d4" />
                <h3 style={{ fontSize: '1.15rem', color: '#fff' }}>Target Job Description</h3>
                <span className="badge badge-high" style={{ marginLeft: 'auto' }}>Required</span>
              </div>
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                className="form-textarea"
                rows={10}
                placeholder="Paste job description requirements, responsibilities, and key technologies..."
                required
              />
              <div style={{ textAlign: 'right', fontSize: '0.8rem', color: 'var(--text-dim)', marginTop: '4px' }}>
                {jobDescription.length} / 5000 chars
              </div>
            </div>

            {/* Right Column: Candidate Profile */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <FileText size={20} color="#6366f1" />
                <h3 style={{ fontSize: '1.15rem', color: '#fff' }}>Your Profile</h3>
                <span className="badge badge-low" style={{ marginLeft: 'auto' }}>Resume or Self-Desc</span>
              </div>

              {/* Upload Resume Box */}
              <div style={{ marginBottom: '20px' }}>
                <label
                  onClick={() => fileInputRef.current.click()}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '24px',
                    border: selectedFile ? '2px solid #06b6d4' : '2px dashed var(--border-glass)',
                    borderRadius: '12px',
                    background: selectedFile ? 'rgba(6, 182, 212, 0.08)' : 'rgba(10, 15, 26, 0.5)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <Upload size={28} color={selectedFile ? '#06b6d4' : '#6366f1'} style={{ marginBottom: '8px' }} />
                  <span style={{ fontWeight: 600, color: '#fff', fontSize: '0.95rem' }}>
                    {selectedFile ? `📄 ${selectedFile.name}` : 'Click to Upload Resume (PDF)'}
                  </span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>Max file size 5MB</span>
                  <input ref={fileInputRef} type="file" accept=".pdf" onChange={handleFileChange} style={{ display: 'none' }} />
                </label>
              </div>

              <div style={{ textAlign: 'center', margin: '12px 0', position: 'relative' }}>
                <span style={{ background: 'var(--bg-dark)', padding: '0 12px', color: 'var(--text-dim)', fontSize: '0.8rem', position: 'relative', zIndex: 1 }}>OR</span>
                <div style={{ position: 'absolute', top: '50%', left: 0, width: '100%', borderBottom: '1px solid var(--border-glass)' }} />
              </div>

              {/* Self Description */}
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '6px' }}>Quick Self-Description</label>
                <textarea
                  value={selfDescription}
                  onChange={(e) => setSelfDescription(e.target.value)}
                  className="form-textarea"
                  rows={3}
                  placeholder="Describe your current role, top skills, years of experience..."
                />
              </div>
            </div>
          </div>

          {/* Action Footer */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '32px', paddingTop: '20px', borderTop: '1px solid var(--border-glass)' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Clock size={16} color="#6366f1" /> Estimated AI Analysis: ~15 seconds
            </span>
            <button type="submit" className="btn-primary" disabled={loading} style={{ padding: '14px 32px', fontSize: '1rem' }}>
              {loading ? (
                <>Building Strategy Plan...</>
              ) : (
                <><Sparkles size={18} /> Generate My Strategy Plan <ArrowRight size={18} /></>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Recent Plans History */}
      {reports.length > 0 && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
            <History size={22} color="#06b6d4" />
            <h2 style={{ fontSize: '1.4rem', fontWeight: 700 }}>Your Interview Strategy Plans</h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '20px' }}>
            {reports.map((r) => (
              <div
                key={r._id}
                onClick={() => navigate(`/plan/${r._id}`)}
                className="glass-card"
                style={{ padding: '20px', cursor: 'pointer', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <h3 style={{ fontSize: '1.1rem', color: '#fff', fontWeight: 600 }}>{r.title}</h3>
                    <span style={{ background: r.matchScore >= 80 ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)', color: r.matchScore >= 80 ? '#34d399' : '#fbbf24', padding: '2px 8px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 700 }}>
                      {r.matchScore}% Match
                    </span>
                  </div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Created {new Date(r.createdAt).toLocaleDateString()}</p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', color: '#6366f1', fontSize: '0.85rem', fontWeight: 600, marginTop: '16px' }}>
                  View Strategy Plan <ChevronRight size={16} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default Dashboard
