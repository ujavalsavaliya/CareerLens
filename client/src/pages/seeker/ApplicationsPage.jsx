import { useEffect, useState } from 'react';
import { getMyApplicationsAPI } from '../../api/axiosClient';
import { Briefcase, MapPin, Clock, CheckCircle, XCircle, AlertCircle, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';

const statusConfig = {
    applied: { icon: Clock, color: '#818cf8', label: 'Applied', badge: 'badge-primary' },
    shortlisted: { icon: CheckCircle, color: '#34d399', label: 'Shortlisted', badge: 'badge-success' },
    interview: { icon: Calendar, color: '#fcd34d', label: 'Interview', badge: 'badge-warning' },
    rejected: { icon: XCircle, color: '#f87171', label: 'Rejected', badge: 'badge-danger' },
};

export default function ApplicationsPage() {
    const [apps, setApps] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getMyApplicationsAPI().then(r => setApps(r.data || [])).finally(() => setLoading(false));
    }, []);

    if (loading) return (
        <div className="page-container">{[...Array(4)].map((_, i) => <div key={i} className="skeleton mb-4" style={{ height: 100, borderRadius: 14 }} />)}</div>
    );

    return (
        <div className="page-container animate-fade-in">
            <div className="page-header">
                <h1>My Applications</h1>
                <p>{apps.length} application{apps.length !== 1 ? 's' : ''} total</p>
            </div>

            {apps.length === 0 ? (
                <div className="empty-state">
                    <Briefcase size={48} />
                    <h3>No Applications Yet</h3>
                    <p>Start browsing jobs and apply to your first role!</p>
                    <Link to="/jobs" className="btn btn-primary mt-4">Browse Jobs</Link>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {apps.map((app, i) => {
                        const cfg = statusConfig[app.status] || statusConfig.applied;
                        const Icon = cfg.icon;
                        return (
                            <div key={i} className="glass-card" style={{ padding: 20, display: 'flex', alignItems: 'center', gap: 16 }}>
                                <div style={{ width: 48, height: 48, background: 'var(--gradient-1)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 18, color: 'white', flexShrink: 0 }}>
                                    {app.job?.company?.charAt(0)}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>
                                        <Link to={`/jobs/${app.job?._id}`} style={{ color: 'var(--text-primary)' }}>{app.job?.title}</Link>
                                    </div>
                                    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                                        <span style={{ fontSize: 13, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}><Briefcase size={12} /> {app.job?.company}</span>
                                        <span style={{ fontSize: 13, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}><MapPin size={12} /> {app.job?.location}</span>
                                        <span style={{ fontSize: 13, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}><Clock size={12} /> Applied {new Date(app.appliedAt).toLocaleDateString()}</span>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
                                    <span className={`badge ${cfg.badge}`}><Icon size={12} /> {cfg.label}</span>
                                    {app.aiMatchScore > 0 && (
                                        <span style={{ fontSize: 13, fontWeight: 700, color: app.aiMatchScore >= 80 ? '#34d399' : app.aiMatchScore >= 60 ? '#fcd34d' : '#f87171' }}>
                                            {app.aiMatchScore}% match
                                        </span>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
