import React, { useEffect, useState, useContext } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { InterviewContext } from '../context/InterviewContext'
import MatchGauge from '../components/MatchGauge'
import PracticeModal from '../components/PracticeModal'
import { ArrowLeft, CheckSquare, Square, Code, Users, AlertTriangle, Calendar, MessageCircleCode, CheckCircle, Sparkles } from 'lucide-react'

const PlanDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { currentReport, fetchReportById, loading, error } = useContext(InterviewContext)
  const [activeTab, setActiveTab] = useState('technical')
  const [checkedTasks, setCheckedTasks] = useState({})
  const [practiceQuestion, setPracticeQuestion] = useState(null)

  useEffect(() => {
    fetchReportById(id)
  }, [id])

  const toggleTask = (dayIndex, taskIndex) => {
    const key = `${dayIndex}-${taskIndex}`
    setCheckedTasks(prev => ({ ...prev, [key]: !prev[key] }))
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <Sparkles size={40} color="#6366f1" style={{ animation: 'spin 2s linear infinite' }} />
        <h2 style={{ marginTop: '16px', color: '#fff' }}>Analyzing Strategy Report...</h2>
      </div>
    )
  }

  if (error || !currentReport) {
    return (
      <div className="container" style={{ textAlign: 'center', paddingTop: '60px' }}>
        <div style={{ padding: '24px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', borderRadius: '12px', color: '#f87171' }}>
          ⚠️ {error || 'Plan not found.'}
        </div>
        <button onClick={() => navigate('/dashboard')} className="btn-secondary" style={{ marginTop: '20px' }}>
          <ArrowLeft size={16} /> Back to Dashboard
        </button>
      </div>
    )
  }

  const { title, matchScore, matchBreakdown, technicalQuestions, behavioralQuestions, skillGaps, preparationPlan, practiceSessions } = currentReport

  return (
    <div className="container" style={{ paddingBottom: '80px' }}>
      
      {/* Back Header */}
      <button onClick={() => navigate('/dashboard')} className="btn-secondary" style={{ marginBottom: '24px' }}>
        <ArrowLeft size={16} /> Back to Dashboard
      </button>

      {/* Hero Overview Card */}
      <div className="glass-card animate-fade-in" style={{ padding: '32px', marginBottom: '32px', border: '1px solid var(--border-glow)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 220px', gap: '32px', alignItems: 'center' }}>
          <div>
            <span style={{ fontSize: '0.85rem', color: '#06b6d4', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>AI Interview Strategy</span>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, marginTop: '4px', color: '#fff' }}>{title}</h1>
            
            {/* Breakdown Stats */}
            {matchBreakdown && (
              <div style={{ display: 'flex', gap: '24px', marginTop: '20px' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Technical Fit</span>
                  <span style={{ fontSize: '1.2rem', fontWeight: 700, color: '#34d399' }}>{matchBreakdown.technicalFit}%</span>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Experience Fit</span>
                  <span style={{ fontSize: '1.2rem', fontWeight: 700, color: '#6366f1' }}>{matchBreakdown.experienceFit}%</span>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Culture Fit</span>
                  <span style={{ fontSize: '1.2rem', fontWeight: 700, color: '#06b6d4' }}>{matchBreakdown.culturalFit}%</span>
                </div>
              </div>
            )}
          </div>

          <MatchGauge score={matchScore} />
        </div>
      </div>

      {/* Tabs Bar */}
      <div style={{ display: 'flex', gap: '12px', borderBottom: '1px solid var(--border-glass)', paddingBottom: '12px', marginBottom: '28px' }}>
        <button
          onClick={() => setActiveTab('technical')}
          className={`btn-secondary ${activeTab === 'technical' ? 'btn-primary' : ''}`}
          style={{ padding: '10px 20px' }}
        >
          <Code size={16} /> Technical Q&amp;A ({technicalQuestions?.length || 0})
        </button>

        <button
          onClick={() => setActiveTab('behavioral')}
          className={`btn-secondary ${activeTab === 'behavioral' ? 'btn-primary' : ''}`}
          style={{ padding: '10px 20px' }}
        >
          <Users size={16} /> Behavioral STAR Q&amp;A ({behavioralQuestions?.length || 0})
        </button>

        <button
          onClick={() => setActiveTab('gaps')}
          className={`btn-secondary ${activeTab === 'gaps' ? 'btn-primary' : ''}`}
          style={{ padding: '10px 20px' }}
        >
          <AlertTriangle size={16} /> Skill Gaps ({skillGaps?.length || 0})
        </button>

        <button
          onClick={() => setActiveTab('roadmap')}
          className={`btn-secondary ${activeTab === 'roadmap' ? 'btn-primary' : ''}`}
          style={{ padding: '10px 20px' }}
        >
          <Calendar size={16} /> 7-Day Battle Plan
        </button>
      </div>

      {/* TAB CONTENT: Technical Questions */}
      {activeTab === 'technical' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {technicalQuestions?.map((q, idx) => (
            <div key={idx} className="glass-card animate-fade-in" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <h3 style={{ fontSize: '1.1rem', color: '#fff', fontWeight: 600 }}>
                  <span style={{ color: '#06b6d4' }}>Q{idx + 1}.</span> {q.question}
                </h3>
                <button
                  onClick={() => setPracticeQuestion(q.question)}
                  className="btn-primary"
                  style={{ padding: '6px 14px', fontSize: '0.8rem' }}
                >
                  <MessageCircleCode size={14} /> Practice Mock Response
                </button>
              </div>

              <div style={{ background: 'rgba(10, 15, 26, 0.6)', padding: '12px 16px', borderRadius: '8px', marginBottom: '12px', borderLeft: '3px solid #6366f1' }}>
                <span style={{ fontSize: '0.75rem', color: '#6366f1', textTransform: 'uppercase', fontWeight: 700 }}>Interviewer Intention:</span>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginTop: '2px' }}>{q.intention}</p>
              </div>

              <div style={{ background: 'rgba(16, 185, 129, 0.06)', padding: '14px 16px', borderRadius: '8px', border: '1px solid rgba(16,185,129,0.15)' }}>
                <span style={{ fontSize: '0.75rem', color: '#34d399', textTransform: 'uppercase', fontWeight: 700 }}>Recommended Strategy &amp; Points to Cover:</span>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-main)', marginTop: '4px', whiteSpace: 'pre-line' }}>{q.answer}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB CONTENT: Behavioral Questions */}
      {activeTab === 'behavioral' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {behavioralQuestions?.map((q, idx) => (
            <div key={idx} className="glass-card animate-fade-in" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <h3 style={{ fontSize: '1.1rem', color: '#fff', fontWeight: 600 }}>
                  <span style={{ color: '#ec4899' }}>Q{idx + 1}.</span> {q.question}
                </h3>
                <button
                  onClick={() => setPracticeQuestion(q.question)}
                  className="btn-primary"
                  style={{ padding: '6px 14px', fontSize: '0.8rem', background: 'linear-gradient(135deg, #ec4899, #6366f1)' }}
                >
                  <MessageCircleCode size={14} /> Practice Answer
                </button>
              </div>

              <div style={{ background: 'rgba(10, 15, 26, 0.6)', padding: '12px 16px', borderRadius: '8px', marginBottom: '12px', borderLeft: '3px solid #ec4899' }}>
                <span style={{ fontSize: '0.75rem', color: '#ec4899', textTransform: 'uppercase', fontWeight: 700 }}>STAR Technique Tip:</span>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginTop: '2px' }}>{q.starTip || q.intention}</p>
              </div>

              <div style={{ background: 'rgba(10, 15, 26, 0.4)', padding: '14px 16px', borderRadius: '8px', border: '1px solid var(--border-glass)' }}>
                <span style={{ fontSize: '0.75rem', color: '#06b6d4', textTransform: 'uppercase', fontWeight: 700 }}>Exemplar Answer Outline:</span>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-main)', marginTop: '4px', whiteSpace: 'pre-line' }}>{q.answer}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB CONTENT: Skill Gaps */}
      {activeTab === 'gaps' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
          {skillGaps?.map((gap, idx) => (
            <div key={idx} className="glass-card animate-fade-in" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h3 style={{ fontSize: '1.1rem', color: '#fff' }}>{gap.skill}</h3>
                <span className={`badge badge-${gap.severity}`}>{gap.severity} severity</span>
              </div>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{gap.recommendation}</p>
            </div>
          ))}
        </div>
      )}

      {/* TAB CONTENT: 7-Day Battle Plan */}
      {activeTab === 'roadmap' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {preparationPlan?.map((day, dIdx) => (
            <div key={dIdx} className="glass-card animate-fade-in" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <span style={{ background: 'linear-gradient(135deg, #6366f1, #06b6d4)', color: '#fff', fontWeight: 800, padding: '4px 14px', borderRadius: '20px', fontSize: '0.85rem' }}>
                  DAY {day.day}
                </span>
                <h3 style={{ fontSize: '1.15rem', color: '#fff' }}>{day.focus}</h3>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {day.tasks?.map((task, tIdx) => {
                  const isDone = !!checkedTasks[`${dIdx}-${tIdx}`]
                  return (
                    <div
                      key={tIdx}
                      onClick={() => toggleTask(dIdx, tIdx)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '12px 16px',
                        background: isDone ? 'rgba(16, 185, 129, 0.08)' : 'rgba(10, 15, 26, 0.5)',
                        border: isDone ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid var(--border-glass)',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      {isDone ? <CheckSquare size={18} color="#34d399" /> : <Square size={18} color="#6b7280" />}
                      <span style={{ fontSize: '0.9rem', color: isDone ? '#34d399' : 'var(--text-main)', textDecoration: isDone ? 'line-through' : 'none' }}>
                        {task}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Practice Modal */}
      {practiceQuestion && (
        <PracticeModal
          reportId={id}
          question={practiceQuestion}
          onClose={() => setPracticeQuestion(null)}
        />
      )}

    </div>
  )
}

export default PlanDetail
