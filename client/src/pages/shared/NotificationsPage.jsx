import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { Bell, CheckCircle, Trash2, Calendar, Briefcase, UserPlus } from 'lucide-react';
import {
    deleteNotificationAPI,
    getNotificationsAPI,
    markAllNotificationsReadAPI,
    markNotificationReadAPI
} from '../../api/axiosClient';

const typeLabel = (t) => {
    if (t === 'job_application') return 'Job update';
    if (t === 'interview_scheduled') return 'Interview scheduled';
    if (t === 'interview_reminder') return 'Interview reminder';
    if (t === 'message') return 'Message';
    if (t === 'connection_request') return 'Connection request';
    if (t === 'connection_accepted') return 'Connection accepted';
    if (t === 'follow') return 'New follower';
    return 'Notification';
};

export default function NotificationsPage() {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState({ notifications: [], unreadCount: 0 });

    const refresh = async () => {
        setLoading(true);
        try {
            const res = await getNotificationsAPI();
            setData(res.data || { notifications: [], unreadCount: 0 });
        } catch {
            toast.error('Failed to load notifications');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { refresh(); }, []);

    const items = useMemo(() => data.notifications || [], [data.notifications]);

    const renderWithLinks = (text) => {
        if (!text) return null;
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        const parts = text.split(urlRegex);
        return parts.map((part, i) => {
            if (urlRegex.test(part)) {
                let displayUrl = part;
                if (part.includes('zoom.us')) {
                    displayUrl = "Join Zoom Meeting 🔗";
                } else if (part.length > 50) {
                    displayUrl = part.substring(0, 47) + "...";
                }
                return (
                    <a 
                        key={i} 
                        href={part} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="text-primary-light underline underline-offset-4 font-bold hover:text-primary transition-all inline-flex items-center gap-1 mx-1"
                        onClick={e => e.stopPropagation()}
                    >
                        {displayUrl}
                    </a>
                );
            }
            return part;
        });
    };

    if (loading) {
        return (
            <div className="page-container max-w-5xl mx-auto py-12 px-6">
                <div className="flex justify-between items-center mb-10">
                    <div className="space-y-3">
                        <div className="skeleton w-64 h-10 rounded-xl" />
                        <div className="skeleton w-40 h-5 rounded-lg" />
                    </div>
                    <div className="skeleton w-32 h-10 rounded-xl" />
                </div>
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="skeleton mb-6" style={{ height: 110, borderRadius: 24 }} />
                ))}
            </div>
        );
    }

    return (
        <div className="page-container animate-fade-in max-w-5xl mx-auto py-10 px-6">
            <div className="page-header mb-10" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                <div>
                    <h1 className="font-display font-black text-4xl flex gap-3 items-center text-text-primary">
                        <Bell size={32} className="text-primary" /> Notifications
                    </h1>
                    <p className="text-text-secondary font-medium mt-1 text-lg">
                        {data.unreadCount || 0} unread messages requiring your attention
                    </p>
                </div>
                {data.unreadCount > 0 && (
                    <button
                        className="btn btn-secondary btn-sm rounded-xl px-5 py-3 font-bold shadow-lg shadow-primary/5 border-primary/20 hover:border-primary/50 transition-all flex items-center gap-2"
                        onClick={async () => {
                            try {
                                await markAllNotificationsReadAPI();
                                toast.success('All marked as read');
                                refresh();
                            } catch {
                                toast.error('Failed to mark all read');
                            }
                        }}
                    >
                        <CheckCircle size={18} /> Mark all read
                    </button>
                )}
            </div>

            {items.length === 0 ? (
                <div className="empty-state bg-bg-card/40 backdrop-blur-xl border border-white/5 rounded-[32px] p-20 mt-8 text-center">
                    <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-8 text-primary">
                        <Bell size={48} />
                    </div>
                    <h3 className="font-display font-black text-3xl text-text-primary mb-3">Clean slate!</h3>
                    <p className="max-w-md mx-auto text-text-secondary text-lg">
                        When activity happens (applications, interview schedules, follows, messages), it will show here.
                    </p>
                    <Link to="/dashboard" className="btn btn-primary mt-10 rounded-2xl px-8 py-4 font-bold shadow-2xl shadow-primary/20 hover:scale-105 transition-transform">
                        Return to Dashboard
                    </Link>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    {items.map((n) => (
                        <div
                            key={n._id}
                            className={`glass-card group relative transition-all duration-300 hover:translate-x-1 ${!n.read ? 'border-primary/40 bg-primary/5 shadow-lg shadow-primary/5' : 'border-white/5 hover:border-white/10 hover:bg-white/2'}`}
                            style={{
                                padding: '24px 28px',
                                borderRadius: 28,
                                overflow: 'hidden'
                            }}
                        >
                            {/* Decorative background for unread */}
                            {!n.read && (
                                <div className="absolute top-0 left-0 w-[200px] h-[200px] bg-primary/5 blur-[80px] rounded-full -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
                            )}

                            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 24, flexWrap: 'wrap', position: 'relative', zIndex: 10 }}>
                                <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start', flex: 1, minWidth: '280px' }}>
                                    <div className="avatar-circle shrink-0" style={{ 
                                        width: 56, 
                                        height: 56, 
                                        borderRadius: 18,
                                        background: n.type.includes('interview') ? 'rgba(99,102,241,0.15)' : 'rgba(255,255,255,0.05)',
                                        color: n.type.includes('interview') ? 'var(--primary)' : 'var(--text-muted)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        border: '1px solid rgba(255,255,255,0.08)',
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                                    }}>
                                        {n.type === 'interview_reminder' || n.type === 'interview_scheduled' ? <Calendar size={26} /> :
                                         n.type === 'job_application' ? <Briefcase size={26} /> :
                                         n.type === 'follow' ? <UserPlus size={26} /> :
                                         n.sender?.avatar?.url ? <img src={n.sender.avatar.url} alt={n.sender.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'inherit' }} /> :
                                         <span className="font-bold text-xl">{(n.sender?.name || 'U').charAt(0).toUpperCase()}</span>}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div style={{ fontWeight: 900, fontSize: 11, color: 'var(--primary-light)', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 6, opacity: 0.8 }}>
                                            {typeLabel(n.type)}
                                        </div>
                                        <div className="text-text-primary leading-relaxed break-words" style={{ fontWeight: 600, fontSize: 16 }}>
                                            {renderWithLinks(n.comment)}
                                        </div>
                                        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 10, fontWeight: 700, opacity: 0.5, display: 'flex', alignItems: 'center', gap: 8 }}>
                                            <span>{new Date(n.createdAt).toLocaleDateString()}</span>
                                            <div className="w-1 h-1 rounded-full bg-white/20" />
                                            <span>{new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                        </div>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }} className="ml-auto sm:ml-0 self-end md:self-center">
                                    {!n.read && (
                                        <button
                                            className="h-10 px-5 rounded-xl bg-primary/10 text-primary-light border border-primary/20 hover:bg-primary hover:text-white transition-all font-black text-xs uppercase tracking-wider shadow-sm flex items-center gap-2"
                                            onClick={async () => {
                                                try {
                                                    await markNotificationReadAPI(n._id);
                                                    refresh();
                                                } catch {
                                                    toast.error('Failed to mark read');
                                                }
                                            }}
                                        >
                                            <CheckCircle size={14} /> Mark Read
                                        </button>
                                    )}
                                    <button
                                        className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 text-text-muted border border-white/10 hover:bg-red-500 hover:text-white hover:border-red-500 transition-all shadow-sm"
                                        onClick={async () => {
                                            try {
                                                await deleteNotificationAPI(n._id);
                                                toast.success('Deleted');
                                                refresh();
                                            } catch {
                                                toast.error('Delete failed');
                                            }
                                        }}
                                        title="Delete notification"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

