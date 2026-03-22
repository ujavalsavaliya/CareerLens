import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Calendar, CheckCircle, Clock, FileText, MapPin, User, XCircle } from 'lucide-react';
import { getShortlistedCandidatesAPI, scheduleInterviewAPI, updateApplicantStatusAPI, sendOfferLetterAPI } from '../../api/axiosClient';

export default function ShortlistedCandidatesPage() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeSchedule, setActiveSchedule] = useState(null); // { jobId, userId }
    const [activeOffer, setActiveOffer] = useState(null); // { jobId, userId }
    const [form, setForm] = useState({ round: '', scheduledAt: '', durationMinutes: 60, notes: '' });
    const [offerForm, setOfferForm] = useState({ message: '', file: null });
    const [sending, setSending] = useState(false);

    const refresh = async () => {
        setLoading(true);
        try {
            const res = await getShortlistedCandidatesAPI();
            setItems(res.data || []);
        } catch {
            toast.error('Failed to load shortlisted candidates');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { refresh(); }, []);

    const grouped = useMemo(() => {
        const map = new Map();
        for (const it of items) {
            const jobId = it.job?._id;
            if (!jobId) continue;
            if (!map.has(jobId)) map.set(jobId, { job: it.job, rows: [] });
            map.get(jobId).rows.push({ ...it.applicant, offer: it.offer });
        }
        return Array.from(map.values());
    }, [items]);

    if (loading) {
        return (
            <div className="page-container">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="skeleton mb-4" style={{ height: 110, borderRadius: 16 }} />
                ))}
            </div>
        );
    }

    return (
        <div className="page-container animate-fade-in">
            <div className="page-header">
                <h1>Shortlisted Candidates</h1>
                <p>{items.length} candidate{items.length !== 1 ? 's' : ''}</p>
            </div>

            {items.length === 0 ? (
                <div className="empty-state">
                    <User size={48} />
                    <h3>No shortlisted candidates yet</h3>
                    <p>Shortlist candidates from your job applications to see them here.</p>
                    <Link to="/hr/jobs" className="btn btn-primary mt-4">Go to My Jobs</Link>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {grouped.map(({ job, rows }) => (
                        <div key={job._id} className="glass-card" style={{ padding: 18 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                                <div>
                                    <div style={{ fontWeight: 800, fontSize: 16 }}>{job.title}</div>
                                    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 6 }}>
                                        <span style={{ fontSize: 13, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                                            <FileText size={12} /> {job.company}
                                        </span>
                                        <span style={{ fontSize: 13, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                                            <MapPin size={12} /> {job.location}
                                        </span>
                                        <span style={{ fontSize: 13, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                                            <Clock size={12} /> {job.jobType}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
                                {rows.map((a) => {
                                    const u = a.user;
                                    const status = a.status?.toLowerCase() || 'applied';
                                    const isInterview = status === 'interview';
                                    const userId = u?._id || a.user;

                                    return (
                                        <div
                                            key={`${job._id}-${userId}`}
                                            style={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                gap: 16,
                                                alignItems: 'flex-start',
                                                padding: '16px 0',
                                                borderTop: '1px solid var(--border)',
                                                flexWrap: 'wrap'
                                            }}
                                        >
                                            <div style={{ flex: 1, minWidth: 280 }}>
                                                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                                                    <div className="avatar-circle" style={{ width: 40, height: 40, background: 'var(--gradient-1)', fontSize: 16 }}>
                                                        {u?.name?.charAt(0) || 'U'}
                                                    </div>
                                                    <div>
                                                        <div style={{ fontWeight: 700, fontSize: 15 }}>{u?.name || 'Candidate'}</div>
                                                        <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{u?.email}</div>
                                                    </div>
                                                </div>
                                                
                                                <div style={{ marginTop: 12, display: 'flex', gap: 8, alignItems: 'center' }}>
                                                    <span className={`status-badge ${status}`} style={{ fontSize: 11 }}>{status}</span>
                                                    {a.aiMatchScore > 0 && <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--primary)' }}>{a.aiMatchScore}% Match</span>}
                                                </div>

                                                {/* Multiple Interview Rounds Display */}
                                                {a.interviews && a.interviews.length > 0 && (
                                                    <div style={{ marginTop: 14, padding: 12, background: 'rgba(99,102,241,0.03)', borderRadius: 10, border: '1px solid rgba(99,102,241,0.1)' }}>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                                                            <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 4 }}>
                                                                <Calendar size={12} /> Interview History ({a.interviews.length})
                                                            </div>
                                                            <div style={{ fontSize: 9, color: 'var(--text-muted)', background: 'rgba(255,255,255,0.05)', padding: '2px 6px', borderRadius: 4 }}>
                                                                Auto-Zoom Enabled
                                                            </div>
                                                        </div>
                                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                                            {a.interviews.map((iv, i) => (
                                                                <div key={i} style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'flex', justifyContent: 'space-between' }}>
                                                                    <span><strong>R{i + 1}:</strong> {iv.round}</span>
                                                                    <span style={{ color: 'var(--text-muted)' }}>{new Date(iv.scheduledAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Offer Status Display */}
                                                {a.offer && (
                                                    <div style={{ marginTop: 14, padding: '12px 16px', background: a.offer.status === 'accepted' ? 'rgba(16,185,129,0.06)' : a.offer.status === 'rejected' ? 'rgba(239,68,68,0.06)' : 'rgba(99,102,241,0.06)', borderRadius: 12, border: '1px solid', borderColor: a.offer.status === 'accepted' ? 'rgba(16,185,129,0.2)' : a.offer.status === 'rejected' ? 'rgba(239,68,68,0.2)' : 'rgba(99,102,241,0.2)' }}>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                            <div style={{ fontSize: 11, fontWeight: 800, color: a.offer.status === 'accepted' ? '#10b981' : a.offer.status === 'rejected' ? '#ef4444' : 'var(--primary)', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 6 }}>
                                                                <FileText size={14} /> Offer {a.offer.status}
                                                            </div>
                                                            <a href={a.offer.pdfUrl} target="_blank" rel="noreferrer" style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 3, textDecoration: 'underline' }}>
                                                                View Sent PDF
                                                            </a>
                                                        </div>
                                                        {a.offer.respondedAt && (
                                                            <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 4 }}>
                                                                Responded on {new Date(a.offer.respondedAt).toLocaleDateString()}
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>

                                            <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                                                <Link to={`/hr/candidates/${userId}`} className="btn btn-ghost btn-sm" title="View Profile">
                                                    <User size={14} /> Profile
                                                </Link>
                                                
                                                {(status === 'shortlisted' || status === 'interview') && (
                                                    <button
                                                        className="btn btn-primary btn-sm"
                                                        onClick={() => {
                                                            setActiveSchedule({ jobId: job._id, userId: userId });
                                                            setForm({
                                                                round: `Round ${a.interviews?.length + 1 || 1} – Technical Interview`,
                                                                scheduledAt: '',
                                                                durationMinutes: 60,
                                                                notes: ''
                                                            });
                                                        }}
                                                    >
                                                        <Calendar size={14} /> {isInterview ? 'Add Round' : 'Schedule'}
                                                    </button>
                                                )}

                                                {status === 'interview' && (
                                                    <button 
                                                        className="btn btn-success btn-sm" 
                                                        onClick={() => {
                                                            setActiveOffer({ jobId: job._id, userId: userId });
                                                            setOfferForm({ message: `Congratulations! We are pleased to offer you the position of ${job.title}. Please find the attached offer letter for details.`, file: null });
                                                        }} 
                                                        style={{ background: '#10b981', borderColor: '#10b981', color: 'white' }}
                                                    >
                                                        <CheckCircle size={14} /> Send Offer
                                                    </button>
                                                )}

                                                {status !== 'rejected' && status !== 'selected' && (
                                                    <button
                                                        className="btn btn-ghost btn-sm text-danger"
                                                        onClick={async () => {
                                                            if (!confirm('Reject this candidate?')) return;
                                                            try {
                                                                await updateApplicantStatusAPI(job._id, userId, { status: 'rejected' });
                                                                toast.success('Marked as rejected');
                                                                refresh();
                                                            } catch { toast.error('Update failed'); }
                                                        }}
                                                    >
                                                        <XCircle size={14} /> Reject
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {activeSchedule?.jobId === job._id && (
                                <div style={{ marginTop: 14, borderTop: '1px solid var(--border)', paddingTop: 12 }}>
                                    <h3 style={{ marginBottom: 8, fontSize: 14 }}>Schedule interview</h3>
                                    <div className="grid-2" style={{ gap: 12 }}>
                                        <div className="form-group">
                                            <label className="form-label">Round</label>
                                            <input className="form-input" value={form.round} onChange={(e) => setForm((x) => ({ ...x, round: e.target.value }))} />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Date &amp; time</label>
                                            <input type="datetime-local" className="form-input" value={form.scheduledAt} onChange={(e) => setForm((x) => ({ ...x, scheduledAt: e.target.value }))} />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Duration (minutes)</label>
                                            <input type="number" className="form-input" value={form.durationMinutes} onChange={(e) => setForm((x) => ({ ...x, durationMinutes: Number(e.target.value) || 60 }))} />
                                        </div>
                                        <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                                            <label className="form-label">Interview description / notes</label>
                                            <textarea className="form-input" rows={3} value={form.notes} onChange={(e) => setForm((x) => ({ ...x, notes: e.target.value }))} />
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: 10, marginTop: 10, flexWrap: 'wrap' }}>
                                        <button
                                            className="btn btn-primary btn-sm"
                                            onClick={async () => {
                                                if (!form.round || !form.scheduledAt) {
                                                    toast.error('Round and date/time are required');
                                                    return;
                                                }
                                                try {
                                                    await scheduleInterviewAPI(activeSchedule.jobId, activeSchedule.userId, form);
                                                    toast.success('Interview scheduled');
                                                    setActiveSchedule(null);
                                                    setForm({ round: '', scheduledAt: '', durationMinutes: 60, notes: '' });
                                                    refresh();
                                                } catch (err) {
                                                    toast.error(err.response?.data?.message || 'Failed to schedule interview');
                                                }
                                            }}
                                        >
                                            <Calendar size={14} /> Save interview
                                        </button>
                                        <button
                                            className="btn btn-secondary btn-sm"
                                            onClick={() => {
                                                setActiveSchedule(null);
                                                setForm({ round: '', scheduledAt: '', durationMinutes: 60, notes: '' });
                                            }}
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            )}

                            {activeOffer?.jobId === job._id && (
                                <div style={{ marginTop: 14, borderTop: '2px solid #10b981', paddingTop: 16, background: 'rgba(16,185,129,0.03)', padding: 16, borderRadius: 12 }}>
                                    <h3 style={{ marginBottom: 12, fontSize: 16, color: '#10b981', display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <FileText size={18} /> Send Official Offer Letter
                                    </h3>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                                        <div className="form-group">
                                            <label className="form-label" style={{ fontWeight: 700 }}>Personalized Message</label>
                                            <textarea 
                                                className="form-input" 
                                                rows={3} 
                                                placeholder="Write a congratulatory message..."
                                                value={offerForm.message} 
                                                onChange={(e) => setOfferForm((x) => ({ ...x, message: e.target.value }))} 
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label" style={{ fontWeight: 700 }}>Offer Letter (PDF)</label>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                <input 
                                                    type="file" 
                                                    accept="application/pdf"
                                                    onChange={(e) => setOfferForm(x => ({ ...x, file: e.target.files[0] }))}
                                                    style={{ fontSize: 13 }}
                                                />
                                                {offerForm.file && <span style={{ color: '#10b981', fontSize: 12, fontWeight: 700 }}>✓ Loaded</span>}
                                            </div>
                                            <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>Maximum file size: 5MB</p>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
                                        <button
                                            className="btn btn-primary"
                                            disabled={sending || !offerForm.file}
                                            onClick={async () => {
                                                if (!offerForm.file) return toast.error('Please select a PDF file');
                                                setSending(true);
                                                try {
                                                    const fd = new FormData();
                                                    fd.append('offerPdf', offerForm.file);
                                                    fd.append('message', offerForm.message);
                                                    
                                                    await sendOfferLetterAPI(activeOffer.jobId, activeOffer.userId, fd);
                                                    toast.success('Offer letter sent successfully!');
                                                    setActiveOffer(null);
                                                    setOfferForm({ message: '', file: null });
                                                    refresh();
                                                } catch (err) {
                                                    toast.error(err.response?.data?.message || 'Failed to send offer');
                                                } finally {
                                                    setSending(false);
                                                }
                                            }}
                                            style={{ background: '#10b981', borderColor: '#10b981' }}
                                        >
                                            {sending ? 'Sending...' : 'Confirm & Send Offer'}
                                        </button>
                                        <button
                                            className="btn btn-ghost"
                                            onClick={() => {
                                                setActiveOffer(null);
                                                setOfferForm({ message: '', file: null });
                                            }}
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

