import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProfileByUserIdAPI } from '../../api/axiosClient';
import { User, Briefcase, GraduationCap, FileText, Award, Link as LinkIcon, ArrowLeft, Mail, MapPin, Globe } from 'lucide-react';
import toast from 'react-hot-toast';

export default function CandidateProfilePage() {
    const { userId } = useParams();
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getProfileByUserIdAPI(userId)
            .then(r => setProfile(r.data))
            .catch(() => toast.error('Failed to load candidate profile'))
            .finally(() => setLoading(false));
    }, [userId]);

    if (loading) return (
        <div className="page-container">
            <div className="skeleton" style={{ height: 400, borderRadius: 24 }} />
        </div>
    );

    if (!profile) return (
        <div className="page-container text-center">
            <h2>Profile not found</h2>
            <button className="btn btn-secondary mt-4" onClick={() => navigate(-1)}>Go Back</button>
        </div>
    );

    const { user, experience = [], education = [], skills = [], aiAnalysis = {} } = profile;

    return (
        <div className="page-container animate-fade-in">
            <button className="btn btn-ghost mb-6" onClick={() => navigate(-1)} style={{ padding: 0, gap: 8 }}>
                <ArrowLeft size={18} /> Back to Candidates
            </button>

            <div className="profile-layout" style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 24 }}>
                {/* Left Sidebar */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                    <div className="glass-card text-center" style={{ padding: 32 }}>
                        <div className="avatar mx-auto mb-6" style={{ width: 100, height: 100, borderRadius: 30, background: 'var(--gradient-1)', fontSize: 36, fontWeight: 800 }}>
                            {user?.name?.charAt(0)}
                        </div>
                        <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>{user?.name}</h2>
                        <p style={{ color: 'var(--primary-light)', fontWeight: 600, fontSize: 14, marginBottom: 20 }}>{profile.headline || 'Professional profile'}</p>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, textAlign: 'left', padding: '20px 0', borderTop: '1px solid var(--border)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: 'var(--text-secondary)' }}>
                                <Mail size={16} /> {user?.email}
                            </div>
                            {profile.location && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: 'var(--text-secondary)' }}>
                                    <MapPin size={16} /> {profile.location}
                                </div>
                            )}
                            {profile.website && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: 'var(--text-secondary)' }}>
                                    <Globe size={16} /> {profile.website}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="glass-card" style={{ padding: 24 }}>
                        <h4 style={{ fontSize: 13, textTransform: 'uppercase', letterSpacing: 1, color: 'var(--text-muted)', marginBottom: 20, fontWeight: 800 }}>Social Links</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {profile.linkedIn && <a href={profile.linkedIn} target="_blank" rel="noreferrer" className="social-link"><LinkIcon size={16} /> LinkedIn</a>}
                            {profile.github && <a href={profile.github} target="_blank" rel="noreferrer" className="social-link"><Globe size={16} /> GitHub</a>}
                            {profile.portfolio && <a href={profile.portfolio} target="_blank" rel="noreferrer" className="social-link"><LinkIcon size={16} /> Portfolio</a>}
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                    {/* Summary Section */}
                    <div className="glass-card" style={{ padding: 32 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                            <div className="icon-box" style={{ width: 40, height: 40, background: 'rgba(99,102,241,0.1)' }}>
                                <User size={20} color="var(--primary)" />
                            </div>
                            <h3 style={{ margin: 0 }}>Professional Summary</h3>
                        </div>
                        <p style={{ lineHeight: 1.8, color: 'var(--text-secondary)', fontSize: 15 }}>
                            {profile.summary || 'No summary provided.'}
                        </p>
                    </div>

                    {/* AI Analysis (If Available) */}
                    {aiAnalysis.profileSummary && (
                        <div className="glass-card" style={{ padding: 32, border: '1px solid rgba(16,185,129,0.2)', background: 'rgba(16,185,129,0.02)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                                <div className="icon-box" style={{ width: 40, height: 40, background: 'rgba(16,185,129,0.1)' }}>
                                    <FileText size={20} color="#10b981" />
                                </div>
                                <h3 style={{ margin: 0 }}>AI-Generated Insight</h3>
                            </div>
                            <p style={{ lineHeight: 1.8, color: 'var(--text-secondary)', fontSize: 15, fontStyle: 'italic' }}>
                                "{aiAnalysis.profileSummary}"
                            </p>
                        </div>
                    )}

                    {/* Experience Section */}
                    <div className="glass-card" style={{ padding: 32 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                            <div className="icon-box" style={{ width: 40, height: 40, background: 'rgba(251,191,36,0.1)' }}>
                                <Briefcase size={20} color="#fbbf24" />
                            </div>
                            <h3 style={{ margin: 0 }}>Work Experience</h3>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
                            {experience.length > 0 ? experience.map((exp, i) => (
                                <div key={i} className="exp-item" style={{ position: 'relative', paddingLeft: 24, borderLeft: '2px solid var(--border)' }}>
                                    <div style={{ position: 'absolute', left: -7, top: 0, width: 12, height: 12, borderRadius: '50%', background: 'var(--primary)', border: '2px solid var(--bg-deep)' }} />
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                                        <h4 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>{exp.title}</h4>
                                        <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                                            {exp.startDate ? new Date(exp.startDate).getFullYear() : ''} — {exp.current ? 'Present' : exp.endDate ? new Date(exp.endDate).getFullYear() : ''}
                                        </span>
                                    </div>
                                    <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--primary-light)', marginBottom: 12 }}>{exp.company}</div>
                                    <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.6 }}>{exp.description}</p>
                                </div>
                            )) : <p style={{ color: 'var(--text-muted)' }}>No experience listed.</p>}
                        </div>
                    </div>

                    {/* Skills Section */}
                    <div className="glass-card" style={{ padding: 32 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                             <div className="icon-box" style={{ width: 40, height: 40, background: 'rgba(167,139,250,0.1)' }}>
                                <Award size={20} color="#a78bfa" />
                            </div>
                            <h3 style={{ margin: 0 }}>Expertise & Skills</h3>
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                            {skills.map(s => <span key={s} className="skill-chip" style={{ fontSize: 14, padding: '8px 16px' }}>{s}</span>)}
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                .social-link { display: flex; align-items: center; gap: 10px; padding: 10px 14px; border-radius: 10px; background: rgba(255,255,255,0.03); color: var(--text-secondary); text-decoration: none; font-size: 14px; transition: 0.2s; border: 1px solid transparent; }
                .social-link:hover { background: rgba(255,255,255,0.06); color: var(--text-primary); border-color: var(--border); }
                .avatar { display: flex; align-items: center; justifyContent: center; color: white; }
            `}</style>
        </div>
    );
}
