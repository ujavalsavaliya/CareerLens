import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getMyJobsAPI, deleteJobAPI } from '../../api/axiosClient';
import { Briefcase, Users, Eye, Trash2, Plus, MapPin, Clock, Search, ChevronRight } from 'lucide-react';
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
                                                    <Users size={12} className="text-amber-400" /> {job.applicants?.length || 0} applicants
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
                                    <div className="flex items-center gap-3 shrink-0">
                                        <Link to={`/hr/jobs/${job._id}/candidates`} className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-white/5 border border-white/10 text-white rounded-xl font-bold hover:bg-primary hover:border-primary transition-all group/btn">
                                            <Users size={16} /> 
                                            <span>AI Candidates</span>
                                            <ChevronRight size={14} className="group-hover/btn:translate-x-0.5 transition-transform" />
                                        </Link>
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
        </div>
    );
}
