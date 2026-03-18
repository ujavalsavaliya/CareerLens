import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../app/slices/authSlice';
import { searchAll, clearSearch } from '../app/slices/searchSlice';
import { Home, Newspaper, BriefcaseBusiness, FileText, Sparkles, Users, Bell, ChevronDown, Zap, Search, User, LogOut, IdCard } from 'lucide-react';
import './Navbar.css';

export default function Navbar() {
    const { user } = useSelector(s => s.auth);
    const searchState = useSelector(s => s.search);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const [searchInput, setSearchInput] = useState('');
    const dropRef = useRef();
    const searchRef = useRef();
    const resultsRef = useRef();

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

    const isActive = (path) => location.pathname.startsWith(path);

    const seekerLinks = [
        { path: '/me', label: 'My Profile', icon: <IdCard size={18} /> },
        { path: '/dashboard', label: 'Dashboard', icon: <Home size={18} /> },
        { path: '/feed', label: 'Feed', icon: <Newspaper size={18} /> },
        { path: '/jobs', label: 'Jobs', icon: <BriefcaseBusiness size={18} /> },
        { path: '/applications', label: 'Applications', icon: <FileText size={18} /> },
        { path: '/ai-feedback', label: 'AI Feedback', icon: <Sparkles size={18} /> },
    ];

    const hrLinks = [
        { path: '/me', label: 'My Profile', icon: <IdCard size={18} /> },
        { path: '/hr/jobs', label: 'My Jobs', icon: <BriefcaseBusiness size={18} /> },
        { path: '/hr/post-job', label: 'Post Job', icon: <FileText size={18} /> },
        { path: '/hr/candidates', label: 'Talent', icon: <Users size={18} /> },
    ];

    const links = user ? (user.role === 'hr' ? hrLinks : seekerLinks) : [];

    return (
        <nav className="navbar">
            <div className="navbar-inner">
                {/* Logo */}
                <Link to="/" className="navbar-logo">
                    <div className="logo-icon"><Zap size={18} /></div>
                    <span className="logo-text">Career<span className="gradient-text">Lens</span></span>
                </Link>

                {/* Desktop Links */}
                {user && (
                    <div className="navbar-links">
                        {links.map(l => (
                            <Link key={l.path} to={l.path} className={`nav-link ${isActive(l.path) ? 'active' : ''}`}>
                                {l.icon}
                                <span>{l.label}</span>
                            </Link>
                        ))}
                    </div>
                )}

                {/* Right actions */}
                <div className="navbar-right">
                    {user ? (
                        <>
                            {user.role === 'jobseeker' && !user.premium && (
                                <Link to="/premium" className="btn btn-sm premium-btn">
                                    <Zap size={14} /> Upgrade
                                </Link>
                            )}
                            <div className="nav-search" ref={searchRef}>
                                <Search size={16} />
                                <input
                                    type="text"
                                    placeholder="Search people..."
                                    value={searchInput}
                                    onChange={e => setSearchInput(e.target.value)}
                                />
                            </div>

                            <button className="btn-icon btn-ghost nav-icon-btn"><Bell size={18} /></button>

                            {/* Avatar Dropdown */}
                            <div className="dropdown" ref={dropRef}>
                                <button className="avatar-btn" onClick={() => setDropdownOpen(!dropdownOpen)}>
                                    <div className="avatar-circle">
                                        {user.avatar?.url
                                            ? <img src={user.avatar.url} alt={user.name} />
                                            : <span>{user.name?.charAt(0).toUpperCase()}</span>}
                                    </div>
                                    <ChevronDown size={14} className={`avatar-chevron ${dropdownOpen ? 'rotated' : ''}`} />
                                </button>
                                {dropdownOpen && (
                                    <div className="dropdown-menu">
                                        <div className="dropdown-header">
                                            <div className="dh-name">{user.name}</div>
                                            <div className="dh-role">{user.role === 'hr' ? 'HR / Recruiter' : 'Job Seeker'}</div>
                                        </div>
                                        <div className="dropdown-divider" />
                                        <Link to="/profile" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                                            <User size={15} /> Profile
                                        </Link>
                                        {user.role === 'hr' && (
                                            <Link to="/hr/jobs" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                                                <BriefcaseBusiness size={15} /> My Jobs
                                            </Link>
                                        )}
                                        <button className="dropdown-item danger" onClick={handleLogout}>
                                            <LogOut size={15} /> Sign Out
                                        </button>
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="auth-links">
                            <Link to="/login" className="btn btn-ghost btn-sm">Sign In</Link>
                            <Link to="/signup" className="btn btn-primary btn-sm">Get Started</Link>
                        </div>
                    )}
                </div>
            </div>

            {/* Search dropdown */}
            {searchOpen && (
                <div className="nav-search-results" ref={resultsRef}>
                    {searchState.loading && (
                        <div className="nav-search-empty">Searching…</div>
                    )}
                    {!searchState.loading && (searchState.results || []).length === 0 && (
                        <div className="nav-search-empty">No users found</div>
                    )}
                    {(searchState.results || []).map(u => (
                        <Link
                            key={u._id}
                            to={`/profile/${u._id}`}
                            className="nav-search-item"
                            onClick={() => {
                                setSearchOpen(false);
                                setSearchInput('');
                                dispatch(clearSearch());
                            }}
                        >
                            <div className="nav-search-avatar">
                                {u.avatar?.url
                                    ? <img src={u.avatar.url} alt={u.name} />
                                    : <span>{u.name?.charAt(0).toUpperCase()}</span>}
                            </div>
                            <div className="nav-search-meta">
                                <div className="nav-search-name">{u.name}</div>
                                <div className="nav-search-sub">
                                    {u.headline || u.company || u.industry || ''}
                                </div>
                            </div>
                            <span className="nav-search-cta">View</span>
                        </Link>
                    ))}
                </div>
            )}

        </nav>
    );
}
