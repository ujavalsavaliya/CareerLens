import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Zap, Brain, Target, Users, TrendingUp, CheckCircle, ArrowRight, Briefcase, FileText, Award, Sparkles, ChevronDown, Bot, Cpu, Wifi } from 'lucide-react';
import { useSelector } from 'react-redux';
// import './LandingPage.css'; // Removed

/* ─── Animated number counter ─── */
function Counter({ to, suffix = '' }) {
    const [val, setVal] = useState(0);
    const ref = useRef();
    useEffect(() => {
        const obs = new IntersectionObserver(([e]) => {
            if (!e.isIntersecting) return;
            obs.disconnect();
            let start = 0;
            const step = Math.ceil(to / 50);
            const t = setInterval(() => {
                start = Math.min(start + step, to);
                setVal(start);
                if (start >= to) clearInterval(t);
            }, 28);
        }, { threshold: 0.5 });
        if (ref.current) obs.observe(ref.current);
        return () => obs.disconnect();
    }, [to]);
    return <span ref={ref}>{val.toLocaleString()}{suffix}</span>;
}

/* ─── Typewriter hook ─── */
function useTypewriter(words, speed = 90, pause = 1800) {
    const [display, setDisplay] = useState('');
    const [wi, setWi] = useState(0);
    const [deleting, setDeleting] = useState(false);
    useEffect(() => {
        const current = words[wi];
        const timeout = setTimeout(() => {
            if (!deleting) {
                setDisplay(current.slice(0, display.length + 1));
                if (display.length + 1 === current.length) setTimeout(() => setDeleting(true), pause);
            } else {
                setDisplay(current.slice(0, display.length - 1));
                if (display.length === 0) { setDeleting(false); setWi((wi + 1) % words.length); }
            }
        }, deleting ? speed / 2 : speed);
        return () => clearTimeout(timeout);
    }, [display, deleting, wi, words, speed, pause]);
    return display;
}

/* ─── Scroll reveal hook ─── */
function useScrollReveal(threshold = 0.15) {
    const ref = useRef();
    const [visible, setVisible] = useState(false);
    useEffect(() => {
        const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } }, { threshold });
        if (ref.current) obs.observe(ref.current);
        return () => obs.disconnect();
    }, [threshold]);
    return [ref, visible];
}

/* ─── Reveal wrapper ─── */
function Reveal({ children, delay = 0, direction = 'up' }) {
    const [ref, visible] = useScrollReveal();
    return (
        <div ref={ref} className={`reveal reveal-${direction} ${visible ? 'revealed' : ''}`} style={{ transitionDelay: `${delay}ms` }}>
            {children}
        </div>
    );
}

/* ─── AI Demo card (live typing simulation) ─── */
const AI_DEMO_LINES = [
    { type: 'prompt', text: 'Analyzing resume…' },
    { type: 'score', text: '82 / 100 Overall Score' },
    { type: 'good', text: '✓ Strong technical skills section' },
    { type: 'good', text: '✓ Quantified achievements detected' },
    { type: 'warn', text: '⚠ Missing: professional summary' },
    { type: 'warn', text: '⚠ Add more keywords: Docker, AWS' },
    { type: 'skill', text: 'Extracted: React · Node.js · Python · SQL' },
    { type: 'match', text: '🎯 94% match — Senior Dev at Google' },
];

function AIDemo() {
    const [lines, setLines] = useState([]);
    const [ref, visible] = useScrollReveal(0.3);
    useEffect(() => {
        if (!visible) return;
        setLines([]);
        let i = 0;
        const t = setInterval(() => {
            if (i >= AI_DEMO_LINES.length) { clearInterval(t); return; }
            setLines(prev => [...prev, AI_DEMO_LINES[i]]);
            i++;
        }, 500);
        return () => clearInterval(t);
    }, [visible]);
    return (
        <div ref={ref} className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden font-mono shadow-2xl">
            <div className="flex items-center gap-2 px-4 py-3 bg-black/40 border-b border-white/10">
                <div className="w-3 h-3 rounded-full bg-red-400" /><div className="w-3 h-3 rounded-full bg-amber-400" /><div className="w-3 h-3 rounded-full bg-emerald-400" />
                <span className="text-[10px] text-text-muted ml-2 font-display uppercase tracking-widest">CareerLens AI Engine</span>
            </div>
            <div className="p-5 min-h-[260px] flex flex-col gap-2 bg-black/20">
                {lines.filter(Boolean).map((l, i) => (
                    <div key={i} className="text-xs leading-relaxed animate-fade-in">
                        {l.type === 'prompt' && <span className="text-primary-light mr-2">$ </span>}
                        <span className={
                            l.type === 'score' ? 'text-lg font-black bg-linear-to-r from-primary to-secondary bg-clip-text text-transparent' :
                            l.type === 'good' ? 'text-emerald-400' :
                            l.type === 'warn' ? 'text-amber-400' :
                            l.type === 'skill' ? 'text-primary-light' :
                            l.type === 'match' ? 'text-white font-bold' : 'text-text-secondary'
                        }>
                            {l.text}
                        </span>
                        {i === lines.length - 1 && <span className="inline-block w-2 h-4 bg-emerald-400 ml-1 animate-blink relative top-1"></span>}
                    </div>
                ))}
            </div>
        </div>
    );
}

/* ─── Feature card ─── */
const FEATURES = [
    { icon: Brain, title: 'AI Resume Analysis', desc: 'Instant ATS score, graded sections, missing keywords, and specific improvement tips — delivered in seconds.', color: '#6366f1', gradient: 'from-indigo' },
    { icon: Target, title: 'Smart Job Matching', desc: 'AI reads your extracted skills and ranks every job by your actual fit percentage, not generic algorithms.', color: '#06b6d4', gradient: 'from-cyan' },
    { icon: Users, title: 'Candidate Ranking for HR', desc: 'Post a job and instantly receive AI-ranked candidates with match scores, matched/missing skills, and reasoning.', color: '#10b981', gradient: 'from-green' },
    { icon: FileText, title: 'Certificate Analysis', desc: 'Upload certs and let AI extract issuer, date, and credentials — automatically added to your profile.', color: '#f59e0b', gradient: 'from-amber' },
    { icon: TrendingUp, title: 'Profile Score', desc: 'Live completeness meter with AI suggestions. Know exactly what to fix to appear higher in recruiter searches.', color: '#8b5cf6', gradient: 'from-purple' },
    { icon: Award, title: 'Priority Discovery', desc: 'Premium members appear at the top of recruiter talent searches and get advanced AI career coaching.', color: '#ec4899', gradient: 'from-pink' },
];

const STATS = [
    { val: 50000, suffix: '+', label: 'Professionals' },
    { val: 12000, suffix: '+', label: 'Jobs Posted' },
    { val: 80000, suffix: '+', label: 'AI Analyses' },
    { val: 8500, suffix: '+', label: 'Placements' },
];

const TYPEWRITER_WORDS = ['Dream Job', 'Perfect Role', 'Next Opportunity', 'Career Leap'];

/* ─── Floating particles ─── */
function Particles() {
    return (
        <div className="particles-container" aria-hidden>
            {Array.from({ length: 20 }).map((_, i) => (
                <div key={i} className="particle" style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 8}s`,
                    animationDuration: `${6 + Math.random() * 6}s`,
                    opacity: 0.3 + Math.random() * 0.4,
                }} />
            ))}
        </div>
    );
}


/* ─── Robotic AI Animation Section ─── */
const SCAN_ITEMS = [
    { label: 'Resume Parser', pct: 98, color: '#6366f1' },
    { label: 'Skill Extractor', pct: 94, color: '#06b6d4' },
    { label: 'Job Matcher', pct: 91, color: '#10b981' },
    { label: 'ATS Optimizer', pct: 87, color: '#f59e0b' },
];

function RobotSection() {
    const [ref, visible] = useScrollReveal(0.2);
    const [tick, setTick] = useState(0);
    useEffect(() => {
        const t = setInterval(() => setTick(n => n + 1), 1200);
        return () => clearInterval(t);
    }, []);
    return (
        <section className="relative py-24 px-6 overflow-hidden">
            {/* Background grid */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.05)_0%,transparent_70%)] opacity-50" />
            <div className="absolute inset-0 bg-size-[40px_40px] bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] mask-[radial-gradient(ellipse_at_center,black_transparent_80%)]" />

            <div className="relative z-10 max-w-[1280px] mx-auto">
                <Reveal direction="up">
                    <div className="text-center mb-16">
                        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary-light text-[11px] font-black uppercase tracking-widest leading-none">
                            <Bot size={13} /> AI Engine at a Glance
                        </span>
                        <h2 className="text-4xl md:text-5xl font-display font-black mt-6 mb-4 text-text-primary">
                            Powered by a <span className="bg-linear-to-r from-primary to-secondary bg-clip-text text-transparent">Thinking Machine</span>
                        </h2>
                        <p className="text-text-secondary max-w-2xl mx-auto text-lg leading-relaxed">
                            Our AI engine never stops scanning, matching, and optimizing for you — 24/7, in real-time.
                        </p>
                    </div>
                </Reveal>

                <div className="grid lg:grid-cols-[1fr_auto_1fr] gap-12 items-center" ref={ref}>
                    {/* Left: system stats */}
                    <Reveal direction="left" delay={0}>
                        <div className="p-8 bg-bg-card/30 backdrop-blur-xl border border-white/10 rounded-[32px] shadow-2xl space-y-6">
                            <div className="flex items-center gap-2 text-text-primary font-bold text-sm mb-2">
                                <Cpu size={16} className="text-primary-light" /> System Modules
                            </div>
                            {SCAN_ITEMS.map(({ label, pct, color }) => (
                                <div key={label} className="space-y-2">
                                    <div className="flex justify-between text-xs font-semibold">
                                        <span className="text-text-secondary">{label}</span>
                                        <span style={{ color }}>{pct}%</span>
                                    </div>
                                    <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                                        <div
                                            className="h-full transition-all duration-[1.5s] ease-out rounded-full shadow-[0_0_10px_rgba(0,0,0,0.5)]"
                                            style={{
                                                width: visible ? `${pct}%` : '0%',
                                                background: `linear-gradient(90deg, ${color}44, ${color})`,
                                            }}
                                        />
                                    </div>
                                </div>
                            ))}
                            <div className="pt-4 flex items-center gap-2 text-[11px] text-emerald-400 font-bold uppercase tracking-widest">
                                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_8px_#10b981]" />
                                All systems operational
                            </div>
                        </div>
                    </Reveal>

                    {/* Center: animated robot */}
                    <Reveal direction="up" delay={80}>
                        <div className="relative flex justify-center items-center py-12">
                            {/* Orbit rings */}
                            <div className="absolute w-[300px] h-[300px] border border-primary/10 rounded-full animate-ring-expand" />
                            <div className="absolute w-[450px] h-[450px] border border-primary/5 rounded-full animate-ring-expand [animation-delay:2s]" />

                            {/* Robot SVG */}
                            <div className="relative z-10 w-[240px] md:w-[280px] drop-shadow-[0_20px_50px_rgba(99,102,241,0.2)]">
                                <svg viewBox="0 0 160 200" className="w-full h-auto animate-float" xmlns="http://www.w3.org/2000/svg">
                                    <defs>
                                        <linearGradient id="robot_grad" x1="0%" y1="0%" x2="100%" y2="100%">
                                            <stop offset="0%" stopColor="#6366f1" />
                                            <stop offset="100%" stopColor="#06b6d4" />
                                        </linearGradient>
                                        <filter id="robot_glow">
                                            <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
                                            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                                        </filter>
                                    </defs>
                                    <line x1="80" y1="10" x2="80" y2="28" stroke="url(#robot_grad)" strokeWidth="3" strokeLinecap="round" />
                                    <circle cx="80" cy="8" r="5" fill="url(#robot_grad)" filter="url(#robot_glow)" className="animate-pulse" />
                                    <rect x="42" y="28" width="76" height="58" rx="16" fill="rgba(99,102,241,0.15)" stroke="url(#robot_grad)" strokeWidth="2" />
                                    <rect x="54" y="44" width="20" height="14" rx="5" fill="url(#robot_grad)" filter="url(#robot_glow)" />
                                    <rect x="86" y="44" width="20" height="14" rx="5" fill="url(#robot_grad)" filter="url(#robot_glow)" />
                                    <rect x="56" y="68" width="48" height="8" rx="4" fill="none" stroke="#06b6d4" strokeWidth="1.5" />
                                    <rect x="58" y="70" width={`${24 + (tick % 3) * 8}`} height="4" rx="2" fill="#06b6d4" opacity="0.8" className="transition-all duration-300" />
                                    <rect x="72" y="86" width="16" height="10" rx="4" fill="rgba(99,102,241,0.3)" />
                                    <rect x="30" y="96" width="100" height="72" rx="18" fill="rgba(99,102,241,0.1)" stroke="url(#robot_grad)" strokeWidth="2" />
                                    <rect x="48" y="112" width="64" height="38" rx="10" fill="rgba(6,182,212,0.1)" stroke="rgba(6,182,212,0.3)" strokeWidth="1" />
                                    <line x1="56" y1="122" x2="104" y2="122" stroke="rgba(6,182,212,0.4)" strokeWidth="1" />
                                    <line x1="56" y1="130" x2="90" y2="130" stroke="rgba(99,102,241,0.4)" strokeWidth="1" />
                                    <circle cx="100" cy="122" r="3" fill="#6366f1" filter="url(#robot_glow)" />
                                    <circle cx="94" cy="130" r="3" fill="#06b6d4" filter="url(#robot_glow)" />
                                    <rect x="4" y="100" width="28" height="54" rx="12" fill="rgba(99,102,241,0.1)" stroke="url(#robot_grad)" strokeWidth="1.5" />
                                    <rect x="128" y="100" width="28" height="54" rx="12" fill="rgba(99,102,241,0.1)" stroke="url(#robot_grad)" strokeWidth="1.5" />
                                    <rect x="44" y="168" width="30" height="28" rx="10" fill="rgba(99,102,241,0.1)" stroke="url(#robot_grad)" strokeWidth="1.5" />
                                    <rect x="86" y="168" width="30" height="28" rx="10" fill="rgba(99,102,241,0.1)" stroke="url(#robot_grad)" strokeWidth="1.5" />
                                </svg>

                                {/* Floating nodes */}
                                {[{ t: '8%', l: '-15%', c: '#6366f1', i: 'AI' }, { t: '50%', l: '-25%', c: '#06b6d4', i: 'ML' }, { t: '8%', r: '-15%', c: '#10b981', i: 'GPT' }, { t: '50%', r: '-25%', c: '#f59e0b', i: 'DATA' }].map((o, idx) => (
                                    <div key={idx} className="absolute w-10 h-10 rounded-xl border border-white/10 bg-bg-card/80 backdrop-blur-md flex items-center justify-center shadow-xl animate-float" style={{ 
                                        top: o.t, left: o.l, right: o.r, 
                                        borderColor: `${o.c}44`,
                                        animationDelay: `${idx * 0.7}s` 
                                    }}>
                                        <span className="text-[10px] font-black" style={{ color: o.c }}>{o.i}</span>
                                    </div>
                                ))}

                                {/* Scan Line */}
                                <div className="absolute inset-x-0 h-0.5 bg-linear-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_15px_#22d3ee] animate-scan pointer-events-none opacity-40" />
                            </div>

                            <div className="absolute -bottom-4 px-4 py-1.5 rounded-full bg-bg-dark/80 backdrop-blur-md border border-white/10 text-[10px] text-text-muted flex items-center gap-2 font-bold tracking-widest uppercase shadow-xl">
                                <Wifi size={12} className="text-primary-light" /> Neural net active · 24/7
                            </div>
                        </div>
                    </Reveal>

                    {/* Right: live feed */}
                    <Reveal direction="right" delay={160}>
                        <div className="p-8 bg-bg-card/30 backdrop-blur-xl border border-white/10 rounded-[32px] shadow-2xl space-y-5">
                            <div className="flex items-center gap-2 text-text-primary font-bold text-sm mb-2">
                                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" /> Live Activity
                            </div>
                            {[
                                { msg: 'Resume scored → 82/100', t: '0s ago', c: '#6366f1' },
                                { msg: 'Job match found → 94%', t: '2s ago', c: '#06b6d4' },
                                { msg: 'Skills extracted → 12', t: '5s ago', c: '#10b981' },
                                { msg: 'ATS keywords added', t: '9s ago', c: '#f59e0b' },
                                { msg: 'Profile score +7pts', t: '14s ago', c: '#8b5cf6' },
                            ].map(({ msg, t, c }, i) => (
                                <div key={i} className="flex items-start gap-4 p-3 rounded-2xl hover:bg-white/5 transition-colors group">
                                    <span className="w-1.5 h-1.5 rounded-full mt-2 ring-4 ring-white/5" style={{ background: c }} />
                                    <div className="flex-1">
                                        <div className="text-xs font-semibold text-text-secondary group-hover:text-text-primary transition-colors">{msg}</div>
                                        <div className="text-[10px] text-text-muted mt-1">{t}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Reveal>
                </div>
            </div>
        </section>
    );
}

export default function LandingPage() {
    const { user } = useSelector(s => s.auth);
    const typing = useTypewriter(TYPEWRITER_WORDS);

    return (
        <div className="bg-bg-dark overflow-x-hidden">
            {/* ═══════════ HERO ═══════════ */}
            <section className="relative min-h-[90vh] flex flex-col items-center justify-center overflow-hidden bg-bg-dark pt-20 pb-16 px-6">
                <Particles />
                {/* Decorative orbs */}
                <div className="absolute -top-[10%] -right-[5%] w-[500px] h-[500px] bg-primary/20 blur-2xl rounded-full animate-float pointer-events-none" />
                <div className="absolute bottom-[5%] -left-[10%] w-[400px] h-[400px] bg-secondary/15 blur-[100px] rounded-full animate-float [animation-delay:2s] pointer-events-none" />
                
                {/* Expanding rings */}
                <div className="absolute top-1/2 left-1/2 w-[600px] h-[600px] border border-primary/15 rounded-full animate-ring-expand pointer-events-none" />
                <div className="absolute top-1/2 left-1/2 w-[900px] h-[900px] border border-primary/10 rounded-full animate-ring-expand [animation-delay:3s] pointer-events-none" />

                <div className="relative z-10 w-full max-w-[1280px] grid lg:grid-cols-2 gap-16 items-center">
                    <div className="flex flex-col gap-6 text-left">
                        <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/30 text-primary-light text-sm font-bold w-fit animate-fade-in stagger-1">
                            <Sparkles size={14} className="animate-pulse-soft" />
                            <span>AI-Powered Career Platform · GPT-4o</span>
                        </div>

                        <h1 className="text-4xl md:text-5xl xl:text-6xl font-display font-black leading-[1.1] text-text-primary animate-fade-in stagger-2">
                            Land Your<br />
                            <span className="relative inline-block min-w-auto">
                                <span className="bg-linear-to-r from-primary to-secondary bg-clip-text text-transparent italic">{typing}</span>
                                <span className="inline-block w-0.5 h-[0.9em] bg-primary-light ml-2 animate-blink transform translate-y-2"></span>
                            </span>
                            <br />with AI Superpowers
                        </h1>

                        <p className="text-lg md:text-xl text-text-secondary leading-relaxed max-w-[520px] animate-fade-in stagger-3">
                            CareerLens uses GPT-4o to analyze your resume, match you to the perfect roles,
                            and help HR teams discover their ideal candidates — in real-time.
                        </p>

                        <div className="flex flex-wrap items-center gap-4 animate-fade-in stagger-4">
                            {user ? (
                                <Link to="/dashboard" className="px-8 py-4 rounded-xl bg-linear-to-r from-primary to-secondary text-white font-bold shadow-2xl shadow-primary/30 hover:shadow-primary/50 hover:-translate-y-1 transition-all duration-300 flex items-center gap-2">
                                    Go to Dashboard <ArrowRight size={20} />
                                </Link>
                            ) : (
                                <>
                                    <Link to="/signup" className="px-8 py-4 rounded-xl bg-linear-to-r from-primary to-secondary text-white font-bold shadow-2xl shadow-primary/30 hover:shadow-primary/50 hover:-translate-y-1 transition-all duration-300 flex items-center gap-2">
                                        Get Started Free <ArrowRight size={20} />
                                    </Link>
                                    <Link to="/jobs" className="px-8 py-4 rounded-xl border border-white/10 bg-white/5 text-text-primary font-bold hover:bg-white/10 hover:border-white/20 transition-all duration-200">
                                        Browse Jobs
                                    </Link>
                                </>
                            )}
                        </div>

                        {!user && (
                            <div className="text-sm text-text-muted animate-fade-in stagger-4">
                                Already have an account? <Link to="/login" className="text-primary-light font-bold hover:underline ml-1">Sign in</Link>
                            </div>
                        )}

                        <div className="flex flex-wrap gap-x-6 gap-y-3 mt-4 animate-fade-in stagger-5">
                            {['Free AI resume analysis', 'Instant job matching', 'No credit card required'].map(t => (
                                <span key={t} className="flex items-center gap-2 text-sm text-text-muted">
                                    <CheckCircle size={14} className="text-emerald-400" /> {t}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Hero visual — AI score card */}
                    <div className="hidden lg:flex justify-center items-center animate-slide-right stagger-2">
                        <div className="relative w-full max-w-[400px]">
                            {/* Main score card */}
                            <div className="p-8 bg-bg-card/40 backdrop-blur-2xl border border-white/10 rounded-[32px] shadow-2xl animate-float relative z-10">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-10 h-10 bg-linear-to-br from-primary to-secondary rounded-xl flex items-center justify-center text-white shadow-lg">
                                        <Brain size={20} />
                                    </div>
                                    <div>
                                        <div className="font-bold text-sm text-text-primary">AI Resume Analysis</div>
                                        <div className="text-[11px] text-text-muted mt-0.5">GPT-4o · Real-time processing</div>
                                    </div>
                                    <span className="ml-auto px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-[10px] font-black uppercase tracking-wider">Live</span>
                                </div>

                                {/* Score ring */}
                                <div className="relative flex justify-center items-center my-8">
                                    <svg viewBox="0 0 130 130" className="w-[140px] h-[140px]">
                                        <circle cx="65" cy="65" r="54" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="10" />
                                        <circle cx="65" cy="65" r="54" fill="none" stroke="url(#hg)" strokeWidth="10"
                                            strokeDasharray="339.3" strokeDashoffset="61" strokeLinecap="round" transform="rotate(-90 65 65)"
                                            className="transition-all duration-1000" />
                                        <defs>
                                            <linearGradient id="hg" x1="0%" y1="0%" x2="100%" y2="0%">
                                                <stop offset="0%" stopColor="#6366f1" />
                                                <stop offset="100%" stopColor="#06b6d4" />
                                            </linearGradient>
                                        </defs>
                                    </svg>
                                    <div className="absolute text-center">
                                        <div className="text-4xl font-display font-black bg-linear-to-r from-primary to-secondary bg-clip-text text-transparent">82</div>
                                        <div className="text-[11px] text-text-muted">/ 100</div>
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-2 mb-6">
                                    {['React', 'Python', 'AWS', 'Node.js', 'Docker'].map((s) => (
                                        <span key={s} className="px-3 py-1 bg-primary/10 border border-primary/20 rounded-full text-[12px] text-primary-light font-medium">{s}</span>
                                    ))}
                                </div>

                                <div className="space-y-2.5">
                                    {[['Senior Dev at Google', 94], ['Full Stack at Stripe', 88], ['Backend at Airbnb', 72]].map(([j, m]) => (
                                        <div key={j} className="flex justify-between items-center text-[13px]">
                                            <span className="text-text-secondary">{j}</span>
                                            <span className={`font-bold ${m >= 80 ? 'text-emerald-400' : 'text-amber-400'}`}>{m}%</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Floating secondary cards */}
                            <div className="absolute -bottom-6 -right-8 p-4 bg-bg-card/80 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl flex items-center gap-3 animate-float [animation-delay:1s] z-20">
                                <CheckCircle size={18} className="text-emerald-400" />
                                <div>
                                    <div className="text-xs font-bold text-text-primary">Profile Ready</div>
                                    <div className="text-[10px] text-text-muted mt-0.5">ATS Optimized</div>
                                </div>
                            </div>
                            <div className="absolute -top-6 -left-8 p-4 bg-bg-card/80 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl flex items-center gap-3 animate-float [animation-delay:0.5s] z-20">
                                <Briefcase size={18} className="text-indigo-400" />
                                <div>
                                    <div className="text-xs font-bold text-text-primary">3 New Jobs</div>
                                    <div className="text-[10px] text-text-muted mt-0.5">Top match: 94%</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Scroll hint */}
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-text-muted animate-bounce animate-fade-in stagger-5">
                    <ChevronDown size={24} />
                </div>
            </section>

            {/* ═══════════ STATS ═══════════ */}
            <section className="py-20 px-6 bg-linear-to-b from-transparent via-primary/5 to-transparent border-y border-white/5">
                <div className="max-w-[1000px] mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 text-center">
                    {STATS.map(({ val, suffix, label }, i) => (
                        <Reveal key={label} direction="up" delay={i * 80}>
                            <div className="flex flex-col gap-2 group">
                                <div className="text-4xl md:text-5xl font-display font-black bg-linear-to-r from-primary to-secondary bg-clip-text text-transparent group-hover:scale-110 transition-transform duration-300">
                                    <Counter to={val} suffix={suffix} />
                                </div>
                                <div className="text-sm font-bold text-text-muted uppercase tracking-widest">{label}</div>
                            </div>
                        </Reveal>
                    ))}
                </div>
            </section>

            {/* ═══════════ AI DEMO ═══════════ */}
            <RobotSection />

            <section className="py-24 px-6 overflow-hidden">
                <div className="max-w-[1280px] mx-auto grid lg:grid-cols-2 gap-20 items-center">
                    <div className="flex flex-col gap-8">
                        <Reveal direction="left">
                            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary-light text-[11px] font-black uppercase tracking-widest leading-none">
                                <Brain size={13} /> How the AI works
                            </span>
                            <h2 className="text-4xl md:text-5xl font-display font-black mt-6 mb-4 text-text-primary leading-tight">
                                Watch AI Analyze<br />a Resume in <span className="bg-linear-to-r from-primary to-secondary bg-clip-text text-transparent">Real-time</span>
                            </h2>
                            <p className="text-text-secondary text-lg leading-relaxed">
                                Upload your PDF and our GPT-4o engine scores every section, finds ATS keywords, extracts your skills, and matches you to open roles — all within seconds.
                            </p>
                        </Reveal>
                        <Reveal direction="left" delay={150}>
                            <div className="space-y-6">
                                {[
                                    { n: '01', t: 'Upload Resume', d: 'PDF, DOC, or DOCX · up to 10MB' },
                                    { n: '02', t: 'AI Parses & Scores', d: 'GPT-4o extracts skills, scores sections, flags gaps' },
                                    { n: '03', t: 'Get Match-ranked Jobs', d: 'Jobs sorted by your actual fit percentage' },
                                ].map(({ n, t, d }) => (
                                    <div key={n} className="flex gap-6 group">
                                        <div className="text-2xl font-display font-black bg-linear-to-r from-primary to-secondary bg-clip-text text-transparent w-12 shrink-0">{n}</div>
                                        <div>
                                            <div className="font-bold text-text-primary text-base mb-1">{t}</div>
                                            <div className="text-sm text-text-muted leading-relaxed">{d}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Reveal>
                        <Reveal direction="left" delay={250}>
                            <Link to={user ? "/dashboard" : "/signup"} className="w-fit px-8 py-4 rounded-xl bg-linear-to-r from-primary to-secondary text-white font-bold shadow-2xl shadow-primary/30 hover:shadow-primary/50 hover:-translate-y-1 transition-all duration-300 flex items-center gap-2">
                                {user ? "Go to Dashboard" : "Try AI Analysis Free"} <ArrowRight size={20} />
                            </Link>
                        </Reveal>
                    </div>

                    <Reveal direction="right" delay={100}>
                        <AIDemo />
                    </Reveal>
                </div>
            </section>

            {/* ═══════════ FEATURES ═══════════ */}
            <section className="py-24 px-6 bg-linear-to-b from-transparent via-primary/5 to-transparent">
                <div className="max-w-[1280px] mx-auto">
                    <Reveal direction="up">
                        <div className="text-center mb-16">
                            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary-light text-[11px] font-black uppercase tracking-widest leading-none">
                                Features
                            </span>
                            <h2 className="text-4xl md:text-5xl font-display font-black mt-6 mb-4 text-text-primary">
                                Everything to Land the Job <span className="bg-linear-to-r from-primary to-secondary bg-clip-text text-transparent">Faster</span>
                            </h2>
                            <p className="text-text-secondary max-w-2xl mx-auto text-lg leading-relaxed">
                                AI-powered tools that cover every step of your job search.
                            </p>
                        </div>
                    </Reveal>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {FEATURES.map(({ icon: Icon, title, desc, color }, i) => (
                            <Reveal key={title} direction="up" delay={i * 80}>
                                <div className="p-4 bg-bg-card/40 backdrop-blur-xl border border-white/10 rounded-[32px] hover:border-primary/30 hover:bg-bg-card/60 transition-all duration-300 group relative overflow-hidden">
                                    <div className="absolute inset-0 bg-linear-to-br from-white/2 to-transparent pointer-events-none" />
                                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3 shadow-lg" style={{ background: `${color}15`, color }}>
                                        <Icon size={26} />
                                    </div>
                                    <h3 className="text-xl font-bold text-text-primary mb-3">{title}</h3>
                                    <p className="text-text-secondary text-sm leading-relaxed">{desc}</p>
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-2xl rounded-full pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                </div>
                            </Reveal>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══════════ HOW IT WORKS ═══════════ */}
            <section className="py-24 px-6">
                <div className="max-w-[1280px] mx-auto">
                    <Reveal direction="up">
                        <div className="text-center mb-16">
                            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary-light text-[11px] font-black uppercase tracking-widest leading-none">
                                <Target size={13} /> Two types of users
                            </span>
                            <h2 className="text-4xl md:text-5xl font-display font-black mt-6 mb-4 text-text-primary">
                                Built for Both <span className="bg-linear-to-r from-primary to-secondary bg-clip-text text-transparent">Seekers & Recruiters</span>
                            </h2>
                        </div>
                    </Reveal>

                    <div className="grid md:grid-cols-2 gap-8">
                        <Reveal direction="left" delay={0}>
                            <div className="p-6 bg-bg-card/40 backdrop-blur-xl border border-white/10 rounded-[40px] relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-6">
                                    <span className="px-4 py-1.5 rounded-full bg-primary/10 border border-primary/30 text-primary-light text-xs font-black uppercase tracking-widest">Job Seeker</span>
                                </div>
                                <h3 className="text-3xl font-display font-black text-text-primary mb-8 mt-4 leading-tight">Get hired faster<br />with AI</h3>
                                <div className="space-y-4">
                                    {['Sign up & build your profile', 'Upload resume — AI scores it instantly', 'Browse AI-ranked job matches', 'Apply with your AI match score', 'Track application status'].map((s, i) => (
                                        <div key={i} className="flex items-center gap-4 text-text-secondary group-hover:text-text-primary transition-colors text-base">
                                            <div className="w-1.5 h-1.5 rounded-full bg-linear-to-r from-primary to-secondary" />
                                            <span>{s}</span>
                                        </div>
                                    ))}
                                </div>
                                <Link to={user ? "/dashboard" : "/signup"} className="mt-10 w-full px-8 py-4 rounded-xl bg-primary text-white font-bold hover:bg-primary-dark transition-all duration-300 text-center block">
                                    {user ? "Go to Dashboard" : "Start Job Hunting"}
                                </Link>
                            </div>
                        </Reveal>

                        <Reveal direction="right" delay={100}>
                            <div className="p-6 bg-bg-card/40 backdrop-blur-xl border border-white/10 rounded-[40px] relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-6">
                                    <span className="px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-black uppercase tracking-widest">HR / Recruiter</span>
                                </div>
                                <h3 className="text-3xl font-display font-black text-text-primary mb-8 mt-4 leading-tight">Find perfect candidates<br />instantly</h3>
                                <div className="space-y-4">
                                    {['Post a job — AI extracts keywords', 'AI ranks ALL job seekers by fit %', 'View detailed match explanations', 'Shortlist top candidates', 'Reach out directly'].map((s, i) => (
                                        <div key={i} className="flex items-center gap-4 text-text-secondary group-hover:text-text-primary transition-colors text-base">
                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                            <span>{s}</span>
                                        </div>
                                    ))}
                                </div>
                                <Link to={user ? "/hr/dashboard" : "/signup?role=hr"} className="mt-10 w-full px-8 py-4 rounded-xl bg-secondary text-white font-bold hover:opacity-90 transition-all duration-300 text-center block">
                                    {user ? "Manage Jobs" : "Start Hiring"}
                                </Link>
                            </div>
                        </Reveal>
                    </div>
                </div>
            </section>

            {/* ═══════════ CTA ═══════════ */}
            <section className="py-2 overflow-hidden">
                <div className="max-w-[1280px] mx-auto">
                    <Reveal direction="up">
                        <div className="relative p-10 md:p-10 bg-linear-to-br from-bg-card to-black/40 backdrop-blur-2xl border border-white/10 rounded-[48px] overflow-hidden text-center group">
                            {/* Decorative orbs */}
                            <div className="absolute -top-[20%] -left-[10%] w-[400px] h-[400px] bg-primary/10 blur-[100px] rounded-full group-hover:bg-primary/20 transition-all duration-1000" />
                            <div className="absolute -bottom-[20%] -right-[10%] w-[400px] h-[400px] bg-secondary/10 blur-[100px] rounded-full group-hover:bg-secondary/20 transition-all duration-1000" />
                            
                            <div className="relative z-10 space-y-8">
                                <div className="w-20 h-20 bg-white/5 border border-white/10 rounded-3xl flex items-center justify-center mx-auto shadow-2xl">
                                    <Sparkles size={40} className="text-primary-light animate-pulse-soft" />
                                </div>
                                <h2 className="text-4xl md:text-6xl font-display font-black text-text-primary leading-tight max-w-3xl mx-auto">
                                    Ready to Supercharge<br />Your Career?
                                </h2>
                                <p className="text-text-secondary text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
                                    Join 50,000+ professionals already using CareerLens AI to land their dream roles.
                                </p>
                                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                                    <Link to={user ? "/dashboard" : "/signup"} className="w-full sm:w-auto px-10 py-5 rounded-2xl bg-linear-to-r from-primary to-secondary text-white font-black text-lg shadow-2xl shadow-primary/40 hover:shadow-primary/60 hover:-translate-y-1.5 transition-all duration-300 flex items-center justify-center gap-3">
                                        {user ? "Go to Dashboard" : "Get Started Free"} <ArrowRight size={22} />
                                    </Link>
                                    <Link to="/premium" className="w-full sm:w-auto px-10 py-5 rounded-2xl border border-white/10 bg-white/5 text-text-primary font-bold hover:bg-white/10 hover:border-white/20 transition-all duration-200">
                                        View Premium Plans
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </Reveal>
                </div>
            </section>

            {/* FOOTER REMOVED - NOW IN App.jsx */}
        </div>
    );
}
