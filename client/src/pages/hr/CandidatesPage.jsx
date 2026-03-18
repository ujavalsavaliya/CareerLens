import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCandidatesAPI, getJobByIdAPI } from '../../api/axiosClient';
import { Brain, User, ChevronDown, Award, Mail, Sparkles, Target } from 'lucide-react';
import toast from 'react-hot-toast';

const recColors = { 
    'strongly recommended': '#10b981', 
    'recommended': '#6366f1', 
    'consider': '#f59e0b', 
    'not recommended': '#ef4444' 
};

export default function CandidatesPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [job, setJob] = useState(null);
    const [candidates, setCandidates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expanded, setExpanded] = useState(null);

    useEffect(() => {
        Promise.all([getJobByIdAPI(id), getCandidatesAPI(id)])
            .then(([jobRes, candRes]) => { setJob(jobRes.data); setCandidates(candRes.data || []); })
            .catch(() => toast.error('Failed to load candidates'))
            .finally(() => setLoading(false));
    }, [id]);

    if (loading) return (
        <div className="page-container">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {[...Array(5)].map((_, i) => <div key={i} className="skeleton" style={{ height: 100, borderRadius: 16 }} />)}
            </div>
        </div>
    );

    return (
        <div className="page-container animate-fade-in">
            <div className="page-header" style={{ marginBottom: 40 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                    <div className="icon-box" style={{ background: 'var(--gradient-1)', width: 48, height: 48 }}>
                        <Brain size={24} color="white" />
                    </div>
                    <div>
                        <h1 style={{ fontSize: 32, fontWeight: 800 }}>AI Matchboard</h1>
                        <p style={{ color: 'var(--text-muted)' }}>Analyzing <strong>{candidates.length}</strong> top candidates for <strong>{job?.title}</strong></p>
                    </div>
                </div>
            </div>

            {candidates.length === 0 ? (
                <div className="empty-state glass-card">
                    <div className="icon-circle" style={{ width: 80, height: 80, background: 'rgba(255,255,255,0.05)' }}>
                        <User size={40} color="var(--text-muted)" />
                    </div>
                    <h3>No Candidates Yet</h3>
                    <p>Applications will be automatically ranked by AI as they come in.</p>
                </div>
            ) : (
                <div className="candidate-list" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {candidates.map((c, i) => {
                        const isExpanded = expanded === i;
                        const score = Math.round(c.matchScore || 0);
                        const scoreColor = score >= 80 ? '#10b981' : score >= 50 ? '#f59e0b' : '#ef4444';
                        const recColor = recColors[c.recommendation] || '#9ca3af';

                        return (
                            <div key={i} className={`candidate-card glass-card ${isExpanded ? 'active' : ''}`} 
                                 style={{ 
                                     padding: 0, 
                                     transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', 
                                     overflow: 'hidden',
                                     animation: `slideUp 0.5s ease-out ${i * 0.1}s both`,
                                     border: isExpanded ? `1px solid ${scoreColor}40` : '1px solid var(--border)'
                                 }}>
                                
                                <div style={{ padding: '24px 28px', display: 'flex', alignItems: 'center', gap: 20, cursor: 'pointer' }} onClick={() => setExpanded(isExpanded ? null : i)}>
                                    {/* Rank & Profile Row */}
                                    <div style={{ position: 'relative' }}>
                                        <div className="avatar" style={{ width: 56, height: 56, borderRadius: 16, background: 'var(--gradient-3)', fontSize: 20, fontWeight: 800 }}>
                                            {c.user?.name?.charAt(0) || 'U'}
                                        </div>
                                        <div style={{ position: 'absolute', top: -8, left: -8, width: 24, height: 24, borderRadius: 12, background: i < 3 ? 'var(--gradient-1)' : 'var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 900, color: 'white', border: '2px solid var(--bg-deep)' }}>
                                            #{i + 1}
                                        </div>
                                    </div>

                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                                            <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>{c.user?.name}</h3>
                                            {score >= 80 && <Sparkles size={16} color="#fbbf24" style={{ filter: 'drop-shadow(0 0 4px #fbbf24)' }} />}
                                        </div>
                                        <div style={{ fontSize: 13, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
                                            <Award size={14} /> {c.profile?.headline || 'Professional Profile'}
                                        </div>
                                    </div>

                                    <div style={{ textAlign: 'right', marginRight: 10 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                            <div style={{ textAlign: 'right' }}>
                                                <div style={{ fontSize: 28, fontWeight: 900, color: scoreColor, lineHeight: 1 }}>{score}%</div>
                                                <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, color: 'var(--text-muted)', fontWeight: 700 }}>AI Match</div>
                                            </div>
                                            <div style={{ width: 44, height: 44, borderRadius: '50%', border: `3px solid ${scoreColor}20`, borderTopColor: scoreColor, transform: 'rotate(-45deg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <Target size={18} color={scoreColor} style={{ transform: 'rotate(45deg)' }} />
                                            </div>
                                        </div>
                                    </div>

                                    <ChevronDown size={20} style={{ color: 'var(--text-muted)', transform: isExpanded ? 'rotate(180deg)' : 'none', transition: '0.4s cubic-bezier(0.4, 0, 0.2, 1)' }} />
                                </div>

                                {/* Animated Match Bar */}
                                <div style={{ height: 4, background: 'rgba(255,255,255,0.05)', position: 'relative' }}>
                                    <div className="match-fill" style={{ width: `${score}%`, background: scoreColor }} />
                                </div>

                                {/* Detail Section */}
                                {isExpanded && (
                                    <div style={{ padding: '28px', background: 'rgba(255,255,255,0.01)', animation: 'fadeIn 0.4s ease-out' }}>
                                        <div className="recommendation-chip mb-6" style={{ background: `${recColor}15`, color: recColor, border: `1px solid ${recColor}30` }}>
                                            <Brain size={16} /> <span>Recommendation: <strong>{c.recommendation}</strong></span>
                                        </div>

                                        <p style={{ fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: 24, fontStyle: 'italic' }}>
                                            "{c.reason}"
                                        </p>

                                        {c.matchedAspects && c.matchedAspects.length > 0 && (
                                            <div style={{ marginBottom: 24, padding: 16, background: 'rgba(99,102,241,0.03)', borderRadius: 12, border: '1px solid rgba(99,102,241,0.1)' }}>
                                                <h4 style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: 1, color: 'var(--primary-light)', marginBottom: 12, fontWeight: 800 }}>AI Match Analysis</h4>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                                    {c.matchedAspects.map((aspect, idx) => (
                                                        <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                                            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>{aspect.title}</div>
                                                            <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{aspect.content}</div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        <div className="grid-2" style={{ gap: 24 }}>
                                            <div className="skill-section">
                                                <h4 style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: 1, color: '#10b981', marginBottom: 12, fontWeight: 800 }}>Key Matches</h4>
                                                <div className="flex flex-wrap gap-2">
                                                    {(c.matchedSkills || []).map(s => <span key={s} className="match-tag success">{s}</span>)}
                                                    {(!c.matchedSkills || c.matchedSkills.length === 0) && <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Potential skill overlap detected</span>}
                                                </div>
                                            </div>
                                            <div className="skill-section">
                                                <h4 style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: 1, color: '#f87171', marginBottom: 12, fontWeight: 800 }}>Focus Areas</h4>
                                                <div className="flex flex-wrap gap-2">
                                                    {(c.missingSkills || []).map(s => <span key={s} className="match-tag danger">{s}</span>)}
                                                    {(!c.missingSkills || c.missingSkills.length === 0) && <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Top percentile match!</span>}
                                                </div>
                                            </div>
                                        </div>

                                        <div style={{ marginTop: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-muted)', fontSize: 14 }}>
                                                <Mail size={16} /> {c.user?.email}
                                            </div>
                                            <button className="btn btn-primary btn-sm" onClick={() => navigate(`/hr/candidates/${c.user._id}`)}>View Full Profile</button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            <style>{`
                @keyframes slideUp {
                    from { transform: translateY(20px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                .candidate-card:hover { transform: translateY(-3px); border-color: rgba(99,102,241,0.3); background: rgba(255,255,255,0.04); }
                .match-fill { height: 100%; transition: width 1.5s cubic-bezier(0.1, 0, 0.1, 1); }
                .recommendation-chip { display: inline-flex; align-items: center; gap: 8px; padding: 6px 14px; borderRadius: 30px; fontSize: 13px; }
                .match-tag { padding: 4px 12px; borderRadius: 8px; fontSize: 12px; fontWeight: 600; }
                .match-tag.success { background: rgba(16,185,129,0.1); color: #10b981; border: 1px solid rgba(16,185,129,0.2); }
                .match-tag.danger { background: rgba(248,113,113,0.1); color: #f87171; border: 1px solid rgba(248,113,113,0.2); }
                .avatar { display: flex; align-items: center; justifyContent: center; color: white; }
            `}</style>
        </div>
    );
}
