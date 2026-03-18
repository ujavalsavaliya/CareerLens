import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { createJobAPI } from '../../api/axiosClient';
import { Briefcase, MapPin, DollarSign, Zap, Plus, X } from 'lucide-react';
import toast from 'react-hot-toast';

export default function PostJobPage() {
    const navigate = useNavigate();
    const { user } = useSelector(s => s.auth);
    const [loading, setLoading] = useState(false);
    const [skillInput, setSkillInput] = useState('');
    const [form, setForm] = useState({
        title: '', description: '', requirements: '',
        location: 'Remote', jobType: 'full-time', experienceLevel: 'mid',
        salaryRange: '', skills: []
    });

    const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

    const addSkill = () => {
        const s = skillInput.trim();
        if (!s || form.skills.includes(s)) return;
        set('skills', [...form.skills, s]);
        setSkillInput('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.title || !form.description) return toast.error('Title and description required');
        setLoading(true);
        try {
            const r = await createJobAPI(form);
            toast.success('Job posted! AI keywords extracted. 🎯');
            navigate(`/hr/jobs/${r.data._id}/candidates`);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to post job');
        } finally { setLoading(false); }
    };

    return (
        <div className="page-container animate-fade-in" style={{ maxWidth: 800 }}>
            <div className="page-header">
                <h1><Briefcase size={24} style={{ display: 'inline', marginRight: 10 }} />Post a New Job</h1>
                <p>Fill in the details below. Our AI will automatically extract keywords and rank candidates for you.</p>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="glass-card mb-4" style={{ padding: 28 }}>
                    <h3 className="mb-4">Basic Information</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <div className="form-group">
                            <label className="form-label">Job Title *</label>
                            <input className="form-input" placeholder="e.g. Senior React Developer" value={form.title} onChange={e => set('title', e.target.value)} required />
                        </div>
                        <div className="grid-2">
                            <div className="form-group">
                                <label className="form-label">Job Type</label>
                                <select className="form-input form-select" value={form.jobType} onChange={e => set('jobType', e.target.value)}>
                                    {['full-time', 'part-time', 'contract', 'internship', 'remote'].map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Experience Level</label>
                                <select className="form-input form-select" value={form.experienceLevel} onChange={e => set('experienceLevel', e.target.value)}>
                                    {['entry', 'mid', 'senior', 'lead'].map(l => <option key={l} value={l}>{l}</option>)}
                                </select>
                            </div>
                        </div>
                        <div className="grid-2">
                            <div className="form-group">
                                <label className="form-label"><MapPin size={13} style={{ display: 'inline' }} /> Location</label>
                                <input className="form-input" placeholder="e.g. New York, USA or Remote" value={form.location} onChange={e => set('location', e.target.value)} />
                            </div>
                            <div className="form-group">
                                <label className="form-label"><DollarSign size={13} style={{ display: 'inline' }} /> Salary Range</label>
                                <input className="form-input" placeholder="e.g. $80K - $120K / year" value={form.salaryRange} onChange={e => set('salaryRange', e.target.value)} />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="glass-card mb-4" style={{ padding: 28 }}>
                    <h3 className="mb-4">Job Details</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <div className="form-group">
                            <label className="form-label">Job Description * <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(AI will extract keywords from this)</span></label>
                            <textarea className="form-input" rows={6} placeholder="Describe the role, responsibilities, team culture..."
                                value={form.description} onChange={e => set('description', e.target.value)} required />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Requirements</label>
                            <textarea className="form-input" rows={4} placeholder="List specific requirements, qualifications..."
                                value={form.requirements} onChange={e => set('requirements', e.target.value)} />
                        </div>
                    </div>
                </div>

                <div className="glass-card mb-6" style={{ padding: 28 }}>
                    <h3 className="mb-4">Required Skills</h3>
                    <div className="flex gap-2 mb-4">
                        <input className="form-input" placeholder="Add a required skill..." value={skillInput}
                            onChange={e => setSkillInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSkill())} />
                        <button type="button" className="btn btn-primary btn-icon" onClick={addSkill}><Plus size={18} /></button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {form.skills.map(s => (
                            <span key={s} className="skill-chip" style={{ gap: 6 }}>
                                {s} <X size={12} style={{ cursor: 'pointer' }} onClick={() => set('skills', form.skills.filter(x => x !== s))} />
                            </span>
                        ))}
                    </div>
                </div>

                <div style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 12, padding: '14px 18px', marginBottom: 24, fontSize: 13, color: 'var(--primary-light)', display: 'flex', gap: 10 }}>
                    <Zap size={16} style={{ flexShrink: 0, marginTop: 1 }} />
                    <span>After posting, our AI will automatically extract keywords from your description and rank all matching candidates by fit score.</span>
                </div>

                <button type="submit" className="btn btn-primary btn-lg w-full" disabled={loading}>
                    {loading ? <><span className="btn-spinner" /> Posting & Extracting AI Keywords...</> : <><Zap size={18} /> Post Job with AI Matching</>}
                </button>
            </form>
        </div>
    );
}
