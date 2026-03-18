import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getJobByIdAPI, applyToJobAPI } from '../../api/axiosClient';
import { useSelector } from 'react-redux';
import { MapPin, Clock, DollarSign, Briefcase, Users, ArrowLeft, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function JobDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useSelector(s => s.auth);
    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(true);
    const [applying, setApplying] = useState(false);
    const [applied, setApplied] = useState(false);
    const [cover, setCover] = useState('');

    useEffect(() => {
        getJobByIdAPI(id).then(r => {
            setJob(r.data);
            setApplied(r.data.applicants?.some(a => a.user === user?._id));
        }).finally(() => setLoading(false));
    }, [id]);

    const handleApply = async () => {
        setApplying(true);
        try {
            const r = await applyToJobAPI(id, { coverLetter: cover });
            setApplied(true);
            toast.success(`Applied successfully! AI Match: ${r.data.aiMatchScore}% 🎯`);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Apply failed');
        } finally { setApplying(false); }
    };

    if (loading) return <div className="page-container"><div className="skeleton" style={{ height: 500, borderRadius: 16 }} /></div>;
    if (!job) return <div className="page-container"><div className="empty-state"><h3>Job not found</h3></div></div>;

    return (
        <div className="page-container animate-fade-in">
            <button className="btn btn-ghost btn-sm mb-4" onClick={() => navigate(-1)}><ArrowLeft size={16} /> Back</button>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24, alignItems: 'start' }}>
                <div>
                    <div className="glass-card mb-6" style={{ padding: 28 }}>
                        <div style={{ display: 'flex', gap: 16, marginBottom: 20 }}>
                            <div style={{ width: 60, height: 60, background: 'var(--gradient-1)', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 800, color: 'white' }}>
                                {job.company?.charAt(0)}
                            </div>
                            <div>
                                <h1 style={{ fontSize: 24, marginBottom: 4 }}>{job.title}</h1>
                                <div style={{ fontSize: 15, color: 'var(--text-secondary)' }}>{job.company}</div>
                            </div>
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, marginBottom: 20 }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, color: 'var(--text-secondary)' }}><MapPin size={14} /> {job.location}</span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, color: 'var(--text-secondary)' }}><Clock size={14} /> {job.jobType}</span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, color: 'var(--text-secondary)' }}><Briefcase size={14} /> {job.experienceLevel} level</span>
                            {job.salaryRange !== 'Not disclosed' && <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, color: '#34d399' }}><DollarSign size={14} /> {job.salaryRange}</span>}
                            <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, color: 'var(--text-muted)' }}><Users size={14} /> {job.applicants?.length || 0} applied</span>
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
                            {(job.aiKeywords || []).map(k => <span key={k} className="skill-chip">{k}</span>)}
                        </div>
                    </div>

                    <div className="glass-card mb-4" style={{ padding: 28 }}>
                        <h2 style={{ marginBottom: 16 }}>About the Role</h2>
                        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>{job.description}</p>
                    </div>

                    {job.requirements && (
                        <div className="glass-card" style={{ padding: 28 }}>
                            <h2 style={{ marginBottom: 16 }}>Requirements</h2>
                            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>{job.requirements}</p>
                        </div>
                    )}
                </div>

                {/* Apply Card */}
                <div className="glass-card" style={{ padding: 24, position: 'sticky', top: 80 }}>
                    <h3 style={{ marginBottom: 16 }}>Apply for this role</h3>
                    {applied ? (
                        <div style={{ textAlign: 'center', padding: '20px 0' }}>
                            <CheckCircle size={40} style={{ color: '#34d399', margin: '0 auto 12px' }} />
                            <div style={{ fontWeight: 700, marginBottom: 6 }}>Application Sent!</div>
                            <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>The recruiter will review your profile and contact you.</div>
                        </div>
                    ) : (
                        <>
                            <div className="form-group mb-4">
                                <label className="form-label">Cover Letter (optional)</label>
                                <textarea className="form-input" rows={5} placeholder="Tell the recruiter why you're a great fit..."
                                    value={cover} onChange={e => setCover(e.target.value)} />
                            </div>
                            <button className="btn btn-primary w-full" onClick={handleApply} disabled={applying}>
                                {applying ? <><span className="btn-spinner" /> Computing AI Match Score...</> : 'Apply Now'}
                            </button>
                            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 10, textAlign: 'center' }}>
                                AI will compute your match score upon applying
                            </p>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
