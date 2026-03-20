import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { getMyProfileAPI, getRecommendedJobsAPI } from '../../api/axiosClient';
import SocialFeed from '../../components/SocialFeed';
import { Brain, Briefcase, FileText, ArrowRight, CheckCircle, AlertCircle, TrendingUp, Star, MapPin, Clock, Zap, Target, Sparkles, Plus } from 'lucide-react';
import toast from 'react-hot-toast';

function ScoreRing({ score }) {
    const r = 54, c = 2 * Math.PI * r;
    const offset = c - (score / 100) * c;
    return (
        <div className="relative flex items-center justify-center">
            <svg width="160" height="160" viewBox="0 0 130 130" className="drop-shadow-[0_0_15px_rgba(99,102,241,0.3)]">
                <circle cx="65" cy="65" r={r} fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="12" />
                <circle cx="65" cy="65" r={r} fill="none" stroke="url(#dashGrad)" strokeWidth="12"
                    strokeDasharray={c} strokeDashoffset={offset} strokeLinecap="round" transform="rotate(-90 65 65)"
                    className="transition-all duration-[2000ms] ease-out" />
                <defs>
                    <linearGradient id="dashGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="var(--color-primary)" />
                        <stop offset="100%" stopColor="var(--color-secondary)" />
                    </linearGradient>
                </defs>
            </svg>
            <div className="absolute flex flex-col items-center">
                <div className="text-5xl font-display font-black bg-linear-to-br from-white to-white/40 bg-clip-text text-transparent leading-none">{score}</div>
                <div className="text-[10px] font-black text-primary-light uppercase tracking-[0.3em] mt-1">Global Rank</div>
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
        <div className="min-h-screen bg-bg-dark p-6 lg:p-10 flex items-center justify-center">
             <div className="relative w-24 h-24">
                <div className="absolute inset-0 border-4 border-primary/20 rounded-full" />
                <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                <Brain className="absolute inset-0 m-auto text-primary animate-pulse" size={32} />
            </div>
        </div>
    );

    const score = profile?.aiAnalysis?.score || 0;
    const completion = profile?.completionPercentage || 0;

    return (
        <div className="min-h-screen bg-bg-dark p-6 lg:p-10 animate-fade-in relative overflow-hidden">
            {/* Background Orbs */}
            <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-primary/10 blur-[150px] rounded-full pointer-events-none animate-pulse-soft" />
            <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-secondary/5 blur-[120px] rounded-full pointer-events-none" />

            <div className="max-w-7xl mx-auto relative z-10">
                {/* ═══════════ HEADER ═══════════ */}
                <div className="flex flex-col items-start gap-6 mb-10 w-full max-w-3xl">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary-light text-[10px] font-black uppercase tracking-widest">
                        <Sparkles size={12} className="animate-pulse" /> Mission Control Active
                    </div>
                    <h1 className="text-4xl lg:text-5xl font-display font-black text-text-primary tracking-tight leading-tight">
                        Elevating your career, <br />
                        <span className="bg-linear-to-r from-primary via-primary-light to-secondary bg-clip-text text-transparent">
                            {user?.name?.split(' ')[0] || 'Seeker'}!
                        </span>
                    </h1>
                    
                    <div className="flex flex-wrap items-center gap-4 mt-2">
                        <Link to="/profile" className="px-6 py-3.5 bg-white/5 backdrop-blur-md border border-white/10 text-white font-black rounded-2xl hover:bg-white/10 transition-all flex items-center gap-3 group text-sm">
                            <FileText size={18} className="text-primary-light group-hover:rotate-12 transition-transform" /> 
                            Refine Profile
                        </Link>
                        <Link to="/jobs" className="px-6 py-3.5 bg-linear-to-r from-primary to-primary-dark text-white font-black rounded-2xl shadow-xl shadow-primary/30 hover:scale-[1.03] active:scale-[0.98] transition-all flex items-center gap-3 text-sm">
                            <Briefcase size={18} /> Explore Opportunities
                        </Link>
                    </div>
                </div>

                {/* ═══════════ QUICK STATS ═══════════ */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
                    {[
                        { label: 'Neural Score', val: score, icon: Brain, color: 'text-primary' },
                        { label: 'Completeness', val: `${completion}%`, icon: Target, color: 'text-secondary' },
                        { label: 'Direct Matches', val: jobs.length, icon: Sparkles, color: 'text-emerald-400' },
                        { label: 'Active Skills', val: profile?.skills?.length || 0, icon: Zap, color: 'text-amber-400' }
                    ].map((s, i) => (
                        <div key={i} className="bg-bg-card/40 backdrop-blur-xl border border-white/5 rounded-[24px] p-5 lg:p-6 flex items-center gap-4 hover:border-primary/20 hover:bg-white/[0.04] transition-all group">
                            <div className={`w-12 h-12 rounded-[14px] bg-white/5 flex items-center justify-center ${s.color} group-hover:scale-110 group-hover:rotate-3 transition-transform shadow-inner shrink-0`}>
                                <s.icon size={22} />
                            </div>
                            <div className="min-w-0">
                                <div className="text-2xl font-display font-black text-text-primary tracking-tighter truncate leading-none mb-1">{s.val}</div>
                                <div className="text-[9px] font-black text-text-muted uppercase tracking-widest truncate">{s.label}</div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 mb-16">
                    {/* ═══════════ AI SCORE CARD ═══════════ */}
                    <div className="lg:col-span-2 p-5 lg:p-10 rounded-4xl bg-bg-card/50 backdrop-blur-2xl border border-white/10 relative overflow-hidden group shadow-2xl flex flex-col items-center text-center">
                        <div className="absolute inset-0 bg-linear-to-br from-primary/10 via-transparent to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                        
                        <div className="relative z-10 w-full flex flex-col items-center">
                            <div className="flex items-center justify-between w-full mb-12">
                                <h3 className="text-sm font-black text-text-muted uppercase tracking-widest">Neural Analysis</h3>
                                <div className="p-2 rounded-xl bg-primary/10 text-primary border border-primary/20 animate-pulse-soft"><Brain size={18} /></div>
                            </div>

                            {score === 0 ? (
                                <div className="py-12">
                                    <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center text-text-muted/40 mx-auto mb-8 border-2 border-dashed border-white/10 group-hover:rotate-12 transition-transform">
                                        <AlertCircle size={40} />
                                    </div>
                                    <h4 className="text-2xl font-display font-black text-text-primary mb-3 uppercase tracking-tighter">Horizon Obscured</h4>
                                    <p className="text-text-muted text-sm max-w-[240px] mx-auto mb-10 font-medium">Activate your profile DNA by uploading a resume to unlock neural rankings.</p>
                                    <Link to="/profile" className="px-10 py-4 bg-primary text-white font-black rounded-2xl hover:bg-primary-dark shadow-xl shadow-primary/20 transition-all uppercase tracking-widest text-xs">Initialize Analysis</Link>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center w-full">
                                    <ScoreRing score={score} />
                                    <div className={`mt-10 px-8 py-2.5 rounded-full font-black text-[10px] tracking-[0.2em] uppercase border transition-all ${
                                        score >= 80 ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                                        score >= 60 ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 
                                        'bg-red-500/10 text-red-400 border-red-500/20'
                                    }`}>
                                        {score >= 80 ? 'Elite Performance' : score >= 60 ? 'Significant Potential' : 'Needs Calibration'}
                                    </div>
                                    <p className="text-text-muted text-xs mt-6 max-w-[280px] font-medium leading-relaxed italic">
                                        Your profile ranks in the <span className="text-primary-light font-black underline decoration-primary/30 underline-offset-4">Top 12%</span> of candidates for lead design roles.
                                    </p>
                                    <Link to="/ai-feedback" className="w-full mt-12 p-5 bg-white/5 border border-white/10 rounded-3xl text-xs font-black text-text-primary hover:bg-white/10 hover:border-primary/30 transition-all flex items-center justify-center gap-3 group/btn uppercase tracking-widest">
                                        Access Full Intelligence <ArrowRight size={18} className="text-primary group-hover/btn:translate-x-2 transition-transform" />
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ═══════════ PROFILE COMPLETIONS ═══════════ */}
                    <div className="lg:col-span-3 p-10 lg:p-12 rounded-[48px] bg-bg-card/40 backdrop-blur-xl border border-white/10 shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none text-white"><Target size={200} /></div>
                        
                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-12">
                                <div>
                                    <h3 className="text-sm font-black text-text-muted uppercase tracking-widest mb-1">Self-Actualization</h3>
                                    <p className="text-text-primary text-xl font-display font-black tracking-tight uppercase">Profile Integrity</p>
                                </div>
                                <div className="text-5xl font-display font-black bg-linear-to-b from-white to-white/40 bg-clip-text text-transparent leading-none">{completion}%</div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10">
                                {[
                                    { key: 'headline', label: 'Identity Header', done: !!profile?.headline, icon: FileText },
                                    { key: 'summary', label: 'Career Narrative', done: !!profile?.summary, icon: Briefcase },
                                    { key: 'skills', label: 'Capability Matrix', done: (profile?.skills?.length || 0) > 4, icon: Zap },
                                    { key: 'resume', label: 'Source Document', done: !!profile?.resume?.url, icon: FileText },
                                ].map((item) => (
                                    <div key={item.key} className={`group p-2 rounded-[28px] border transition-all duration-300 ${
                                        item.done 
                                            ? 'bg-emerald-500/5 border-emerald-500/10 opacity-60 grayscale hover:grayscale-0 hover:opacity-100' 
                                            : 'bg-white/5 border-white/10 hover:border-primary/50 hover:bg-primary/5'
                                    }`}>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${item.done ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/10 text-text-muted group-hover:text-primary group-hover:bg-primary/20'}`}>
                                                    <item.icon size={20} />
                                                </div>
                                                <span className={`text-xs font-black uppercase tracking-widest ${item.done ? 'text-text-primary' : 'text-text-muted group-hover:text-text-primary'}`}>{item.label}</span>
                                            </div>
                                            {!item.done && (
                                                <Link to="/profile" className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center hover:bg-primary hover:text-white transition-all">
                                                    <Plus size={16} />
                                                </Link>
                                            )}
                                            {item.done && <CheckCircle size={18} className="text-emerald-400" />}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="p-8 bg-white/5 rounded-[32px] border border-white/5 group hover:bg-white/10 transition-colors">
                                <div className="flex justify-between items-center mb-6">
                                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-text-muted">Visibility Amplification</span>
                                    <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-bold">+24% Recruiter Reach</span>
                                </div>
                                <div className="h-2.5 w-full bg-white/5 rounded-full overflow-hidden p-[2px]">
                                    <div 
                                        className="h-full bg-linear-to-r from-primary via-primary-light to-secondary rounded-full shadow-[0_0_15px_rgba(99,102,241,0.6)] transition-all duration-[1.5s] ease-out" 
                                        style={{ width: `${completion}%` }} 
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ═══════════ FEEDS & MATCHES ═══════════ */}
                <div className="grid grid-cols-1 xl:grid-cols-4 gap-12">
                    {/* Social Feed (Left 2 columns) */}
                    <div className="xl:col-span-2">
                        <div className="flex items-center justify-between mb-10">
                            <div>
                                <h2 className="text-2xl font-display font-black text-text-primary uppercase tracking-tighter">Global Network</h2>
                                <p className="text-text-muted text-xs font-bold uppercase tracking-widest mt-1 italic">Real-time collaborative updates</p>
                            </div>
                            <Link to="/feed" className="flex items-center gap-2 text-[10px] font-black text-primary-light hover:text-primary transition-colors uppercase tracking-[0.2em] group">
                                Deep Dive <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </div>
                        <SocialFeed />
                    </div>

                    {/* AI Job Matches (Right column) */}
                    <div className="space-y-10 col-span-2">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-2xl font-display font-black text-text-primary uppercase tracking-tighter leading-none">High Fidelity Matches</h2>
                                <p className="text-text-muted text-[10px] font-black uppercase tracking-widest mt-2">Personalized opportunities</p>
                            </div>
                            <Link to="/jobs" className="p-3 bg-white/5 rounded-2xl text-text-muted hover:text-primary hover:bg-primary/10 transition-all border border-transparent hover:border-primary/20"><Briefcase size={20} /></Link>
                        </div>

                        <div className="space-y-4">
                            {jobs.length === 0 ? (
                                <div className="p-16 border-2 border-dashed border-white/5 rounded-[40px] bg-white/[0.02] text-center group hover:bg-white/[0.04] transition-colors">
                                    <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center text-text-muted/40 mx-auto mb-6 group-hover:scale-110 transition-transform">
                                        <Target size={32} />
                                    </div>
                                    <p className="text-sm text-text-muted font-black uppercase tracking-widest">No matching frequencies found</p>
                                    <p className="text-xs text-text-muted/60 mt-2">Expand your skill matrix to synchronize</p>
                                </div>
                            ) : (
                                jobs.slice(0, 5).map((job, idx) => (
                                    <Link 
                                        to={`/jobs/${job._id}`} 
                                        key={job._id} 
                                        className="block p-7 bg-bg-card/40 backdrop-blur-xl border border-white/5 rounded-[32px] hover:border-primary/50 hover:bg-primary/5 transition-all duration-300 group relative overflow-hidden"
                                    >
                                        <div className="absolute top-0 left-0 w-1 h-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                                        
                                        <div className="flex items-center justify-between mb-5">
                                            <div className="flex items-center gap-5">
                                                <div className="w-12 h-12 bg-linear-to-br from-primary to-secondary rounded-2xl flex items-center justify-center font-black text-white uppercase text-xl shadow-lg shrink-0 group-hover:rotate-6 transition-transform">
                                                    {job.company?.charAt(0)}
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="font-black text-text-primary group-hover:text-primary-light transition-colors text-base truncate uppercase tracking-tighter">{job.title}</div>
                                                    <div className="text-[10px] text-text-muted font-black uppercase tracking-widest truncate mt-0.5">{job.company}</div>
                                                </div>
                                            </div>
                                            {job.matchScore > 0 && (
                                                <div className="flex flex-col items-end">
                                                    <div className="text-2xl font-display font-black text-primary-light leading-none">{job.matchScore}%</div>
                                                    <div className="text-[8px] font-black text-text-muted uppercase tracking-[0.2em]">Match</div>
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-4 text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">
                                            <span className="flex items-center gap-2"><MapPin size={12} className="text-secondary" /> {job.location?.replace('RemoteRemote', 'Remote')}</span>
                                            <span className="flex items-center gap-2"><Clock size={12} className="text-primary-light" /> {job.jobType}</span>
                                        </div>
                                    </Link>
                                ))
                            )}
                            {jobs.length > 0 && (
                                <Link to="/jobs" className="flex items-center justify-center gap-3 p-6 bg-white/5 border border-white/10 rounded-[28px] text-[10px] font-black uppercase tracking-[0.3em] text-text-muted hover:text-text-primary hover:bg-white/10 transition-all group">
                                    Explore Universal Hub <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
