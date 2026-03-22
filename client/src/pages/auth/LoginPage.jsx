import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser, clearError } from '../../app/slices/authSlice';
import { Zap, Mail, Lock, Eye, EyeOff, ArrowRight, Brain, Target, Star } from 'lucide-react';
import toast from 'react-hot-toast';

export default function LoginPage() {
    const [form, setForm] = useState({ email: '', password: '' });
    const [showPw, setShowPw] = useState(false);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { loading, error } = useSelector(s => s.auth);

    const handleSubmit = async (e) => {
        e.preventDefault();
        dispatch(clearError());
        const res = await dispatch(loginUser(form));
        if (loginUser.fulfilled.match(res)) {
            toast.success(`Welcome back, ${res.payload.name}! 🎉`);
            navigate(res.payload.role === 'hr' ? '/hr/jobs' : '/dashboard');
        } else {
            toast.error(res.payload || 'Login failed');
        }
    };

    const handleChange = (field) => (e) => {
        dispatch(clearError());
        setForm(f => ({ ...f, [field]: e.target.value }));
    };

    return (
        <div className="min-h-screen bg-bg-dark font-sans text-text-primary flex items-center justify-center p-6 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-primary/10 blur-[120px] rounded-full animate-float" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-secondary/10 blur-[120px] rounded-full animate-float [animation-delay:2s]" />
                <div className="absolute inset-0 bg-size-[40px_40px] bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)]" />
            </div>

            <div className="relative z-10 w-full max-w-[1100px] grid grid-cols-1 lg:grid-cols-2 bg-bg-card/40 backdrop-blur-3xl border border-white/10 rounded-[40px] shadow-2xl overflow-hidden animate-scale">
                
                {/* Left Panel - Hero Branding */}
                <div className="hidden lg:flex flex-col p-12 bg-linear-to-br from-primary/10 to-transparent relative">
                    <div className="flex items-center gap-3 mb-16">
                        <div className="w-10 h-10 rounded-xl bg-linear-to-br from-primary to-secondary flex items-center justify-center text-white shadow-lg shadow-primary/30">
                            <Zap size={22} fill="currentColor" />
                        </div>
                        <span className="text-2xl font-display font-black tracking-tight">Career<span className="bg-linear-to-r from-primary to-secondary bg-clip-text text-transparent">Lens</span></span>
                    </div>

                    <div className="mb-auto">
                        <h2 className="text-4xl font-display font-black leading-tight mb-6">
                            AI that <span className="bg-linear-to-r from-primary to-secondary bg-clip-text text-transparent">accelerates</span> your career
                        </h2>
                        <p className="text-text-secondary text-lg leading-relaxed max-w-sm">
                            Smart resume scoring, job matching, and recruiter-side AI ranking — all in one platform.
                        </p>
                    </div>

                    <div className="grid grid-cols-3 gap-6 pt-12 border-t border-white/5">
                        {[
                            { v: '50K+', l: 'Users', icon: Star, color: 'text-amber-400' },
                            { v: '94%', l: 'Accuracy', icon: Target, color: 'text-secondary' },
                            { v: '8.5K', l: 'Roles', icon: Brain, color: 'text-primary' }
                        ].map((s, i) => (
                            <div key={i} className="space-y-1">
                                <div className="text-xl font-display font-black text-text-primary">{s.v}</div>
                                <div className="text-[10px] font-bold text-text-muted uppercase tracking-widest">{s.l}</div>
                            </div>
                        ))}
                    </div>

                    {/* Decorative Elements */}
                    <div className="absolute top-1/2 -right-12 w-32 h-32 bg-secondary/20 blur-3xl animate-pulse" />
                </div>

                {/* Right Panel - Login Form */}
                <div className="p-10 lg:p-16 flex flex-col justify-center">
                    <div className="mb-10 text-center lg:text-left">
                        <h1 className="text-3xl font-display font-black text-text-primary mb-3">Welcome back</h1>
                        <p className="text-text-secondary">Sign in to continue your career journey</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-text-muted uppercase tracking-widest ml-1">Email Address</label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary transition-colors" size={18} />
                                <input 
                                    type="email" 
                                    placeholder="you@example.com" 
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-text-primary placeholder:text-text-muted/40 focus:outline-none focus:border-primary/50 focus:bg-white/8 transition-all"
                                    value={form.email}
                                    onChange={handleChange('email')}
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-text-muted uppercase tracking-widest ml-1">Password</label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary transition-colors" size={18} />
                                <input 
                                    type={showPw ? 'text' : 'password'} 
                                    placeholder="••••••••" 
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-12 text-text-primary placeholder:text-text-muted/40 focus:outline-none focus:border-primary/50 focus:bg-white/8 transition-all"
                                    value={form.password}
                                    onChange={handleChange('password')}
                                    required
                                />
                                <button 
                                    type="button" 
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors p-1"
                                    onClick={() => setShowPw(!showPw)}
                                >
                                    {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        {error && <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold">{error}</div>}

                        <button 
                            type="submit" 
                            disabled={loading}
                            className="w-full py-4 bg-linear-to-r from-primary to-secondary text-white font-black text-lg rounded-2xl shadow-xl shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-1 active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-3"
                        >
                            {loading ? <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <>Sign In <ArrowRight size={20} /></>}
                        </button>
                    </form>

                    <div className="mt-8 relative text-center">
                        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/5"></div></div>
                        <span className="relative px-4 bg-[#111] text-[10px] font-black tracking-widest text-text-muted uppercase">Or continue with</span>
                    </div>
                    <p className="mt-10 text-center text-text-muted text-sm font-medium">
                        Don't have an account? <Link to="/signup" className="text-primary-light font-black hover:underline ml-1">Create one free</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
