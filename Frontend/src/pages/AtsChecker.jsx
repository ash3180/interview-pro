import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import {
  FileText,
  Upload,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Download,
  Code,
  Sparkles,
  ArrowRight,
  RefreshCw,
  Copy,
  Check,
  Award,
  Layers,
  Zap,
  ExternalLink,
  ChevronRight,
  Clock
} from 'lucide-react';

const AtsChecker = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('analyzer'); // 'analyzer' | 'templates' | 'history'

  // Analyzer Form State
  const [file, setFile] = useState(null);
  const [selfDescription, setSelfDescription] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Current Scan Result
  const [atsReport, setAtsReport] = useState(null);

  // LaTeX Templates State
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  // Scan History State
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const res = await api.get('/api/ats/templates');
      setTemplates(res.data.templates || []);
      if (res.data.templates && res.data.templates.length > 0) {
        setSelectedTemplate(res.data.templates[0]);
      }
    } catch (err) {
      console.error('Failed to load LaTeX templates', err);
    }
  };

  const fetchHistory = async () => {
    setLoadingHistory(true);
    try {
      const res = await api.get('/api/ats/reports');
      setHistory(res.data.reports || []);
    } catch (err) {
      console.error('Failed to load history', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'history') {
      fetchHistory();
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      if (!selected.name.endsWith('.pdf')) {
        setError('Please upload a PDF file.');
        return;
      }
      setError('');
      setFile(selected);
    }
  };

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!jobDescription || jobDescription.trim().length < 20) {
      setError('Please paste a valid Job Description (at least 20 characters).');
      return;
    }
    if (!file && !selfDescription.trim()) {
      setError('Please upload a Resume PDF or fill in your background self-description.');
      return;
    }

    setLoading(true);
    setError('');

    const formData = new FormData();
    if (file) formData.append('resume', file);
    formData.append('jobDescription', jobDescription);
    formData.append('selfDescription', selfDescription);

    try {
      const res = await api.post('/api/ats/analyze', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setAtsReport(res.data.atsReport);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to complete ATS analysis. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const loadHistoricalReport = async (reportId) => {
    setLoading(true);
    try {
      const res = await api.get(`/api/ats/reports/${reportId}`);
      setAtsReport(res.data.atsReport);
      setActiveTab('analyzer');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Generate downloadable HTML PDF Report via Print window
  const downloadPdfReport = () => {
    if (!atsReport) return;

    const reportHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>ATS Optimization Report - ${atsReport.targetRole}</title>
        <style>
          body { font-family: 'Segoe UI', Arial, sans-serif; margin: 30px; color: #1e293b; background: #fff; }
          .header { text-align: center; border-bottom: 2px solid #6366f1; padding-bottom: 15px; margin-bottom: 20px; }
          .header h1 { margin: 0; color: #4f46e5; font-size: 24px; }
          .header p { margin: 5px 0 0 0; color: #64748b; font-size: 14px; }
          .score-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin-bottom: 20px; display: flex; align-items: center; justify-content: space-between; }
          .score-badge { font-size: 36px; font-weight: bold; color: ${atsReport.overallScore >= 75 ? '#16a34a' : atsReport.overallScore >= 55 ? '#d97706' : '#dc2626'}; }
          .metrics-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px; }
          .metric-item { background: #f1f5f9; padding: 12px; border-radius: 6px; }
          .metric-title { font-weight: 600; font-size: 13px; color: #475569; }
          .metric-val { font-size: 18px; font-weight: bold; color: #0f172a; margin-top: 4px; }
          .section { margin-bottom: 25px; }
          .section-title { font-size: 16px; font-weight: bold; color: #334155; border-bottom: 1px solid #cbd5e1; padding-bottom: 6px; margin-bottom: 12px; }
          .pills { display: flex; flex-wrap: wrap; gap: 8px; }
          .pill-match { background: #dcfce7; color: #166534; padding: 4px 10px; border-radius: 12px; font-size: 12px; font-weight: 500; }
          .pill-missing { background: #fee2e2; color: #991b1b; padding: 4px 10px; border-radius: 12px; font-size: 12px; font-weight: 500; }
          .bullet-box { background: #fafafa; border-left: 4px solid #6366f1; padding: 12px; margin-bottom: 10px; border-radius: 4px; }
          .orig { color: #dc2626; font-size: 13px; text-decoration: line-through; }
          .sug { color: #16a34a; font-size: 13px; font-weight: 600; margin-top: 4px; }
          .reason { color: #64748b; font-size: 11px; margin-top: 4px; font-style: italic; }
          @media print {
            body { margin: 0; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Interview AI Pro — ATS Improvement Audit Report</h1>
          <p>Target Role: <strong>${atsReport.targetRole}</strong> | Scanned on: ${new Date(atsReport.createdAt).toLocaleDateString()}</p>
        </div>

        <div class="score-card">
          <div>
            <h3 style="margin:0; color:#334155;">Overall ATS Match Score</h3>
            <p style="margin:4px 0 0 0; font-size:13px; color:#64748b;">Compatibility with target automated screening algorithms</p>
          </div>
          <div class="score-badge">${atsReport.overallScore}%</div>
        </div>

        <div class="metrics-grid">
          <div class="metric-item">
            <div class="metric-title">Keyword Overlap Match</div>
            <div class="metric-val">${atsReport.matchBreakdown?.keywordMatchScore || 0}%</div>
          </div>
          <div class="metric-item">
            <div class="metric-title">Skills Alignment</div>
            <div class="metric-val">${atsReport.matchBreakdown?.skillsScore || 0}%</div>
          </div>
          <div class="metric-item">
            <div class="metric-title">Experience Relevance</div>
            <div class="metric-val">${atsReport.matchBreakdown?.experienceRelevanceScore || 0}%</div>
          </div>
          <div class="metric-item">
            <div class="metric-title">ATS Formatting Health</div>
            <div class="metric-val">${atsReport.matchBreakdown?.formattingScore || 0}%</div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">Matched Keywords Found</div>
          <div class="pills">
            ${(atsReport.matchedKeywords || []).map(k => `<span class="pill-match">✓ ${k}</span>`).join('')}
          </div>
        </div>

        <div class="section">
          <div class="section-title">Critical Missing Keywords</div>
          <div class="pills">
            ${(atsReport.missingKeywords || []).map(k => `<span class="pill-missing">✕ ${k}</span>`).join('')}
          </div>
        </div>

        ${atsReport.formattingIssues && atsReport.formattingIssues.length > 0 ? `
          <div class="section">
            <div class="section-title">Formatting & Legibility Warnings</div>
            <ul>
              ${atsReport.formattingIssues.map(i => `<li style="color:#d97706; font-size:13px; margin-bottom:4px;">${i}</li>`).join('')}
            </ul>
          </div>
        ` : ''}

        <div class="section">
          <div class="section-title">Categorized Actionable Recommendations</div>
          <ul>
            ${(atsReport.improvementSuggestions || []).map(s => `
              <li style="margin-bottom:8px; font-size:13px;">
                <strong>[${s.priority.toUpperCase()}] ${s.category}:</strong> ${s.recommendation}
              </li>
            `).join('')}
          </ul>
        </div>

        <div class="section">
          <div class="section-title">AI Bullet Point Rewrites (High Impact)</div>
          ${(atsReport.rewrittenBullets || []).map(b => `
            <div class="bullet-box">
              <div class="orig">Original: ${b.original}</div>
              <div class="sug">Recommended: ${b.suggested}</div>
              <div class="reason">Why: ${b.reason}</div>
            </div>
          `).join('')}
        </div>

        <script>
          window.onload = function() {
            window.print();
          }
        </script>
      </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    printWindow.document.write(reportHtml);
    printWindow.document.close();
  };

  // Copy LaTeX template code
  const handleCopyCode = (id, code) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  // Download .tex file directly
  const handleDownloadTex = (template) => {
    const element = document.createElement('a');
    const file = new Blob([template.code], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${template.id}_resume_template.tex`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="container" style={{ paddingBottom: '60px' }}>
      {/* Header Banner */}
      <div className="glass-card" style={{ padding: '32px', marginBottom: '28px', background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.12), rgba(6, 182, 212, 0.08))' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(99, 102, 241, 0.2)', color: '#818cf8', padding: '4px 12px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 600, marginBottom: '12px' }}>
              <Zap size={14} /> AI-Powered ATS Optimization Suite
            </div>
            <h1 className="brand-font" style={{ fontSize: '2.2rem', margin: 0 }}>
              ATS Resume Matcher & <span style={{ color: '#06b6d4' }}>LaTeX Templates</span>
            </h1>
            <p style={{ color: '#94a3b8', margin: '8px 0 0 0', maxWidth: '600px', fontSize: '0.95rem' }}>
              Scan your resume against any Job Description, export a comprehensive improvement PDF report, or grab 100% ATS-compliant LaTeX templates.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={() => handleTabChange('analyzer')}
              className={activeTab === 'analyzer' ? 'btn-primary' : 'btn-secondary'}
              style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <FileText size={18} /> ATS Scanner
            </button>
            <button
              onClick={() => handleTabChange('templates')}
              className={activeTab === 'templates' ? 'btn-primary' : 'btn-secondary'}
              style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <Code size={18} /> LaTeX Templates
            </button>
            <button
              onClick={() => handleTabChange('history')}
              className={activeTab === 'history' ? 'btn-primary' : 'btn-secondary'}
              style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <Clock size={18} /> Scan History
            </button>
          </div>
        </div>
      </div>

      {/* TAB 1: ATS ANALYZER */}
      {activeTab === 'analyzer' && (
        <div style={{ display: 'grid', gridTemplateColumns: atsReport ? '1fr 1fr' : '1fr', gap: '28px' }}>
          {/* Left / Input Form */}
          <div className="glass-card" style={{ padding: '28px' }}>
            <h3 style={{ fontSize: '1.3rem', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Upload size={20} color="#6366f1" /> Step 1: Upload Resume & Job Description
            </h3>

            <form onSubmit={handleAnalyze}>
              {/* PDF File Upload */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: '#cbd5e1' }}>
                  Upload Resume PDF
                </label>
                <div style={{ border: '2px dashed var(--border-glass)', borderRadius: '12px', padding: '20px', textAlign: 'center', background: 'rgba(255, 255, 255, 0.02)', cursor: 'pointer' }}>
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                    id="resume-pdf-input"
                  />
                  <label htmlFor="resume-pdf-input" style={{ cursor: 'pointer' }}>
                    <FileText size={36} color="#6366f1" style={{ marginBottom: '8px' }} />
                    <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>
                      {file ? file.name : 'Click to select Resume PDF'}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '4px' }}>
                      {file ? `${(file.size / 1024 / 1024).toFixed(2)} MB PDF selected` : 'Maximum file size: 5MB'}
                    </div>
                  </label>
                </div>
              </div>

              {/* Or Self Description */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: '#cbd5e1' }}>
                  Or Self-Description / Raw Resume Text (Optional fallback)
                </label>
                <textarea
                  value={selfDescription}
                  onChange={(e) => setSelfDescription(e.target.value)}
                  placeholder="Paste raw resume text or summarize your key tech stack, role, and experience..."
                  rows={3}
                  className="input-field"
                  style={{ width: '100%', resize: 'vertical' }}
                />
              </div>

              {/* Target Job Description */}
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: '#cbd5e1', fontWeight: 600 }}>
                  Target Job Description <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <textarea
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Paste the full job posting details, required skills, and responsibilities here..."
                  rows={6}
                  className="input-field"
                  style={{ width: '100%', resize: 'vertical' }}
                  required
                />
              </div>

              {error && (
                <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#f87171', padding: '12px', borderRadius: '8px', marginBottom: '20px', fontSize: '0.9rem' }}>
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="btn-primary"
                style={{ width: '100%', padding: '14px', fontSize: '1rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px' }}
              >
                {loading ? (
                  <>
                    <RefreshCw className="spin" size={20} /> Analyzing Resume against Job Description...
                  </>
                ) : (
                  <>
                    <Sparkles size={20} /> Run Deep ATS Scan
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Right / ATS Analysis Results */}
          {atsReport && (
            <div className="glass-card" style={{ padding: '28px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                <div>
                  <h3 style={{ fontSize: '1.4rem', margin: 0 }}>{atsReport.targetRole}</h3>
                  <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '4px' }}>
                    Scan generated on {new Date(atsReport.createdAt || Date.now()).toLocaleDateString()}
                  </div>
                </div>

                <button
                  onClick={downloadPdfReport}
                  className="btn-secondary"
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(99, 102, 241, 0.2)', border: '1px solid #6366f1', color: '#fff' }}
                >
                  <Download size={16} /> Export PDF Report
                </button>
              </div>

              {/* Overall Score Badge */}
              <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-glass)', borderRadius: '16px', padding: '20px', marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: '0.85rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>
                    Overall ATS Compatibility
                  </div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 600, color: '#e2e8f0', marginTop: '4px' }}>
                    {atsReport.overallScore >= 75 ? '🔥 High Match - ATS Compliant' : atsReport.overallScore >= 55 ? '⚠️ Moderate Match - Needs Tweaks' : '🚨 Low Match - High Risk'}
                  </div>
                </div>

                <div style={{ fontSize: '2.5rem', fontWeight: 800, color: atsReport.overallScore >= 75 ? '#4ade80' : atsReport.overallScore >= 55 ? '#fbbf24' : '#f87171' }}>
                  {atsReport.overallScore}%
                </div>
              </div>

              {/* Sub-Metric Cards Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
                <div style={{ background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '10px', border: '1px solid var(--border-glass)' }}>
                  <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Keyword Match</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 700, marginTop: '2px' }}>{atsReport.matchBreakdown?.keywordMatchScore || 0}%</div>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '10px', border: '1px solid var(--border-glass)' }}>
                  <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Skills Alignment</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 700, marginTop: '2px' }}>{atsReport.matchBreakdown?.skillsScore || 0}%</div>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '10px', border: '1px solid var(--border-glass)' }}>
                  <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Experience Fit</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 700, marginTop: '2px' }}>{atsReport.matchBreakdown?.experienceRelevanceScore || 0}%</div>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '10px', border: '1px solid var(--border-glass)' }}>
                  <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Format Health</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 700, marginTop: '2px' }}>{atsReport.matchBreakdown?.formattingScore || 0}%</div>
                </div>
              </div>

              {/* Matched vs Missing Keywords */}
              <div style={{ marginBottom: '20px' }}>
                <h4 style={{ fontSize: '0.95rem', color: '#4ade80', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CheckCircle2 size={16} /> Matched Keywords Found ({atsReport.matchedKeywords?.length || 0})
                </h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {(atsReport.matchedKeywords || []).map((kw, i) => (
                    <span key={i} style={{ background: 'rgba(74, 222, 128, 0.15)', color: '#4ade80', padding: '3px 10px', borderRadius: '12px', fontSize: '0.8rem', border: '1px solid rgba(74, 222, 128, 0.3)' }}>
                      ✓ {kw}
                    </span>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <h4 style={{ fontSize: '0.95rem', color: '#f87171', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <XCircle size={16} /> Critical Missing Keywords ({atsReport.missingKeywords?.length || 0})
                </h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {(atsReport.missingKeywords || []).map((kw, i) => (
                    <span key={i} style={{ background: 'rgba(248, 113, 113, 0.15)', color: '#f87171', padding: '3px 10px', borderRadius: '12px', fontSize: '0.8rem', border: '1px solid rgba(248, 113, 113, 0.3)' }}>
                      ✕ {kw}
                    </span>
                  ))}
                </div>
              </div>

              {/* AI Bullet Rewrites */}
              {atsReport.rewrittenBullets && atsReport.rewrittenBullets.length > 0 && (
                <div style={{ marginBottom: '24px' }}>
                  <h4 style={{ fontSize: '1rem', color: '#e2e8f0', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Sparkles size={16} color="#6366f1" /> High-Impact AI Bullet Point Rewrites
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {atsReport.rewrittenBullets.map((b, idx) => (
                      <div key={idx} style={{ background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '8px', borderLeft: '3px solid #6366f1' }}>
                        <div style={{ fontSize: '0.8rem', color: '#ef4444', textDecoration: 'line-through' }}>
                          Original: {b.original}
                        </div>
                        <div style={{ fontSize: '0.85rem', color: '#4ade80', fontWeight: 600, marginTop: '4px' }}>
                          Suggested: {b.suggested}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '2px', fontStyle: 'italic' }}>
                          Reason: {b.reason}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action: Practice Gaps in Mock Interview */}
              <div style={{ background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(6, 182, 212, 0.15))', padding: '16px', borderRadius: '12px', border: '1px solid rgba(99, 102, 241, 0.4)', textAlign: 'center' }}>
                <h4 style={{ margin: '0 0 6px 0', fontSize: '1rem' }}>Practice Interview Questions for Missing Skills</h4>
                <p style={{ margin: '0 0 12px 0', fontSize: '0.85rem', color: '#cbd5e1' }}>
                  Ready to test your readiness on missing ATS skills like {(atsReport.missingKeywords || []).slice(0, 3).join(', ')}?
                </p>
                <button
                  onClick={() => navigate('/dashboard', { state: { jobDescription: atsReport.jobDescription } })}
                  className="btn-primary"
                  style={{ padding: '10px 20px', fontSize: '0.9rem' }}
                >
                  Start Custom AI Mock Interview <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: LATEX RESUME TEMPLATES */}
      {activeTab === 'templates' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '24px' }}>
            {/* Sidebar list of templates */}
            <div className="glass-card" style={{ padding: '20px' }}>
              <h3 style={{ fontSize: '1.1rem', margin: '0 0 14px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Layers size={18} color="#6366f1" /> Select ATS Template
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {templates.map((tpl) => (
                  <div
                    key={tpl.id}
                    onClick={() => setSelectedTemplate(tpl)}
                    style={{
                      padding: '14px',
                      borderRadius: '10px',
                      cursor: 'pointer',
                      background: selectedTemplate?.id === tpl.id ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255, 255, 255, 0.03)',
                      border: selectedTemplate?.id === tpl.id ? '1px solid #6366f1' : '1px solid var(--border-glass)',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div style={{ fontWeight: 600, fontSize: '0.95rem', color: '#fff' }}>{tpl.name}</div>
                    <div style={{ fontSize: '0.8rem', color: '#06b6d4', marginTop: '2px' }}>{tpl.category}</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '8px' }}>
                      {(tpl.tags || []).map((t, idx) => (
                        <span key={idx} style={{ background: 'rgba(255, 255, 255, 0.06)', fontSize: '0.7rem', padding: '2px 6px', borderRadius: '4px', color: '#94a3b8' }}>
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Main LaTeX Template Code & Actions */}
            {selectedTemplate ? (
              <div className="glass-card" style={{ padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
                  <div>
                    <h2 style={{ margin: 0, fontSize: '1.4rem' }}>{selectedTemplate.name}</h2>
                    <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: '#94a3b8' }}>{selectedTemplate.description}</p>
                  </div>

                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                      onClick={() => handleCopyCode(selectedTemplate.id, selectedTemplate.code)}
                      className="btn-secondary"
                      style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}
                    >
                      {copiedId === selectedTemplate.id ? <Check size={16} color="#4ade80" /> : <Copy size={16} />}
                      {copiedId === selectedTemplate.id ? 'Copied LaTeX!' : 'Copy .tex Code'}
                    </button>

                    <button
                      onClick={() => handleDownloadTex(selectedTemplate)}
                      className="btn-primary"
                      style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}
                    >
                      <Download size={16} /> Download .tex File
                    </button>

                    <a
                      href="https://www.overleaf.com/docs"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-secondary"
                      style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: '#06b6d4', border: '1px solid rgba(6, 182, 212, 0.4)' }}
                    >
                      <ExternalLink size={14} /> Overleaf
                    </a>
                  </div>
                </div>

                {/* Code Window */}
                <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', overflow: 'hidden' }}>
                  <div style={{ background: '#1e293b', padding: '8px 16px', fontSize: '0.8rem', color: '#94a3b8', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>LaTeX Source Code ({selectedTemplate.id}.tex)</span>
                    <span>100% Vector ATS Standard</span>
                  </div>
                  <pre style={{ padding: '16px', margin: 0, overflowX: 'auto', maxHeight: '500px', fontSize: '0.85rem', color: '#e2e8f0', fontFamily: 'Consolas, Monaco, monospace', lineHeight: '1.5' }}>
                    {selectedTemplate.code}
                  </pre>
                </div>
              </div>
            ) : (
              <div className="glass-card" style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
                Select a LaTeX template from the left list to view code and download.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: SCAN HISTORY */}
      {activeTab === 'history' && (
        <div className="glass-card" style={{ padding: '28px' }}>
          <h3 style={{ fontSize: '1.3rem', margin: '0 0 20px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Clock size={20} color="#6366f1" /> Your Past ATS Scan History
          </h3>

          {loadingHistory ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
              <RefreshCw className="spin" size={24} style={{ marginBottom: '8px' }} /> Loading past reports...
            </div>
          ) : history.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
              No ATS scans found yet. Run your first resume scan in the ATS Scanner tab!
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {history.map((rep) => (
                <div
                  key={rep._id}
                  onClick={() => loadHistoricalReport(rep._id)}
                  style={{
                    display: 'flex',
                    justify: 'space-between',
                    alignItems: 'center',
                    padding: '16px',
                    borderRadius: '12px',
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid var(--border-glass)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '1.05rem', color: '#fff' }}>{rep.targetRole}</div>
                    <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '2px' }}>
                      Scanned on {new Date(rep.createdAt).toLocaleDateString()}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ fontSize: '1.3rem', fontWeight: 800, color: rep.overallScore >= 75 ? '#4ade80' : rep.overallScore >= 55 ? '#fbbf24' : '#f87171' }}>
                      {rep.overallScore}%
                    </div>
                    <ChevronRight size={20} color="#64748b" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AtsChecker;
