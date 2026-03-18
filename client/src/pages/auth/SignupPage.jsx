import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { registerUser } from '../../app/slices/authSlice';
import { Zap, Mail, Lock, User, Briefcase, Eye, EyeOff, Building2, Brain } from 'lucide-react';
import toast from 'react-hot-toast';
import './Auth.css';

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
        <div className="auth-page">
            <div className="auth-bg">
                <div className="auth-orb auth-orb-1" />
                <div className="auth-orb auth-orb-2" />
                <div className="auth-orb auth-orb-3" />
                <div className="auth-grid-lines" />
            </div>

            <div className="auth-wrapper">
                {/* Left decorative panel */}
                <div className="auth-left-panel">
                    <div className="alp-logo">
                        <div className="logo-icon"><Zap size={22} /></div>
                        <span className="logo-text">Career<span className="gradient-text">Lens</span></span>
                    </div>
                    <div className="alp-headline">
                        <h2>Start your <span className="gradient-text">AI-powered</span> career journey</h2>
                        <p>Join thousands of professionals who land better jobs faster using CareerLens AI.</p>
                    </div>
                    <div className="alp-features">
                        {[
                            { icon: Brain, label: 'AI Resume Analysis', desc: 'Instant score & feedback' },
                            { icon: Zap, label: 'Smart Job Matching', desc: 'AI ranks jobs by fit %' },
                            { icon: Briefcase, label: 'HR AI Ranking', desc: 'Get found by top recruiters' },
                        ].map(({ icon: Icon, label, desc }) => (
                            <div key={label} className="alp-feature-item">
                                <div className="alp-feature-icon"><Icon size={16} /></div>
                                <div>
                                    <div className="alp-feature-label">{label}</div>
                                    <div className="alp-feature-desc">{desc}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="alp-floating-card alp-card-1 glass">
                        <div className="alp-fc-score">82</div>
                        <div className="alp-fc-label">AI Resume Score</div>
                        <div className="progress-bar mt-2"><div className="progress-fill" style={{ width: '82%' }} /></div>
                    </div>
                </div>

                {/* Right form panel */}
                <div className="auth-right-panel">
                    <div className="auth-form-card animate-scale">
                        <div className="auth-form-header">
                            <h1>Create your account</h1>
                            <p>Free forever · No credit card required</p>
                        </div>

                        {/* Role toggle */}
                        <div className="auth-role-toggle">
                            <button type="button"
                                className={`art-btn ${form.role === 'jobseeker' ? 'active' : ''}`}
                                onClick={() => setForm(f => ({ ...f, role: 'jobseeker' }))}>
                                <User size={15} /> Job Seeker
                            </button>
                            <button type="button"
                                className={`art-btn ${form.role === 'hr' ? 'active' : ''}`}
                                onClick={() => setForm(f => ({ ...f, role: 'hr' }))}>
                                <Briefcase size={15} /> HR / Recruiter
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="auth-form-body">
                            <div className="auth-field">
                                <label>Full Name</label>
                                <div className="auth-input-wrap">
                                    <User size={16} className="auth-input-icon" />
                                    <input type="text" placeholder="John Doe" value={form.name}
                                        onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
                                </div>
                            </div>

                            {form.role === 'hr' && (
                                <div className="auth-field">
                                    <label>Company Name</label>
                                    <div className="auth-input-wrap">
                                        <Building2 size={16} className="auth-input-icon" />
                                        <input type="text" placeholder="Acme Inc." value={form.company}
                                            onChange={e => setForm(f => ({ ...f, company: e.target.value }))} />
                                    </div>
                                </div>
                            )}

                            <div className="auth-field">
                                <label>Email Address</label>
                                <div className="auth-input-wrap">
                                    <Mail size={16} className="auth-input-icon" />
                                    <input type="email" placeholder="you@example.com" value={form.email}
                                        onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
                                </div>
                            </div>

                            <div className="auth-field">
                                <label>Password</label>
                                <div className="auth-input-wrap">
                                    <Lock size={16} className="auth-input-icon" />
                                    <input type={showPw ? 'text' : 'password'} placeholder="Min. 6 characters"
                                        value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required />
                                    <button type="button" className="auth-eye-btn" onClick={() => setShowPw(!showPw)}>
                                        {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                                    </button>
                                </div>
                            </div>

                            <button type="submit" className="auth-submit-btn" disabled={loading}>
                                {loading ? <span className="btn-spinner" /> : 'Create Account →'}
                            </button>
                        </form>

                        <div className="auth-form-footer">
                            Already have an account? <Link to="/login">Sign in</Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
