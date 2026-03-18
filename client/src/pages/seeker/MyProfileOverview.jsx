import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { getMyProfileAPI, getUserPostsAPI } from '../../api/axiosClient';
import API from '../../api/axiosClient';
import PostCard from '../../components/PostCard';
import { Users, Eye, FileText, ArrowRight } from 'lucide-react';

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
                toast.error('Failed to load profile overview');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [user?._id]);

    if (loading) {
        return (
            <div className="page-container">
                <div className="skeleton" style={{ height: 520, borderRadius: 20 }} />
            </div>
        );
    }

    const avatarUrl = user?.avatar?.url;

    return (
        <div className="page-container animate-fade-in">
            <div className="glass-card" style={{ padding: 26, marginBottom: 18 }}>
                <div style={{ display: 'flex', gap: 18, alignItems: 'center' }}>
                    <div
                        style={{
                            width: 88,
                            height: 88,
                            borderRadius: '50%',
                            background: avatarUrl ? `url(${avatarUrl}) center/cover` : 'var(--gradient-1)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontWeight: 900,
                            fontSize: 28
                        }}
                    >
                        {!avatarUrl && user?.name?.charAt(0)}
                    </div>

                    <div style={{ flex: 1 }}>
                        <h1 style={{ fontSize: 26, fontWeight: 900 }}>{user?.name}</h1>
                        <p style={{ marginTop: 4, color: 'var(--text-secondary)' }}>
                            {profile?.headline || 'Add your professional headline'}
                        </p>
                        <div style={{ marginTop: 10, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                            <span className="pill">
                                <Users size={14} /> {user?.connectionCount || connections.length} connections
                            </span>
                            <span className="pill">
                                <FileText size={14} /> {posts.length} posts
                            </span>
                            <span className="pill" title="Viewer analytics coming next">
                                <Eye size={14} /> 0 views
                            </span>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: 10 }}>
                        <Link to="/profile" className="btn btn-secondary">
                            Edit Profile <ArrowRight size={14} />
                        </Link>
                    </div>
                </div>
            </div>

            <div className="grid-2" style={{ gap: 18, alignItems: 'start' }}>
                <div className="glass-card" style={{ padding: 22 }}>
                    <div className="section-title" style={{ marginBottom: 10 }}>
                        <Users size={16} /> Connections
                    </div>
                    {connections.length === 0 ? (
                        <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>No connections yet.</p>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 10 }}>
                            {connections.slice(0, 6).map((c) => (
                                <Link
                                    key={c.connection}
                                    to={`/profile/${c.user._id}`}
                                    className="glass-card"
                                    style={{ padding: 12, display: 'flex', gap: 10, alignItems: 'center', textDecoration: 'none' }}
                                >
                                    <div
                                        style={{
                                            width: 34,
                                            height: 34,
                                            borderRadius: '50%',
                                            background: c.user.avatar?.url ? `url(${c.user.avatar.url}) center/cover` : 'var(--gradient-1)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: 'white',
                                            fontWeight: 800,
                                            fontSize: 12
                                        }}
                                    >
                                        {!c.user.avatar?.url && c.user.name?.charAt(0)}
                                    </div>
                                    <div style={{ minWidth: 0 }}>
                                        <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-primary)' }}>{c.user.name}</div>
                                        <div style={{ fontSize: 12, color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                            {c.user.headline || c.user.company || ''}
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>

                <div className="glass-card" style={{ padding: 22 }}>
                    <div className="section-title" style={{ marginBottom: 10 }}>
                        <FileText size={16} /> Recent Activity
                    </div>
                    {posts.length === 0 ? (
                        <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>No posts yet.</p>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                            {posts.map(p => <PostCard key={p._id} post={p} />)}
                        </div>
                    )}
                </div>
            </div>

            <style>{`
              .pill{
                display:inline-flex;
                align-items:center;
                gap:8px;
                padding:6px 10px;
                border-radius:999px;
                border:1px solid var(--border);
                background:rgba(255,255,255,0.03);
                color:var(--text-secondary);
                font-size:12px;
                font-weight:600;
              }
            `}</style>
        </div>
    );
}

