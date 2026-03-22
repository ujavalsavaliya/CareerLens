import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getMyJobsAPI, deleteJobAPI, updateJobAPI } from '../../api/axiosClient';
import { Briefcase, Users, Eye, Trash2, Plus, MapPin, Clock, Edit3, X, Sparkles, ChevronRight, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ManageJobsPage() {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingJob, setEditingJob] = useState(null);
    const [editForm, setEditForm] = useState({ title: '', description: '', location: '', jobType: '', experienceLevel: '', salaryRange: '' });

    const loadJobs = () => {
        setLoading(true);
        getMyJobsAPI()
            .then(r => setJobs(r.data || []))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        loadJobs();
    }, []);

    const handleDelete = async (id) => {
        if (!confirm('Delete this job posting? This action cannot be undone.')) return;
        try {
            await deleteJobAPI(id);
            setJobs(j => j.filter(x => x._id !== id));
            toast.success('Job deleted successfully');
        } catch { 
            toast.error('Failed to delete job'); 
        }
    };

    const handleEdit = (job) => {
        setEditingJob(job);
        setEditForm({
            title: job.title || '',
            description: job.description || '',
            location: job.location || '',
            jobType: job.jobType || 'full-time',
            experienceLevel: job.experienceLevel || 'mid',
            salaryRange: job.salaryRange || ''
        });
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            await updateJobAPI(editingJob._id, editForm);
            toast.success('Job updated successfully');
            setEditingJob(null);
            loadJobs();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Update failed');
        }
    };

    if (loading) {
        return (
            <div className="max-w-7xl mx-auto p-6 lg:p-10 space-y-4 animate-pulse">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-28 bg-white/5 border border-white/10 rounded-2xl" />
                ))}
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-bg-dark p-6 lg:p-10 animate-fade-in relative">
            {/* Background Decor */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
            
            <div className="max-w-7xl mx-auto relative z-10">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-10">
                    <div>
                        <h1 className="text-3xl font-display font-black text-text-primary">My Job Postings</h1>
                        <p className="text-text-secondary mt-1 font-medium">
                            {jobs.length} active posting{jobs.length !== 1 ? 's' : ''} under your account
                        </p>
                    </div>
                    <Link to="/hr/post-job" className="flex items-center gap-2 px-6 py-3 bg-linear-to-r from-primary to-primary-dark text-white rounded-xl font-bold shadow-lg shadow-primary/25 hover:scale-105 transition-transform">
                        <Plus size={18} /> Post New Job
                    </Link>
                </div>

                {jobs.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-20 bg-bg-card/40 backdrop-blur-xl border border-white/10 rounded-[40px] text-center">
                        <div className="w-20 h-20 rounded-3xl bg-white/5 flex items-center justify-center text-text-muted mb-6">
                            <Briefcase size={40} />
                        </div>
                        <h3 className="text-2xl font-display font-black text-text-primary mb-3">No Jobs Posted Yet</h3>
                        <p className="text-text-secondary max-w-sm mb-8 leading-relaxed">
                            Create your first job posting and let our AI-powered engine help you find the perfect talent for your team.
                        </p>
                        <Link to="/hr/post-job" className="flex items-center gap-2 px-8 py-3 bg-white/5 border border-white/15 text-text-primary rounded-xl font-bold hover:bg-white/10 transition-colors">
                            <Plus size={18} /> Post a Job Now
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {jobs.map(job => (
                            <div key={job._id} className="group bg-bg-card/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:border-primary/40 transition-all duration-300">
                                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                                    <div className="flex items-start gap-5">
                                        <div className="w-14 h-14 rounded-2xl bg-linear-to-br from-primary to-secondary flex items-center justify-center text-white font-black text-xl shadow-lg shrink-0">
                                            {job.title?.charAt(0)}
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-display font-black text-text-primary group-hover:text-primary-light transition-colors">{job.title}</h3>
                                            <div className="flex flex-wrap gap-x-5 gap-y-2 mt-2">
                                                <span className="flex items-center gap-1.5 text-xs font-bold text-text-muted uppercase tracking-wider">
                                                    <MapPin size={12} className="text-secondary" /> {job.location}
                                                </span>
                                                <span className="flex items-center gap-1.5 text-xs font-bold text-text-muted uppercase tracking-wider">
                                                    <Clock size={12} className="text-primary" /> {job.jobType}
                                                </span>
                                                <span className="flex items-center gap-1.5 text-xs font-bold text-text-muted uppercase tracking-wider">
                                                    <Users size={12} className="text-amber-400" /> {job.applicants?.filter(a => a.status === 'applied').length || 0} New
                                                </span>
                                                <span className="flex items-center gap-1.5 text-xs font-bold text-text-muted uppercase tracking-wider">
                                                    <CheckCircle size={12} className="text-success" /> {job.applicants?.filter(a => ['shortlisted', 'interview', 'selected'].includes(a.status?.toLowerCase())).length || 0} Shortlisted
                                                </span>
                                                <span className="flex items-center gap-1.5 text-xs font-bold text-text-muted uppercase tracking-wider">
                                                    <Eye size={12} className="text-cyan-400" /> {job.views || 0} views
                                                </span>
                                            </div>
                                            <div className="flex flex-wrap gap-2 mt-4">
                                                {(job.aiKeywords || []).slice(0, 5).map(k => (
                                                    <span key={k} className="px-3 py-1 bg-primary/10 text-primary-light border border-primary/20 rounded-full text-[10px] font-black uppercase tracking-wider">
                                                        {k}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="flex flex-wrap items-center gap-3 shrink-0">
                                        <Link 
                                            to={`/hr/jobs/${job._id}/applicants`} 
                                            className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 text-text-primary rounded-xl font-bold hover:bg-white/10 transition-all text-sm"
                                        >
                                            <Users size={14} /> New Applicants
                                        </Link>
                                        <Link 
                                            to={`/hr/jobs/${job._id}/applicants?tab=shortlisted`} 
                                            className="flex items-center gap-2 px-4 py-2 bg-success/10 border border-success/20 text-success rounded-xl font-bold hover:bg-success/20 transition-all text-sm"
                                        >
                                            <CheckCircle size={14} /> Shortlisted
                                        </Link>
                                        <Link 
                                            to={`/hr/jobs/${job._id}/candidates`} 
                                            className="flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 text-primary-light rounded-xl font-bold hover:bg-primary/20 transition-all text-sm"
                                        >
                                            <Sparkles size={14} /> AI Matches
                                        </Link>
                                        <button 
                                            className="p-2.5 text-text-muted hover:text-primary hover:bg-primary/10 border border-transparent hover:border-primary/20 rounded-xl transition-all"
                                            onClick={() => handleEdit(job)}
                                            title="Edit Job"
                                        >
                                            <Edit3 size={18} />
                                        </button>
                                        <button 
                                            className="p-2.5 text-text-muted hover:text-danger hover:bg-danger/10 border border-transparent hover:border-danger/20 rounded-xl transition-all"
                                            onClick={() => handleDelete(job._id)}
                                            title="Delete Job"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Edit Modal */}
            {editingJob && (
                <div className="modal-overlay" onClick={() => setEditingJob(null)}>
                    <div className="modal-content glass-card animate-scale-in" onClick={e => e.stopPropagation()} style={{ maxWidth: 600 }}>
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-display font-black text-text-primary">Edit Job Posting</h2>
                            <button className="p-2 text-text-muted hover:text-text-primary transition-colors" onClick={() => setEditingJob(null)}>
                                <X size={24} />
                            </button>
                        </div>
                        
                        <form onSubmit={handleUpdate} className="space-y-5">
                            <div className="form-group">
                                <label className="block text-xs font-black uppercase tracking-widest text-text-muted mb-2">Job Title</label>
                                <input 
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-text-primary focus:border-primary outline-hidden transition-all" 
                                    value={editForm.title} 
                                    onChange={e => setEditForm({...editForm, title: e.target.value})} 
                                    required 
                                />
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div className="form-group">
                                    <label className="block text-xs font-black uppercase tracking-widest text-text-muted mb-2">Job Type</label>
                                    <select 
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-text-primary focus:border-primary outline-hidden transition-all appearance-none" 
                                        value={editForm.jobType} 
                                        onChange={e => setEditForm({...editForm, jobType: e.target.value})}
                                    >
                                        {['full-time', 'part-time', 'contract', 'internship', 'remote'].map(t => (
                                            <option key={t} value={t} className="bg-bg-dark">{t}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="block text-xs font-black uppercase tracking-widest text-text-muted mb-2">Experience Level</label>
                                    <select 
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-text-primary focus:border-primary outline-hidden transition-all appearance-none" 
                                        value={editForm.experienceLevel} 
                                        onChange={e => setEditForm({...editForm, experienceLevel: e.target.value})}
                                    >
                                        {['entry', 'mid', 'senior', 'lead'].map(l => (
                                            <option key={l} value={l} className="bg-bg-dark">{l}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="form-group">
                                    <label className="block text-xs font-black uppercase tracking-widest text-text-muted mb-2">Location</label>
                                    <input 
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-text-primary focus:border-primary outline-hidden transition-all" 
                                        value={editForm.location} 
                                        onChange={e => setEditForm({...editForm, location: e.target.value})} 
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="block text-xs font-black uppercase tracking-widest text-text-muted mb-2">Salary Range</label>
                                    <input 
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-text-primary focus:border-primary outline-hidden transition-all" 
                                        value={editForm.salaryRange} 
                                        onChange={e => setEditForm({...editForm, salaryRange: e.target.value})} 
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="block text-xs font-black uppercase tracking-widest text-text-muted mb-2">Description</label>
                                <textarea 
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-text-primary focus:border-primary outline-hidden transition-all resize-none" 
                                    rows={5} 
                                    value={editForm.description} 
                                    onChange={e => setEditForm({...editForm, description: e.target.value})} 
                                    required 
                                />
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button 
                                    type="button" 
                                    className="flex-1 px-6 py-3 border border-white/10 text-text-primary rounded-xl font-bold hover:bg-white/5 transition-all" 
                                    onClick={() => setEditingJob(null)}
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit" 
                                    className="flex-1 px-6 py-3 bg-linear-to-r from-primary to-primary-dark text-white rounded-xl font-bold shadow-lg shadow-primary/25 hover:scale-105 transition-all"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <style>{`
                .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.8); backdrop-filter: blur(8px); display: flex; align-items: center; justifyContent: center; z-index: 2000; padding: 20px; }
                .modal-content { width: 100%; max-width: 600px; padding: 32px; border: 1px solid rgba(255,255,255,0.1); border-radius: 32px; background: rgba(15,15,20,0.8); }
                @keyframes scaleIn { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
                .animate-scale-in { animation: scaleIn 0.3s cubic-bezier(0.1, 0, 0.1, 1); }
                .glass-card { background: rgba(255, 255, 255, 0.03); backdrop-filter: blur(20px); box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37); }
            `}</style>
        </div>
    );
}
