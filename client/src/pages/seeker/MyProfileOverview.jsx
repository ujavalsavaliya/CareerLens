import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { getMyProfileAPI, getUserPostsAPI } from '../../api/axiosClient';
import API from '../../api/axiosClient';
import PostCard from '../../components/PostCard';
import { Users, Eye, FileText, ArrowRight, Camera, MapPin, Sparkles, Activity, Target } from 'lucide-react';

export default function MyProfileOverview() {
    const { user } = useSelector(s => s.auth);
    const [profile, setProfile] = useState(null);
    const [connections, setConnections] = useState([]);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                setLoading(true);
                const [profileRes, connsRes, postsRes] = await Promise.all([
                    getMyProfileAPI(),
                    API.get('/connections'),
                    getUserPostsAPI(user?._id, { page: 1, limit: 10 })
                ]);
                setProfile(profileRes.data);
                setConnections(connsRes.data || []);
                setPosts(postsRes.data.posts || []);
            } catch (err) {
                toast.error('Failed to synchronize profile telemetry');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [user?._id]);

    if (loading) {
        return (
            <div className="min-h-screen bg-bg-dark p-6 lg:p-10 flex items-center justify-center">
                 <div className="relative w-20 h-20">
                    <div className="absolute inset-0 border-4 border-primary/20 rounded-full" />
                    <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                    <Activity size={32} className="absolute inset-0 m-auto text-primary animate-pulse" />
                </div>
            </div>
        );
    }

    const avatarUrl = user?.avatar?.url;

    return (
        <div className="min-h-screen bg-bg-dark p-6 lg:p-10 animate-fade-in relative overflow-hidden">
             {/* Background Orbs */}
             <div className="absolute top-[-10%] left-[-5%] w-[600px] h-[600px] bg-primary/5 blur-[150px] rounded-full pointer-events-none" />

            <div className="max-w-7xl mx-auto relative z-10">
                {/* Header Profile Card */}
                <div className="bg-bg-card/40 backdrop-blur-xl border border-white/5 rounded-[48px] p-8 lg:p-10 shadow-2xl mb-8 group relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:opacity-10 transition-opacity">
                         <Target size={120} className="text-primary rotate-12" />
                    </div>
                    
                    <div className="flex flex-col md:flex-row gap-10 items-center relative z-10 text-center md:text-left">
                        <div className="relative shrink-0">
                            <div className="w-32 h-32 rounded-[40px] bg-linear-to-br from-primary to-secondary p-1 shadow-2xl transform group-hover:rotate-3 transition-transform">
                                <div className="w-full h-full rounded-[38px] bg-bg-dark flex items-center justify-center overflow-hidden border border-white/10">
                                    {avatarUrl ? (
                                        <img src={avatarUrl} alt={user?.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-4xl font-black text-white">{user?.name?.charAt(0)}</span>
                                    )}
                                </div>
                            </div>
                            <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-primary rounded-2xl flex items-center justify-center text-white shadow-lg border-2 border-bg-dark transform hover:scale-110 transition-transform cursor-pointer">
                                <Camera size={16} />
                            </div>
                        </div>

                        <div className="flex-1">
                            <h1 className="text-3xl lg:text-4xl font-display font-black text-text-primary uppercase tracking-tighter mb-2">{user?.name}</h1>
                            <p className="text-text-muted text-lg font-medium opacity-80 italic mb-6">
                                {profile?.headline || 'Mission-ready professional seeking synchronization.'}
                            </p>
                            
                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                                <div className="px-5 py-2.5 bg-white/5 border border-white/5 rounded-2xl flex items-center gap-3 text-[10px] font-black text-text-muted uppercase tracking-[0.2em] group-hover:text-text-primary transition-colors">
                                    <Users size={14} className="text-primary" /> {user?.connectionCount || connections.length} Neural Nodes
                                </div>
                                <div className="px-5 py-2.5 bg-white/5 border border-white/5 rounded-2xl flex items-center gap-3 text-[10px] font-black text-text-muted uppercase tracking-[0.2em] group-hover:text-text-primary transition-colors">
                                    <FileText size={14} className="text-secondary" /> {posts.length} Transmissions
                                </div>
                                <div className="px-5 py-2.5 bg-white/5 border border-white/5 rounded-2xl flex items-center gap-3 text-[10px] font-black text-text-muted uppercase tracking-[0.2em] group-hover:text-text-primary transition-colors">
                                    <Eye size={14} className="text-primary-light" /> 342 Visualizations
                                </div>
                            </div>
                        </div>

                        <div className="shrink-0 flex gap-4">
                            <Link to="/profile" className="px-8 py-4 bg-linear-to-r from-primary to-primary-dark text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-primary/30 hover:scale-105 active:scale-95 transition-all flex items-center gap-3">
                                Reconfigure Matrix <ArrowRight size={16} />
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* Connections Sidebar */}
                    <div className="lg:col-span-4 bg-bg-card/40 backdrop-blur-xl border border-white/5 rounded-[48px] p-8 lg:p-10 shadow-2xl">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-lg font-display font-black text-text-primary uppercase tracking-tighter flex items-center gap-3">
                                <Users size={20} className="text-primary" /> Active Nodes
                            </h3>
                            <Link to="/network" className="text-[10px] font-black text-primary-light uppercase tracking-widest hover:underline italic">Expand Nexus</Link>
                        </div>

                        {connections.length === 0 ? (
                            <div className="text-center py-12 px-6 border border-dashed border-white/10 rounded-[32px]">
                                <Users size={32} className="text-text-muted/20 mx-auto mb-4" />
                                <p className="text-[11px] font-black text-text-muted uppercase tracking-widest opacity-60">Isolated Node Detected.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-4">
                                {connections.slice(0, 6).map((c) => (
                                    <Link
                                        key={c.connection}
                                        to={`/profile/${c.user._id}`}
                                        className="p-4 bg-white/5 border border-white/5 rounded-3xl flex items-center gap-4 hover:bg-white/[0.08] hover:border-primary/30 transition-all group/item"
                                    >
                                        <div className="w-12 h-12 rounded-xl bg-linear-to-br from-primary/20 to-secondary/20 p-[1px] group-hover/item:rotate-6 transition-transform">
                                            <div className="w-full h-full rounded-xl bg-bg-dark flex items-center justify-center overflow-hidden">
                                                {c.user.avatar?.url ? (
                                                    <img src={c.user.avatar.url} alt={c.user.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <span className="text-xs font-black text-text-primary">{c.user.name?.charAt(0)}</span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="min-w-0">
                                            <div className="font-black text-sm text-text-primary uppercase tracking-tighter leading-none mb-1 group-hover/item:text-primary-light transition-colors">{c.user.name}</div>
                                            <div className="text-[10px] font-medium text-text-muted truncate italic">{c.user.headline || 'Synchronized Member'}</div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Activity Feed */}
                    <div className="lg:col-span-8 bg-bg-card/40 backdrop-blur-xl border border-white/5 rounded-[48px] p-8 lg:p-10 shadow-2xl relative overflow-hidden">
                         <div className="absolute top-0 right-0 p-10 text-white/[0.02] -rotate-12">
                             <Activity size={120} />
                        </div>
                        
                        <div className="flex items-center justify-between mb-10 relative z-10">
                            <h3 className="text-xl font-display font-black text-text-primary uppercase tracking-tighter flex items-center gap-3">
                                <Activity size={24} className="text-secondary" /> Data Transmissions
                            </h3>
                            <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/5 text-[9px] font-black text-text-muted uppercase tracking-widest">
                                <Sparkles size={12} className="text-primary-light" /> Real-time Feed
                            </div>
                        </div>

                        {posts.length === 0 ? (
                            <div className="text-center py-24 bg-white/5 border border-dashed border-white/10 rounded-[40px]">
                                <FileText size={48} className="text-text-muted/10 mx-auto mb-6" />
                                <h4 className="text-lg font-display font-black text-text-primary uppercase tracking-tighter mb-2">Signal Silence</h4>
                                <p className="text-text-muted text-sm font-medium italic mb-8">No recent transmissions recorded from your node.</p>
                                <button className="px-8 py-4 bg-white/10 border border-white/10 rounded-2xl text-[10px] font-black text-text-primary uppercase tracking-widest hover:bg-primary hover:border-primary transition-all">Broadcast Intelligence</button>
                            </div>
                        ) : (
                            <div className="space-y-8 relative z-10">
                                {posts.map(p => (
                                    <div key={p._id} className="group/post">
                                        <PostCard post={p} />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

