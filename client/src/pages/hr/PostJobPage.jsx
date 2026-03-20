import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { createJobAPI } from '../../api/axiosClient';
import { Briefcase, MapPin, DollarSign, Zap, Plus, X, ListTodo, FileText, GraduationCap } from 'lucide-react';
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
        <div className="min-h-screen bg-bg-dark p-6 lg:p-10 animate-fade-in relative overflow-hidden">
            {/* Background Decor */}
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
            
            <div className="max-w-4xl mx-auto relative z-10">
                <div className="mb-12 flex items-center gap-5">
                    <div className="w-16 h-16 rounded-[24px] bg-linear-to-br from-primary to-secondary flex items-center justify-center text-white shadow-xl shadow-primary/20 shrink-0">
                        <Briefcase size={32} />
                    </div>
                    <div>
                        <h1 className="text-3xl lg:text-4xl font-display font-black text-text-primary uppercase tracking-tight">Create Job Opportunity</h1>
                        <p className="text-text-secondary text-lg mt-1 font-medium italic">
                            Empower your team with AI-driven talent discovery.
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Basic Info Section */}
                    <div className="bg-bg-card/40 backdrop-blur-xl border border-white/10 rounded-[32px] p-8 lg:p-10">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="p-2.5 rounded-xl bg-primary/10 text-primary border border-primary/20"><ListTodo size={20} /></div>
                            <h3 className="text-xl font-display font-black text-text-primary uppercase tracking-widest">Base Configuration</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="md:col-span-2">
                                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-text-muted mb-3 ml-1">Job Identity Title *</label>
                                <input 
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-text-primary font-bold placeholder:text-text-muted focus:border-primary/50 focus:bg-white/10 outline-none transition-all"
                                    placeholder="e.g. Senior Frontend Architect" 
                                    value={form.title} 
                                    onChange={e => set('title', e.target.value)} 
                                    required 
                                />
                            </div>

                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-text-muted mb-3 ml-1">Engagement Type</label>
                                <select 
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-text-primary font-bold appearance-none focus:border-primary/50 focus:bg-white/10 outline-none transition-all cursor-pointer"
                                    value={form.jobType} 
                                    onChange={e => set('jobType', e.target.value)}
                                >
                                    {['full-time', 'part-time', 'contract', 'internship', 'remote'].map(t => (
                                        <option key={t} value={t} className="bg-bg-elevated text-text-primary uppercase">{t}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-text-muted mb-3 ml-1">Position Seniority</label>
                                <select 
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-text-primary font-bold appearance-none focus:border-primary/50 focus:bg-white/10 outline-none transition-all cursor-pointer"
                                    value={form.experienceLevel} 
                                    onChange={e => set('experienceLevel', e.target.value)}
                                >
                                    {['entry', 'mid', 'senior', 'lead'].map(l => (
                                        <option key={l} value={l} className="bg-bg-elevated text-text-primary uppercase">{l}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-text-muted mb-3 ml-1 flex items-center gap-2">
                                    <MapPin size={12} className="text-secondary" /> Geographical focus
                                </label>
                                <input 
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-text-primary font-bold placeholder:text-text-muted focus:border-primary/50 focus:bg-white/10 outline-none transition-all"
                                    placeholder="e.g. Global Remote" 
                                    value={form.location} 
                                    onChange={e => set('location', e.target.value)} 
                                />
                            </div>

                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-text-muted mb-3 ml-1 flex items-center gap-2">
                                    <DollarSign size={12} className="text-success" /> Compensation Band
                                </label>
                                <input 
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-text-primary font-bold placeholder:text-text-muted focus:border-primary/50 focus:bg-white/10 outline-none transition-all"
                                    placeholder="e.g. $140K - $180K" 
                                    value={form.salaryRange} 
                                    onChange={e => set('salaryRange', e.target.value)} 
                                />
                            </div>
                        </div>
                    </div>

                    {/* Job Details Section */}
                    <div className="bg-bg-card/40 backdrop-blur-xl border border-white/10 rounded-[32px] p-8 lg:p-10">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="p-2.5 rounded-xl bg-secondary/10 text-secondary border border-secondary/20"><FileText size={20} /></div>
                            <h3 className="text-xl font-display font-black text-text-primary uppercase tracking-widest">In-depth Narrative</h3>
                        </div>

                        <div className="space-y-8">
                            <div>
                                <div className="flex justify-between items-center mb-3 ml-1">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted">Master Description *</label>
                                    <span className="text-[10px] font-black text-primary-light uppercase tracking-widest animate-pulse-soft">AI Keyword Extraction Enabled</span>
                                </div>
                                <textarea 
                                    className="w-full bg-white/5 border border-white/10 rounded-[28px] px-8 py-6 text-text-primary font-medium leading-relaxed placeholder:text-text-muted focus:border-primary/50 focus:bg-white/10 outline-none transition-all min-h-[220px]"
                                    placeholder="Define the mission, technical stack, team dynamics, and core objectives..."
                                    value={form.description} 
                                    onChange={e => set('description', e.target.value)} 
                                    required 
                                />
                            </div>

                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-text-muted mb-3 ml-1 flex items-center gap-2">
                                    <GraduationCap size={12} className="text-primary-light" /> Candidate requirements
                                </label>
                                <textarea 
                                    className="w-full bg-white/5 border border-white/10 rounded-[28px] px-8 py-6 text-text-primary font-medium leading-relaxed placeholder:text-text-muted focus:border-primary/50 focus:bg-white/10 outline-none transition-all min-h-[160px]"
                                    placeholder="Specify technical prerequisites, cultural alignment, and educational background..."
                                    value={form.requirements} 
                                    onChange={e => set('requirements', e.target.value)} 
                                />
                            </div>
                        </div>
                    </div>

                    {/* Skills Section */}
                    <div className="bg-bg-card/40 backdrop-blur-xl border border-white/10 rounded-[32px] p-8 lg:p-10">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="p-2.5 rounded-xl bg-success/10 text-success border border-success/20"><Zap size={20} /></div>
                            <h3 className="text-xl font-display font-black text-text-primary uppercase tracking-widest">Skill Matrix Tags</h3>
                        </div>

                        <div className="flex gap-3 mb-8">
                            <input 
                                className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-text-primary font-bold placeholder:text-text-muted focus:border-primary/50 focus:bg-white/10 outline-none transition-all"
                                placeholder="Add imperative skill (e.g. TypeScript)..." 
                                value={skillInput}
                                onChange={e => setSkillInput(e.target.value)} 
                                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSkill())} 
                            />
                            <button 
                                type="button" 
                                className="w-16 h-16 bg-white/5 border border-white/10 rounded-2xl text-text-primary flex items-center justify-center hover:bg-primary-light hover:text-white hover:border-primary-light transition-all shadow-lg active:scale-95"
                                onClick={addSkill}
                            >
                                <Plus size={24} />
                            </button>
                        </div>

                        <div className="flex flex-wrap gap-3">
                            {form.skills.map(s => (
                                <span key={s} className="px-5 py-2.5 bg-primary/10 text-primary-light border border-primary/20 rounded-2xl text-sm font-black uppercase tracking-wider flex items-center gap-3 group/tag hover:bg-primary hover:text-white transition-all">
                                    {s} 
                                    <X 
                                        size={14} 
                                        className="cursor-pointer opacity-50 group-hover:opacity-100 hover:scale-125 transition-all text-danger" 
                                        onClick={() => set('skills', form.skills.filter(x => x !== s))} 
                                    />
                                </span>
                            ))}
                            {form.skills.length === 0 && (
                                <div className="text-text-muted text-sm font-medium italic p-2">Skill matrix currently empty. Add tags to improve AI precision.</div>
                            )}
                        </div>
                    </div>

                    <div className="bg-primary/5 border border-primary/20 rounded-[32px] p-8 flex items-start gap-5 group hover:bg-primary/10 transition-colors">
                        <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center text-primary-light shrink-0 group-hover:scale-110 transition-transform">
                            <Brain size={24} />
                        </div>
                        <p className="text-sm font-bold text-text-primary leading-relaxed opacity-80">
                            Upon submission, our <span className="text-primary-light font-black">Neural Engine</span> will process your description to extract high-fidelity keywords and begin real-time ranking of candidates based on weighted matching scores.
                        </p>
                    </div>

                    <button 
                        type="submit" 
                        className="w-full bg-linear-to-r from-primary to-primary-dark text-white py-6 rounded-[32px] font-black text-xl uppercase tracking-[0.2em] shadow-2xl shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-4 disabled:opacity-50 disabled:cursor-wait"
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                                Synchronizing with AI Core...
                            </>
                        ) : (
                            <>
                                <Zap size={24} />
                                Unleash AI Matching Power
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}

import { Brain } from 'lucide-react';
