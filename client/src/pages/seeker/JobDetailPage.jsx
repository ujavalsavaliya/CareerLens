import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getJobByIdAPI, applyToJobAPI } from '../../api/axiosClient';
import { useSelector } from 'react-redux';
import { MapPin, Clock, DollarSign, Briefcase, Users, ArrowLeft, CheckCircle, Sparkles, Target, Zap, Globe, ShieldCheck } from 'lucide-react';
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
    const [coverFile, setCoverFile] = useState(null);

    useEffect(() => {
        getJobByIdAPI(id).then(r => {
            setJob(r.data);
            setApplied(r.data.applicants?.some(a => (a.user?._id || a.user) === user?._id));
        }).finally(() => setLoading(false));
    }, [id]);

    const handleApply = async () => {
        if (applying) return;
        setApplying(true);
        try {
            const formData = new FormData();
            formData.append('coverLetter', cover);
            if (coverFile) {
                formData.append('coverLetterFile', coverFile);
            }
            
            const r = await applyToJobAPI(id, formData);
            setApplied(true);
            toast.success(`Application Sent! AI Match Score: ${r.data.aiMatchScore}% 🎯`, {
                style: {
                    background: '#1e1e2e',
                    color: '#fff',
                    border: '1px solid rgba(255,255,255,0.1)',
                    backdropFilter: 'blur(10px)'
                }
            });
        } catch (err) {
            toast.error(err.response?.data?.message || 'Application failed to initialize');
        } finally { 
            setApplying(false); 
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-bg-dark p-6 lg:p-10 flex items-center justify-center">
             <div className="relative w-20 h-20">
                <div className="absolute inset-0 border-4 border-primary/20 rounded-full" />
                <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                <Target size={32} className="absolute inset-0 m-auto text-primary animate-pulse" />
            </div>
        </div>
    );

    if (!job) return (
        <div className="min-h-screen bg-bg-dark flex items-center justify-center p-6">
            <div className="text-center bg-bg-card/40 backdrop-blur-xl border border-white/5 p-12 rounded-[48px] max-w-md">
                <ShieldCheck size={48} className="mx-auto text-text-muted/20 mb-6" />
                <h3 className="text-2xl font-display font-black text-text-primary uppercase tracking-tighter mb-4">Object Not Found</h3>
                <p className="text-text-muted mb-8 font-medium">The specified job listing is either inactive or has been purged from the repository.</p>
                <button onClick={() => navigate('/jobs')} className="px-8 py-4 bg-primary text-white font-black rounded-2xl uppercase tracking-widest text-xs hover:scale-105 transition-all">Return to Nexus</button>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-bg-dark p-6 lg:p-10 animate-fade-in relative overflow-hidden">
            {/* Background Orbs */}
            <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] bg-primary/5 blur-[150px] rounded-full pointer-events-none" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-secondary/5 blur-[150px] rounded-full pointer-events-none" />

            <div className="max-w-7xl mx-auto relative z-10">
                <button 
                    className="group mb-12 flex items-center gap-3 text-[10px] font-black text-text-muted uppercase tracking-[0.3em] hover:text-primary-light transition-colors"
                    onClick={() => navigate(-1)}
                >
                    <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-primary/20 group-hover:border-primary/40 transition-all">
                        <ArrowLeft size={16} />
                    </div>
                    Back to Matrix
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
                    {/* Main Content */}
                    <div className="lg:col-span-8 space-y-8">
                        {/* Header Card */}
                        <div className="bg-bg-card/40 backdrop-blur-xl border border-white/5 rounded-[48px] p-8 lg:p-12 shadow-2xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                                <Globe size={120} className="text-primary rotate-12" />
                            </div>
                            
                            <div className="flex flex-col md:flex-row gap-8 items-start relative z-10">
                                <div className="w-24 h-24 bg-linear-to-br from-primary to-secondary rounded-[32px] flex items-center justify-center font-black text-white text-5xl shadow-2xl group-hover:rotate-6 transition-transform flex-shrink-0">
                                    {job.company?.charAt(0)}
                                </div>
                                <div>
                                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 border border-primary/20 rounded-full text-primary-light text-[10px] font-black uppercase tracking-widest mb-4">
                                        <Zap size={12} /> {job.jobType}
                                    </div>
                                    <h1 className="text-4xl lg:text-5xl font-display font-black text-text-primary uppercase tracking-tighter mb-4 leading-none">{job.title}</h1>
                                    <div className="flex flex-wrap items-center gap-6 text-text-muted text-sm font-semibold">
                                        <span className="flex items-center gap-2 tracking-wide"><Briefcase size={16} className="text-primary" /> {job.company}</span>
                                        <span className="flex items-center gap-2 tracking-wide"><MapPin size={16} className="text-secondary" /> {job.location}</span>
                                        <span className="flex items-center gap-2 tracking-wide font-black text-primary-light"><Clock size={16} /> {job.experienceLevel} Level</span>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12 pt-12 border-t border-white/5">
                                <div className="p-4 bg-white/5 rounded-3xl border border-white/5 text-center">
                                    <div className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1">Package</div>
                                    <div className="text-lg font-display font-black text-emerald-400">{job.salaryRange === 'Not disclosed' ? 'Competitive' : job.salaryRange}</div>
                                </div>
                                <div className="p-4 bg-white/5 rounded-3xl border border-white/5 text-center">
                                    <div className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1">Experience</div>
                                    <div className="text-lg font-display font-black text-text-primary uppercase">{job.experienceLevel} Level</div>
                                </div>
                                <div className="p-4 bg-white/5 rounded-3xl border border-white/5 text-center">
                                    <div className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1">Engagement</div>
                                    <div className="text-lg font-display font-black text-text-primary uppercase">{job.jobType}</div>
                                </div>
                                <div className="p-4 bg-white/5 rounded-3xl border border-white/5 text-center">
                                    <div className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1">Applicants</div>
                                    <div className="text-lg font-display font-black text-text-primary uppercase">{job.applicants?.length || 0} Pool</div>
                                </div>
                            </div>
                        </div>

                        {/* Description */}
                        <div className="bg-bg-card/40 backdrop-blur-xl border border-white/5 rounded-[48px] p-8 lg:p-12 shadow-2xl">
                            <h2 className="text-2xl font-display font-black text-text-primary uppercase tracking-tighter mb-8 flex items-center gap-3">
                                <Target size={24} className="text-primary" /> Role Architecture
                            </h2>
                            <div className="prose prose-invert max-w-none">
                                <p className="text-text-muted text-lg leading-relaxed font-medium whitespace-pre-wrap opacity-90">{job.description}</p>
                            </div>
                        </div>

                        {/* Requirements */}
                        {job.requirements && (
                            <div className="bg-bg-card/40 backdrop-blur-xl border border-white/5 rounded-[48px] p-8 lg:p-12 shadow-2xl">
                                <h2 className="text-2xl font-display font-black text-text-primary uppercase tracking-tighter mb-8 flex items-center gap-3">
                                    <ShieldCheck size={24} className="text-secondary" /> Required Competencies
                                </h2>
                                <p className="text-text-muted text-lg leading-relaxed font-medium whitespace-pre-wrap opacity-90">{job.requirements}</p>
                            </div>
                        )}

                        {/* Keywords */}
                        <div className="flex flex-wrap gap-3">
                            {(job.aiKeywords || []).map(k => (
                                <span key={k} className="px-5 py-2.5 bg-white/5 border border-white/5 rounded-full text-[10px] font-black text-primary-light uppercase tracking-widest hover:bg-primary/20 hover:border-primary/40 transition-all cursor-default">
                                    #{k}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Sidebar / Apply */}
                    <div className="lg:col-span-4 sticky top-10">
                        <div className="bg-bg-card/40 backdrop-blur-xl border border-white/10 rounded-[48px] p-8 lg:p-10 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.5)] relative overflow-hidden group">
                            <div className="absolute top-0 left-0 w-full h-2 bg-linear-to-r from-primary via-secondary to-primary" />
                            
                            <h3 className="text-2xl font-display font-black text-text-primary uppercase tracking-tighter mb-8 flex items-center gap-2">
                                Application Nexus
                            </h3>

                            {applied ? (
                                <div className="text-center py-10 space-y-6 animate-fade-in">
                                    <div className="w-24 h-24 bg-emerald-500/10 border border-emerald-500/20 rounded-[32px] flex items-center justify-center mx-auto shadow-2xl shadow-emerald-500/10">
                                        <CheckCircle size={48} className="text-emerald-400" />
                                    </div>
                                    <div className="space-y-2">
                                        <div className="text-xl font-display font-black text-text-primary uppercase tracking-tighter">Mission Active</div>
                                        <p className="text-text-muted text-sm font-medium italic">Application telemetry received. Awaiting recruiter synchronization.</p>
                                    </div>
                                    <div className="pt-6">
                                        <button onClick={() => navigate('/applications')} className="w-full py-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black text-text-primary uppercase tracking-[0.3em] hover:bg-white/10 transition-all">Track Performance</button>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-8">
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em] ml-2">Strategic Cover (Optional)</label>
                                        <textarea 
                                            className="w-full bg-white/5 border border-white/5 rounded-3xl p-6 text-text-primary text-sm font-medium focus:outline-none focus:border-primary/40 focus:bg-white/[0.08] transition-all resize-none min-h-[160px] placeholder:text-text-muted/30"
                                            placeholder="Synthesize your mission-critical contributions..."
                                            value={cover} 
                                            onChange={e => setCover(e.target.value)} 
                                        />
                                    </div>

                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em] ml-2">Attachment (PDF/DOC)</label>
                                        <input type="file" className="w-full bg-white/5 border border-white/5 rounded-2xl p-4 text-[10px] text-text-muted font-black focus:outline-none focus:border-primary/40 transition-all" accept=".pdf,.doc,.docx" 
                                            onChange={e => setCoverFile(e.target.files[0])} />
                                    </div>

                                    <button 
                                        className={`w-full py-6 rounded-[24px] font-display font-black text-sm uppercase tracking-[0.3em] transition-all relative overflow-hidden group/btn ${
                                            applying ? 'bg-white/5 cursor-not-allowed text-text-muted' : 'bg-linear-to-r from-primary to-primary-dark text-white shadow-2xl shadow-primary/30 hover:scale-[1.02] active:scale-95'
                                        }`}
                                        onClick={handleApply}
                                        disabled={applying}
                                    >
                                        <div className="absolute inset-0 bg-linear-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-1000" />
                                        <span className="relative z-10 flex items-center justify-center gap-3">
                                            {applying ? (
                                                <>
                                                    <div className="w-5 h-5 border-2 border-text-muted border-t-transparent rounded-full animate-spin" />
                                                    Neural Matching...
                                                </>
                                            ) : (
                                                <>Apply Now <Sparkles size={18} /></>
                                            )}
                                        </span>
                                    </button>

                                    <div className="flex items-center gap-3 px-4 py-3 bg-white/5 rounded-2xl border border-white/5">
                                        <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                                            <ShieldCheck size={16} className="text-primary-light" />
                                        </div>
                                        <div className="text-[9px] font-black text-text-muted uppercase tracking-widest leading-relaxed">
                                            AI Match Engine will analyze your profile compatibility post-submission.
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
