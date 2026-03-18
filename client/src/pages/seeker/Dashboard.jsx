import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { getMyProfileAPI, getRecommendedJobsAPI } from '../../api/axiosClient';
import SocialFeed from '../../components/SocialFeed';
import { Brain, Briefcase, FileText, ArrowRight, CheckCircle, AlertCircle, TrendingUp, Star, MapPin, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import './Dashboard.css';

function ScoreRing({ score }) {
    const r = 54, c = 2 * Math.PI * r;
    const offset = c - (score / 100) * c;
    return (
        <div className="score-ring-wrap">
            <svg width="140" height="140" viewBox="0 0 130 130">
                <circle cx="65" cy="65" r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="10" />
                <circle cx="65" cy="65" r={r} fill="none" stroke="url(#dashGrad)" strokeWidth="10"
                    strokeDasharray={c} strokeDashoffset={offset} strokeLinecap="round" transform="rotate(-90 65 65)"
                    style={{ transition: 'stroke-dashoffset 1.5s ease' }} />
                <defs>
                    <linearGradient id="dashGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#6366f1" />
                        <stop offset="100%" stopColor="#06b6d4" />
                    </linearGradient>
                </defs>
            </svg>
            <div className="score-ring-text">
                <div className="score-big gradient-text">{score}</div>
                <div className="score-sub">/ 100</div>
            </div>
        </div>
    );
}

export default function Dashboard() {
    const { user } = useSelector(s => s.auth);
    const [profile, setProfile] = useState(null);
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                const [profileRes, jobsRes] = await Promise.all([
                    getMyProfileAPI(),
                    getRecommendedJobsAPI()
                ]);
                setProfile(profileRes.data);
                setJobs(jobsRes.data.slice(0, 6));
            } catch (err) {
                toast.error('Failed to load dashboard');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    if (loading) return (
        <div className="page-container">
            <div className="dashboard-skeleton">
                {[...Array(4)].map((_, i) => <div key={i} className="skeleton" style={{ height: 120, borderRadius: 16 }} />)}
            </div>
        </div>
    );

    const score = profile?.aiAnalysis?.score || 0;
    const completion = profile?.completionPercentage || 0;

    return (
        <div className="page-container animate-fade-in">
            {/* Welcome */}
            <div className="dashboard-welcome">
                <div>
                    <h1>Welcome back, <span className="gradient-text">{user?.name?.split(' ')[0]}</span> 👋</h1>
                    <p>Here's what's happening with your career today.</p>
                </div>
                <Link to="/profile" className="btn btn-primary">
                    <FileText size={16} /> Update Profile
                </Link>
            </div>

            {/* Top Stats */}
            <div className="dash-stats">
                <div className="dash-stat-card">
                    <div className="dash-stat-icon" style={{ background: 'rgba(99,102,241,0.15)', color: '#818cf8' }}>
                        <Brain size={22} />
                    </div>
                    <div>
                        <div className="stat-number gradient-text">{score}</div>
                        <div className="stat-label">AI Resume Score</div>
                    </div>
                </div>
                <div className="dash-stat-card">
                    <div className="dash-stat-icon" style={{ background: 'rgba(6,182,212,0.15)', color: '#22d3ee' }}>
                        <TrendingUp size={22} />
                    </div>
                    <div>
                        <div className="stat-number" style={{ color: '#22d3ee' }}>{completion}%</div>
                        <div className="stat-label">Profile Complete</div>
                    </div>
                </div>
                <div className="dash-stat-card">
                    <div className="dash-stat-icon" style={{ background: 'rgba(16,185,129,0.15)', color: '#34d399' }}>
                        <Briefcase size={22} />
                    </div>
                    <div>
                        <div className="stat-number" style={{ color: '#34d399' }}>{jobs.length}</div>
                        <div className="stat-label">Matched Jobs</div>
                    </div>
                </div>
                <div className="dash-stat-card">
                    <div className="dash-stat-icon" style={{ background: 'rgba(245,158,11,0.15)', color: '#fcd34d' }}>
                        <Star size={22} />
                    </div>
                    <div>
                        <div className="stat-number" style={{ color: '#fcd34d' }}>{profile?.skills?.length || 0}</div>
                        <div className="stat-label">Skills Listed</div>
                    </div>
                </div>
            </div>

            <div className="dash-main-grid">
                {/* AI Score Card */}
                <div className="glass-card ai-score-card">
                    <div className="card-title">
                        <Brain size={18} /> AI Profile Score
                    </div>
                    {score === 0 ? (
                        <div className="empty-state" style={{ padding: '30px 0' }}>
                            <AlertCircle size={40} />
                            <h3>No Analysis Yet</h3>
                            <p>Upload your resume to get AI feedback</p>
                            <Link to="/profile" className="btn btn-primary btn-sm mt-4">Upload Resume</Link>
                        </div>
                    ) : (
                        <>
                            <ScoreRing score={score} />
                            <div className="score-label-text">{score >= 80 ? '🔥 Excellent Profile!' : score >= 60 ? '✅ Good Profile' : '⚠️ Needs Improvement'}</div>
                            <Link to="/ai-feedback" className="btn btn-secondary w-full mt-4">
                                View Full Analysis <ArrowRight size={14} />
                            </Link>
                        </>
                    )}
                </div>

                {/* Profile Completion */}
                <div className="glass-card">
                    <div className="card-title"><CheckCircle size={18} /> Profile Completion</div>
                    <div className="completion-list">
                        {[
                            { key: 'headline', label: 'Professional Headline', done: !!profile?.headline },
                            { key: 'summary', label: 'Profile Summary', done: !!profile?.summary },
                            { key: 'skills', label: 'Skills Added', done: (profile?.skills?.length || 0) > 0 },
                            { key: 'experience', label: 'Work Experience', done: (profile?.experience?.length || 0) > 0 },
                            { key: 'education', label: 'Education', done: (profile?.education?.length || 0) > 0 },
                            { key: 'resume', label: 'Resume Uploaded', done: !!profile?.resume?.url },
                        ].map(({ key, label, done }) => (
                            <div key={key} className={`completion-item ${done ? 'done' : ''}`}>
                                <CheckCircle size={16} />
                                <span>{label}</span>
                                {!done && <Link to="/profile" className="fix-link">Fix</Link>}
                            </div>
                        ))}
                    </div>
                    <div className="progress-bar mt-4">
                        <div className="progress-fill" style={{ width: `${completion}%` }} />
                    </div>
                    <div style={{ textAlign: 'right', fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>{completion}% complete</div>
                </div>
            </div>

            {/* Social Feed */}
            <div className="dash-jobs-section" style={{ marginTop: 32 }}>
                <div className="section-title-row">
                    <h2>Professional Feed</h2>
                    <Link to="/feed" className="btn btn-ghost btn-sm">
                        Open Full Feed <ArrowRight size={14} />
                    </Link>
                </div>
                <SocialFeed />
            </div>

            {/* Recommended Jobs */}
            <div className="dash-jobs-section">
                <div className="section-title-row">
                    <h2><Briefcase size={20} /> Recommended Jobs</h2>
                    <Link to="/jobs" className="btn btn-ghost btn-sm">View All <ArrowRight size={14} /></Link>
                </div>
                {jobs.length === 0 ? (
                    <div className="empty-state">
                        <Briefcase size={40} />
                        <h3>No Recommendations Yet</h3>
                        <p>Add skills to your profile to get personalized job matches</p>
                    </div>
                ) : (
                    <div className="grid-auto">
                        {jobs.map(job => (
                            <Link to={`/jobs/${job._id}`} key={job._id} className="job-card glass-card">
                                <div className="job-card-header">
                                    <div className="company-avatar">{job.company?.charAt(0)}</div>
                                    <div>
                                        <h3 className="job-title">{job.title}</h3>
                                        <div className="job-company">{job.company}</div>
                                    </div>
                                    {job.matchScore > 0 && (
                                        <div className={`match-badge ${job.matchScore >= 80 ? 'match-high' : job.matchScore >= 60 ? 'match-mid' : 'match-low'}`}>
                                            {job.matchScore}%
                                        </div>
                                    )}
                                </div>
                                <div className="job-meta">
                                    <span><MapPin size={12} /> {job.location}</span>
                                    <span><Clock size={12} /> {job.jobType}</span>
                                </div>
                                <div className="job-skills">
                                    {(job.skills || job.aiKeywords || []).slice(0, 3).map(s => (
                                        <span key={s} className="skill-chip">{s}</span>
                                    ))}
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
