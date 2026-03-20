import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { Heart, MessageCircle, Share2, MoreHorizontal, Send, Pencil, Trash2 } from 'lucide-react';
import { reactToPost, addComment, deletePost, updatePost, likeComment, replyToComment, likeReply } from '../app/slices/postSlice';
import toast from 'react-hot-toast';

export default function PostCard({ post }) {
  const dispatch = useDispatch();
  const { user } = useSelector(s => s.auth);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(post.content || '');
  const [likeBurst, setLikeBurst] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [replySubmitting, setReplySubmitting] = useState(false);

  const handleReaction = async (type) => {
    try {
      const res = await dispatch(reactToPost({ postId: post._id, type })).unwrap();
      if (!post.userReaction && res.userReaction) {
        setLikeBurst(true);
        setTimeout(() => setLikeBurst(false), 350);
      }
    } catch (error) {
      toast.error('Failed to react');
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    setSubmitting(true);
    try {
      await dispatch(addComment({ postId: post._id, text: commentText })).unwrap();
      setCommentText('');
      setShowComments(true);
    } catch (error) {
      toast.error('Failed to add comment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReply = async (e, commentId) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    setReplySubmitting(true);
    try {
      await dispatch(replyToComment({ postId: post._id, commentId, text: replyText })).unwrap();
      setReplyText('');
      setReplyingTo(null);
      toast.success('Reply added');
    } catch (error) {
      toast.error('Failed to reply');
    } finally {
      setReplySubmitting(false);
    }
  };

  const handleLikeComment = (commentId) => {
    dispatch(likeComment({ postId: post._id, commentId }));
  };

  const handleLikeReply = (commentId, replyId) => {
    dispatch(likeReply({ postId: post._id, commentId, replyId }));
  };

  const reactionIcons = {
    like: '👍',
    love: '❤️',
    celebrate: '🎉',
    support: '💪'
  };

  const reactionColors = {
    like: '#6366f1',
    love: '#ef4444',
    celebrate: '#f59e0b',
    support: '#10b981'
  };

  return (
    <div className="bg-bg-card/40 backdrop-blur-xl border border-white/10 rounded-[32px] p-6 hover:border-primary/40 hover:shadow-[0_0_30px_rgba(99,102,241,0.15)] hover:bg-white/2 transition-all duration-500">
      {/* Header */}
      <div className="post-header">
        <Link to={`/profile/${post.author._id}`} className="post-author">
          <div 
            className="author-avatar"
            style={{
              background: post.author.avatar?.url 
                ? `url(${post.author.avatar.url}) center/cover` 
                : 'var(--gradient-1)'
            }}
          >
            {!post.author.avatar?.url && post.author.name?.charAt(0)}
          </div>
          <div>
            <div className="author-name">{post.author.name}</div>
            <div className="post-time">
              {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
              {post.author.role === 'hr' && <span className="hr-badge">HR</span>}
            </div>
          </div>
        </Link>
        {post.author?._id?.toString?.() === user?._id?.toString?.() && (
          <div style={{ position: 'relative' }}>
            <button className="post-menu" onClick={() => setMenuOpen(v => !v)}>
              <MoreHorizontal size={18} />
            </button>
            {menuOpen && (
              <div className="post-menu-dropdown">
                <button type="button" onClick={() => { setEditing(true); setMenuOpen(false); }}>
                  <Pencil size={16} /> Edit
                </button>
                <button
                  type="button"
                  className="danger"
                  onClick={async () => {
                    setMenuOpen(false);
                    if (!confirm('Delete this post?')) return;
                    try {
                      await dispatch(deletePost(post._id)).unwrap();
                      toast.success('Post deleted');
                    } catch (e) {
                      toast.error(e || 'Delete failed');
                    }
                  }}
                >
                  <Trash2 size={16} /> Delete
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="post-content">
        {editing ? (
          <div className="edit-box">
            <textarea value={editText} onChange={(e) => setEditText(e.target.value)} rows={3} />
            <div className="edit-actions">
              <button className="btn btn-ghost btn-sm" onClick={() => { setEditing(false); setEditText(post.content || ''); }}>
                Cancel
              </button>
              <button
                className="btn btn-primary btn-sm"
                onClick={async () => {
                  try {
                    await dispatch(updatePost({ postId: post._id, content: editText })).unwrap();
                    toast.success('Post updated');
                    setEditing(false);
                  } catch (e) {
                    toast.error(e || 'Update failed');
                  }
                }}
                disabled={!editText.trim()}
              >
                Save
              </button>
            </div>
          </div>
        ) : (
          <p>{post.content}</p>
        )}
        {post.images?.length > 0 && (
          <div className={`post-images count-${post.images.length}`}>
            {post.images.map((img, i) => (
              <img key={i} src={img.url} alt="" loading="lazy" />
            ))}
          </div>
        )}
      </div>

      {/* Instagram-style Actions & Stats */}
      <div className="flex items-center gap-2 py-2 mt-4 border-t border-white/5">
        <button 
          className={`flex items-center gap-1.5 px-3 py-2 rounded-full transition-all group ${post.userReaction ? 'text-rose-500' : 'text-text-muted hover:text-text-primary'}`}
          onClick={() => handleReaction(post.userReaction || 'like')}
        >
          <div className={`p-1.5 rounded-full transition-all ${post.userReaction ? 'bg-rose-500/20' : 'group-hover:bg-white/10'}`}>
            <Heart size={20} className={post.userReaction ? 'fill-current' : ''} />
          </div>
          <span className="text-sm font-bold tracking-wide">{(post.reactionCount ?? post.reactions?.length ?? 0)}</span>
        </button>

        <button 
          className="flex items-center gap-1.5 px-3 py-2 rounded-full text-text-muted hover:text-text-primary transition-all group"
          onClick={() => setShowComments(!showComments)}
        >
          <div className="p-1.5 rounded-full transition-all group-hover:bg-blue-500/20 group-hover:text-blue-400">
            <MessageCircle size={20} />
          </div>
          <span className="text-sm font-bold tracking-wide">{post.comments?.length || 0}</span>
        </button>

        <button className="flex items-center gap-1.5 px-3 py-2 rounded-full text-text-muted hover:text-text-primary transition-all group ml-auto" disabled title="Share UI coming next">
          <div className="p-1.5 rounded-full transition-all group-hover:bg-emerald-500/20 group-hover:text-emerald-400">
             <Share2 size={20} />
          </div>
          <span className="text-sm font-bold tracking-wide">{post.shareCount || 0}</span>
        </button>
      </div>

      {/* Comments */}
      {showComments && (
        <div className="comments-section">
          {/* Comment form */}
          <form onSubmit={handleComment} className="comment-form">
            <div 
              className="comment-avatar"
              style={{
                background: user?.avatar?.url 
                  ? `url(${user.avatar.url}) center/cover` 
                  : 'var(--gradient-1)'
              }}
            >
              {!user?.avatar?.url && user?.name?.charAt(0)}
            </div>
            <input
              type="text"
              placeholder="Write a comment..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              disabled={submitting}
            />
            <button type="submit" disabled={!commentText.trim() || submitting}>
              <Send size={16} />
            </button>
          </form>

          {/* Comments list */}
          <div className="comments-list">
            {post.comments?.map(comment => (
              <div key={comment._id} className="comment-item">
                <Link to={`/profile/${comment.author._id}`} className="comment-avatar">
                  <div 
                    style={{
                      background: comment.author.avatar?.url 
                        ? `url(${comment.author.avatar.url}) center/cover` 
                        : 'var(--gradient-1)'
                    }}
                  >
                    {!comment.author.avatar?.url && comment.author.name?.charAt(0)}
                  </div>
                </Link>
                <div className="comment-content">
                  <div className="comment-header">
                    <Link to={`/profile/${comment.author._id}`} className="comment-author">
                      {comment.author.name}
                    </Link>
                    <span className="comment-time">
                      {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                  <p className="comment-text">{comment.text}</p>
                  <div className="comment-actions">
                    <button 
                      className={`flex items-center gap-1.5 transition-all group ${comment.likes?.includes(user?._id) ? 'text-rose-500' : 'text-text-muted hover:text-text-primary'}`}
                      onClick={() => handleLikeComment(comment._id)}
                    >
                      <div className={`p-1 rounded-full transition-all ${comment.likes?.includes(user?._id) ? 'bg-rose-500/10' : 'group-hover:bg-white/10'}`}>
                        <Heart size={14} className={comment.likes?.includes(user?._id) ? 'fill-current' : ''} />
                      </div>
                      <span className="text-[11px] font-bold">{(comment.likesCount || comment.likes?.length || 0)}</span>
                    </button>
                    <button 
                      className="flex items-center gap-1.5 px-2 py-1 rounded-full text-[11px] font-bold text-text-muted hover:text-text-primary hover:bg-white/5 transition-all"
                      onClick={() => setReplyingTo(replyingTo === comment._id ? null : comment._id)}
                    >
                      Reply
                    </button>
                  </div>

                  {/* Replies list */}
                  {comment.replies?.length > 0 && (
                    <div className="replies-list">
                      {comment.replies.map(reply => (
                        <div key={reply._id} className="reply-item">
                          <Link to={`/profile/${reply.author._id}`} className="reply-avatar">
                            <div style={{ background: reply.author.avatar?.url ? `url(${reply.author.avatar.url}) center/cover` : 'var(--gradient-2)' }}>
                              {!reply.author.avatar?.url && reply.author.name?.charAt(0)}
                            </div>
                          </Link>
                          <div className="reply-content">
                            <div className="reply-header">
                              <Link to={`/profile/${reply.author._id}`} className="reply-author">{reply.author.name}</Link>
                              <span className="reply-time">{formatDistanceToNow(new Date(reply.createdAt), { addSuffix: true })}</span>
                            </div>
                            <p className="reply-text">{reply.text}</p>
                            <div className="reply-actions">
                              <button 
                                className={`flex items-center gap-1.5 transition-all group ${reply.likes?.includes(user?._id) ? 'text-rose-500' : 'text-text-muted hover:text-text-primary'}`}
                                onClick={() => handleLikeReply(comment._id, reply._id)}
                              >
                                <div className={`p-1 rounded-full transition-all ${reply.likes?.includes(user?._id) ? 'bg-rose-500/10' : 'group-hover:bg-white/10'}`}>
                                  <Heart size={12} className={reply.likes?.includes(user?._id) ? 'fill-current' : ''} />
                                </div>
                                <span className="text-[10px] font-bold">{(reply.likesCount || reply.likes?.length || 0)}</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Reply form */}
                  {replyingTo === comment._id && (
                    <form onSubmit={(e) => handleReply(e, comment._id)} className="reply-form">
                      <input
                        type="text"
                        placeholder="Write a reply..."
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        autoFocus
                        disabled={replySubmitting}
                      />
                      <button type="submit" disabled={!replyText.trim() || replySubmitting}>
                        <Send size={14} />
                      </button>
                    </form>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <style>{`
        .post-card {
          padding: 20px;
        }
        .post-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 16px;
        }
        .post-author {
          display: flex;
          gap: 12px;
          text-decoration: none;
        }
        .author-avatar {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 800;
          font-size: 18px;
          background-size: cover !important;
        }
        .author-name {
          font-weight: 700;
          color: var(--text-primary);
        }
        .post-time {
          font-size: 12px;
          color: var(--text-muted);
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .hr-badge {
          background: rgba(99,102,241,0.1);
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 10px;
          font-weight: 700;
          color: var(--primary-light);
        }
        .post-content p {
          margin-bottom: 16px;
          line-height: 1.6;
          color: var(--text-secondary);
        }
        .post-images {
          display: grid;
          gap: 8px;
          margin-bottom: 16px;
        }
        .post-images.count-1 {
          grid-template-columns: 1fr;
        }
        .post-images.count-2 {
          grid-template-columns: 1fr 1fr;
        }
        .post-images.count-3 {
          grid-template-columns: repeat(3, 1fr);
        }
        .post-images img {
          width: 100%;
          height: 200px;
          object-fit: cover;
          border-radius: 8px;
        }
        .post-stats {
          display: flex;
          justify-content: flex-end;
          padding: 12px 0;
          border-top: 1px solid var(--border);
          border-bottom: 1px solid var(--border);
          font-size: 13px;
          color: var(--text-muted);
        }
        .post-actions {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 8px;
          padding: 8px 0;
        }
        .action-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 8px;
          border: none;
          background: transparent;
          color: var(--text-muted);
          font-size: 14px;
          font-weight: 600;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .action-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .action-btn:hover {
          background: rgba(255,255,255,0.05);
          color: var(--text-primary);
        }
        .action-btn.active {
          color: var(--primary-light);
          background: rgba(99,102,241,0.10);
        }
        .comments-section {
          margin-top: 16px;
          border-top: 1px solid var(--border);
          padding-top: 16px;
        }
        .comment-form {
          display: flex;
          gap: 12px;
          margin-bottom: 16px;
        }
        .comment-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          flex-shrink: 0;
          background-size: cover !important;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 12px;
          font-weight: 800;
        }
        .comment-form input {
          flex: 1;
          padding: 8px 12px;
          border-radius: 20px;
          border: 1px solid var(--border);
          background: rgba(255,255,255,0.03);
          color: var(--text-primary);
        }
        .comment-form input:focus {
          outline: none;
          border-color: var(--primary);
        }
        .comment-form button {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          border: none;
          background: var(--gradient-1);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }
        .comment-form button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .comments-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .comment-item {
          display: flex;
          gap: 12px;
        }
        .comment-content {
          flex: 1;
          background: rgba(255,255,255,0.03);
          padding: 12px;
          border-radius: 12px;
        }
        .comment-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 4px;
        }
        .comment-author {
          font-weight: 700;
          font-size: 13px;
          color: var(--text-primary);
          text-decoration: none;
        }
        .comment-time {
          font-size: 11px;
          color: var(--text-muted);
        }
        .comment-text {
          font-size: 13px;
          color: var(--text-secondary);
          line-height: 1.5;
        }
        .comment-actions, .reply-actions {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-top: 6px;
        }
        .replies-list {
          margin-top: 12px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          padding-left: 8px;
          border-left: 1px solid rgba(255,255,255,0.05);
        }
        .reply-item {
          display: flex;
          gap: 10px;
        }
        .reply-avatar {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 10px;
          font-weight: 800;
          background-size: cover !important;
        }
        .reply-avatar div { width: 100%; height: 100%; border-radius: 50%; display: flex; align-items: center; justify-content: center; }
        .reply-content {
          flex: 1;
          background: rgba(255,255,255,0.02);
          padding: 8px 12px;
          border-radius: 12px;
        }
        .reply-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 2px;
        }
        .reply-author {
          font-weight: 700;
          font-size: 12px;
          color: var(--text-primary);
          text-decoration: none;
        }
        .reply-time {
          font-size: 10px;
          color: var(--text-muted);
        }
        .reply-text {
          font-size: 12px;
          color: var(--text-secondary);
          line-height: 1.4;
        }
        .reply-form {
          margin-top: 8px;
          display: flex;
          gap: 8px;
        }
        .reply-form input {
          flex: 1;
          background: rgba(255,255,255,0.05);
          border: 1px solid var(--border);
          border-radius: 16px;
          padding: 6px 12px;
          font-size: 12px;
          color: var(--text-primary);
          outline: none;
        }
        .reply-form button {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: var(--primary);
          color: white;
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }
        .post-menu {
          border: 1px solid var(--border);
          background: transparent;
          color: var(--text-muted);
          width: 34px;
          height: 34px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }
        .post-menu:hover {
          background: rgba(255,255,255,0.05);
          color: var(--text-primary);
        }
        .post-menu-dropdown {
          position: absolute;
          right: 0;
          top: 40px;
          background: rgba(15,23,42,0.98);
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 6px;
          min-width: 160px;
          z-index: 30;
          box-shadow: 0 18px 45px rgba(15,23,42,0.75);
        }
        .post-menu-dropdown button {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px;
          border: none;
          border-radius: 10px;
          background: transparent;
          color: var(--text-secondary);
          cursor: pointer;
        }
        .post-menu-dropdown button:hover {
          background: rgba(255,255,255,0.05);
          color: var(--text-primary);
        }
        .post-menu-dropdown button.danger {
          color: #fca5a5;
        }
        .post-menu-dropdown button.danger:hover {
          background: rgba(239,68,68,0.12);
          color: #fecaca;
        }
        .edit-box textarea{
          width:100%;
          border-radius:12px;
          border:1px solid var(--border);
          background: rgba(255,255,255,0.03);
          color: var(--text-primary);
          padding: 10px 12px;
          outline: none;
          resize: vertical;
        }
        .edit-actions{
          display:flex;
          justify-content:flex-end;
          gap:10px;
          margin-top:10px;
        }
        .action-btn.like-burst{
          animation: likeBurst 0.35s ease;
          background: rgba(236,72,153,0.10);
          color: #fb7185;
        }
        @keyframes likeBurst{
          0%{ transform: scale(1); }
          40%{ transform: scale(1.06); }
          100%{ transform: scale(1); }
        }
      `}</style>
    </div>
  );
}