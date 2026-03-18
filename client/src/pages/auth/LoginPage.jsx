import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser } from '../../app/slices/authSlice';
import { Zap, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import './Auth.css';

export default function LoginPage() {
    const [form, setForm] = useState({ email: '', password: '' });
    const [showPw, setShowPw] = useState(false);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { loading, error } = useSelector(s => s.auth);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const res = await dispatch(loginUser(form));
        if (loginUser.fulfilled.match(res)) {
            toast.success(`Welcome back, ${res.payload.name}! 🎉`);
            navigate(res.payload.role === 'hr' ? '/hr/jobs' : '/dashboard');
        } else {
            toast.error(res.payload || 'Login failed');
        }
    };

    return (
        <div className="auth-page">
            {/* Animated background */}
            <div className="auth-bg">
                <div className="auth-orb auth-orb-1" />
                <div className="auth-orb auth-orb-2" />
                <div className="auth-orb auth-orb-3" />
                <div className="auth-grid-lines" />
            </div>

            <div className="auth-wrapper">
                {/* Left panel decoration */}
                <div className="auth-left-panel">
                    <div className="alp-logo">
                        <div className="logo-icon"><Zap size={22} /></div>
                        <span className="logo-text">Career<span className="gradient-text">Lens</span></span>
                    </div>
                    <div className="alp-headline">
                        <h2>AI that <span className="gradient-text">accelerates</span> your career</h2>
                        <p>Smart resume scoring, job matching, and recruiter-side AI ranking — all in one platform.</p>
                    </div>
                    <div className="alp-stats">
                        {[['50K+', 'Professionals'], ['94%', 'Match accuracy'], ['8.5K+', 'Placements']].map(([v, l]) => (
                            <div key={l} className="alp-stat">
                                <div className="alp-stat-val gradient-text">{v}</div>
                                <div className="alp-stat-lbl">{l}</div>
                            </div>
                        ))}
                    </div>
                    <div className="alp-floating-card alp-card-1 glass">
                        <div className="alp-fc-score">82</div>
                        <div className="alp-fc-label">AI Resume Score</div>
                        <div className="progress-bar mt-2"><div className="progress-fill" style={{ width: '82%' }} /></div>
                    </div>
                    <div className="alp-floating-card alp-card-2 glass">
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                            <span style={{ fontSize: 20 }}>🎯</span>
                            <span style={{ fontSize: 13, fontWeight: 600 }}>Match Found</span>
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Senior Dev at Google</div>
                        <div style={{ fontSize: 18, fontWeight: 800, color: '#34d399', marginTop: 4 }}>94% match</div>
                    </div>
                </div>

                {/* Right form panel */}
                <div className="auth-right-panel">
                    <div className="auth-form-card animate-scale">
                        <div className="auth-form-header">
                            <h1>Welcome back</h1>
                            <p>Sign in to continue your career journey</p>
                        </div>

                        <form onSubmit={handleSubmit} className="auth-form-body">
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
                                    <input type={showPw ? 'text' : 'password'} placeholder="••••••••"
                                        value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required />
                                    <button type="button" className="auth-eye-btn" onClick={() => setShowPw(!showPw)}>
                                        {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                                    </button>
                                </div>
                            </div>

                            {error && <div className="auth-error-msg">{error}</div>}

                            <button type="submit" className="auth-submit-btn" disabled={loading}>
                                {loading ? <span className="btn-spinner" /> : 'Sign In'}
                            </button>
                        </form>

                        <div className="auth-form-footer">
                            Don't have an account? <Link to="/signup">Create one free</Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
