import React, { useState, useContext } from 'react'
import { InterviewContext } from '../context/InterviewContext'
import { X, Send, Award, CheckCircle2, MessageSquareText } from 'lucide-react'

const PracticeModal = ({ reportId, question, onClose }) => {
  const { submitPracticeAnswer } = useContext(InterviewContext)
  const [userAnswer, setUserAnswer] = useState('')
  const [loading, setLoading] = useState(false)
  const [evaluation, setEvaluation] = useState(null)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!userAnswer.trim()) return
    setLoading(true)
    setError('')
    try {
      const result = await submitPracticeAnswer(reportId, question, userAnswer)
      setEvaluation(result)
    } catch (err) {
      setError(err.message || 'Failed to submit practice answer.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0, 0, 0, 0.8)', backdropFilter: 'blur(8px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div className="glass-card animate-fade-in" style={{ width: '100%', maxWidth: '750px', maxHeight: '90vh', overflowY: 'auto', padding: '28px', border: '1px solid var(--border-glow)' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
          <div>
            <span style={{ fontSize: '0.8rem', color: '#06b6d4', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>AI Interactive Mock Simulator</span>
            <h3 style={{ fontSize: '1.2rem', marginTop: '4px', color: '#fff' }}>{question}</h3>
          </div>
          <button onClick={onClose} className="btn-secondary" style={{ padding: '6px' }}>
            <X size={18} />
          </button>
        </div>

        {error && (
          <div style={{ padding: '10px 14px', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid #ef4444', color: '#f87171', borderRadius: '8px', marginBottom: '16px', fontSize: '0.9rem' }}>
            ⚠️ {error}
          </div>
        )}

        {!evaluation ? (
          <form onSubmit={handleSubmit}>
            <label style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
              Type or paste your response below to get instant AI scoring & feedback:
            </label>
            <textarea
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              className="form-textarea"
              rows={7}
              placeholder="e.g. In my previous role at X, I encountered this by... My approach was to..."
              required
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
              <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
              <button type="submit" className="btn-primary" disabled={loading || !userAnswer.trim()}>
                {loading ? (
                  <>Evaluating Answer...</>
                ) : (
                  <><Send size={16} /> Evaluate My Answer</>
                )}
              </button>
            </div>
          </form>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Score Banner */}
            <div style={{ background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(6, 182, 212, 0.15))', border: '1px solid rgba(99, 102, 241, 0.3)', borderRadius: '12px', padding: '18px', display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ background: evaluation.score >= 75 ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)', color: evaluation.score >= 75 ? '#34d399' : '#fbbf24', width: '56px', height: '56px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', fontWeight: 800 }}>
                {evaluation.score}
              </div>
              <div>
                <h4 style={{ color: '#fff', fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Award size={18} color="#06b6d4" /> Answer Evaluation Score: {evaluation.score} / 100
                </h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  {evaluation.score >= 80 ? 'Excellent response! Concise and structured.' : 'Good attempt. Check suggestions below to make it stronger.'}
                </p>
              </div>
            </div>

            {/* AI Feedback */}
            <div style={{ background: 'rgba(10, 15, 26, 0.6)', padding: '16px', borderRadius: '10px', border: '1px solid var(--border-glass)' }}>
              <h4 style={{ fontSize: '0.95rem', color: '#06b6d4', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <MessageSquareText size={16} /> AI Feedback & Insights
              </h4>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-main)', whiteSpace: 'pre-line' }}>{evaluation.feedback}</p>
            </div>

            {/* Improved Exemplar Answer */}
            <div style={{ background: 'rgba(16, 185, 129, 0.08)', padding: '16px', borderRadius: '10px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
              <h4 style={{ fontSize: '0.95rem', color: '#34d399', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CheckCircle2 size={16} /> Optimized Exemplar Answer
              </h4>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-main)', whiteSpace: 'pre-line' }}>{evaluation.improvedAnswer}</p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button onClick={() => setEvaluation(null)} className="btn-secondary">Practice Again</button>
              <button onClick={onClose} className="btn-primary">Done</button>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}

export default PracticeModal
