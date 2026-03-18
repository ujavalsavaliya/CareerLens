import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Zap, Brain, Target, Users, TrendingUp, CheckCircle, ArrowRight, Briefcase, FileText, Award, Sparkles, ChevronDown, Bot, Cpu, Wifi } from 'lucide-react';
import './LandingPage.css';

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
        <div ref={ref} className="ai-demo-card glass-card">
            <div className="adc-header">
                <div className="adc-dot red" /><div className="adc-dot yellow" /><div className="adc-dot green" />
                <span className="adc-title">CareerLens AI Engine</span>
            </div>
            <div className="adc-body">
                {lines.filter(Boolean).map((l, i) => (
                    <div key={i} className={`adc-line adc-${l.type}`}>
                        {l.type === 'prompt' && <span className="adc-prompt">$ </span>}
                        {l.text}
                        {i === lines.length - 1 && <span className="adc-cursor">▌</span>}
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
                    width: `${2 + Math.random() * 3}px`,
                    height: `${2 + Math.random() * 3}px`,
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
        <section className="robot-section">
            <div className="robot-bg-grid" aria-hidden />
            <div className="page-container">
                <Reveal direction="up">
                    <div className="section-header-center">
                        <span className="section-badge"><Bot size={13} /> AI Engine at a Glance</span>
                        <h2 className="mt-4">Powered by a <span className="gradient-text">Thinking Machine</span></h2>
                        <p>Our AI engine never stops scanning, matching, and optimizing for you — 24/7, in real-time.</p>
                    </div>
                </Reveal>

                <div className="robot-layout" ref={ref}>
                    {/* Left: system stats */}
                    <Reveal direction="left" delay={0}>
                        <div className="robot-stats-panel glass-card">
                            <div className="rsp-title"><Cpu size={15} /> System Modules</div>
                            {SCAN_ITEMS.map(({ label, pct, color }) => (
                                <div key={label} className="rsp-row">
                                    <div className="rsp-label">{label}</div>
                                    <div className="rsp-bar-wrap">
                                        <div
                                            className="rsp-bar-fill"
                                            style={{
                                                width: visible ? `${pct}%` : '0%',
                                                background: `linear-gradient(90deg, ${color}88, ${color})`,
                                                transition: 'width 1.4s cubic-bezier(.4,0,.2,1)'
                                            }}
                                        />
                                    </div>
                                    <div className="rsp-pct" style={{ color }}>{pct}%</div>
                                </div>
                            ))}
                            <div className="rsp-live-row">
                                <span className="rsp-live-dot" />
                                <span>All systems operational</span>
                            </div>
                        </div>
                    </Reveal>

                    {/* Center: animated robot */}
                    <Reveal direction="up" delay={80}>
                        <div className="robot-center">
                            {/* Orbit rings */}
                            <div className="robot-ring r-ring-1" aria-hidden />
                            <div className="robot-ring r-ring-2" aria-hidden />
                            <div className="robot-ring r-ring-3" aria-hidden />

                            {/* Robot SVG */}
                            <div className="robot-svg-wrap">
                                <svg viewBox="0 0 160 200" className="robot-svg" xmlns="http://www.w3.org/2000/svg">
                                    <defs>
                                        <linearGradient id="rg1" x1="0%" y1="0%" x2="100%" y2="100%">
                                            <stop offset="0%" stopColor="#6366f1" />
                                            <stop offset="100%" stopColor="#06b6d4" />
                                        </linearGradient>
                                        <filter id="glow">
                                            <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
                                            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                                        </filter>
                                    </defs>
                                    {/* Antenna */}
                                    <line x1="80" y1="10" x2="80" y2="28" stroke="url(#rg1)" strokeWidth="3" strokeLinecap="round" />
                                    <circle cx="80" cy="8" r="5" fill="url(#rg1)" filter="url(#glow)" className="robot-antenna-pulse" />
                                    {/* Head */}
                                    <rect x="42" y="28" width="76" height="58" rx="16" fill="rgba(99,102,241,0.18)" stroke="url(#rg1)" strokeWidth="2" />
                                    {/* Eyes */}
                                    <rect x="54" y="44" width="20" height="14" rx="5" fill="url(#rg1)" filter="url(#glow)" className="robot-eye" />
                                    <rect x="86" y="44" width="20" height="14" rx="5" fill="url(#rg1)" filter="url(#glow)" className="robot-eye" />
                                    {/* Mouth / display */}
                                    <rect x="56" y="68" width="48" height="8" rx="4" fill="none" stroke="#06b6d4" strokeWidth="1.5" />
                                    <rect x="58" y="70" width={`${24 + (tick % 3) * 8}`} height="4" rx="2" fill="#06b6d4" opacity="0.8" className="robot-mouth-fill" />
                                    {/* Neck */}
                                    <rect x="72" y="86" width="16" height="10" rx="4" fill="rgba(99,102,241,0.3)" />
                                    {/* Body */}
                                    <rect x="30" y="96" width="100" height="72" rx="18" fill="rgba(99,102,241,0.12)" stroke="url(#rg1)" strokeWidth="2" />
                                    {/* Chest panel */}
                                    <rect x="48" y="112" width="64" height="38" rx="10" fill="rgba(6,182,212,0.12)" stroke="rgba(6,182,212,0.4)" strokeWidth="1" />
                                    {/* Circuit lines on chest */}
                                    <line x1="56" y1="122" x2="104" y2="122" stroke="rgba(6,182,212,0.5)" strokeWidth="1" />
                                    <line x1="56" y1="130" x2="90" y2="130" stroke="rgba(99,102,241,0.5)" strokeWidth="1" />
                                    <line x1="56" y1="138" x2="98" y2="138" stroke="rgba(6,182,212,0.4)" strokeWidth="1" />
                                    <circle cx="100" cy="122" r="3" fill="#6366f1" filter="url(#glow)" />
                                    <circle cx="94" cy="130" r="3" fill="#06b6d4" filter="url(#glow)" />
                                    {/* Arms */}
                                    <rect x="4" y="100" width="28" height="54" rx="12" fill="rgba(99,102,241,0.15)" stroke="url(#rg1)" strokeWidth="1.5" />
                                    <rect x="128" y="100" width="28" height="54" rx="12" fill="rgba(99,102,241,0.15)" stroke="url(#rg1)" strokeWidth="1.5" />
                                    {/* Legs */}
                                    <rect x="44" y="168" width="30" height="28" rx="10" fill="rgba(99,102,241,0.15)" stroke="url(#rg1)" strokeWidth="1.5" />
                                    <rect x="86" y="168" width="30" height="28" rx="10" fill="rgba(99,102,241,0.15)" stroke="url(#rg1)" strokeWidth="1.5" />
                                </svg>

                                {/* Floating data nodes */}
                                {[{ top: '8%', left: '-20%', c: '#6366f1', icon: 'AI' }, { top: '50%', left: '-28%', c: '#06b6d4', icon: 'ML' }, { top: '8%', right: '-20%', c: '#10b981', icon: 'NLP' }, { top: '50%', right: '-28%', c: '#f59e0b', icon: 'CV' }].map((o, i) => (
                                    <div key={i} className="robot-node" style={{ top: o.top, left: o.left, right: o.right, borderColor: o.c, animationDelay: `${i * 0.4}s` }}>
                                        <span style={{ color: o.c, fontSize: 11, fontWeight: 700 }}>{o.icon}</span>
                                    </div>
                                ))}

                                {/* Scan line */}
                                <div className="robot-scan-line" aria-hidden />
                            </div>

                            <div className="robot-caption"><Wifi size={12} />  Neural net active · 24/7</div>
                        </div>
                    </Reveal>

                    {/* Right: live feed */}
                    <Reveal direction="right" delay={160}>
                        <div className="robot-feed-panel glass-card">
                            <div className="rsp-title"><span className="rsp-live-dot" style={{ marginRight: 6 }} />Live Activity</div>
                            {[
                                { msg: 'Resume scored → 82/100', t: '0s ago', c: '#6366f1' },
                                { msg: 'Job match found → 94%', t: '2s ago', c: '#06b6d4' },
                                { msg: 'Skills extracted → 12', t: '5s ago', c: '#10b981' },
                                { msg: 'ATS keywords added', t: '9s ago', c: '#f59e0b' },
                                { msg: 'Profile score +7pts', t: '14s ago', c: '#8b5cf6' },
                            ].map(({ msg, t, c }, i) => (
                                <div key={i} className="rfp-row" style={{ animationDelay: `${i * 0.12}s` }}>
                                    <span className="rfp-dot" style={{ background: c }} />
                                    <div className="rfp-msg">{msg}<span className="rfp-time">{t}</span></div>
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
    const typing = useTypewriter(TYPEWRITER_WORDS);

    return (
        <div className="landing">

            {/* ═══════════ HERO ═══════════ */}
            <section className="hero-section">
                <Particles />
                <div className="hero-orb hero-orb-1" />
                <div className="hero-orb hero-orb-2" />
                <div className="hero-orb hero-orb-3" />
                {/* animated ring */}
                <div className="hero-ring hero-ring-1" />
                <div className="hero-ring hero-ring-2" />

                <div className="hero-inner">
                    <div className="hero-content">
                        <div className="hero-badge animate-fade-in stagger-1">
                            <Sparkles size={14} />
                            <span>AI-Powered Career Platform · GPT-4o</span>
                        </div>

                        <h1 className="hero-title animate-fade-in stagger-2">
                            Land Your<br />
                            <span className="typewriter-wrap">
                                <span className="gradient-text typewriter-text">{typing}</span>
                                <span className="typewriter-cursor">|</span>
                            </span>
                            <br />with AI Superpowers
                        </h1>

                        <p className="hero-subtitle animate-fade-in stagger-3">
                            CareerLens uses GPT-4o to analyze your resume, match you to the perfect roles,
                            and help HR teams discover their ideal candidates — all powered by real AI.
                        </p>

                        <div className="hero-cta animate-fade-in stagger-4">
                            <Link to="/signup" className="btn btn-primary btn-lg hero-btn-primary">
                                Get Started Free <ArrowRight size={18} />
                            </Link>
                            <Link to="/jobs" className="btn-outline-hero">
                                Browse Jobs
                            </Link>
                        </div>

                        <div className="hero-badges animate-fade-in stagger-5">
                            {['Free AI resume analysis', 'Instant job matching', 'No credit card required'].map(t => (
                                <span key={t}><CheckCircle size={13} /> {t}</span>
                            ))}
                        </div>
                    </div>

                    {/* Hero visual — AI score card */}
                    <div className="hero-visual animate-slide-right stagger-2">
                        <div className="hero-card-wrap">
                            {/* Main score card */}
                            <div className="hero-main-card glass-card">
                                <div className="hmc-header">
                                    <div className="hmc-icon"><Brain size={18} /></div>
                                    <div>
                                        <div className="hmc-title">AI Resume Analysis</div>
                                        <div className="hmc-sub">GPT-4o · Just now</div>
                                    </div>
                                    <span className="hmc-live">Live</span>
                                </div>

                                {/* Score ring */}
                                <div className="hmc-score-wrap">
                                    <svg viewBox="0 0 130 130" className="hmc-svg">
                                        <circle cx="65" cy="65" r="54" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="10" />
                                        <circle cx="65" cy="65" r="54" fill="none" stroke="url(#hg)" strokeWidth="10"
                                            strokeDasharray="339.3" strokeDashoffset="61" strokeLinecap="round" transform="rotate(-90 65 65)"
                                            style={{ transition: 'stroke-dashoffset 2s ease', animation: 'drawArc 2s ease forwards' }} />
                                        <defs>
                                            <linearGradient id="hg" x1="0%" y1="0%" x2="100%" y2="0%">
                                                <stop offset="0%" stopColor="#6366f1" />
                                                <stop offset="100%" stopColor="#06b6d4" />
                                            </linearGradient>
                                        </defs>
                                    </svg>
                                    <div className="hmc-score-center">
                                        <div className="hmc-score-val gradient-text">82</div>
                                        <div className="hmc-score-sub">/ 100</div>
                                    </div>
                                </div>

                                {/* Skills */}
                                <div className="hmc-skills">
                                    {['React', 'Python', 'AWS', 'Node.js', 'Docker'].map((s, i) => (
                                        <span key={s} className="skill-chip" style={{ animationDelay: `${i * 0.1}s` }}>{s}</span>
                                    ))}
                                </div>

                                {/* Matches */}
                                <div className="hmc-matches">
                                    {[['Senior Dev at Google', 94], ['Full Stack at Stripe', 88], ['Backend at Airbnb', 72]].map(([j, m]) => (
                                        <div key={j} className="hmc-match-row">
                                            <span>{j}</span>
                                            <span className={m >= 80 ? 'match-high' : 'match-mid'} style={{ fontWeight: 800 }}>{m}%</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Floating badge cards */}
                            <div className="hero-badge-card hbc-1 glass">
                                <CheckCircle size={16} style={{ color: '#34d399' }} />
                                <div><div className="hbc-title">Profile Complete</div><div className="hbc-sub">+12 this week</div></div>
                            </div>
                            <div className="hero-badge-card hbc-2 glass">
                                <Briefcase size={16} style={{ color: '#818cf8' }} />
                                <div><div className="hbc-title">3 New Matches</div><div className="hbc-sub">Best: 94% fit</div></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Scroll hint */}
                <div className="scroll-hint animate-fade-in stagger-5">
                    <ChevronDown size={20} />
                </div>
            </section>

            {/* ═══════════ STATS ═══════════ */}
            <section className="stats-section">
                <div className="stats-inner">
                    {STATS.map(({ val, suffix, label }) => (
                        <Reveal key={label} direction="up" delay={STATS.indexOf({ val, suffix, label }) * 80}>
                            <div className="stat-block">
                                <div className="stat-number gradient-text"><Counter to={val} suffix={suffix} /></div>
                                <div className="stat-label">{label}</div>
                            </div>
                        </Reveal>
                    ))}
                </div>
            </section>

            {/* ═══════════ AI DEMO ═══════════ */}
            <RobotSection />

            <section className="ai-demo-section">
                <div className="ai-demo-inner">
                    <div className="ai-demo-text">
                        <Reveal direction="left">
                            <span className="section-badge"><Brain size={13} /> How the AI works</span>
                            <h2 className="mt-4">Watch AI Analyze<br />a Resume in <span className="gradient-text">Real-time</span></h2>
                            <p>Upload your PDF and our GPT-4o engine scores every section, finds ATS keywords, extracts your skills, and matches you to open roles — all within seconds.</p>
                        </Reveal>
                        <Reveal direction="left" delay={150}>
                            <div className="ai-steps">
                                {[
                                    { n: '01', t: 'Upload Resume', d: 'PDF, DOC, or DOCX · up to 10MB' },
                                    { n: '02', t: 'AI Parses & Scores', d: 'GPT-4o extracts skills, scores sections, flags gaps' },
                                    { n: '03', t: 'Get Match-ranked Jobs', d: 'Jobs sorted by your actual fit percentage' },
                                ].map(({ n, t, d }) => (
                                    <div key={n} className="ai-step">
                                        <div className="ai-step-num gradient-text">{n}</div>
                                        <div>
                                            <div className="ai-step-title">{t}</div>
                                            <div className="ai-step-desc">{d}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Reveal>
                        <Reveal direction="left" delay={250}>
                            <Link to="/signup" className="btn btn-primary btn-lg" style={{ width: 'fit-content' }}>
                                Try AI Analysis Free <ArrowRight size={16} />
                            </Link>
                        </Reveal>
                    </div>

                    <Reveal direction="right" delay={100}>
                        <AIDemo />
                    </Reveal>
                </div>
            </section>

            {/* ═══════════ FEATURES ═══════════ */}
            <section className="features-section">
                <div className="page-container">
                    <Reveal direction="up">
                        <div className="section-header-center">
                            <span className="section-badge">Features</span>
                            <h2 className="mt-4">Everything to Land the Job <span className="gradient-text">Faster</span></h2>
                            <p>AI-powered tools that cover every step of your job search.</p>
                        </div>
                    </Reveal>

                    <div className="features-grid">
                        {FEATURES.map(({ icon: Icon, title, desc, color }, i) => (
                            <Reveal key={title} direction="up" delay={i * 80}>
                                <div className="feature-card glass-card">
                                    <div className="fc-icon" style={{ background: `${color}18`, color }}>
                                        <Icon size={22} />
                                    </div>
                                    <div className="fc-glow" style={{ background: `${color}08` }} />
                                    <h3>{title}</h3>
                                    <p>{desc}</p>
                                </div>
                            </Reveal>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══════════ HOW IT WORKS ═══════════ */}
            <section className="hiw-section">
                <div className="page-container">
                    <Reveal direction="up">
                        <div className="section-header-center">
                            <span className="section-badge"><Target size={13} /> Two types of users</span>
                            <h2 className="mt-4">Built for Both <span className="gradient-text">Seekers & Recruiters</span></h2>
                        </div>
                    </Reveal>

                    <div className="hiw-grid">
                        <Reveal direction="left" delay={0}>
                            <div className="hiw-panel glass-card">
                                <div className="hiw-badge seeker-badge">Job Seeker</div>
                                <h3>Get hired faster with AI</h3>
                                <div className="hiw-steps">
                                    {['Sign up & build your profile', 'Upload resume — AI scores it instantly', 'Browse AI-ranked job matches', 'Apply with your AI match score', 'Track application status'].map((s, i) => (
                                        <div key={i} className="hiw-step">
                                            <div className="hiw-step-dot" />
                                            <span>{s}</span>
                                        </div>
                                    ))}
                                </div>
                                <Link to="/signup" className="btn btn-primary w-full mt-4">Start Job Hunting</Link>
                            </div>
                        </Reveal>

                        <Reveal direction="right" delay={100}>
                            <div className="hiw-panel glass-card">
                                <div className="hiw-badge hr-badge">HR / Recruiter</div>
                                <h3>Find perfect candidates instantly</h3>
                                <div className="hiw-steps">
                                    {['Post a job — AI extracts keywords', 'AI ranks ALL job seekers by fit %', 'View detailed match explanations', 'Shortlist top candidates', 'Reach out directly'].map((s, i) => (
                                        <div key={i} className="hiw-step">
                                            <div className="hiw-step-dot hr-dot" />
                                            <span>{s}</span>
                                        </div>
                                    ))}
                                </div>
                                <Link to="/signup?role=hr" className="btn btn-secondary w-full mt-4">Start Hiring</Link>
                            </div>
                        </Reveal>
                    </div>
                </div>
            </section>

            {/* ═══════════ CTA ═══════════ */}
            <section className="cta-section">
                <div className="page-container">
                    <Reveal direction="up">
                        <div className="cta-card glass-card">
                            <div className="cta-orb cta-orb-1" />
                            <div className="cta-orb cta-orb-2" />
                            <Sparkles size={40} className="cta-icon-big gradient-text" />
                            <h2>Ready to Supercharge Your Career?</h2>
                            <p>Join 50,000+ professionals already using CareerLens AI.</p>
                            <div className="cta-actions">
                                <Link to="/signup" className="btn btn-primary btn-lg">
                                    Get Started Free <ArrowRight size={18} />
                                </Link>
                                <Link to="/premium" className="btn btn-ghost btn-lg">View Premium Plans</Link>
                            </div>
                        </div>
                    </Reveal>
                </div>
            </section>

            {/* FOOTER */}
            <footer className="landing-footer">
                <div className="lf-inner">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div className="logo-icon"><Zap size={16} /></div>
                        <span className="logo-text">Career<span className="gradient-text">Lens</span></span>
                    </div>
                    <p>© 2024 CareerLens · AI-Powered Career Platform</p>
                    <div style={{ display: 'flex', gap: 20 }}>
                        <Link to="/premium" style={{ color: 'var(--text-muted)', fontSize: 13 }}>Premium</Link>
                        <Link to="/jobs" style={{ color: 'var(--text-muted)', fontSize: 13 }}>Jobs</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}
