import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Image as ImageIcon, Send, X, Plus, Globe, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import { createPost } from '../app/slices/postSlice';

export default function CreatePost({ onPostCreated }) {
    const dispatch = useDispatch();
    const { user } = useSelector(s => s.auth);
    const [content, setContent] = useState('');
    const [visibility, setVisibility] = useState('public');
    const [images, setImages] = useState([]);
    const [submitting, setSubmitting] = useState(false);
    const [showComposer, setShowComposer] = useState(false);

    const onPickImages = (e) => {
        const files = Array.from(e.target.files || []).slice(0, 5);
        setImages(files);
    };

    const removeImage = (idx) => {
        setImages(imgs => imgs.filter((_, i) => i !== idx));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!content.trim() && images.length === 0) {
            toast.error('Write something or add an image');
            return;
        }

        const fd = new FormData();
        fd.append('content', content);
        fd.append('visibility', visibility);
        images.forEach(f => fd.append('images', f));

        setSubmitting(true);
        try {
            const created = await dispatch(createPost(fd)).unwrap();
            setContent('');
            setImages([]);
            toast.success('Posted!');
            onPostCreated?.(created);
        } catch (err) {
            toast.error(err || 'Failed to post');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="glass-card" style={{ padding: 18, marginBottom: 18 }}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                    <div
                        style={{
                            width: 42,
                            height: 42,
                            borderRadius: '50%',
                            background: user?.avatar?.url ? `url(${user.avatar.url}) center/cover` : 'var(--gradient-1)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontWeight: 800
                        }}
                    >
                        {!user?.avatar?.url && user?.name?.charAt(0)}
                    </div>

                    <div style={{ flex: 1 }}>
                        {!showComposer ? (
                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={() => setShowComposer(true)}
                                style={{
                                    width: '100%',
                                    justifyContent: 'space-between',
                                    padding: '12px 14px',
                                    borderRadius: 14
                                }}
                            >
                                <span style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--text-secondary)' }}>
                                    <Plus size={16} /> Add a post…
                                </span>
                                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <ImageIcon size={16} /> Add media
                                </span>
                            </button>
                        ) : (
                            <form onSubmit={handleSubmit}>
                                <textarea
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    placeholder="Share something with your network…"
                                    rows={4}
                                    disabled={submitting}
                                    style={{
                                        width: '100%',
                                        resize: 'vertical',
                                        borderRadius: 14,
                                        border: '1px solid var(--border)',
                                        background: 'rgba(255,255,255,0.03)',
                                        color: 'var(--text-primary)',
                                        padding: '10px 12px',
                                        outline: 'none'
                                    }}
                                />

                        {images.length > 0 && (
                            <div style={{ marginTop: 10, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                                {images.map((file, idx) => {
                                    const url = URL.createObjectURL(file);
                                    return (
                                        <div key={idx} style={{ position: 'relative' }}>
                                            <img
                                                src={url}
                                                alt=""
                                                style={{ width: 92, height: 92, objectFit: 'cover', borderRadius: 10, border: '1px solid var(--border)' }}
                                                onLoad={() => URL.revokeObjectURL(url)}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removeImage(idx)}
                                                style={{
                                                    position: 'absolute',
                                                    top: -8,
                                                    right: -8,
                                                    width: 26,
                                                    height: 26,
                                                    borderRadius: '50%',
                                                    border: '1px solid var(--border)',
                                                    background: 'rgba(0,0,0,0.6)',
                                                    color: 'white',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                <X size={14} />
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                                <div style={{ marginTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                                    <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                                        <label className="btn btn-secondary btn-sm" style={{ display: 'inline-flex', gap: 8, cursor: submitting ? 'not-allowed' : 'pointer' }}>
                                            <ImageIcon size={16} /> Add media
                                            <input
                                                type="file"
                                                accept="image/*"
                                                multiple
                                                onChange={onPickImages}
                                                disabled={submitting}
                                                style={{ display: 'none' }}
                                            />
                                        </label>

                                        <button
                                            type="button"
                                            className="btn btn-ghost btn-sm"
                                            onClick={() => setShowComposer(false)}
                                            disabled={submitting}
                                        >
                                            Cancel
                                        </button>
                                    </div>

                                    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-muted)', fontSize: 12 }}>
                                            {visibility === 'public' ? <Globe size={14} /> : <Users size={14} />}
                                            <select
                                                value={visibility}
                                                onChange={(e) => setVisibility(e.target.value)}
                                                disabled={submitting}
                                                style={{
                                                    borderRadius: 10,
                                                    border: '1px solid var(--border)',
                                                    background: 'rgba(255,255,255,0.03)',
                                                    color: 'var(--text-primary)',
                                                    padding: '6px 10px'
                                                }}
                                            >
                                                <option value="public">Public</option>
                                                <option value="connections">Connections</option>
                                            </select>
                                        </div>

                                        <button type="submit" className="btn btn-primary btn-sm" disabled={submitting}>
                                            <Send size={16} /> {submitting ? 'Posting...' : 'Post'}
                                        </button>
                                    </div>
                                </div>
                            </form>
                        )}
                    </div>
            </div>
        </div>
    );
}

