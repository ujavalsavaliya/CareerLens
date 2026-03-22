import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { 
    getNotificationsAPI, 
    markNotificationReadAPI, 
    markAllNotificationsReadAPI, 
    deleteNotificationAPI 
} from '../api/axiosClient';
import { 
    Bell, CheckCheck, X, ChevronRight, UserPlus, Heart, MessageSquare, Briefcase, Share2, AtSign, Calendar, Video 
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function NotificationWidget() {
    const { user } = useSelector(s => s.auth);
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);
    
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);

    // Initial load and global event listener
    useEffect(() => {
        if (user) {
            fetchNotifications(true);
        }

        const handleToggle = () => {
            setOpen(prev => !prev);
        };
        window.addEventListener('toggle-notifications', handleToggle);
        return () => window.removeEventListener('toggle-notifications', handleToggle);
    }, [user]);

    // Polling mechanism
    useEffect(() => {
        let interval;
        if (user) {
            // Poll every 10 seconds to keep unread badges updated, even when closed
            interval = setInterval(() => {
                fetchNotifications(true);
            }, 10000);
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [user, open]);

    const fetchNotifications = async (silent = false) => {
        if (!silent) setLoading(true);
        try {
            const res = await getNotificationsAPI();
            setNotifications(res.data.notifications || []);
            setUnreadCount(res.data.unreadCount || 0);

            // Dispatch global event for Navbar badge
            window.dispatchEvent(new CustomEvent('update-unread-notifications', { 
                detail: { count: res.data.unreadCount || 0 } 
            }));
        } catch (err) {
            console.error('Failed to fetch notifications', err);
        } finally {
            if (!silent) setLoading(false);
        }
    };

    const handleMarkRead = async (id, e) => {
        if (e) e.stopPropagation();
        try {
            await markNotificationReadAPI(id);
            setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
            window.dispatchEvent(new CustomEvent('update-unread-notifications', { 
                detail: { count: Math.max(0, unreadCount - 1) } 
            }));
        } catch (err) {
            toast.error('Failed to mark as read');
        }
    };

    const handleMarkAllRead = async () => {
        try {
            await markAllNotificationsReadAPI();
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
            setUnreadCount(0);
            window.dispatchEvent(new CustomEvent('update-unread-notifications', { 
                detail: { count: 0 } 
            }));
            toast.success('All marked as read');
        } catch (err) {
            toast.error('Failed to mark all as read');
        }
    };

    const handleDelete = async (id, e) => {
        if (e) e.stopPropagation();
        try {
            await deleteNotificationAPI(id);
            setNotifications(prev => prev.filter(n => n._id !== id));
            // Let the next poll update the precise unread count, or lazily guess
            fetchNotifications(true); 
            toast.success('Notification removed');
        } catch (err) {
            toast.error('Failed to delete notification');
        }
    };

    const renderWithLinks = (text) => {
        if (!text) return null;
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        const parts = text.split(urlRegex);
        return parts.map((part, i) => {
            if (urlRegex.test(part)) {
                let displayUrl = part;
                if (part.includes('zoom.us')) {
                    displayUrl = "Join Zoom Meeting 🔗";
                } else if (part.length > 30) {
                    displayUrl = part.substring(0, 27) + "...";
                }
                return (
                    <a 
                        key={i} 
                        href={part} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="text-primary-light underline underline-offset-2 break-all hover:text-primary transition-colors font-bold inline-block mx-1" 
                        onClick={e => e.stopPropagation()}
                    >
                        {displayUrl}
                    </a>
                );
            }
            return part;
        });
    };

    const getNotificationStyle = (type) => {
        switch(type) {
            case 'connection_request': return { icon: <UserPlus size={18} className="text-secondary" />, bg: 'bg-secondary/10', border: 'border-secondary/30' };
            case 'connection_accepted': return { icon: <CheckCheck size={18} className="text-success" />, bg: 'bg-success/10', border: 'border-success/30' };
            case 'follow': return { icon: <UserPlus size={18} className="text-primary-light" />, bg: 'bg-primary/20', border: 'border-primary/30' };
            case 'post_like': return { icon: <Heart size={18} className="text-red-400" />, bg: 'bg-red-400/10', border: 'border-red-400/30' };
            case 'post_comment': return { icon: <MessageSquare size={18} className="text-blue-400" />, bg: 'bg-blue-400/10', border: 'border-blue-400/30' };
            case 'message': return { icon: <MessageSquare size={18} className="text-primary" />, bg: 'bg-primary/10', border: 'border-primary/30' };
            case 'interview_scheduled': return { icon: <Calendar size={18} className="text-amber-400" />, bg: 'bg-amber-400/10', border: 'border-amber-400/30' };
            case 'interview_reminder': return { icon: <Video size={18} className="text-green-400" />, bg: 'bg-green-400/10', border: 'border-green-400/30' };
            case 'job_application': return { icon: <Briefcase size={18} className="text-primary-light" />, bg: 'bg-primary/10', border: 'border-primary/30' };
            case 'job_update': return { icon: <Briefcase size={18} className="text-amber-400" />, bg: 'bg-amber-400/10', border: 'border-amber-400/30' };
            case 'offer_letter': return { icon: <Briefcase size={18} className="text-green-400" />, bg: 'bg-green-400/10', border: 'border-green-400/30' };
            default: return { icon: <Bell size={18} className="text-text-secondary" />, bg: 'bg-white/10', border: 'border-white/20' };
        }
    };

    const getNotificationMessage = (n) => {
        const name = n.sender?.name || 'Someone';
        switch(n.type) {
            case 'connection_request': return <span><strong className="text-text-primary">{name}</strong> sent you a connection request.</span>;
            case 'connection_accepted': return <span><strong className="text-text-primary">{name}</strong> accepted your connection request.</span>;
            case 'follow': return <span><strong className="text-text-primary">{name}</strong> started following you.</span>;
            case 'post_like': return <span><strong className="text-text-primary">{name}</strong> liked your post.</span>;
            case 'post_comment': return <span><strong className="text-text-primary">{name}</strong> commented on your post: "{n.comment}"</span>;
            case 'comment_like': return <span><strong className="text-text-primary">{name}</strong> liked your comment.</span>;
            case 'message': return <span><strong className="text-text-primary">{name}</strong> sent you a message.</span>;
            case 'post_mention': return <span><strong className="text-text-primary">{name}</strong> mentioned you in a post.</span>;
            case 'interview_scheduled': return <span><span className="font-bold text-amber-400">📅 INTERVIEW SCHEDULED</span><br/>{renderWithLinks(n.comment)}</span>;
            case 'interview_reminder': return <span><span className="font-bold text-green-400">⏰ INTERVIEW REMINDER</span><br/>{renderWithLinks(n.comment)}</span>;
            case 'job_application': return <span>{renderWithLinks(n.comment) || <><strong className="text-text-primary">{name}</strong> interacted with your application.</>}</span>;
            case 'job_update': return <span>{renderWithLinks(n.comment)}</span>;
            case 'offer_letter': return <span><span className="font-bold text-green-400">🎉 OFFER LETTER</span><br/>{renderWithLinks(n.comment)}</span>;
            default: return <span>{n.comment || <><strong className="text-text-primary">{name}</strong> interacted with you.</>}</span>;
        }
    };

    const handleNotificationClick = (n) => {
        if (!n.read) handleMarkRead(n._id);
        
        switch(n.type) {
            case 'connection_request': 
            case 'connection_accepted': 
            case 'follow':
                navigate(`/profile/${n.sender?._id}`);
                setOpen(false);
                break;
            case 'message':
                window.dispatchEvent(new CustomEvent('toggle-chat', { detail: { userId: n.sender?._id, user: n.sender } }));
                setOpen(false);
                break;
            case 'post_like':
            case 'post_comment':
            case 'comment_like':
            case 'post_mention':
                navigate('/feed');
                setOpen(false);
                break;
            case 'interview_reminder': {
                // Try to extract Zoom URL from comment and open it
                const urlMatch = n.comment?.match(/(https?:\/\/[^\s]+)/);
                if (urlMatch) {
                    window.open(urlMatch[1], '_blank', 'noopener,noreferrer');
                }
                setOpen(false);
                break;
            }
            case 'offer_letter':
                navigate('/applications');
                setOpen(false);
                break;
            default: break;
        }
    };

    if (!user) return null;

    return (
        <>
            {/* Mobile Backdrop */}
            <div 
                className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-9998 sm:hidden transition-all duration-300 ${open ? 'opacity-100 visible' : 'opacity-0 invisible'}`} 
                onClick={() => setOpen(false)} 
            />
            
            <div className={`fixed top-0 right-0 z-9999 w-sm sm:w-sm lg:w-sm h-full bg-bg-dark border-l border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden transition-transform duration-500 cubic-bezier(0.16, 1, 0.3, 1) ${open ? 'translate-x-0' : 'translate-x-full'}`}>
                
                {/* Header */}
                <div className="h-[76px] bg-bg-card/80 backdrop-blur-xl border-b border-white/10 flex items-center justify-between px-5 shrink-0 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-primary/10 blur-[60px] rounded-full pointer-events-none -translate-y-1/2 translate-x-1/2" />
                    
                    <div className="flex items-center gap-3 relative z-10">
                        <div className="w-10 h-10 rounded-xl bg-linear-to-br from-primary/20 to-secondary/20 flex items-center justify-center text-white shadow-inner border border-white/10">
                            <Bell size={20} className="text-text-primary drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]" />
                        </div>
                        <div>
                            <span className="font-display font-black text-text-primary text-lg tracking-wide">NOTIFICATIONS</span>
                            {unreadCount > 0 && (
                                <div className="text-[10px] text-primary-light font-bold uppercase tracking-widest mt-0.5">{unreadCount} Unread</div>
                            )}
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-2 relative z-10">
                        {unreadCount > 0 && (
                            <button 
                                onClick={handleMarkAllRead} 
                                className="p-2 hover:bg-white/10 rounded-xl text-primary-light hover:text-primary transition-colors flex items-center justify-center"
                                title="Mark all as read"
                            >
                                <CheckCheck size={18} />
                            </button>
                        )}
                        <button onClick={() => setOpen(false)} className="p-2 hover:bg-white/10 rounded-xl text-text-muted hover:text-red-400 transition-colors">
                            <X size={22} />
                        </button>
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto custom-scrollbar relative bg-black/20">
                    {loading && notifications.length === 0 ? (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className="absolute inset-0 p-8 text-center flex flex-col items-center justify-center">
                            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-5 border border-white/5 relative">
                                <Bell className="w-8 h-8 text-text-muted" />
                                <div className="absolute top-4 right-4 w-3 h-3 bg-red-500/20 rounded-full" />
                            </div>
                            <h3 className="text-xl font-display font-black text-text-primary mb-2">You're all caught up!</h3>
                            <p className="text-sm text-text-secondary">No new notifications right now. Check back later.</p>
                        </div>
                    ) : (
                        <div className="flex flex-col">
                            {notifications.map(n => {
                                const style = getNotificationStyle(n.type);
                                return (
                                    <div 
                                        key={n._id}
                                        className={`group relative p-4 lg:p-5 border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer flex gap-4 ${n.read ? 'opacity-80' : 'bg-primary/5'}`}
                                        onClick={() => handleNotificationClick(n)}
                                    >
                                        {!n.read && (
                                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />
                                        )}
                                        
                                        {/* Avatar or Icon Container */}
                                        <div className="relative shrink-0">
                                            <Link 
                                                to={`/profile/${n.sender?._id}`} 
                                                className="w-12 h-12 rounded-full border border-white/10 bg-linear-to-br from-primary/50 to-secondary/50 flex items-center justify-center text-white overflow-hidden shadow-md group-hover:border-primary/50 transition-colors block"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                {n.sender?.avatar?.url ? (
                                                    <img src={n.sender.avatar.url} alt={n.sender.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <span className="font-bold">{n.sender?.name?.charAt(0)}</span>
                                                )}
                                            </Link>
                                            
                                            <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center border-2 border-bg-dark shadow-sm ${style.bg} ${style.border}`}>
                                                {style.icon}
                                            </div>
                                        </div>

                                        <div className="flex-1 min-w-0 pr-6">
                                            <p className={`text-[14px] leading-snug ${n.read ? 'text-text-secondary font-medium' : 'text-text-primary font-bold'}`}>
                                                {getNotificationMessage(n)}
                                            </p>
                                            <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider mt-2 block">
                                                {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                                            </span>
                                        </div>

                                        {/* Actions */}
                                        <div className="absolute top-4 right-3 opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity">
                                            <button 
                                                onClick={(e) => handleDelete(n._id, e)}
                                                className="p-1.5 rounded-lg text-text-muted hover:bg-white/10 hover:text-red-400 transition-colors"
                                                title="Remove"
                                            >
                                                <X size={14} />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
