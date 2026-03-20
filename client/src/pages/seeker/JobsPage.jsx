import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { getJobsAPI } from '../../api/axiosClient';
import { Briefcase, MapPin, Clock, DollarSign, Search, Filter, Building2, ChevronRight, Zap, ChevronDown } from 'lucide-react';

const JOB_TYPES = ['full-time', 'part-time', 'contract', 'internship', 'remote'];
const EXP_LEVELS = ['entry', 'mid', 'senior', 'lead'];

function CustomSelect({ value, onChange, options, placeholder }) {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (ref.current && !ref.current.contains(event.target)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const selectedOption = options.find(o => o.value === value);

    return (
        <div className={`relative flex-1 min-w-[200px] ${open ? 'z-50' : 'z-10'}`} ref={ref}>
            <button
                type="button"
                className={`w-full flex items-center justify-between bg-white/5 border border-transparent rounded-[24px] px-6 py-4 text-text-primary font-bold focus:bg-white/10 focus:border-white/10 outline-none transition-all cursor-pointer uppercase tracking-wider text-xs lg:text-sm ${open ? 'bg-white/10 border-white/10 ring-2 ring-primary/20' : ''}`}
                onClick={() => setOpen(!open)}
            >
                <span className={!selectedOption ? "text-text-muted" : "text-text-primary"}>
                    {selectedOption ? selectedOption.label.toUpperCase() : placeholder.toUpperCase()}
                </span>
                <ChevronDown size={18} className={`text-text-muted transition-transform duration-300 ${open ? 'rotate-180 text-primary-light' : ''}`} />
            </button>
            
            {open && (
                <div className="absolute top-[calc(100%+12px)] left-0 w-full bg-bg-card/95 backdrop-blur-3xl border border-white/10 rounded-[28px] p-2 z-50 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.7)] outline outline-1 outline-white/5 overflow-hidden animate-fade-in text-xs lg:text-sm font-bold uppercase tracking-wider">
                    <button
                        type="button"
                        className={`w-full text-left px-5 py-3 rounded-[20px] transition-colors ${value === '' ? 'bg-primary/20 text-primary-light' : 'text-text-muted hover:bg-white/5 hover:text-text-primary'}`}
                        onClick={() => { onChange(''); setOpen(false); }}
                    >
                        {placeholder}
                    </button>
                    {options.map((opt) => (
                        <button
                            key={opt.value}
                            type="button"
                            className={`w-full text-left px-5 py-3 rounded-[20px] transition-colors mt-1 ${value === opt.value ? 'bg-primary/20 text-primary-light shadow-inner' : 'text-text-muted hover:bg-white/5 hover:text-text-primary'}`}
                            onClick={() => { onChange(opt.value); setOpen(false); }}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

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
        <div className="min-h-screen bg-bg-dark p-6 lg:p-10 animate-fade-in relative overflow-hidden">
            {/* Background Decor */}
            <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
            
            <div className="max-w-7xl mx-auto relative z-10">
                <div className="mb-12">
                    <h1 className="text-3xl lg:text-5xl font-display font-black text-text-primary uppercase tracking-tight">Find Your Next Role</h1>
                    <p className="text-text-secondary text-lg mt-2 font-medium">
                        <span className="text-primary-light font-black underline underline-offset-4 decoration-primary/30">{total}</span> roles available for your expertise.
                    </p>
                </div>

                {/* Search & Filter Bar */}
                <form 
                    onSubmit={handleSearch} 
                    className="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-12 p-3 bg-bg-card/40 backdrop-blur-xl border border-white/10 rounded-[32px] lg:rounded-[48px] shadow-2xl shadow-primary/5 w-full items-center"
                >
                    <div className="relative w-full lg:col-span-5 h-auto">
                        <Search size={22} className="absolute left-6 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary transition-colors" />
                        <input 
                            className="w-full h-full bg-white/5 border border-transparent rounded-[24px] lg:rounded-[36px] pl-[60px] pr-6 py-4 text-text-primary font-bold placeholder:text-text-muted focus:bg-white/10 focus:border-white/10 outline-none transition-all text-sm"
                            placeholder="Job title, company, or keyword..."
                            value={filters.search} 
                            onChange={e => setFilters(f => ({ ...f, search: e.target.value }))} 
                        />
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full lg:col-span-5 h-12 sm:h-auto">
                        <CustomSelect 
                            value={filters.jobType}
                            onChange={(val) => setFilters(f => ({ ...f, jobType: val }))}
                            placeholder="All Types"
                            options={JOB_TYPES.map(t => ({ value: t, label: t.replace('-', ' ') }))}
                        />

                        <CustomSelect 
                            value={filters.experienceLevel}
                            onChange={(val) => setFilters(f => ({ ...f, experienceLevel: val }))}
                            placeholder="All Levels"
                            options={EXP_LEVELS.map(l => ({ value: l, label: l }))}
                        />
                    </div>

                    <button 
                        type="submit" 
                        className="w-full lg:col-span-2 h-12 bg-linear-to-r from-primary to-primary-dark text-white rounded-[24px] lg:rounded-[36px] px-8 font-black uppercase tracking-widest shadow-lg shadow-primary/25 hover:scale-[1.03] active:scale-[0.98] transition-all flex items-center justify-center gap-3 text-sm"
                    >
                        <Search size={20} /> Search
                    </button>
                </form>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="h-[220px] bg-white/5 border border-white/10 rounded-[32px] animate-pulse" />
                        ))}
                    </div>
                ) : jobs.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-20 bg-bg-card/40 backdrop-blur-xl border border-white/10 rounded-[40px] text-center">
                        <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center text-text-muted mb-6 border border-white/10">
                            <Briefcase size={40} />
                        </div>
                        <h3 className="text-2xl font-display font-black text-text-primary mb-3 text-white uppercase tracking-tighter">Horizon Empty</h3>
                        <p className="text-text-secondary max-w-sm">We couldn't find matches for your current criteria. Try broading your search markers.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {jobs.map(job => (
                            <Link 
                                to={`/jobs/${job._id}`} 
                                key={job._id} 
                                className="group bg-bg-card/40 backdrop-blur-xl border border-white/10 rounded-[32px] p-6 lg:p-8 hover:border-primary/50 hover:bg-white/[0.04] transition-all duration-500 flex flex-col relative overflow-hidden"
                            >
                                <div className="absolute top-0 left-0 w-1.5 h-full bg-linear-to-b from-primary to-secondary opacity-0 group-hover:opacity-100 transition-opacity" />
                                
                                <div className="flex justify-between items-start mb-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 rounded-2xl bg-linear-to-br from-primary to-secondary flex items-center justify-center text-white font-black text-xl shadow-lg shrink-0 group-hover:scale-110 transition-transform">
                                            {job.company?.charAt(0)}
                                        </div>
                                        <div className="min-w-0">
                                            <h3 className="text-lg font-display font-black text-text-primary whitespace-nowrap overflow-hidden text-ellipsis group-hover:text-primary-light transition-colors">{job.title}</h3>
                                            <div className="flex items-center gap-2 text-text-muted text-xs font-bold uppercase tracking-wider group-hover:text-text-secondary transition-colors">
                                                <Building2 size={12} className="text-secondary" /> {job.company}
                                            </div>
                                        </div>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border transition-colors ${
                                        job.jobType === 'remote' 
                                            ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20 group-hover:bg-cyan-500 group-hover:text-white' 
                                            : 'bg-primary/10 text-primary-light border-primary/20 group-hover:bg-primary group-hover:text-white'
                                    }`}>
                                        {job.jobType}
                                    </span>
                                </div>

                                <div className="flex flex-wrap gap-x-4 gap-y-2 mb-6">
                                    <div className="flex items-center gap-1.5 text-xs font-bold text-text-secondary">
                                        <MapPin size={12} className="text-secondary" /> {job.location}
                                    </div>
                                    <div className="flex items-center gap-1.5 text-xs font-bold text-text-secondary">
                                        <Clock size={12} className="text-primary" /> {job.experienceLevel}
                                    </div>
                                    {job.salaryRange && job.salaryRange !== 'Not disclosed' && (
                                        <div className="flex items-center gap-1.5 text-xs font-bold text-success">
                                            <DollarSign size={12} /> {job.salaryRange}
                                        </div>
                                    )}
                                </div>

                                <div className="flex flex-wrap gap-2 mb-8">
                                    {(job.aiKeywords || job.skills || []).slice(0, 3).map(k => (
                                        <span key={k} className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-xs font-bold text-text-secondary group-hover:bg-white/10 transition-colors">
                                            {k}
                                        </span>
                                    ))}
                                </div>

                                <div className="mt-auto pt-6 border-t border-white/5 flex items-center justify-between">
                                    <div className="text-[10px] font-black uppercase tracking-widest text-text-muted">
                                        {job.applicants?.length || 0} applicants
                                    </div>
                                    <div className="flex items-center gap-1 text-primary-light font-black text-xs uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                                        Explore <ChevronRight size={14} />
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
