import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { getConversationsAPI, getMessagesAPI, sendMessageAPI, markMessagesReadAPI } from '../api/axiosClient';
import { MessageSquare, Send, Image as ImageIcon, Paperclip, Check, CheckCheck, X, ChevronLeft } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';

export default function ChatWidget() {
    const { user } = useSelector(s => s.auth);
    const [open, setOpen] = useState(false);
    
    const [conversations, setConversations] = useState([]);
    const [activeConv, setActiveConv] = useState(null);
    const [messages, setMessages] = useState([]);
    const [content, setContent] = useState('');
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [sending, setSending] = useState(false);
    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);

    useEffect(() => {
        let interval;
        if (open) {
            interval = setInterval(() => {
                if (activeConv && !activeConv.isTemp) {
                    fetchMessages(activeConv._id);
                    markMessagesReadAPI(activeConv._id).catch(() => {});
                } else if (!activeConv) {
                    fetchConversations(true);
                }
            }, 3000);
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [open, activeConv]);

    useEffect(() => {
        const handleToggle = (e) => {
            const detail = e.detail;
            if (detail?.userId && detail?.user) {
                setOpen(true);
                // We will handle the conversation setting after conversations are fetched
                // or optimistically now
                setActiveConv({
                    _id: 'temp-' + Date.now(),
                    other: detail.user,
                    isTemp: true
                });
            } else {
                setOpen(prev => !prev);
            }
        };
        window.addEventListener('toggle-chat', handleToggle);
        return () => window.removeEventListener('toggle-chat', handleToggle);
    }, []);

    useEffect(() => {
        if (open && conversations.length === 0) {
            fetchConversations();
        }
    }, [open]);

    // Match temp conversation with real one when conversations load
    useEffect(() => {
        if (activeConv?.isTemp && conversations.length > 0) {
            const existing = conversations.find(c => c.other._id === activeConv.other._id);
            if (existing) {
                setActiveConv(existing);
            }
        }
    }, [conversations, activeConv]);

    useEffect(() => {
        if (activeConv && !activeConv.isTemp && open) {
            fetchMessages(activeConv._id);
            markMessagesReadAPI(activeConv._id).catch(console.error);
        } else if (activeConv?.isTemp) {
            setMessages([]);
        }
    }, [activeConv, open]);

    useEffect(() => {
        if (open && activeConv) {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, open, activeConv]);

    const fetchConversations = async (silent = false) => {
        if (!silent) setLoading(true);
        try {
            const res = await getConversationsAPI();
            setConversations(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            if (!silent) setLoading(false);
        }
    };

    const fetchMessages = async (convId) => {
        try {
            const res = await getMessagesAPI(convId);
            setMessages(res.data || []);
        } catch (err) {
            console.error(err);
        }
    };

    const handleSend = async (e) => {
        e?.preventDefault();
        if (!content.trim() && files.length === 0) return;
        if (!activeConv?.other?._id) return;

        setSending(true);
        try {
            let data;
            if (files.length > 0) {
                data = new FormData();
                data.append('content', content);
                Array.from(files).forEach(f => {
                    data.append('media', f);
                });
            } else {
                data = { content };
            }

            const res = await sendMessageAPI(activeConv.other._id, data);
            setMessages(prev => [...prev, res.data.message]);
            setContent('');
            setFiles([]);
            fetchConversations();
            
            // If it was a temp conversation, the next fetchConversations will naturally re-assign activeConv
            // but we can manually update it to avoid race conditions
            if (activeConv.isTemp) {
                setActiveConv({ ...activeConv, isTemp: false, _id: res.data.message.conversation });
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to send message');
        } finally {
            setSending(false);
        }
    };

    const handleFileChange = (e) => {
        const selectedFiles = Array.from(e.target.files);
        if (selectedFiles.length + files.length > 5) {
            toast.error('Maximum 5 files allowed');
            return;
        }
        setFiles(prev => [...prev, ...selectedFiles]);
    };

    const removeFile = (idx) => {
        setFiles(prev => prev.filter((_, i) => i !== idx));
    };

    if (!user) return null;

    return (
        <>
            {/* Mobile Backdrop */}
            <div 
                className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-9998 sm:hidden transition-all duration-300 ${open ? 'opacity-100 visible' : 'opacity-0 invisible'}`} 
                onClick={() => setOpen(false)} 
            />
            
            <div className={`fixed top-0 right-0 z-9999 w-sm sm:w-[400px] h-full h-dvh bg-bg-dark border-l border-white/10 shadow-[0_0_40px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden transition-transform duration-500 cubic-bezier(0.16, 1, 0.3, 1) ${open ? 'translate-x-0' : 'translate-x-full'}`}>
            
            {/* Header */}
            <div className="h-[72px] bg-bg-card/80 backdrop-blur-xl border-b border-white/10 flex items-center justify-between px-4 shrink-0">
                {activeConv ? (
                    <div className="flex items-center gap-3 flex-1">
                        <button onClick={(e) => { e.stopPropagation(); setActiveConv(null); }} className="p-2 hover:bg-white/10 rounded-xl text-text-muted hover:text-white transition-colors">
                            <ChevronLeft size={22} />
                        </button>
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div className="w-10 h-10 rounded-full bg-linear-to-br from-primary to-secondary flex items-center justify-center text-white overflow-hidden shrink-0 shadow-md">
                                {activeConv.other?.avatar?.url ? (
                                    <img src={activeConv.other.avatar.url} alt={activeConv.other.name} className="w-full h-full object-cover" />
                                ) : (
                                    <span className="font-bold text-sm">{activeConv.other?.name?.charAt(0)}</span>
                                )}
                            </div>
                            <div className="flex flex-col min-w-0">
                                <span className="font-bold text-text-primary text-[15px] truncate">{activeConv.other?.name}</span>
                                <span className="text-[11px] text-text-muted font-medium uppercase tracking-wider">{activeConv.other?.role === 'hr' ? 'HR / Recruiter' : 'Job Seeker'}</span>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center gap-3 flex-1 px-2">
                        <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary-light shadow-inner shadow-primary/20">
                            <MessageSquare size={20} />
                        </div>
                        <div>
                            <span className="font-display font-black text-text-primary text-lg tracking-wide">MESSAGING</span>
                        </div>
                    </div>
                )}
                
                <div className="flex items-center gap-1 shrink-0 ml-2">
                    <button onClick={(e) => { e.stopPropagation(); setOpen(false); }} className="p-2.5 hover:bg-white/10 rounded-xl text-text-muted hover:text-red-400 transition-colors">
                        <X size={22} />
                    </button>
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-hidden relative bg-black/20">
                {!activeConv ? (
                    /* Conversations List */
                    <div className="absolute inset-0 overflow-y-auto custom-scrollbar flex flex-col pt-2">
                        {loading ? (
                            <div className="flex-1 flex items-center justify-center">
                                <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
                            </div>
                        ) : conversations.length === 0 ? (
                            <div className="p-8 text-center text-text-muted flex-1 flex flex-col items-center justify-center">
                                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
                                    <MessageSquare className="w-8 h-8 opacity-40 text-text-secondary" />
                                </div>
                                <p className="text-base font-medium text-text-secondary">No active conversations</p>
                                <p className="text-sm mt-1">Connect with someone to start chatting!</p>
                            </div>
                        ) : (
                            conversations.map(conv => (
                                <button 
                                    key={conv._id}
                                    onClick={() => setActiveConv(conv)}
                                    className="flex items-start gap-4 p-4 border-b border-white/5 hover:bg-white/5 transition-colors text-left relative group"
                                >
                                    <div className="w-14 h-14 rounded-full bg-linear-to-br from-primary/80 to-secondary/80 shrink-0 flex items-center justify-center text-white overflow-hidden shadow-md border-2 border-transparent group-hover:border-primary/30 transition-all">
                                        {conv.other?.avatar?.url ? (
                                            <img src={conv.other.avatar.url} alt={conv.other.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="font-bold text-lg">{conv.other?.name?.charAt(0)}</span>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0 mt-0.5">
                                        <div className="flex justify-between items-center mb-1">
                                            <h3 className="font-bold text-text-primary text-[15px] truncate">{conv.other?.name || 'Unknown'}</h3>
                                            <span className="text-[11px] text-text-muted whitespace-nowrap ml-2 font-medium">
                                                {conv.lastMessageAt ? formatDistanceToNow(new Date(conv.lastMessageAt), { addSuffix: false }).replace('about ', '') : ''}
                                            </span>
                                        </div>
                                        <p className="text-[13px] text-text-secondary truncate leading-relaxed">
                                            {conv.lastMessage?.content || (conv.lastMessage?.media?.length > 0 && 'Sent an attachment')}
                                        </p>
                                    </div>
                                    {conv.lastMessage && conv.lastMessage.sender !== user._id && !conv.lastMessage.readBy?.includes(user._id) && (
                                        <div className="absolute top-[28px] right-4 w-3 h-3 bg-primary rounded-full shadow-[0_0_10px_rgba(99,102,241,0.8)]" />
                                    )}
                                </button>
                            ))
                        )}
                    </div>
                ) : (
                    /* Active Chat */
                    <div className="absolute inset-0 flex flex-col bg-bg-dark">
                        <div className="flex-1 overflow-y-auto p-5 space-y-5 custom-scrollbar bg-linear-to-b from-transparent to-black/20">
                            {messages.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-text-muted">
                                    <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
                                        <MessageSquare className="w-8 h-8 opacity-40 text-primary-light" />
                                    </div>
                                    <p className="text-base font-bold text-text-secondary">Start the conversation</p>
                                    <p className="text-sm mt-1">Say hi to {activeConv.other?.name}</p>
                                </div>
                            ) : (
                                messages.map((msg, idx) => {
                                    const isMine = msg.sender?._id === user._id || msg.sender === user._id;
                                    const isRead = msg.readBy?.length > 1; 
                                    return (
                                        <div key={msg._id || idx} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`max-w-[85%] flex flex-col ${isMine ? 'items-end' : 'items-start'}`}>
                                                
                                                {msg.media && msg.media.length > 0 && (
                                                    <div className={`flex flex-wrap gap-2 mb-2 ${isMine ? 'justify-end' : 'justify-start'}`}>
                                                        {msg.media.map((m, i) => (
                                                            <a key={i} href={m.url} target="_blank" rel="noopener noreferrer" className="block max-w-[220px] overflow-hidden rounded-xl border border-white/10 hover:border-primary/50 transition-colors">
                                                                {m.type === 'image' ? (
                                                                    <img src={m.url} alt="attachment" className="max-w-full object-contain bg-black/40 max-h-[160px]" />
                                                                ) : (
                                                                    <div className="bg-bg-card/80 p-3 flex items-center gap-2">
                                                                        <Paperclip size={16} className="text-primary hidden sm:block" />
                                                                        <span className="text-[12px] text-text-primary underline truncate max-w-[140px]">{m.name || 'Document'}</span>
                                                                    </div>
                                                                )}
                                                            </a>
                                                        ))}
                                                    </div>
                                                )}

                                                {msg.content && (
                                                    <div className={`px-4 py-3 rounded-2xl shadow-md relative ${isMine ? 'bg-linear-to-br from-primary to-primary-dark text-white rounded-tr-sm' : 'bg-white/10 backdrop-blur-md border border-white/5 text-text-primary rounded-tl-sm'}`}>
                                                        <p className="text-[14px] leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                                                    </div>
                                                )}
                                                
                                                <div className="flex items-center gap-1.5 mt-1.5 px-1">
                                                    <span className="text-[10px] font-medium text-text-muted">
                                                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                    {isMine && (
                                                        isRead ? <CheckCheck size={12} className="text-emerald-400" /> : <Check size={12} className="text-text-muted" />
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="p-4 bg-bg-card/95 backdrop-blur-2xl border-t border-white/10 shrink-0 shadow-[0_-10px_40px_rgba(0,0,0,0.3)]">
                            {files.length > 0 && (
                                <div className="flex flex-wrap gap-2.5 mb-3 px-1">
                                    {files.map((file, idx) => (
                                        <div key={idx} className="relative group bg-black/60 border border-white/10 rounded-lg p-2 pr-7 flex items-center gap-2 max-w-[180px]">
                                            {file.type.startsWith('image/') ? <ImageIcon size={14} className="text-primary-light shrink-0" /> : <Paperclip size={14} className="text-primary-light shrink-0" />}
                                            <span className="text-[11px] text-text-primary truncate">{file.name}</span>
                                            <button 
                                                onClick={() => removeFile(idx)}
                                                className="absolute right-1.5 text-text-muted hover:text-red-400 p-1 rounded-md hover:bg-white/10 transition-colors"
                                            >
                                                <X size={12} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <form onSubmit={handleSend} className="flex items-end gap-3 relative">
                                <div className="flex-1 bg-white/5 border border-white/10 rounded-2xl p-1.5 flex flex-col focus-within:bg-white/10 focus-within:border-primary/50 transition-all shadow-inner">
                                    <textarea
                                        value={content}
                                        onChange={e => setContent(e.target.value)}
                                        placeholder="Write a message..."
                                        className="w-full bg-transparent border-none outline-none text-text-primary text-[14px] px-3 py-2 min-h-[44px] max-h-[120px] resize-y custom-scrollbar placeholder:text-text-muted"
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                e.preventDefault();
                                                handleSend();
                                            }
                                        }}
                                    />
                                    <div className="flex items-center gap-1 mt-1 px-1 mb-0.5">
                                        <input 
                                            type="file" 
                                            ref={fileInputRef} 
                                            onChange={handleFileChange} 
                                            className="hidden" 
                                            multiple 
                                            accept="image/*,video/*,.pdf,.doc,.docx"
                                        />
                                        <button 
                                            type="button" 
                                            onClick={() => fileInputRef.current?.click()}
                                            className="p-2 text-text-muted hover:text-primary hover:bg-primary/10 rounded-xl transition-all"
                                        >
                                            <Paperclip size={18} />
                                        </button>
                                        <button 
                                            type="button" 
                                            onClick={() => fileInputRef.current?.click()}
                                            className="p-2 text-text-muted hover:text-primary hover:bg-primary/10 rounded-xl transition-all"
                                        >
                                            <ImageIcon size={18} />
                                        </button>
                                    </div>
                                </div>
                                
                                <button 
                                    type="submit" 
                                    disabled={sending || (!content.trim() && files.length === 0)}
                                    className="w-[52px] h-[52px] bg-linear-to-br from-primary to-secondary text-white rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-primary/20 hover:scale-[1.05] active:scale-[0.95] disabled:opacity-50 disabled:hover:scale-100 transition-all"
                                >
                                    {sending ? (
                                        <div className="w-5 h-5 border-2 border-white/50 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <Send size={20} className="-ml-0.5" />
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>
                )}
            </div>
            </div>
        </>
    );
}
