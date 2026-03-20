import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
    getProfileByUserIdAPI,
    getUserPostsAPI,
    getConnectionStatusAPI,
    sendConnectionRequestAPI,
    acceptConnectionRequestAPI,
    withdrawConnectionRequestAPI,
    removeConnectionAPI,
    followUserAPI,
    unfollowUserAPI,
    sendMessageAPI
} from '../../api/axiosClient';
import { 
    User, Briefcase, GraduationCap, MapPin, Link as LinkIcon, 
    MessageSquare, UserPlus, UserCheck, X, ArrowLeft, Edit,
    Github, Linkedin, ExternalLink, Mail, Globe, Award, Sparkles, Brain
} from 'lucide-react';
import PostCard from '../../components/PostCard';
import toast from 'react-hot-toast';

export default function UserProfileView() {
    const { userId } = useParams();
    const navigate = useNavigate();
    const { user: currentUser } = useSelector(s => s.auth);
    const targetId = userId || currentUser?._id;
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [posts, setPosts] = useState([]);
    const [status, setStatus] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        const load = async () => {
            if (!targetId) return;
            try {
                setLoading(true);
                const [profileRes, postsRes] = await Promise.all([
                    getProfileByUserIdAPI(targetId),
                    getUserPostsAPI(targetId, { page: 1, limit: 10 })
                ]);
                setProfile(profileRes.data);
                setPosts(postsRes.data.posts || []);

                if (targetId !== currentUser?._id) {
                    const st = await getConnectionStatusAPI(targetId);
                    setStatus(st.data);
                }
            } catch (err) {
                toast.error('Failed to load profile');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [targetId, currentUser?._id]);

    if (loading) {
        return (
            <div className="max-w-6xl mx-auto p-4 lg:p-6 space-y-6 animate-pulse">
                <div className="h-32 md:h-40 bg-white/5 border border-white/10 rounded-2xl" />
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="h-80 bg-white/5 border border-white/10 rounded-2xl" />
                    <div className="lg:col-span-2 space-y-4">
                        <div className="h-32 bg-white/5 border border-white/10 rounded-2xl" />
                        <div className="h-64 bg-white/5 border border-white/10 rounded-2xl" />
                    </div>
                </div>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center p-10 text-center">
                <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center text-text-muted mb-6">
                    <User size={40} />
                </div>
                <h2 className="text-2xl font-display font-black text-text-primary mb-4">Profile not found.</h2>
                <button 
                    className="px-6 py-2 bg-white/5 border border-white/10 text-text-primary rounded-xl font-bold hover:bg-white/10 transition-colors"
                    onClick={() => navigate(-1)}
                >
                    Go Back
                </button>
            </div>
        );
    }

    const { user: owner, experience = [], education = [], skills = [], aiAnalysis = {}, followersCount = 0, followingCount = 0 } = profile;
    const isMe = currentUser?._id === owner?._id;

    const refreshStatus = async () => {
        if (!targetId || targetId === currentUser?._id) return;
        const st = await getConnectionStatusAPI(targetId);
        setStatus(st.data);
    };

    const handleConnect = async () => {
        setActionLoading(true);
        try {
            await sendConnectionRequestAPI(targetId);
            toast.success('Connection request sent');
            await refreshStatus();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to send request');
        } finally {
            setActionLoading(false);
        }
    };

    const handleAccept = async () => {
        setActionLoading(true);
        try {
            await acceptConnectionRequestAPI(targetId);
            toast.success('Connection accepted');
            await refreshStatus();
            setProfile(p => ({ ...p, user: { ...p.user, connectionCount: (p.user.connectionCount || 0) + 1 } }));
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to accept request');
        } finally {
            setActionLoading(false);
        }
    };

    const handleWithdraw = async () => {
        setActionLoading(true);
        try {
            await withdrawConnectionRequestAPI(targetId);
            toast.success('Request withdrawn');
            await refreshStatus();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to withdraw request');
        } finally {
            setActionLoading(false);
        }
    };

    const handleRemoveConnection = async () => {
        setActionLoading(true);
        try {
            await removeConnectionAPI(targetId);
            toast.success('Connection removed');
            await refreshStatus();
            setProfile(p => ({ ...p, user: { ...p.user, connectionCount: Math.max(0, (p.user.connectionCount || 0) - 1) } }));
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to remove connection');
        } finally {
            setActionLoading(false);
        }
    };

    const handleMessage = async () => {
        if (targetId === currentUser?._id) return;
        const text = window.prompt(`Message to ${owner?.name}:`);
        if (!text) return;
        setActionLoading(true);
        try {
            await sendMessageAPI(targetId, text);
            toast.success('Message sent');
            window.dispatchEvent(new CustomEvent('toggle-chat', { 
                detail: { userId: owner._id, user: owner } 
            }));
        } catch (err) {
            toast.error('Failed to send message');
        } finally {
            setActionLoading(false);
        }
    };

    const handleFollow = async () => {
        setActionLoading(true);
        try {
            if (status?.isFollowing) {
                await unfollowUserAPI(targetId);
                setStatus(s => ({ ...s, isFollowing: false }));
                setProfile(p => ({ ...p, followersCount: Math.max(0, (p.followersCount || 0) - 1) }));
            } else {
                await followUserAPI(targetId);
                setStatus(s => ({ ...s, isFollowing: true }));
                setProfile(p => ({ ...p, followersCount: (p.followersCount || 0) + 1 }));
            }
        } catch (err) {
            toast.error('Action failed');
        } finally {
            setActionLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-bg-dark sm:p-4 lg:p-6 animate-fade-in relative overflow-hidden">
            {/* Background Accents */}
            <div className="absolute top-0 left-0 w-[400px] h-[400px] bg-primary/5 blur-[100px] rounded-full pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-secondary/5 blur-[100px] rounded-full pointer-events-none" />
            
            <div className="max-w-6xl mx-auto relative z-10">
                <button 
                    className="group flex items-center gap-2 text-text-muted hover:text-primary-light font-bold text-sm mb-4 transition-colors"
                    onClick={() => navigate(-1)}
                >
                    <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> 
                    Back
                </button>

                {/* Top Banner & Profile Header */}
                <div className="bg-bg-card/40 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden mb-6 relative shadow-xl">
                    <div className="h-32 md:h-40 w-full bg-linear-to-r from-primary/60 to-secondary/60 bg-cover bg-center" style={{ backgroundImage: owner?.banner?.url ? `url(${owner.banner.url})` : undefined }} />
                    
                    <div className="px-5 md:px-8 pb-6 flex flex-col md:flex-row gap-5 relative">
                        {/* Avatar */}
                        <div className="relative -mt-12 sm:-mt-16 w-24 h-24 sm:w-28 sm:h-28 rounded-2xl border-4 border-bg-dark bg-linear-to-br from-primary to-secondary flex items-center justify-center text-white font-black text-4xl sm:text-5xl shadow-lg shrink-0">
                            {owner?.avatar?.url ? (
                                <img src={owner.avatar.url} alt={owner.name} className="w-full h-full object-cover rounded-lg" />
                            ) : (
                                <span>{owner?.name?.charAt(0)}</span>
                            )}
                            {owner?.premium && (
                                <div className="absolute -bottom-2 -right-2 p-1.5 bg-linear-to-r from-amber-400 to-amber-600 rounded-lg border-2 border-bg-dark shadow-md" title="Premium User">
                                    <Award size={16} className="text-white" />
                                </div>
                            )}
                        </div>

                        {/* Info Header */}
                        <div className="flex-1 mt-2 sm:mt-3 flex flex-col sm:flex-row justify-between items-start gap-4">
                            <div className="w-full">
                                <div className="flex justify-between items-start w-full">
                                    <div>
                                        <h1 className="text-2xl sm:text-3xl font-display font-black text-text-primary leading-tight">{owner?.name}</h1>
                                        <p className="text-primary-light font-bold text-sm sm:text-sm tracking-wide mt-1">{profile.headline || 'Professional Profile'}</p>
                                    </div>
                                    <div className="hidden sm:flex px-3 py-1.5 bg-primary/10 text-primary border border-primary/20 rounded-lg text-xs font-bold items-center gap-1.5">
                                        <Award size={14} /> {owner?.role === 'hr' ? 'HR Specialist' : 'Seeker'}
                                    </div>
                                </div>
                                
                                <div className="flex flex-wrap items-center gap-3 mt-3 text-sm font-medium text-text-secondary">
                                    {profile.location && (
                                        <div className="flex items-center gap-1"><MapPin size={14} className="text-text-muted" /> {profile.location}</div>
                                    )}
                                    {owner?.company && (
                                        <div className="flex items-center gap-1"><Briefcase size={14} className="text-text-muted" /> {owner.company}</div>
                                    )}
                                </div>

                                {/* Actions Container */}
                                <div className="flex flex-wrap items-center gap-2 mt-4 sm:mt-5">
                                    {isMe ? (
                                        <button 
                                            onClick={() => navigate('/profile')} 
                                            className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-text-primary text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 hover:bg-white/10 shadow-lg hover:scale-105 active:scale-95"
                                        >
                                            <Edit size={14} /> Edit Profile
                                        </button>
                                    ) : (
                                        <>
                                            <button 
                                                disabled={actionLoading}
                                                onClick={handleFollow}
                                                className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 border shadow-lg ${
                                                    status?.isFollowing 
                                                    ? 'bg-white/5 border-white/10 text-text-primary hover:bg-red-500/10 hover:border-red-500/20 hover:text-red-500' 
                                                    : 'bg-primary border-primary/20 text-white hover:bg-primary-light hover:scale-[1.02] active:scale-95'
                                                }`}
                                            >
                                                <UserCheck size={14} />
                                                {status?.isFollowing ? 'Unfollow' : 'Follow'}
                                            </button>

                                            {status?.status === 'accepted' ? (
                                                <button 
                                                    disabled={actionLoading}
                                                    onClick={handleRemoveConnection}
                                                    className="px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 bg-white/5 border border-white/10 text-text-primary hover:bg-red-500/10 hover:border-red-500/20 hover:text-red-500 shadow-lg"
                                                >
                                                    <X size={14} /> Connected
                                                </button>
                                            ) : status?.status === 'received' ? (
                                                <button 
                                                    disabled={actionLoading}
                                                    onClick={handleAccept}
                                                    className="px-4 py-2 rounded-xl bg-success border border-success/20 text-white text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 hover:bg-success/80 shadow-lg hover:scale-[1.02] active:scale-95"
                                                >
                                                    <UserCheck size={14} /> Accept Request
                                                </button>
                                            ) : status?.status === 'sent' ? (
                                                <button 
                                                    disabled={actionLoading}
                                                    onClick={handleWithdraw}
                                                    className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-text-muted text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 hover:text-red-500 hover:border-red-500/20 shadow-lg"
                                                >
                                                    <ArrowLeft size={14} /> Request Sent
                                                </button>
                                            ) : (
                                                <button 
                                                    disabled={actionLoading}
                                                    onClick={handleConnect}
                                                    className="px-4 py-2 rounded-xl bg-secondary border border-secondary/20 text-white text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 hover:bg-secondary-light shadow-lg hover:scale-[1.02] active:scale-95"
                                                >
                                                    <UserPlus size={14} /> Connect
                                                </button>
                                            )}

                                            <button 
                                                disabled={actionLoading}
                                                onClick={handleMessage}
                                                className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-text-primary text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 hover:bg-white/10 shadow-lg hover:scale-[1.02] active:scale-95"
                                            >
                                                <MessageSquare size={14} /> Message
                                            </button>
                                        </>
                                    )}
                                </div>

                                {/* Social Stats */}
                                <div className="flex justify-start items-center gap-5 mt-4 pt-4 border-t border-white/5">
                                    <div className="flex flex-col items-center">
                                        <span className="text-lg font-black text-text-primary">{owner?.connectionCount || 0}</span>
                                        <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider mt-0.5">Connections</span>
                                    </div>
                                    <div className="w-px h-6 bg-white/10" />
                                    <div className="flex flex-col items-center">
                                        <span className="text-lg font-black text-text-primary">{followersCount}</span>
                                        <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider mt-0.5">Followers</span>
                                    </div>
                                    <div className="w-px h-6 bg-white/10" />
                                    <div className="flex flex-col items-center">
                                        <span className="text-lg font-black text-text-primary">{followingCount}</span>
                                        <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider mt-0.5">Following</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    
                    {/* Left Column (Links & Skills) */}
                    <div className="lg:col-span-4 space-y-6">
                        {/* Links */}
                        <div className="bg-bg-card/40 backdrop-blur-xl border border-white/10 rounded-2xl p-5 hover:border-white/20 transition-colors">
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-4 flex items-center gap-1.5"><LinkIcon size={12} /> Connect & Links</h4>
                            <div className="grid grid-cols-1 gap-2">
                                {[
                                    { label: 'LinkedIn', url: profile.linkedIn, icon: Linkedin, color: 'hover:text-[#0077b5]' },
                                    { label: 'GitHub', url: profile.github, icon: Github, color: 'hover:text-white' },
                                    { label: 'Portfolio', url: profile.portfolio, icon: ExternalLink, color: 'hover:text-primary' },
                                    { label: 'Website', url: profile.website, icon: Globe, color: 'hover:text-amber-400' }
                                ].filter(l => l.url).map((link, i) => (
                                    <a 
                                        key={i} 
                                        href={link.url} 
                                        target="_blank" 
                                        rel="noreferrer" 
                                        className={`flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10 text-xs font-bold text-text-secondary transition-all ${link.color} hover:bg-white/10 hover:border-white/20`}
                                    >
                                        <div className="flex items-center gap-2.5">
                                            <link.icon size={16} />
                                            {link.label}
                                        </div>
                                        <ArrowLeft size={12} className="rotate-135" />
                                    </a>
                                ))}
                                {(!profile.linkedIn && !profile.github && !profile.portfolio && !profile.website) && (
                                    <div className="text-center py-4 text-text-muted text-xs italic font-medium">No public links added yet.</div>
                                )}
                            </div>
                        </div>

                        {/* Skills */}
                        <div className="bg-bg-card/40 backdrop-blur-xl border border-white/10 rounded-2xl p-5 hover:border-white/20 transition-colors">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 rounded-xl bg-secondary/10 text-secondary border border-secondary/20 shadow-sm shadow-secondary/5">
                                    <Award size={16} />
                                </div>
                                <h3 className="text-lg font-display font-black text-text-primary uppercase tracking-tight">Skills</h3>
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                                {skills.map(s => (
                                    <span key={s} className="px-3 py-1.5 bg-white/5 border border-white/10 text-text-primary rounded-lg text-xs font-bold hover:bg-secondary hover:text-white hover:border-secondary transition-all cursor-default">
                                        {s}
                                    </span>
                                ))}
                                {skills.length === 0 && <p className="text-text-muted italic text-xs">No skills added yet.</p>}
                            </div>
                        </div>
                    </div>

                    {/* Right Column (About, Experience, Education, Posts) */}
                    <div className="lg:col-span-8 space-y-6">
                        
                        {/* About */}
                        <div className="bg-bg-card/40 backdrop-blur-xl border border-white/10 rounded-2xl p-5 xl:p-6 hover:border-white/20 transition-colors">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 rounded-xl bg-primary/10 text-primary border border-primary/20 shadow-sm shadow-primary/5">
                                    <User size={16} />
                                </div>
                                <h3 className="text-lg font-display font-black text-text-primary uppercase tracking-tight">About</h3>
                            </div>
                            <p className="text-text-secondary leading-relaxed text-sm font-medium whitespace-pre-wrap">
                                {profile.summary || 'This user has not added a summary yet.'}
                            </p>
                        </div>

                        {/* AI-Generated Insight */}
                        {aiAnalysis?.profileSummary && (
                            <div className="bg-linear-to-br from-success/10 to-transparent backdrop-blur-xl border border-success/20 rounded-2xl p-5 xl:p-6 relative group hover:border-success/30 transition-colors shadow-lg">
                                <div className="absolute top-5 right-6 text-success/20 group-hover:text-success/40 transition-colors">
                                    <Sparkles size={32} />
                                </div>
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-2 rounded-xl bg-success/20 text-success border border-success/30 shadow-sm shadow-success/10 animate-pulse-soft">
                                        <Brain size={16} />
                                    </div>
                                    <h3 className="text-lg font-display font-black text-success uppercase tracking-tight">AI Intelligence Insight</h3>
                                </div>
                                <p className="text-text-primary leading-relaxed text-sm font-bold italic opacity-90 relative z-10 before:content-['“'] after:content-['”'] before:text-2xl after:text-2xl before:text-success/30 after:text-success/30 before:mr-1 after:ml-1">
                                    {aiAnalysis.profileSummary}
                                </p>
                            </div>
                        )}

                        {/* Experience */}
                        <div className="bg-bg-card/40 backdrop-blur-xl border border-white/10 rounded-2xl p-5 xl:p-6 hover:border-white/20 transition-colors">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 rounded-xl bg-amber-400/10 text-amber-400 border border-amber-400/20 shadow-sm shadow-amber-400/5">
                                    <Briefcase size={16} />
                                </div>
                                <h3 className="text-lg font-display font-black text-text-primary uppercase tracking-tight">Experience</h3>
                            </div>
                            
                            <div className="space-y-6 relative before:absolute before:left-[9px] before:top-2 before:bottom-2 before:w-px before:bg-linear-to-b before:from-amber-400 before:to-transparent before:opacity-20">
                                {experience.length > 0 ? experience.map((exp, i) => (
                                    <div key={i} className="relative pl-8 group/exp">
                                        <div className="absolute left-[5.5px] top-1.5 w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)] group-hover/exp:scale-125 transition-transform" />
                                        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 mb-1.5">
                                            <h4 className="text-base font-display font-black text-text-primary group-hover/exp:text-amber-400 transition-colors">{exp.title}</h4>
                                            <span className="px-2 py-0.5 rounded border border-white/10 text-[9px] font-black uppercase tracking-widest text-text-muted shrink-0">
                                                {exp.startDate ? new Date(exp.startDate).getFullYear() : ''} — {exp.current ? 'Present' : exp.endDate ? new Date(exp.endDate).getFullYear() : ''}
                                            </span>
                                        </div>
                                        <div className="text-amber-400/80 font-black text-xs uppercase tracking-wider mb-2">{exp.company}</div>
                                        {exp.description && (
                                            <p className="text-text-secondary text-[13px] font-medium leading-relaxed bg-white/5 p-3 rounded-lg border border-white/5">
                                                {exp.description}
                                            </p>
                                        )}
                                    </div>
                                )) : (
                                    <p className="text-text-muted italic text-sm">No experience added yet.</p>
                                )}
                            </div>
                        </div>

                        {/* Education */}
                        <div className="bg-bg-card/40 backdrop-blur-xl border border-white/10 rounded-2xl p-5 xl:p-6 hover:border-white/20 transition-colors">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 rounded-xl bg-secondary/10 text-secondary border border-secondary/20 shadow-sm shadow-secondary/5">
                                    <GraduationCap size={16} />
                                </div>
                                <h3 className="text-lg font-display font-black text-text-primary uppercase tracking-tight">Education</h3>
                            </div>
                            
                            <div className="space-y-5 relative before:absolute before:left-[9px] before:top-2 before:bottom-2 before:w-px before:bg-linear-to-b before:from-secondary before:to-transparent before:opacity-20">
                                {education.length > 0 ? education.map((edu, i) => (
                                    <div key={i} className="relative pl-8 group/edu">
                                        <div className="absolute left-[5.5px] top-1.5 w-2 h-2 rounded-full bg-secondary shadow-[0_0_8px_rgba(56,189,248,0.6)] group-hover/edu:scale-125 transition-transform" />
                                        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 mb-1">
                                            <h4 className="text-base font-display font-black text-text-primary group-hover/edu:text-secondary transition-colors">{edu.degree}</h4>
                                            {edu.endYear && (
                                                <span className="px-2 py-0.5 rounded border border-white/10 text-[9px] font-black uppercase tracking-widest text-text-muted shrink-0">
                                                    Class of {edu.endYear}
                                                </span>
                                            )}
                                        </div>
                                        <div className="text-secondary/80 font-black text-xs uppercase tracking-wider mb-1">{edu.institution}</div>
                                    </div>
                                )) : (
                                    <p className="text-text-muted italic text-sm">No education added yet.</p>
                                )}
                            </div>
                        </div>

                        {/* Recent Post Activity */}
                        <div className="bg-bg-card/40 backdrop-blur-xl border border-white/10 rounded-2xl p-5 xl:p-6 hover:border-white/20 transition-colors">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 rounded-xl bg-primary/10 text-primary border border-primary/20 shadow-sm shadow-primary/5">
                                    <MessageSquare size={16} />
                                </div>
                                <h3 className="text-lg font-display font-black text-text-primary uppercase tracking-tight">Recent Activity</h3>
                            </div>

                            {posts.length === 0 ? (
                                <div className="text-center py-6">
                                    <div className="text-text-muted italic text-sm mb-2">No public posts from this user yet.</div>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {posts.map(p => (
                                        <PostCard key={p._id} post={p} />
                                    ))}
                                </div>
                            )}
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}
