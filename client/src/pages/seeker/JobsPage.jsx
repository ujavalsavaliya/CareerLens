import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getJobsAPI } from '../../api/axiosClient';
import { Briefcase, MapPin, Clock, DollarSign, Search, Filter, Building2 } from 'lucide-react';

const JOB_TYPES = ['full-time', 'part-time', 'contract', 'internship', 'remote'];
const EXP_LEVELS = ['entry', 'mid', 'senior', 'lead'];

export default function JobsPage() {
    const [jobs, setJobs] = useState([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({ search: '', jobType: '', experienceLevel: '', page: 1 });

    const loadJobs = async (f = filters) => {
        setLoading(true);
        try {
            const r = await getJobsAPI({ ...f, limit: 12 });
            setJobs(r.data.jobs || []);
            setTotal(r.data.total || 0);
        } catch { } finally { setLoading(false); }
    };

    useEffect(() => { loadJobs(); }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        loadJobs(filters);
    };

    return (
        <div className="page-container animate-fade-in">
            <div className="page-header">
                <h1>Find Your Next Role</h1>
                <p>{total} jobs available · Updated today</p>
            </div>

            {/* Search bar */}
            <form onSubmit={handleSearch} style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
                <div style={{ position: 'relative', flex: 2, minWidth: 220 }}>
                    <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input className="form-input" style={{ paddingLeft: 42 }} placeholder="Job title, company, or keyword..."
                        value={filters.search} onChange={e => setFilters(f => ({ ...f, search: e.target.value }))} />
                </div>
                <select className="form-input form-select" style={{ flex: 1, minWidth: 140 }} value={filters.jobType}
                    onChange={e => setFilters(f => ({ ...f, jobType: e.target.value }))}>
                    <option value="">All Types</option>
                    {JOB_TYPES.map(t => <option key={t} value={t}>{t.replace('-', ' ')}</option>)}
                </select>
                <select className="form-input form-select" style={{ flex: 1, minWidth: 140 }} value={filters.experienceLevel}
                    onChange={e => setFilters(f => ({ ...f, experienceLevel: e.target.value }))}>
                    <option value="">All Levels</option>
                    {EXP_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
                <button type="submit" className="btn btn-primary"><Search size={16} /> Search</button>
            </form>

            {loading ? (
                <div className="grid-auto">{[...Array(6)].map((_, i) => <div key={i} className="skeleton" style={{ height: 180, borderRadius: 16 }} />)}</div>
            ) : jobs.length === 0 ? (
                <div className="empty-state"><Briefcase size={48} /><h3>No jobs found</h3><p>Try adjusting your search filters</p></div>
            ) : (
                <div className="grid-auto">
                    {jobs.map(job => (
                        <Link to={`/jobs/${job._id}`} key={job._id} className="glass-card job-list-card">
                            <div style={{ display: 'flex', gap: 12, marginBottom: 12, alignItems: 'flex-start' }}>
                                <div style={{ width: 44, height: 44, borderRadius: 10, background: 'var(--gradient-1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 18, color: 'white', flexShrink: 0 }}>
                                    {job.company?.charAt(0)}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 2 }}>{job.title}</div>
                                    <div style={{ fontSize: 13, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                                        <Building2 size={12} /> {job.company}
                                    </div>
                                </div>
                                <span className={`badge ${job.jobType === 'remote' ? 'badge-cyan' : 'badge-primary'}`}>
                                    {job.jobType}
                                </span>
                            </div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 12 }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--text-muted)' }}>
                                    <MapPin size={12} /> {job.location}
                                </span>
                                <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--text-muted)' }}>
                                    <Clock size={12} /> {job.experienceLevel} level
                                </span>
                                {job.salaryRange && job.salaryRange !== 'Not disclosed' && (
                                    <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#34d399' }}>
                                        <DollarSign size={12} /> {job.salaryRange}
                                    </span>
                                )}
                            </div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                                {(job.aiKeywords || job.skills || []).slice(0, 4).map(k => (
                                    <span key={k} className="skill-chip" style={{ fontSize: 11 }}>{k}</span>
                                ))}
                            </div>
                            <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--border)', fontSize: 12, color: 'var(--text-muted)' }}>
                                Posted {new Date(job.createdAt).toLocaleDateString()}  ·  {job.applicants?.length || 0} applicants
                            </div>
                        </Link>
                    ))}
                </div>
            )}
            <style>{`.job-list-card { padding: 20px; display: flex; flex-direction: column; text-decoration: none; }`}</style>
        </div>
    );
}
