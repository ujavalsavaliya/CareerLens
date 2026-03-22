import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { Building2, X, Eye, EyeOff, KeyRound, User, Loader2, CheckCircle, Zap } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { setHrmsAccount } from '../app/slices/authSlice';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const HRMS_URL = import.meta.env.VITE_HRMS_URL || 'http://localhost:3003';

export default function HrmsSetupModal({ onClose }) {
    const dispatch = useDispatch();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPass, setShowPass] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (!username.trim() || !password.trim()) {
            setError('Username and password are required');
            return;
        }
        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await axios.post(
                `${API}/users/setup-hrms`,
                { username: username.trim().toLowerCase(), password },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (res.data.hrmsAccount) {
                dispatch(setHrmsAccount());
                setSuccess(true);
                // Redirect to HRMS after 1.5s
                setTimeout(() => {
                    onClose();
                    window.open(HRMS_URL, '_blank', 'noopener,noreferrer');
                }, 1500);
            }
        } catch (err) {
            const message = err.response?.data?.message || '';
            if (message.toLowerCase().includes('already set up')) {
                dispatch(setHrmsAccount());
                setSuccess(true);
                setTimeout(() => {
                    onClose();
                    window.location.href = HRMS_URL;
                }, 1500);
            } else {
                setError(message || 'Failed to set up HRMS account. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    const modal = (
        <div style={{ position: 'fixed', inset: 0, zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
            {/* Backdrop */}
            <div
                style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)' }}
                onClick={!loading ? onClose : undefined}
            />

            {/* Modal Card */}
            <div className="relative w-full max-w-[440px] bg-bg-card border border-white/10 rounded-3xl shadow-[0_30px_100px_rgba(0,0,0,0.8)] overflow-hidden animate-scale" style={{ zIndex: 1 }}>
                {/* Top gradient bar */}
                <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-primary via-primary-light to-secondary" />

                {/* Glow orbs */}
                <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary/20 blur-[60px] rounded-full pointer-events-none" />
                <div className="absolute -bottom-16 -left-16 w-32 h-32 bg-secondary/10 blur-[50px] rounded-full pointer-events-none" />

                <div className="relative p-8">
                    {/* Close button */}
                    {!success && (
                        <button
                            onClick={onClose}
                            disabled={loading}
                            className="absolute top-5 right-5 p-2 rounded-full text-text-muted hover:text-text-primary hover:bg-white/10 transition-all cursor-pointer z-10"
                        >
                            <X size={20} />
                        </button>
                    )}

                    {success ? (
                        <div className="flex flex-col items-center text-center py-10 gap-5 animate-scale">
                            <div className="w-20 h-20 rounded-full flex items-center justify-center border border-success/30 bg-success/10 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
                                <CheckCircle size={40} className="text-success" />
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-2xl font-bold text-text-primary">Account Ready!</h3>
                                <p className="text-text-secondary text-sm">Opening your HRMS dashboard…</p>
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* Header */}
                            <div className="flex items-center gap-4 mb-7">
                                <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center shadow-lg shadow-primary/30 flex-shrink-0 p-3">
                                    <Building2 size={24} className="text-white" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-text-primary">HRMS Setup</h2>
                                    <p className="text-sm text-text-secondary mt-0.5">Create your admin credentials</p>
                                </div>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-5">
                                {/* Username */}
                                <div className="space-y-1.5">
                                    <label className="block text-[11px] font-bold text-text-secondary uppercase tracking-widest">
                                        Admin Username
                                    </label>
                                    <div className="relative">
                                        <User size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
                                        <input
                                            type="text"
                                            value={username}
                                            onChange={e => { setUsername(e.target.value); setError(''); }}
                                            placeholder="Choose a username"
                                            autoFocus
                                            disabled={loading}
                                            className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-text-primary placeholder:text-text-muted text-sm outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/15 transition-all duration-200 disabled:opacity-60"
                                        />
                                    </div>
                                </div>

                                {/* Password */}
                                <div className="space-y-1.5">
                                    <label className="block text-[11px] font-bold text-text-secondary uppercase tracking-widest">
                                        Admin Password
                                    </label>
                                    <div className="relative">
                                        <KeyRound size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
                                        <input
                                            type={showPass ? 'text' : 'password'}
                                            value={password}
                                            onChange={e => { setPassword(e.target.value); setError(''); }}
                                            placeholder="At least 6 characters"
                                            disabled={loading}
                                            className="w-full pl-10 pr-11 py-3 rounded-xl bg-white/5 border border-white/10 text-text-primary placeholder:text-text-muted text-sm outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/15 transition-all duration-200 disabled:opacity-60"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPass(v => !v)}
                                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors cursor-pointer"
                                        >
                                            {showPass ? <EyeOff size={17} /> : <Eye size={17} />}
                                        </button>
                                    </div>
                                </div>

                                {/* Error */}
                                {error && (
                                    <div className="p-3.5 rounded-xl bg-danger/10 border border-danger/20 text-danger text-sm font-medium animate-fade-in">
                                        {error}
                                    </div>
                                )}

                                {/* Info */}
                                <div className="flex gap-3 p-3.5 rounded-xl bg-primary/5 border border-primary/10">
                                    <Zap size={14} className="text-primary-light flex-shrink-0 mt-0.5" />
                                    <p className="text-[13px] text-text-secondary leading-relaxed">
                                        Your HRMS data is <span className="text-primary-light font-semibold">fully isolated</span> from other HR accounts.
                                    </p>
                                </div>

                                {/* Submit */}
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-xl bg-gradient-to-r from-primary to-primary-dark text-white font-bold text-[15px] shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:translate-y-0 cursor-pointer"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 size={18} className="animate-spin" />
                                            <span>Setting up…</span>
                                        </>
                                    ) : (
                                        <>
                                            <Building2 size={18} />
                                            <span>Create HRMS Account</span>
                                        </>
                                    )}
                                </button>
                            </form>
                        </>
                    )}
                </div>
            </div>
        </div>
    );

    return ReactDOM.createPortal(modal, document.body);
}
