import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../app/slices/authSlice';
import { searchAll, clearSearch } from '../app/slices/searchSlice';
import { Home, Newspaper, BriefcaseBusiness, FileText, Sparkles, Users, Bell, ChevronDown, Zap, Search, User, LogOut, IdCard, X, MessageSquare } from 'lucide-react';

export default function Navbar() {
    const { user } = useSelector(s => s.auth);
    const searchState = useSelector(s => s.search);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const [searchInput, setSearchInput] = useState('');
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [unreadNotifications, setUnreadNotifications] = useState(0);
    const dropRef = useRef();
    const searchRef = useRef();
    const resultsRef = useRef();

    useEffect(() => {
        const handleUnreadUpdate = (e) => {
            if (e.detail && typeof e.detail.count === 'number') {
                setUnreadNotifications(e.detail.count);
            }
        };
        window.addEventListener('update-unread-notifications', handleUnreadUpdate);
        return () => window.removeEventListener('update-unread-notifications', handleUnreadUpdate);
    }, []);

    useEffect(() => {
        const handler = (e) => {
            if (dropRef.current && !dropRef.current.contains(e.target)) setDropdownOpen(false);
            const inSearch = searchRef.current?.contains(e.target);
            const inResults = resultsRef.current?.contains(e.target);
            if (!inSearch && !inResults) {
                setSearchOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const handleLogout = () => {
        dispatch(logout());
        navigate('/');
        setDropdownOpen(false);
        setMobileMenuOpen(false);
    };

    useEffect(() => {
        const q = searchInput.trim();
        if (!q || q.length < 2) {
            dispatch(clearSearch());
            setSearchOpen(false);
            return;
        }
        setSearchOpen(true);
        const t = setTimeout(() => dispatch(searchAll(q)), 250);
        return () => clearTimeout(t);
    }, [dispatch, searchInput]);

    const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

    const seekerLinks = [
        { path: '/dashboard', label: 'Dashboard', icon: <Home size={18} /> },
        { path: '/feed', label: 'Feed', icon: <Newspaper size={18} /> },
        { path: '/jobs', label: 'Jobs', icon: <BriefcaseBusiness size={18} /> },
        { path: '/applications', label: 'Applications', icon: <FileText size={18} /> },
        { path: '/ai-feedback', label: 'AI Feedback', icon: <Sparkles size={18} /> },
    ];

    const hrLinks = [
        { path: '/hr/jobs', label: 'My Jobs', icon: <BriefcaseBusiness size={18} /> },
        { path: '/feed', label: 'Feed', icon: <Newspaper size={18} /> },
        { path: '/hr/post-job', label: 'Post Job', icon: <FileText size={18} /> },
        { path: '/hr/candidates', label: 'Talent', icon: <Users size={18} /> },
    ];

    const guestLinks = [
        { path: '/', label: 'Home', icon: <Home size={18} /> },
        { path: '/jobs', label: 'Browse Jobs', icon: <BriefcaseBusiness size={18} /> },
    ];

    const links = user ? (user.role === 'hr' ? hrLinks : seekerLinks) : guestLinks;

    return (
        <nav className="sticky top-0 left-0 right-0 h-[72px] z-1100 bg-bg-dark/85 backdrop-blur-xl border-b border-white/10 px-6 flex items-center">
            <div className="flex items-center justify-between w-full max-w-[1440px] mx-auto">
                <div className="flex items-center gap-6">
                    {/* Hamburger for mobile */}
                    <button className="hidden max-[1024px]:block bg-transparent border-none p-2 cursor-pointer z-1100" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                        <div className={`relative w-5 h-3.5 flex flex-col justify-between ${mobileMenuOpen ? 'open' : ''}`}>
                            <span className={`block w-full h-0.5 bg-text-primary rounded-full transition-all duration-300 ${mobileMenuOpen ? 'translate-y-[6px] rotate-45' : ''}`}></span>
                            <span className={`block w-full h-0.5 bg-text-primary rounded-full transition-all duration-300 ${mobileMenuOpen ? 'opacity-0' : ''}`}></span>
                            <span className={`block w-full h-0.5 bg-text-primary rounded-full transition-all duration-300 ${mobileMenuOpen ? '-translate-y-[6px] -rotate-45' : ''}`}></span>
                        </div>
                    </button>

                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2.5 shrink-0" onClick={() => setMobileMenuOpen(false)}>
                        <div className="flex items-center justify-center w-[34px] h-[34px] bg-linear-to-br from-primary to-secondary rounded-lg text-white shadow-[0_0_20px_rgba(99,102,241,0.4)]">
                            <Zap size={18} fill="currentColor" />
                        </div>
                        <span className="font-display text-xl font-extrabold text-text-primary text-white">
                            Career<span className="bg-linear-to-r from-primary to-secondary bg-clip-text text-transparent">Lens</span>
                        </span>
                    </Link>

                    {/* Desktop Links */}
                    {user && (
                        <div className="hidden lg:flex items-center gap-5 ml-10">
                            {links.map(l => (
                                <Link 
                                    key={l.path} 
                                    to={l.path} 
                                    className={`flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                                        isActive(l.path) 
                                        ? 'text-primary-light bg-linear-to-br from-primary/15 to-secondary/15 ring-1 ring-primary/20' 
                                        : 'text-text-secondary hover:text-text-primary hover:bg-white/5'
                                    }`}
                                >
                                    {l.icon}
                                    <span>{l.label}</span>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>

                {/* Right actions */}
                <div className="flex items-center gap-4 ml-auto">
                    {user ? (
                        <>
                            <div className="flex-1 max-w-[320px] hidden md:flex" ref={searchRef}>
                                <div className="w-full flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 focus-within:bg-white/10 focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/10 transition-all duration-200">
                                    <Search size={16} className="text-text-muted" />
                                    <input
                                        type="text"
                                        placeholder="Search..."
                                        className="w-full border-none outline-none bg-transparent text-text-primary text-sm placeholder:text-text-muted"
                                        value={searchInput}
                                        onChange={e => setSearchInput(e.target.value)}
                                        onFocus={() => searchInput.length >= 2 && setSearchOpen(true)}
                                    />
                                </div>
                            </div>

                            <button onClick={() => window.dispatchEvent(new CustomEvent('toggle-chat'))} className="relative p-2.5 rounded-xl text-text-secondary hover:text-text-primary border border-white/10 transition-all duration-200 hidden sm:flex cursor-pointer">
                                <MessageSquare size={18} />
                            </button>

                            <button onClick={() => window.dispatchEvent(new CustomEvent('toggle-notifications'))} className="relative p-2.5 rounded-xl text-text-secondary hover:text-text-primary border border-white/10 transition-all duration-200 hidden sm:flex cursor-pointer">
                                <Bell size={18} />
                                {unreadNotifications > 0 && (
                                    <span className="absolute top-2 right-2 flex items-center justify-center w-[14px] h-[14px] bg-red-500 rounded-full ring-2 ring-bg-dark text-[9px] font-bold text-white shadow-sm shadow-red-500/50">
                                        {unreadNotifications > 9 ? '9+' : unreadNotifications}
                                    </span>
                                )}
                            </button>

                            {/* Avatar Dropdown */}
                            <div className="relative" ref={dropRef}>
                                <button 
                                    className="flex items-center gap-2 bg-transparent border border-white/10 rounded-full p-1 pr-3.5 hover:border-primary hover:bg-primary/10 transition-all duration-200 cursor-pointer" 
                                    onClick={() => setDropdownOpen(!dropdownOpen)}
                                >
                                    <div className="w-[30px] h-[30px] rounded-full bg-linear-to-br from-primary to-secondary flex items-center justify-center text-[13px] font-bold text-white overflow-hidden shadow-sm">
                                        {user.avatar?.url
                                            ? <img src={user.avatar.url} alt={user.name} className="w-full h-full object-cover" />
                                            : <span>{user.name?.charAt(0).toUpperCase()}</span>}
                                    </div>
                                    <ChevronDown size={14} className={`text-text-muted transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''} hidden sm:block`} />
                                </button>
                                {dropdownOpen && (
                                    <div className="absolute top-[calc(100%+10px)] right-0 w-[220px] bg-bg-dark/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-scale origin-top-right z-1200">
                                        <div className="p-4 border-b border-white/10 bg-white/5">
                                            <div className="font-semibold text-sm text-text-primary truncate">{user.name}</div>
                                            <div className="text-[11px] text-text-muted mt-0.5 uppercase tracking-wider font-bold">{user.role === 'hr' ? 'HR / Recruiter' : 'Job Seeker'}</div>
                                        </div>
                                        <div className="p-2 space-y-1">
                                            <Link to="/me" className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-text-secondary hover:text-text-primary hover:bg-white/5 transition-all duration-150" onClick={() => setDropdownOpen(false)}>
                                                <User size={15} /> My Profile
                                            </Link>
                                            <Link to="/profile" className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-text-secondary hover:text-text-primary hover:bg-white/5 transition-all duration-150" onClick={() => setDropdownOpen(false)}>
                                                <IdCard size={15} /> Edit Resume
                                            </Link>
                                        </div>
                                        <div className="p-2 border-t border-white/10">
                                            <button className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-red-400 hover:text-red-300 hover:bg-red-400/10 transition-all duration-150 text-left font-medium" onClick={handleLogout}>
                                                <LogOut size={15} /> Sign Out
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="flex items-center gap-3">
                            <Link to="/login" className="px-5 py-2 rounded-xl text-sm font-semibold text-text-secondary hover:text-text-primary transition-all duration-200">Sign In</Link>
                            <Link to="/signup" className="px-5 py-2 rounded-xl text-sm font-semibold bg-linear-to-r from-primary to-secondary text-white shadow-lg shadow-primary/20 transform hover:-translate-y-0.5 transition-all duration-200">Get Started</Link>
                        </div>
                    )}
                </div>
            </div>

            {/* Mobile Sidebar Menu */}
            <div className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-9998 transition-all duration-300 ${mobileMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`} onClick={() => setMobileMenuOpen(false)}>
                <div className={`fixed top-0 left-0 w-[300px] h-full bg-bg-dark border-r border-white/10 flex flex-col z-9999 transition-transform duration-300 ease-out ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`} onClick={e => e.stopPropagation()}>
                    <div className="p-5 flex items-center justify-between border-b border-white/10">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-linear-to-br from-primary to-secondary rounded-lg flex items-center justify-center text-white shadow-lg shadow-primary/20"><Zap size={18} /></div>
                            <span className="font-display font-bold text-lg text-text-primary">CareerLens</span>
                        </div>
                        <button className="p-2 text-text-secondary hover:text-text-primary hover:bg-white/5 rounded-lg transition-all duration-200" onClick={() => setMobileMenuOpen(false)}>
                            <X size={20} />
                        </button>
                    </div>

                    <div className="p-4 border-b border-white/5">
                        <div className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus-within:bg-white/10 focus-within:border-primary transition-all duration-200">
                            <Search size={16} className="text-text-muted" />
                            <input
                                type="text"
                                placeholder="Search talent..."
                                className="w-full bg-transparent border-none outline-none text-sm text-text-primary placeholder:text-text-muted"
                                value={searchInput}
                                onChange={e => {
                                    setSearchInput(e.target.value);
                                    if (e.target.value.length >= 2) setSearchOpen(true);
                                }}
                            />
                        </div>
                    </div>

                    <div className="flex-1 p-4 flex flex-col gap-2 overflow-y-auto custom-scrollbar">
                        {links.map(l => (
                            <Link 
                                key={l.path} 
                                to={l.path} 
                                className={`flex items-center gap-3.5 px-4 py-3 rounded-xl text-[15px] font-medium transition-all duration-200 ${
                                    isActive(l.path) 
                                    ? 'bg-primary/10 text-primary-light ring-1 ring-primary/20' 
                                    : 'text-text-secondary hover:bg-white/5 hover:text-text-primary'
                                }`}
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                {l.icon}
                                <span>{l.label}</span>
                            </Link>
                        ))}
                    </div>
                    <div className="p-6 border-t border-white/10">
                        {user ? (
                            <button className="w-full flex items-center justify-center gap-3 px-4 py-3.5 rounded-xl bg-red-400/10 text-red-400 font-semibold transition-all duration-200" onClick={handleLogout}>
                                <LogOut size={16} /> Sign Out
                            </button>
                        ) : (
                            <div className="grid grid-cols-2 gap-3">
                                <Link to="/login" className="flex items-center justify-center py-2.5 rounded-xl border border-white/10 text-sm font-semibold text-text-secondary hover:text-white transition-all duration-200" onClick={() => setMobileMenuOpen(false)}>Sign In</Link>
                                <Link to="/signup" className="flex items-center justify-center py-2.5 rounded-xl bg-primary text-white text-sm font-semibold shadow-md shadow-primary/20 hover:brightness-110 transition-all duration-200" onClick={() => setMobileMenuOpen(false)}>Join Now</Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Search dropdown */}
            {searchOpen && (
                <div className="fixed top-[72px] left-1/2 -translate-x-1/2 w-[95%] max-w-[600px] max-h-[70vh] overflow-y-auto bg-bg-dark/98 backdrop-blur-2xl rounded-2xl border border-white/15 shadow-[0_30px_100px_rgba(0,0,0,0.8)] p-2 z-99999 animate-scale" ref={resultsRef}>
                    {searchState.loading && (
                        <div className="p-8 flex flex-col items-center justify-center gap-3 text-text-muted">
                            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                            <span className="text-sm font-medium">Searching talent...</span>
                        </div>
                    )}
                    {!searchState.loading && (searchState.results || []).length === 0 && (
                        <div className="p-10 text-center text-text-muted font-medium italic">No matches found for "{searchInput}"</div>
                    )}
                    {(searchState.results || []).map(u => (
                        <Link
                            key={u._id}
                            to={`/profile/${u._id}`}
                            className="flex items-center gap-4 p-3.5 rounded-xl hover:bg-primary/20 transition-all duration-150 group"
                            onClick={() => {
                                setSearchOpen(false);
                                setSearchInput('');
                                dispatch(clearSearch());
                            }}
                        >
                            <div className="w-11 h-11 rounded-full bg-linear-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-lg overflow-hidden group-hover:scale-105 transition-transform duration-200 border-2 border-transparent group-hover:border-primary/50">
                                {u.avatar?.url
                                    ? <img src={u.avatar.url} alt={u.name} className="w-full h-full object-cover" />
                                    : <span>{u.name?.charAt(0).toUpperCase()}</span>}
                            </div>
                            <div className="flex-1">
                                <div className="text-[15px] font-bold text-text-primary group-hover:text-primary-light transition-colors">{u.name}</div>
                                <div className="text-[12px] text-text-muted mt-0.5 line-clamp-1">
                                    {u.headline || u.company || u.industry || 'No headline set'}
                                </div>
                            </div>
                            <div className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-primary/10 text-primary-light text-xs font-bold opacity-0 group-hover:opacity-100 transition-all duration-200 transform translate-x-2 group-hover:translate-x-0">
                                View Profile
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </nav>
    );
}
