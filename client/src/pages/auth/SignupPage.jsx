import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { registerUser } from '../../app/slices/authSlice';
import { Zap, Mail, Lock, User, Briefcase, Eye, EyeOff, Building2, Brain, Target, Star, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

export default function SignupPage() {
    const [form, setForm] = useState({ name: '', email: '', password: '', role: 'jobseeker', company: '' });
    const [showPw, setShowPw] = useState(false);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { loading } = useSelector(s => s.auth);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (form.password.length < 6) return toast.error('Password must be at least 6 characters');
        const res = await dispatch(registerUser(form));
        if (registerUser.fulfilled.match(res)) {
            toast.success('Account created! Welcome to CareerLens 🚀');
            navigate(res.payload.role === 'hr' ? '/hr/jobs' : '/dashboard');
        } else {
            toast.error(res.payload || 'Registration failed');
        }
    };

    return (
        <div className="min-h-screen bg-bg-dark font-sans text-text-primary flex items-center justify-center p-6 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-primary/10 blur-[120px] rounded-full animate-float" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-secondary/10 blur-[120px] rounded-full animate-float [animation-delay:2s]" />
                <div className="absolute inset-0 bg-size-[40px_40px] bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)]" />
            </div>

            <div className="relative z-10 w-full max-w-5/6 grid grid-cols-1 lg:grid-cols-2 bg-bg-card/40 backdrop-blur-3xl border border-white/10 rounded-4xl shadow-2xl overflow-hidden animate-scale min-h-[750px]">
                
                {/* Left Panel - Hero Branding */}
                <div className="hidden lg:flex flex-col p-12 bg-linear-to-br from-secondary/10 to-transparent relative">
                    <div className="flex items-center gap-3 mb-12">
                        <div className="w-10 h-10 rounded-xl bg-linear-to-br from-primary to-secondary flex items-center justify-center text-white shadow-lg shadow-primary/30">
                            <Zap size={22} fill="currentColor" />
                        </div>
                        <span className="text-2xl font-display font-black tracking-tight">Career<span className="bg-linear-to-r from-primary to-secondary bg-clip-text text-transparent">Lens</span></span>
                    </div>

                    <div className="mb-auto">
                        <h2 className="text-4xl font-display font-black leading-tight mb-8">
                            Start your <span className="bg-linear-to-r from-primary to-secondary bg-clip-text text-transparent">AI-powered</span> career journey
                        </h2>
                        
                        <div className="space-y-6">
                            {[
                                { icon: Brain, label: 'AI Resume Analysis', desc: 'Instant score & actionable feedback', color: 'text-primary' },
                                { icon: Zap, label: 'Smart Job Matching', desc: 'AI ranks jobs by your unique profile fit', color: 'text-secondary' },
                                { icon: Target, label: 'Verified Rankings', desc: 'Get prioritized in high-quality talent pools', color: 'text-amber-400' },
                            ].map((feat, i) => (
                                <div key={i} className="flex gap-4 group">
                                    <div className={`w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center ${feat.color} group-hover:scale-110 transition-transform`}>
                                        <feat.icon size={20} />
                                    </div>
                                    <div>
                                        <div className="font-bold text-text-primary mb-1">{feat.label}</div>
                                        <div className="text-sm text-text-secondary leading-relaxed">{feat.desc}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="pt-8 border-t border-white/5 flex items-center justify-between">
                        <div className="flex -space-x-3">
                            {[1,2,3,4].map(i => (
                                <div key={i} className="w-10 h-10 rounded-full border-2 border-bg-dark bg-white/10 overflow-hidden">
                                    <img src={`https://i.pravatar.cc/100?u=${i}`} alt="user" />
                                </div>
                            ))}
                        </div>
                        <div className="text-sm font-medium text-text-muted">
                            <span className="text-text-primary font-bold">50K+</span> pros already joined
                        </div>
                    </div>
                </div>

                {/* Right Panel - Signup Form */}
                <div className="p-8 lg:p-14 flex flex-col justify-center overflow-y-auto">
                    <div className="mb-8 text-center lg:text-left">
                        <h1 className="text-3xl font-display font-black text-text-primary mb-2">Create Account</h1>
                        <p className="text-text-secondary text-sm">Free forever · No credit card required</p>
                    </div>

                    {/* Role Toggle */}
                    <div className="flex p-1.5 bg-white/5 border border-white/10 rounded-full mb-8">
                        <button 
                            type="button"
                            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all ${form.role === 'jobseeker' ? 'bg-primary text-white shadow-lg' : 'text-text-muted hover:text-text-primary'}`}
                            onClick={() => setForm(f => ({ ...f, role: 'jobseeker' }))}
                        >
                            <User size={16} /> Job Seeker
                        </button>
                        <button 
                            type="button"
                            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all ${form.role === 'hr' ? 'bg-secondary text-white shadow-lg' : 'text-text-muted hover:text-text-primary'}`}
                            onClick={() => setForm(f => ({ ...f, role: 'hr' }))}
                        >
                            <Briefcase size={16} /> Recruiter
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">Full Name</label>
                                <div className="relative group">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary transition-colors" size={16} />
                                    <input 
                                        type="text" 
                                        placeholder="Full Name" 
                                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-sm text-text-primary placeholder:text-text-muted/40 focus:outline-none focus:border-primary/50 focus:bg-white/8 transition-all"
                                        value={form.name}
                                        onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">Email Address</label>
                                <div className="relative group">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary transition-colors" size={16} />
                                    <input 
                                        type="email" 
                                        placeholder="you@email.com" 
                                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-sm text-text-primary placeholder:text-text-muted/40 focus:outline-none focus:border-primary/50 focus:bg-white/8 transition-all"
                                        value={form.email}
                                        onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        {form.role === 'hr' && (
                            <div className="space-y-1.5 animate-slide-in">
                                <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">Company Name</label>
                                <div className="relative group">
                                    <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-secondary transition-colors" size={16} />
                                    <input 
                                        type="text" 
                                        placeholder="Acme Inc." 
                                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-sm text-text-primary placeholder:text-text-muted/40 focus:outline-none focus:border-secondary/50 focus:bg-white/8 transition-all"
                                        value={form.company}
                                        onChange={e => setForm(f => ({ ...f, company: e.target.value }))}
                                        required={form.role === 'hr'}
                                    />
                                </div>
                            </div>
                        )}

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">Password</label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary transition-colors" size={16} />
                                <input 
                                    type={showPw ? 'text' : 'password'} 
                                    placeholder="••••••••" 
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-11 pr-11 text-sm text-text-primary placeholder:text-text-muted/40 focus:outline-none focus:border-primary/50 focus:bg-white/8 transition-all"
                                    value={form.password}
                                    onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                                    required
                                />
                                <button 
                                    type="button" 
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary p-1"
                                    onClick={() => setShowPw(!showPw)}
                                >
                                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        <button 
                            type="submit" 
                            disabled={loading}
                            className={`w-full py-3.5 ${form.role === 'hr' ? 'bg-secondary' : 'bg-primary'} text-white font-black text-base rounded-xl shadow-lg hover:-translate-y-1 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2`}
                        >
                            {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <>Create Account <ArrowRight size={18} /></>}
                        </button>
                    </form>

                    <div className="mt-6 grid grid-cols-2 gap-3">
                        <button className="flex items-center justify-center gap-2 py-2.5 bg-white/5 border border-white/10 rounded-xl font-bold text-xs text-text-primary hover:bg-white/10 transition-colors">
                            <img src="https://authjs.dev/img/providers/google.svg" alt="G" className="w-3.5 h-3.5" /> Google
                        </button>
                        <button className="flex items-center justify-center gap-2 py-2.5 bg-white/5 border border-white/10 rounded-xl font-bold text-xs text-text-primary hover:bg-white/10 transition-colors">
                            <img src="https://authjs.dev/img/providers/linkedin.svg" alt="L" className="w-3.5 h-3.5" /> LinkedIn
                        </button>
                    </div>

                    <p className="mt-8 text-center text-text-muted text-xs font-medium">
                        Already have an account? <Link to="/login" className="text-text-primary font-black hover:underline ml-1">Sign in</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
