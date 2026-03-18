import { useEffect, useState } from 'react';
import { getAIFeedbackAPI } from '../../api/axiosClient';
import { Brain, AlertCircle, CheckCircle, TrendingUp, Target, Zap, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

function ScoreBar({ label, value, max = 10, color = '#6366f1' }) {
    return (
        <div style={{ marginBottom: 12 }}>
            <div className="flex justify-between mb-2">
                <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{label}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color }}>{value}/{max}</span>
            </div>
            <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${(value / max) * 100}%`, background: color }} />
            </div>
        </div>
    );
}

export default function AIFeedbackPage() {
    const [analysis, setAnalysis] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getAIFeedbackAPI()
            .then(r => setAnalysis(r.data))
            .catch(() => setAnalysis(null))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return (
        <div className="page-container">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {[...Array(3)].map((_, i) => <div key={i} className="skeleton" style={{ height: 120, borderRadius: 16 }} />)}
            </div>
        </div>
    );

    if (!analysis) return (
        <div className="page-container">
            <div className="empty-state">
                <Brain size={56} />
                <h3>No AI Analysis Found</h3>
                <p>Upload your resume to get your personalized AI feedback and score.</p>
                <Link to="/profile" className="btn btn-primary mt-4">Upload Resume <ArrowRight size={16} /></Link>
            </div>
        </div>
    );

    const scoreColor = analysis.score >= 80 ? '#10b981' : analysis.score >= 60 ? '#f59e0b' : '#ef4444';
    const atsColor = (analysis.atsScore || 0) >= 80 ? '#10b981' : (analysis.atsScore || 0) >= 60 ? '#f59e0b' : '#ef4444';

    return (
        <div className="page-container animate-fade-in">
            <div className="page-header">
                <h1><Brain size={24} style={{ display: 'inline', marginRight: 10 }} />AI Resume Analysis</h1>
                <p>Last analyzed: {new Date(analysis.lastAnalyzed).toLocaleDateString('en-US', { dateStyle: 'medium' })}</p>
            </div>

            <div className="grid-2 mb-6">
                {/* Overall Score */}
                <div className="glass-card" style={{ padding: 28, textAlign: 'center' }}>
                    <h3 style={{ marginBottom: 16 }}>Overall Resume Score</h3>
                    <div style={{ fontSize: 72, fontWeight: 900, fontFamily: 'var(--font-display)', color: scoreColor }}>
                        {analysis.score}
                    </div>
                    <div style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 16 }}>out of 100</div>
                    <div className="progress-bar">
                        <div className="progress-fill" style={{ width: `${analysis.score}%`, background: scoreColor }} />
                    </div>
                    <div style={{ marginTop: 12, fontSize: 14, color: 'var(--text-secondary)' }}>
                        {analysis.score >= 80 ? '🔥 Excellent! Your resume stands out.' : analysis.score >= 60 ? '✅ Good resume with room to improve.' : '⚠️ Significant improvements needed.'}
                    </div>
                </div>

                {/* ATS Score */}
                <div className="glass-card" style={{ padding: 28, textAlign: 'center' }}>
                    <h3 style={{ marginBottom: 16 }}>ATS Compatibility Score</h3>
                    <div style={{ fontSize: 72, fontWeight: 900, fontFamily: 'var(--font-display)', color: atsColor }}>
                        {analysis.atsScore || 0}
                    </div>
                    <div style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 16 }}>out of 100</div>
                    <div className="progress-bar">
                        <div className="progress-fill" style={{ width: `${analysis.atsScore || 0}%`, background: atsColor }} />
                    </div>
                    <div style={{ marginTop: 12, fontSize: 14, color: 'var(--text-secondary)' }}>
                        ATS systems scan resumes – higher score means better pass-through rate.
                    </div>
                </div>
            </div>

            <div className="grid-2 mb-6">
                {/* Section Scores */}
                {analysis.sectionScores && (
                    <div className="glass-card" style={{ padding: 28 }}>
                        <h3 className="mb-4"><TrendingUp size={18} style={{ display: 'inline', marginRight: 8 }} />Section Breakdown</h3>
                        <ScoreBar label="Contact Information" value={analysis.sectionScores.contact || 0} color="#6366f1" />
                        <ScoreBar label="Professional Summary" value={analysis.sectionScores.summary || 0} color="#06b6d4" />
                        <ScoreBar label="Work Experience" value={analysis.sectionScores.experience || 0} color="#10b981" />
                        <ScoreBar label="Skills" value={analysis.sectionScores.skills || 0} color="#f59e0b" />
                        <ScoreBar label="Education" value={analysis.sectionScores.education || 0} color="#8b5cf6" />
                        <ScoreBar label="Formatting" value={analysis.sectionScores.formatting || 0} color="#ec4899" />
                    </div>
                )}

                {/* Feedback */}
                <div className="glass-card" style={{ padding: 28 }}>
                    <h3 className="mb-4"><Zap size={18} style={{ display: 'inline', marginRight: 8 }} />AI Feedback</h3>
                    {(analysis.feedback || '').split('\n').filter(Boolean).map((line, i) => (
                        <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 12, fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                            <span style={{ color: '#6366f1', flexShrink: 0, marginTop: 2 }}>•</span>
                            <span>{line.replace(/^[-•]\s*/, '')}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="grid-2 mb-6">
                {/* Extracted Skills */}
                <div className="glass-card" style={{ padding: 28 }}>
                    <h3 className="mb-4"><CheckCircle size={18} style={{ display: 'inline', marginRight: 8, color: '#10b981' }} />Extracted Skills</h3>
                    <div className="flex flex-wrap gap-2">
                        {(analysis.extractedSkills || []).map(s => <span key={s} className="skill-chip">{s}</span>)}
                        {(!analysis.extractedSkills || analysis.extractedSkills.length === 0) && (
                            <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>No skills extracted yet. Upload your resume to analyze.</p>
                        )}
                    </div>
                </div>

                {/* Missing Keywords */}
                <div className="glass-card" style={{ padding: 28 }}>
                    <h3 className="mb-4"><AlertCircle size={18} style={{ display: 'inline', marginRight: 8, color: '#f59e0b' }} />Missing Keywords</h3>
                    <div className="flex flex-wrap gap-2">
                        {(analysis.missingKeywords || []).map(k => (
                            <span key={k} className="badge badge-warning">{k}</span>
                        ))}
                        {(!analysis.missingKeywords || analysis.missingKeywords.length === 0) && (
                            <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Great! No critical keywords missing.</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Improvements */}
            {analysis.improvements && analysis.improvements.length > 0 && (
                <div className="glass-card mb-6" style={{ padding: 28 }}>
                    <h3 className="mb-4"><Target size={18} style={{ display: 'inline', marginRight: 8 }} />Specific Improvements</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
                        {analysis.improvements.map((imp, i) => (
                            <div key={i} style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.15)', borderRadius: 10, padding: '12px 16px', fontSize: 14, color: 'var(--text-secondary)' }}>
                                <span style={{ color: 'var(--primary-light)', fontWeight: 600 }}>#{i + 1}</span> {imp}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div style={{ textAlign: 'center' }}>
                <Link to="/profile" className="btn btn-primary btn-lg">
                    <Brain size={18} /> Re-upload Resume for Fresh Analysis
                </Link>
            </div>
        </div>
    );
}
