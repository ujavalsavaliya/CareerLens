import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
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
import { User, Briefcase, GraduationCap, MapPin, Link as LinkIcon, MessageSquare, UserPlus, UserCheck, X } from 'lucide-react';
import PostCard from '../../components/PostCard';
import toast from 'react-hot-toast';

export default function UserProfileView() {
    const { userId } = useParams();
    const { user: currentUser } = useSelector(s => s.auth);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [posts, setPosts] = useState([]);
    const [status, setStatus] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        const load = async () => {
            try {
                setLoading(true);
                const [profileRes, postsRes] = await Promise.all([
                    getProfileByUserIdAPI(userId),
                    getUserPostsAPI(userId, { page: 1, limit: 10 })
                ]);
                setProfile(profileRes.data);
                setPosts(postsRes.data.posts || []);

                // connection/follow status
                const st = await getConnectionStatusAPI(userId);
                setStatus(st.data);
            } catch (err) {
                toast.error('Failed to load profile');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [userId]);

    if (loading) {
        return (
            <div className="page-container">
                <div className="skeleton" style={{ height: 420, borderRadius: 20 }} />
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="page-container">
                <div className="glass-card" style={{ padding: 32 }}>
                    <h2>This profile is not available.</h2>
                </div>
            </div>
        );
    }

    const owner = profile.user;
    const isMe = currentUser?._id === owner?._id;

    const refreshStatus = async () => {
        const st = await getConnectionStatusAPI(userId);
        setStatus(st.data);
    };

    const handleConnect = async () => {
        setActionLoading(true);
        try {
            await sendConnectionRequestAPI(userId);
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
            await acceptConnectionRequestAPI(userId);
            toast.success('Connection accepted');
            await refreshStatus();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to accept request');
        } finally {
            setActionLoading(false);
        }
    };

    const handleWithdraw = async () => {
        setActionLoading(true);
        try {
            await withdrawConnectionRequestAPI(userId);
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
            await removeConnectionAPI(userId);
            toast.success('Connection removed');
            await refreshStatus();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to remove connection');
        } finally {
            setActionLoading(false);
        }
    };

    const handleFollowToggle = async () => {
        setActionLoading(true);
        try {
            if (status?.isFollowing) {
                await unfollowUserAPI(userId);
                toast.success('Unfollowed');
            } else {
                await followUserAPI(userId);
                toast.success('Following');
            }
            await refreshStatus();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed');
        } finally {
            setActionLoading(false);
        }
    };

    const handleMessage = async () => {
        const content = prompt(`Message ${owner?.name || 'user'}:`);
        if (!content || !content.trim()) return;
        setActionLoading(true);
        try {
            await sendMessageAPI(userId, { content });
            toast.success('Message sent');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to send message');
        } finally {
            setActionLoading(false);
        }
    };

    return (
        <div className="page-container animate-fade-in">
            <div className="glass-card" style={{ padding: 28, marginBottom: 20 }}>
                <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
                    <div
                        style={{
                            width: 80,
                            height: 80,
                            borderRadius: '50%',
                            background: owner?.avatar?.url ? `url(${owner.avatar.url}) center/cover` : 'var(--gradient-1)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontWeight: 800,
                            fontSize: 26
                        }}
                    >
                        {!owner?.avatar?.url && owner?.name?.charAt(0)}
                    </div>

                    <div style={{ flex: 1 }}>
                        <h1 style={{ fontSize: 24, fontWeight: 800 }}>{owner?.name}</h1>
                        <p style={{ color: 'var(--text-secondary)', marginTop: 4 }}>
                            {profile.headline || 'No headline yet'}
                        </p>
                        <div style={{ display: 'flex', gap: 14, marginTop: 8, fontSize: 13, color: 'var(--text-muted)' }}>
                            {profile.location && <span><MapPin size={13} style={{ display: 'inline', marginRight: 4 }} />{profile.location}</span>}
                            {owner?.company && <span><Briefcase size={13} style={{ display: 'inline', marginRight: 4 }} />{owner.company}</span>}
                        </div>
                    </div>

                    {!isMe && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, minWidth: 180 }}>
                            {/* Connect */}
                            {status?.status === 'none' && (
                                <button className="btn btn-primary" onClick={handleConnect} disabled={actionLoading}>
                                    <UserPlus size={16} /> Connect
                                </button>
                            )}
                            {status?.status === 'sent' && (
                                <button className="btn btn-secondary" onClick={handleWithdraw} disabled={actionLoading}>
                                    <X size={16} /> Pending (Withdraw)
                                </button>
                            )}
                            {status?.status === 'received' && (
                                <button className="btn btn-primary" onClick={handleAccept} disabled={actionLoading}>
                                    <UserCheck size={16} /> Accept request
                                </button>
                            )}
                            {status?.status === 'accepted' && (
                                <button className="btn btn-secondary" onClick={handleRemoveConnection} disabled={actionLoading}>
                                    <UserCheck size={16} /> Connected (Remove)
                                </button>
                            )}

                            {/* Follow + Message */}
                            <button className="btn btn-ghost" onClick={handleFollowToggle} disabled={actionLoading}>
                                {status?.isFollowing ? 'Unfollow' : 'Follow'}
                            </button>
                            <button className="btn btn-ghost" onClick={handleMessage} disabled={actionLoading}>
                                <MessageSquare size={16} /> Message
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <div className="grid-2" style={{ alignItems: 'flex-start', gap: 20 }}>
                <div className="glass-card" style={{ padding: 24 }}>
                    <h3 className="section-title"><User size={16} /> About</h3>
                    <p style={{ marginTop: 10, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                        {profile.summary || (isMe ? 'Add a summary on your profile page so others can get to know you.' : 'This user has not added a summary yet.')}
                    </p>

                    {profile.skills?.length > 0 && (
                        <>
                            <h4 style={{ marginTop: 18, fontSize: 14, fontWeight: 600 }}>Skills</h4>
                            <div className="flex flex-wrap gap-2 mt-2">
                                {profile.skills.map(s => (
                                    <span key={s} className="skill-chip">{s}</span>
                                ))}
                            </div>
                        </>
                    )}
                </div>

                <div className="glass-card" style={{ padding: 24 }}>
                    <h3 className="section-title"><LinkIcon size={16} /> Links</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 10 }}>
                        {['linkedIn', 'github', 'portfolio', 'website'].map(key => {
                            const labelMap = {
                                linkedIn: 'LinkedIn',
                                github: 'GitHub',
                                portfolio: 'Portfolio',
                                website: 'Website'
                            };
                            const val = profile[key];
                            if (!val) return null;
                            return (
                                <a
                                    key={key}
                                    href={val}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="link-chip"
                                >
                                    {labelMap[key]} ↗
                                </a>
                            );
                        })}
                        {!profile.linkedIn && !profile.github && !profile.portfolio && !profile.website && (
                            <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                                {isMe ? 'Add your professional links from the profile editor to showcase your work.' : 'No public links added yet.'}
                            </p>
                        )}
                    </div>
                </div>
            </div>

            <div className="glass-card" style={{ padding: 24, marginTop: 20 }}>
                <h3 className="section-title"><Briefcase size={16} /> Experience</h3>
                {profile.experience?.length ? (
                    <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 14 }}>
                        {profile.experience.map((exp, i) => (
                            <div key={i} style={{ borderBottom: '1px solid var(--border)', paddingBottom: 10 }}>
                                <div style={{ fontWeight: 600 }}>{exp.title}</div>
                                <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{exp.company}</div>
                                {exp.description && (
                                    <p style={{ marginTop: 4, fontSize: 13, color: 'var(--text-secondary)' }}>{exp.description}</p>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <p style={{ marginTop: 10, fontSize: 13, color: 'var(--text-muted)' }}>No experience added yet.</p>
                )}
            </div>

            <div className="glass-card" style={{ padding: 24, marginTop: 20 }}>
                <h3 className="section-title"><GraduationCap size={16} /> Education</h3>
                {profile.education?.length ? (
                    <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 14 }}>
                        {profile.education.map((edu, i) => (
                            <div key={i} style={{ borderBottom: '1px solid var(--border)', paddingBottom: 10 }}>
                                <div style={{ fontWeight: 600 }}>{edu.degree}</div>
                                <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{edu.institution}</div>
                                {edu.endYear && (
                                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>Class of {edu.endYear}</div>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <p style={{ marginTop: 10, fontSize: 13, color: 'var(--text-muted)' }}>No education added yet.</p>
                )}
            </div>

            {/* User posts */}
            <div className="glass-card" style={{ padding: 24, marginTop: 20 }}>
                <h3 className="section-title"><Briefcase size={16} /> Recent Activity</h3>
                {posts.length === 0 ? (
                    <p style={{ marginTop: 10, fontSize: 13, color: 'var(--text-muted)' }}>
                        {isMe ? 'You have not posted anything yet.' : 'No public posts from this user yet.'}
                    </p>
                ) : (
                    <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 16 }}>
                        {posts.map(p => (
                            <PostCard key={p._id} post={p} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

