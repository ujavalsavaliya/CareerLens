import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Briefcase, Plus } from 'lucide-react';

export default function HRDashboard() {
    const { user } = useSelector(s => s.auth);
    return (
        <div className="page-container animate-fade-in">
            <div className="page-header">
                <h1>Welcome, <span className="gradient-text">{user?.name?.split(' ')[0]}</span> 👋</h1>
                <p>Manage your job postings and find top candidates with AI.</p>
            </div>
            <div className="grid-2 mb-6">
                <Link to="/hr/post-job" className="glass-card" style={{ padding: 28, textAlign: 'center', textDecoration: 'none' }}>
                    <div style={{ width: 56, height: 56, background: 'var(--gradient-1)', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: 'white' }}>
                        <Plus size={24} />
                    </div>
                    <h3>Post a New Job</h3>
                    <p style={{ color: 'var(--text-secondary)', marginTop: 8, fontSize: 14 }}>Create a job posting and let AI extract keywords and rank candidates.</p>
                </Link>
                <Link to="/hr/jobs" className="glass-card" style={{ padding: 28, textAlign: 'center', textDecoration: 'none' }}>
                    <div style={{ width: 56, height: 56, background: 'var(--gradient-3)', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: 'white' }}>
                        <Briefcase size={24} />
                    </div>
                    <h3>Manage My Jobs</h3>
                    <p style={{ color: 'var(--text-secondary)', marginTop: 8, fontSize: 14 }}>View your postings, applicants, and AI-ranked candidate lists.</p>
                </Link>
            </div>
        </div>
    );
}
