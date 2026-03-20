import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Briefcase, Plus, Users, BarChart3, Bell, Settings, Zap } from 'lucide-react';

export default function HRDashboard() {
    const { user } = useSelector(s => s.auth);
    
    return (
        <div className="min-h-[calc(100vh-72px)] bg-bg-dark p-6 lg:p-10 animate-fade-in relative overflow-hidden">
            {/* Background Orbs */}
            <div className="absolute top-[-10%] right-[-10%] w-[400px] h-[400px] bg-secondary/10 blur-[100px] rounded-full pointer-events-none" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[300px] h-[300px] bg-primary/10 blur-[100px] rounded-full pointer-events-none" />

            <div className="max-w-7xl mx-auto relative z-10">
                <div className="mb-10">
                    <h1 className="text-3xl lg:text-4xl font-display font-black text-text-primary mb-3">
                        Welcome back, <span className="bg-linear-to-r from-primary to-secondary bg-clip-text text-transparent">{user?.name?.split(' ')[0]}</span> 👋
                    </h1>
                    <p className="text-text-secondary text-lg">Manage your talent pipeline and AI-ranked candidate lists.</p>
                </div>

                {/* Quick Action Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                    <Link to="/hr/post-job" className="group relative overflow-hidden bg-bg-card/40 backdrop-blur-xl border border-white/10 rounded-[32px] p-8 lg:p-10 hover:border-primary/50 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/20 hover:-translate-y-1">
                        <div className="flex items-start justify-between mb-8">
                            <div className="w-14 h-14 rounded-2xl bg-linear-to-br from-primary to-primary-dark flex items-center justify-center text-white shadow-xl shadow-primary/30 group-hover:scale-110 transition-transform">
                                <Plus size={28} />
                            </div>
                            <div className="px-3 py-1 rounded-full bg-primary/10 text-primary-light text-[10px] font-black uppercase tracking-widest border border-primary/20">Quick Action</div>
                        </div>
                        <h3 className="text-2xl font-display font-black text-text-primary mb-3">Post a New Job</h3>
                        <p className="text-text-secondary leading-relaxed">Create a high-impact job posting and let our AI engine automatically extract requirements and rank incoming talent.</p>
                        <div className="mt-8 flex items-center text-primary-light font-bold text-sm gap-2">
                            Get started <Zap size={14} className="fill-current" />
                        </div>
                    </Link>

                    <Link to="/hr/jobs" className="group relative overflow-hidden bg-bg-card/40 backdrop-blur-xl border border-white/10 rounded-[32px] p-8 lg:p-10 hover:border-secondary/50 transition-all duration-300 hover:shadow-2xl hover:shadow-secondary/20 hover:-translate-y-1">
                        <div className="flex items-start justify-between mb-8">
                            <div className="w-14 h-14 rounded-2xl bg-linear-to-br from-secondary to-secondary-dark flex items-center justify-center text-white shadow-xl shadow-secondary/30 group-hover:scale-110 transition-transform">
                                <Briefcase size={28} />
                            </div>
                            <div className="px-3 py-1 rounded-full bg-secondary/10 text-secondary-light text-[10px] font-black uppercase tracking-widest border border-secondary/20">Management</div>
                        </div>
                        <h3 className="text-2xl font-display font-black text-text-primary mb-3">Manage My Jobs</h3>
                        <p className="text-text-secondary leading-relaxed">Review your active postings, track applicant progress, and dive into AI-ranked candidate shortlists for faster hiring.</p>
                        <div className="mt-8 flex items-center text-secondary-light font-bold text-sm gap-2">
                            View all jobs <BarChart3 size={14} />
                        </div>
                    </Link>
                </div>

                {/* Bottom Stats/Info (Placeholder for now) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                        { label: 'Active Postings', val: '12', icon: Briefcase, color: 'text-primary' },
                        { label: 'Total Candidates', val: '458', icon: Users, color: 'text-secondary' },
                        { label: 'AI Matches Today', val: '24', icon: Zap, color: 'text-amber-400' }
                    ].map((stat, i) => (
                        <div key={i} className="bg-white/5 border border-white/10 p-6 rounded-2xl flex items-center gap-4">
                            <div className={`p-3 rounded-xl bg-white/5 ${stat.color}`}>
                                <stat.icon size={20} />
                            </div>
                            <div>
                                <div className="text-2xl font-display font-black text-text-primary">{stat.val}</div>
                                <div className="text-xs font-bold text-text-muted uppercase tracking-widest">{stat.label}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
