import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getMyJobsAPI, deleteJobAPI } from '../../api/axiosClient';
import { Briefcase, Users, Eye, Trash2, Plus, MapPin, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ManageJobsPage() {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getMyJobsAPI().then(r => setJobs(r.data || [])).finally(() => setLoading(false));
    }, []);

    const handleDelete = async (id) => {
        if (!confirm('Delete this job posting?')) return;
        try {
            await deleteJobAPI(id);
            setJobs(j => j.filter(x => x._id !== id));
            toast.success('Job deleted');
        } catch { toast.error('Delete failed'); }
    };

    if (loading) return <div className="page-container">{[...Array(3)].map((_, i) => <div key={i} className="skeleton mb-4" style={{ height: 100, borderRadius: 14 }} />)}</div>;

    return (
        <div className="page-container animate-fade-in">
            <div className="flex justify-between items-center mb-6" style={{ flexWrap: 'wrap', gap: 16 }}>
                <div>
                    <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28 }}>My Job Postings</h1>
                    <p style={{ color: 'var(--text-secondary)', marginTop: 4 }}>{jobs.length} active posting{jobs.length !== 1 ? 's' : ''}</p>
                </div>
                <Link to="/hr/post-job" className="btn btn-primary"><Plus size={16} /> Post New Job</Link>
            </div>

            {jobs.length === 0 ? (
                <div className="empty-state">
                    <Briefcase size={48} />
                    <h3>No Jobs Posted Yet</h3>
                    <p>Create your first job posting and let AI find the best candidates for you.</p>
                    <Link to="/hr/post-job" className="btn btn-primary mt-4"><Plus size={16} /> Post a Job</Link>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {jobs.map(job => (
                        <div key={job._id} className="glass-card" style={{ padding: 20 }}>
                            <div className="flex justify-between items-start" style={{ flexWrap: 'wrap', gap: 12 }}>
                                <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                                    <div style={{ width: 48, height: 48, background: 'var(--gradient-1)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 18, color: 'white', flexShrink: 0 }}>
                                        {job.title?.charAt(0)}
                                    </div>
                                    <div>
                                        <h3 style={{ fontSize: 16, marginBottom: 4 }}>{job.title}</h3>
                                        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                                            <span style={{ fontSize: 13, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}><MapPin size={12} /> {job.location}</span>
                                            <span style={{ fontSize: 13, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}><Clock size={12} /> {job.jobType}</span>
                                            <span style={{ fontSize: 13, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}><Users size={12} /> {job.applicants?.length || 0} applicants</span>
                                            <span style={{ fontSize: 13, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}><Eye size={12} /> {job.views || 0} views</span>
                                        </div>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
                                            {(job.aiKeywords || []).slice(0, 5).map(k => <span key={k} className="skill-chip" style={{ fontSize: 11 }}>{k}</span>)}
                                        </div>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: 8 }}>
                                    <Link to={`/hr/jobs/${job._id}/candidates`} className="btn btn-secondary btn-sm">
                                        <Users size={14} /> AI Candidates
                                    </Link>
                                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(job._id)}>
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
