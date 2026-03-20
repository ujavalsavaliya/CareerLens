import { useEffect, useState } from 'react';
import { getMyApplicationsAPI } from '../../api/axiosClient';
import { Briefcase, MapPin, Clock, CheckCircle, XCircle, AlertCircle, Calendar, ArrowRight, Sparkles, Target, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

const statusConfig = {
    applied: { icon: Clock, color: 'text-primary-light', bg: 'bg-primary/10', border: 'border-primary/20', label: 'Processing' },
    shortlisted: { icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', label: 'Shortlisted' },
    interview: { icon: Calendar, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20', label: 'Interview' },
    rejected: { icon: XCircle, color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20', label: 'Rejected' },
};

export default function ApplicationsPage() {
    const [apps, setApps] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getMyApplicationsAPI().then(r => setApps(r.data || [])).finally(() => setLoading(false));
    }, []);

    if (loading) return (
        <div className="min-h-screen bg-bg-dark p-6 lg:p-10 flex items-center justify-center">
             <div className="relative w-20 h-20">
                <div className="absolute inset-0 border-4 border-primary/20 rounded-full" />
                <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                <Target size={32} className="absolute inset-0 m-auto text-primary animate-pulse" />
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-bg-dark p-6 lg:p-10 animate-fade-in relative overflow-hidden">
             {/* Background Orbs */}
             <div className="absolute top-[-10%] left-[-5%] w-[600px] h-[600px] bg-primary/5 blur-[150px] rounded-full pointer-events-none" />

            <div className="max-w-7xl mx-auto relative z-10">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-12">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary-light text-[10px] font-black uppercase tracking-widest mb-4">
                            <Target size={12} /> Strategic Tracking
                        </div>
                        <h1 className="text-4xl lg:text-5xl font-display font-black text-text-primary uppercase tracking-tighter">My Applications</h1>
                        <p className="text-text-muted text-lg mt-2 font-medium opacity-80 italic">Monitoring {apps.length} active career trajectories</p>
                    </div>
                    <Link to="/jobs" className="px-8 py-4 bg-white/5 border border-white/10 text-text-primary rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-primary hover:border-primary transition-all flex items-center gap-3 group">
                        Discover More <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>

                {apps.length === 0 ? (
                    <div className="p-20 bg-bg-card/40 backdrop-blur-xl border border-white/5 rounded-[48px] text-center shadow-2xl overflow-hidden group">
                        <div className="absolute inset-0 bg-linear-to-br from-primary/5 via-transparent to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                        <div className="relative z-10">
                            <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center text-text-muted/40 mx-auto mb-8 border border-dashed border-white/10 group-hover:scale-110 group-hover:rotate-12 transition-transform">
                                <Briefcase size={48} />
                            </div>
                            <h3 className="text-2xl font-display font-black text-text-primary uppercase tracking-tighter mb-4">No Missions Initialized</h3>
                            <p className="text-text-muted max-w-sm mx-auto mb-10 font-medium leading-relaxed">Your application portfolio is currently empty. Synchronize with global opportunities to begin your ascent.</p>
                            <Link to="/jobs" className="px-10 py-5 bg-linear-to-r from-primary to-primary-dark text-white font-black rounded-[24px] shadow-xl shadow-primary/30 hover:scale-105 active:scale-95 transition-all uppercase tracking-widest text-xs">Browse Jobs Hub</Link>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col gap-6">
                        {apps.map((app, i) => {
                            const cfg = statusConfig[app.status] || statusConfig.applied;
                            const Icon = cfg.icon;
                            return (
                                <div key={i} className="group bg-bg-card/40 backdrop-blur-xl border border-white/5 rounded-[32px] p-8 lg:p-10 flex flex-col md:flex-row md:items-center gap-8 hover:border-primary/30 hover:bg-white/[0.04] transition-all duration-300 shadow-xl relative overflow-hidden">
                                    <div className="absolute top-0 left-0 w-1 h-full bg-linear-to-b from-primary to-secondary opacity-0 group-hover:opacity-100 transition-opacity" />
                                    
                                    <div className="w-20 h-20 bg-linear-to-br from-primary to-secondary rounded-[24px] flex items-center justify-center font-black text-white text-3xl shadow-2xl flex-shrink-0 group-hover:rotate-6 group-hover:scale-110 transition-transform">
                                        {app.job?.company?.charAt(0)}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-3 mb-2 min-w-0">
                                            <h2 className="text-xl lg:text-2xl font-display font-black text-text-primary uppercase tracking-tighter truncate group-hover:text-primary-light transition-colors">
                                                <Link to={`/jobs/${app.job?._id}`}>{app.job?.title}</Link>
                                            </h2>
                                            {app.aiMatchScore > 0 && (
                                                <div className="flex items-center gap-1.5 px-3 py-1 bg-white/5 rounded-full border border-white/10 shrink-0">
                                                    <Sparkles size={12} className="text-primary-light" />
                                                    <span className="text-[10px] font-black text-text-primary tracking-tighter">{app.aiMatchScore}% Score</span>
                                                </div>
                                            )}
                                        </div>
                                        
                                        <div className="flex flex-wrap items-center gap-6">
                                            <div className="flex items-center gap-2 text-[11px] font-black text-text-muted uppercase tracking-widest group-hover:text-text-primary transition-colors">
                                                <Briefcase size={14} className="text-primary" /> {app.job?.company}
                                            </div>
                                            <div className="flex items-center gap-2 text-[11px] font-black text-text-muted uppercase tracking-widest group-hover:text-text-primary transition-colors">
                                                <MapPin size={14} className="text-secondary" /> {app.job?.location}
                                            </div>
                                            <div className="flex items-center gap-2 text-[11px] font-black text-text-muted uppercase tracking-widest group-hover:text-text-primary transition-colors">
                                                <Clock size={14} className="text-primary-light" /> {new Date(app.appliedAt).toLocaleDateString()}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8 shrink-0">
                                        <div className={`flex items-center gap-3 px-6 py-3 rounded-full border ${cfg.bg} ${cfg.color} ${cfg.border} shadow-lg transition-all group-hover:scale-105`}>
                                            <Icon size={16} className="animate-pulse-soft" />
                                            <span className="text-xs font-black uppercase tracking-[0.2em]">{cfg.label}</span>
                                        </div>
                                        
                                        {app.aiMatchScore > 0 && (
                                            <div className="hidden lg:flex flex-col items-end min-w-[128px]">
                                                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden p-[2px]">
                                                    <div className={`h-full rounded-full transition-all duration-1000 ${
                                                        app.aiMatchScore >= 80 ? 'bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.5)]' : 
                                                        app.aiMatchScore >= 60 ? 'bg-amber-400 shadow-[0_0_10px_rgba(252,211,77,0.5)]' : 
                                                        'bg-red-400 shadow-[0_0_10px_rgba(248,113,113,0.5)]'
                                                    }`} style={{ width: `${app.aiMatchScore}%` }} />
                                                </div>
                                                <span className="text-[8px] font-black text-text-muted uppercase tracking-[0.2em] mt-2 italic">Neural Compatibility</span>
                                            </div>
                                        )}

                                        <Link to={`/jobs/${app.job?._id}`} className="w-12 h-12 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center text-text-primary hover:bg-primary hover:border-primary hover:text-white transition-all transform hover:rotate-12">
                                            <ArrowRight size={20} />
                                        </Link>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
