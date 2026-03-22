import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
    getJobByIdAPI, updateApplicantStatusAPI, scheduleInterviewAPI, 
    updateInterviewScoreAPI, sendOfferLetterAPI, getHROfferAPI 
} from '../../api/axiosClient';
import { Users, FileText, Calendar, Clock, CheckCircle, XCircle, Mail, ArrowLeft, ExternalLink, User, Star, Send, Upload, X } from 'lucide-react';
import toast from 'react-hot-toast';

export default function JobApplicantsPage() {
    const { id } = useParams();
    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedApplicant, setSelectedApplicant] = useState(null);
    const [offerModal, setOfferModal] = useState(null); // { userId, name, existingOffer }
    const [offerForm, setOfferForm] = useState({ pdfFile: null, message: '' });
    const [offerLoading, setOfferLoading] = useState(false);
    // Map of userId -> offer object fetched from backend
    const [offers, setOffers] = useState({});
    const [interviewForm, setInterviewForm] = useState({
        round: 'Technical Interview',
        scheduledAt: '',
        durationMinutes: 60,
        notes: ''
    });
    // Map of "userId-roundIndex" -> score being edited
    const [scoreEdits, setScoreEdits] = useState({});
    const [activeTab, setActiveTab] = useState(new URLSearchParams(window.location.search).get('tab') || 'new');

    const loadData = async () => {
        try {
            const res = await getJobByIdAPI(id);
            setJob(res.data);
        } catch (err) {
            toast.error('Failed to load applicants');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadData(); }, [id]);

    // When job loads, pre-fetch offers for 'selected' candidates
    useEffect(() => {
        if (!job) return;
        const selectedApplicants = (job.applicants || []).filter(a => a.status === 'selected');
        selectedApplicants.forEach(async (a) => {
            const userId = a.user?._id || String(a.user);
            try {
                const res = await getHROfferAPI(id, userId);
                if (res.data) {
                    setOffers(prev => ({ ...prev, [userId]: res.data }));
                }
            } catch {}
        });
    }, [job]);

    const handleStatusUpdate = async (userId, status) => {
        try {
            await updateApplicantStatusAPI(id, userId, { status });
            toast.success(`Applicant ${status}`);
            loadData();
        } catch (err) {
            toast.error('Update failed');
        }
    };

    const handleSchedule = async (e) => {
        e.preventDefault();
        if (!interviewForm.scheduledAt) return toast.error('Please select a date and time');
        try {
            await scheduleInterviewAPI(id, selectedApplicant.user._id, interviewForm);
            toast.success('Interview scheduled!');
            setSelectedApplicant(null);
            loadData();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to schedule');
        }
    };

    const handleScoreSave = async (userId, roundIndex, score) => {
        if (score === '' || score === null || score === undefined) return toast.error('Enter a score 0–10');
        const scoreNum = Number(score);
        if (isNaN(scoreNum) || scoreNum < 0 || scoreNum > 10) return toast.error('Score must be 0–10');
        try {
            await updateInterviewScoreAPI(id, userId, { roundIndex, score: scoreNum });
            toast.success('Score saved');
            loadData();
        } catch (err) {
            toast.error('Failed to save score');
        }
    };

    const handleSendOffer = async (e) => {
        e.preventDefault();
        if (!offerForm.pdfFile) return toast.error('Please upload the offer letter PDF');
        setOfferLoading(true);
        try {
            const fd = new FormData();
            fd.append('offerPdf', offerForm.pdfFile);
            fd.append('message', offerForm.message);
            await sendOfferLetterAPI(id, offerModal.userId, fd);
            toast.success('Offer letter sent!');
            setOfferModal(null);
            setOfferForm({ pdfFile: null, message: '' });
            loadData();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to send offer');
        } finally {
            setOfferLoading(false);
        }
    };

    // Compute total score and average for an applicant's interview rounds
    const getScoreSummary = (interviews) => {
        if (!interviews || interviews.length === 0) return null;
        const scored = interviews.filter(iv => iv.score !== null && iv.score !== undefined);
        if (scored.length === 0) return null;
        const total = scored.reduce((sum, iv) => sum + iv.score, 0);
        const avg = (total / scored.length).toFixed(1);
        return { total, avg, count: scored.length, outOf: scored.length * 10 };
    };

    const applicants = job?.applicants || [];

    const filteredApplicants = applicants.filter(a => {
        const s = a.status?.toLowerCase();
        if (activeTab === 'new') return s === 'applied';
        if (activeTab === 'shortlisted') return ['shortlisted', 'interview', 'selected'].includes(s);
        if (activeTab === 'rejected') return s === 'rejected';
        return true;
    });

    if (loading) return <div className="page-container"><div className="skeleton" style={{ height: 400, borderRadius: 20 }} /></div>;
    if (!job) return <div className="page-container text-center"><h2>Job not found</h2></div>;

    return (
        <div className="page-container animate-fade-in">
            <Link to="/hr/jobs" className="btn btn-ghost mb-6" style={{ padding: 0, gap: 8 }}>
                <ArrowLeft size={18} /> Back to My Jobs
            </Link>

            <div className="page-header mb-8">
                <h1 style={{ fontSize: 32, fontWeight: 800 }}>{job.title}</h1>
                <p style={{ color: 'var(--text-muted)' }}>{applicants.length} Total Applicant{applicants.length !== 1 ? 's' : ''}</p>
            </div>

            {/* Tab Navigation */}
            <div style={{ display: 'flex', gap: 24, borderBottom: '1px solid var(--border)', marginBottom: 24, paddingBottom: 2 }}>
                <button 
                    onClick={() => setActiveTab('new')}
                    style={{ 
                        background: 'none', border: 'none', padding: '12px 4px', cursor: 'pointer',
                        color: activeTab === 'new' ? 'var(--primary)' : 'var(--text-muted)',
                        fontWeight: 700, fontSize: 15, position: 'relative',
                        transition: 'all 0.2s'
                    }}
                >
                    New Applicants ({applicants.filter(a => a.status === 'applied').length})
                    {activeTab === 'new' && <div style={{ position: 'absolute', bottom: -2, left: 0, right: 0, height: 2, background: 'var(--primary)', borderRadius: 2 }} />}
                </button>
                <button 
                    onClick={() => setActiveTab('shortlisted')}
                    style={{ 
                        background: 'none', border: 'none', padding: '12px 4px', cursor: 'pointer',
                        color: activeTab === 'shortlisted' ? 'var(--success)' : 'var(--text-muted)',
                        fontWeight: 700, fontSize: 15, position: 'relative',
                        transition: 'all 0.2s'
                    }}
                >
                    Shortlisted ({applicants.filter(a => ['shortlisted', 'interview', 'selected'].includes(a.status?.toLowerCase())).length})
                    {activeTab === 'shortlisted' && <div style={{ position: 'absolute', bottom: -2, left: 0, right: 0, height: 2, background: 'var(--success)', borderRadius: 2 }} />}
                </button>
                <button 
                    onClick={() => setActiveTab('rejected')}
                    style={{ 
                        background: 'none', border: 'none', padding: '12px 4px', cursor: 'pointer',
                        color: activeTab === 'rejected' ? 'var(--danger)' : 'var(--text-muted)',
                        fontWeight: 700, fontSize: 15, position: 'relative',
                        transition: 'all 0.2s'
                    }}
                >
                    Rejected ({applicants.filter(a => a.status === 'rejected').length})
                    {activeTab === 'rejected' && <div style={{ position: 'absolute', bottom: -2, left: 0, right: 0, height: 2, background: 'var(--danger)', borderRadius: 2 }} />}
                </button>
            </div>

            {filteredApplicants.length === 0 ? (
                <div className="empty-state glass-card">
                    <Users size={48} color="var(--text-muted)" />
                    <h3>No {activeTab} applicants</h3>
                    <p>When candidates match this filter, they will appear here.</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 20 }}>
                    {filteredApplicants.map((a, idx) => {
                        const u = a.user || {};
                        const userName = u.name || `Applicant ${idx + 1}`;
                        const userEmail = u.email || 'No email';
                        const userId = u._id || String(a.user);
                        const scoreSummary = getScoreSummary(a.interviews);
                        const existingOffer = offers[userId];

                        return (
                            <div key={userId} className="glass-card applicant-card" style={{ padding: 24, border: '1px solid var(--border)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 20 }}>
                                    <div style={{ display: 'flex', gap: 16 }}>
                                        <div className="avatar" style={{ width: 56, height: 56, borderRadius: 16, background: 'var(--gradient-1)', fontSize: 24, fontWeight: 800, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            {userName.charAt(0)}
                                        </div>
                                        <div>
                                            <h3 style={{ fontSize: 18, marginBottom: 4 }}>
                                                {userName}
                                                <span style={{ marginLeft: 10, fontSize: 12, padding: '2px 8px', borderRadius: 20, background: 'rgba(99,102,241,0.1)', color: 'var(--primary)', fontWeight: 700 }}>
                                                    {a.aiMatchScore}% Match
                                                </span>
                                                {scoreSummary && (
                                                    <span style={{ marginLeft: 8, fontSize: 12, padding: '2px 8px', borderRadius: 20, background: 'rgba(245,158,11,0.1)', color: '#f59e0b', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                                                        <Star size={11} fill="currentColor" /> {scoreSummary.total}/{scoreSummary.outOf} (avg {scoreSummary.avg}/10)
                                                    </span>
                                                )}
                                            </h3>
                                            <div style={{ display: 'flex', gap: 12, alignItems: 'center', color: 'var(--text-muted)', fontSize: 14 }}>
                                                <span className="flex items-center gap-1"><Mail size={14} /> {userEmail}</span>
                                                <span className="flex items-center gap-1"><Clock size={14} /> Applied {new Date(a.appliedAt).toLocaleDateString()}</span>
                                            </div>
                                            <div style={{ marginTop: 12, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                                <span className={`status-badge ${a.status}`}>{a.status}</span>
                                                {existingOffer && (
                                                    <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 20, fontWeight: 700, background: existingOffer.status === 'accepted' ? 'rgba(16,185,129,0.15)' : existingOffer.status === 'rejected' ? 'rgba(239,68,68,0.15)' : 'rgba(245,158,11,0.15)', color: existingOffer.status === 'accepted' ? '#10b981' : existingOffer.status === 'rejected' ? '#ef4444' : '#f59e0b', border: `1px solid ${existingOffer.status === 'accepted' ? 'rgba(16,185,129,0.3)' : existingOffer.status === 'rejected' ? 'rgba(239,68,68,0.3)' : 'rgba(245,158,11,0.3)'}` }}>
                                                        Offer: {existingOffer.status}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                                        <Link to={`/hr/candidates/${userId}`} className="btn btn-outline btn-sm shadow-glow" title="View Profile">
                                            <User size={14} /> Profile
                                        </Link>

                                        {a.status?.toLowerCase() === 'applied' && (
                                            <button className="btn btn-secondary btn-sm shadow-glow" onClick={() => handleStatusUpdate(userId, 'shortlisted')}>Shortlist</button>
                                        )}

                                        {(a.status?.toLowerCase() === 'shortlisted' || a.status?.toLowerCase() === 'interview') && (
                                            <button className="btn btn-primary btn-sm shadow-glow" onClick={() => setSelectedApplicant(a)} style={{ background: 'var(--primary)', borderColor: 'var(--primary)', color: 'white' }}>
                                                <Calendar size={14} /> {a.status?.toLowerCase() === 'interview' ? 'New Round' : 'Schedule Interview'}
                                            </button>
                                        )}

                                        {a.status?.toLowerCase() === 'interview' && (
                                            <button className="btn btn-success btn-sm shadow-glow" onClick={() => handleStatusUpdate(userId, 'selected')} style={{ background: '#10b981', borderColor: '#10b981', color: 'white' }}>
                                                <CheckCircle size={14} /> Select
                                            </button>
                                        )}

                                        {a.status?.toLowerCase() === 'selected' && (
                                            <button
                                                className="btn btn-sm"
                                                onClick={() => setOfferModal({ userId, name: userName, existingOffer })}
                                                style={{ background: 'linear-gradient(135deg,#10b981,#065f46)', color: 'white', border: 'none' }}
                                            >
                                                <Send size={14} /> {existingOffer ? 'Update Offer' : 'Send Offer Letter'}
                                            </button>
                                        )}

                                        {existingOffer?.status === 'accepted' && (
                                            <button
                                                className="btn btn-sm"
                                                style={{ background: 'linear-gradient(135deg,#6366f1,#4f46e5)', color: 'white', border: 'none' }}
                                                onClick={() => {
                                                    const params = new URLSearchParams({
                                                        name: userName,
                                                        email: userEmail,
                                                    });
                                                    window.open(`http://localhost:3003/add-user?${params.toString()}`, '_blank');
                                                }}
                                            >
                                                🏢 Open HRMS
                                            </button>
                                        )}

                                        {a.status?.toLowerCase() !== 'rejected' && (
                                            <button className="btn btn-danger btn-sm" onClick={() => handleStatusUpdate(userId, 'rejected')}>Reject</button>
                                        )}
                                    </div>
                                </div>

                                <div style={{ marginTop: 24, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
                                    {/* Cover Letter */}
                                    <div style={{ padding: 16, background: 'rgba(255,255,255,0.02)', borderRadius: 12, border: '1px solid var(--border)' }}>
                                        <h4 style={{ fontSize: 13, textTransform: 'uppercase', letterSpacing: 1, color: 'var(--text-muted)', marginBottom: 12, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 6 }}>
                                            <FileText size={14} /> Cover Letter
                                        </h4>
                                        {a.coverLetterUrl ? (
                                            <a href={a.coverLetterUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-primary hover:underline underline-offset-4" style={{ fontSize: 14, fontWeight: 600 }}>
                                                View PDF <ExternalLink size={14} />
                                            </a>
                                        ) : a.coverLetter ? (
                                            <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{a.coverLetter}</p>
                                        ) : (
                                            <p style={{ fontSize: 13, color: 'var(--text-muted)', fontStyle: 'italic' }}>No cover letter provided.</p>
                                        )}
                                    </div>

                                    {/* Interview Rounds with Scoring */}
                                    <div style={{ padding: 16, background: 'rgba(99,102,241,0.04)', borderRadius: 12, border: '1px solid rgba(99,102,241,0.2)' }}>
                                        <div className="flex justify-between items-start mb-4">
                                            <h4 style={{ fontSize: 13, textTransform: 'uppercase', letterSpacing: 1, color: 'var(--primary)', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 6 }}>
                                                <Calendar size={14} /> Interview Rounds {a.interviews?.length > 0 ? `(${a.interviews.length})` : ''}
                                            </h4>
                                            {scoreSummary && (
                                                <div style={{ fontSize: 11, background: 'rgba(245,158,11,0.1)', color: '#f59e0b', padding: '3px 8px', borderRadius: 6, fontWeight: 700 }}>
                                                    Total: {scoreSummary.total}/{scoreSummary.outOf}
                                                </div>
                                            )}
                                        </div>

                                        {a.interviews && a.interviews.length > 0 ? (
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                                {a.interviews.map((iv, i) => {
                                                    const scoreKey = `${userId}-${i}`;
                                                    const editVal = scoreEdits[scoreKey] !== undefined ? scoreEdits[scoreKey] : (iv.score !== null && iv.score !== undefined ? String(iv.score) : '');
                                                    return (
                                                        <div key={i} style={{ paddingBottom: i < a.interviews.length - 1 ? 12 : 0, borderBottom: i < a.interviews.length - 1 ? '1px dashed rgba(99,102,241,0.2)' : 'none' }}>
                                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: 10, marginBottom: 8 }}>
                                                                <div>
                                                                    <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Round {i + 1}</div>
                                                                    <div style={{ fontWeight: 700, fontSize: 14 }}>{iv.round}</div>
                                                                </div>
                                                                <div>
                                                                    <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Scheduled</div>
                                                                    <div style={{ fontWeight: 700, fontSize: 13 }}>{new Date(iv.scheduledAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</div>
                                                                </div>
                                                            </div>

                                                            {/* Score Input */}
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
                                                                <Star size={13} style={{ color: '#f59e0b', flexShrink: 0 }} />
                                                                <span style={{ fontSize: 12, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>Score /10:</span>
                                                                <input
                                                                    type="number"
                                                                    min="0"
                                                                    max="10"
                                                                    step="0.5"
                                                                    placeholder="–"
                                                                    value={editVal}
                                                                    onChange={e => setScoreEdits(prev => ({ ...prev, [scoreKey]: e.target.value }))}
                                                                    style={{ width: 64, padding: '3px 8px', borderRadius: 8, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.15)', color: 'var(--text-primary)', fontSize: 13, textAlign: 'center' }}
                                                                />
                                                                <button
                                                                    onClick={() => handleScoreSave(userId, i, editVal)}
                                                                    className="btn btn-sm"
                                                                    style={{ padding: '3px 12px', fontSize: 12, background: 'rgba(245,158,11,0.15)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.3)', borderRadius: 8 }}
                                                                >
                                                                    Save
                                                                </button>
                                                                {iv.score !== null && iv.score !== undefined && (
                                                                    <span style={{ fontSize: 12, fontWeight: 700, color: '#f59e0b' }}>{iv.score}/10 ✓</span>
                                                                )}
                                                            </div>

                                                            {iv.zoomJoinUrl ? (
                                                                <div style={{ marginTop: 6 }}>
                                                                    <a href={iv.zoomJoinUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-primary hover:underline" style={{ fontSize: 12, fontWeight: 600 }}>
                                                                        Join Meeting <ExternalLink size={12} />
                                                                    </a>
                                                                </div>
                                                            ) : (
                                                                <div style={{ marginTop: 6, fontSize: 11, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                                                                    <Clock size={12} /> Zoom link sent 15 mins before
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        ) : (
                                            <div style={{ textAlign: 'center' }}>
                                                <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>No rounds scheduled yet.</p>
                                                <button className="btn btn-primary btn-sm mt-3" onClick={() => setSelectedApplicant(a)}>Schedule Round 1</button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Schedule Interview Modal */}
            {selectedApplicant && (
                <div className="modal-overlay" onClick={() => setSelectedApplicant(null)}>
                    <div className="modal-content glass-card animate-scale-in" onClick={e => e.stopPropagation()} style={{ maxWidth: 500 }}>
                        <h2 className="mb-2">Schedule Interview Round</h2>
                        <p className="mb-6 text-muted">For <strong>{selectedApplicant.user?.name || 'Candidate'}</strong></p>

                        <form onSubmit={handleSchedule}>
                            <div className="form-group mb-4">
                                <label className="form-label">Round Title</label>
                                <input className="form-input" value={interviewForm.round} onChange={e => setInterviewForm({...interviewForm, round: e.target.value})} placeholder="e.g. Technical Round 1" required />
                            </div>
                            <div className="form-group mb-4">
                                <label className="form-label">Date &amp; Time</label>
                                <input type="datetime-local" className="form-input" value={interviewForm.scheduledAt} onChange={e => setInterviewForm({...interviewForm, scheduledAt: e.target.value})} required />
                            </div>
                            <div className="form-group mb-4">
                                <label className="form-label">Duration (Minutes)</label>
                                <select className="form-input" value={interviewForm.durationMinutes} onChange={e => setInterviewForm({...interviewForm, durationMinutes: Number(e.target.value)})}>
                                    <option value={30}>30 Minutes</option>
                                    <option value={45}>45 Minutes</option>
                                    <option value={60}>60 Minutes</option>
                                    <option value={90}>90 Minutes</option>
                                </select>
                            </div>
                            <div className="form-group mb-6">
                                <label className="form-label">Notes (Optional)</label>
                                <textarea className="form-input" rows={3} value={interviewForm.notes} onChange={e => setInterviewForm({...interviewForm, notes: e.target.value})} placeholder="Shared with candidate..." />
                            </div>

                            <div className="flex gap-4">
                                <button type="button" className="btn btn-outline flex-1" onClick={() => setSelectedApplicant(null)}>Cancel</button>
                                <button type="submit" className="btn btn-primary flex-1 shadow-glow">Create Meeting</button>
                            </div>
                            <p className="text-center mt-4 text-xs text-muted">Zoom link sent to candidate 15 min before start</p>
                        </form>
                    </div>
                </div>
            )}

            {/* Offer Letter Modal */}
            {offerModal && (
                <div className="modal-overlay" onClick={() => setOfferModal(null)}>
                    <div className="modal-content glass-card animate-scale-in" onClick={e => e.stopPropagation()} style={{ maxWidth: 520 }}>
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>
                                    {offerModal.existingOffer ? 'Update Offer Letter' : 'Send Offer Letter'}
                                </h2>
                                <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>To: <strong>{offerModal.name}</strong></p>
                            </div>
                            <button onClick={() => setOfferModal(null)} className="btn btn-ghost" style={{ padding: 8 }}><X size={20} /></button>
                        </div>

                        {offerModal.existingOffer && (
                            <div style={{ marginBottom: 16, padding: '10px 14px', borderRadius: 10, background: offerModal.existingOffer.status === 'accepted' ? 'rgba(16,185,129,0.08)' : offerModal.existingOffer.status === 'rejected' ? 'rgba(239,68,68,0.08)' : 'rgba(245,158,11,0.08)', border: `1px solid ${offerModal.existingOffer.status === 'accepted' ? 'rgba(16,185,129,0.2)' : offerModal.existingOffer.status === 'rejected' ? 'rgba(239,68,68,0.2)' : 'rgba(245,158,11,0.2)'}`, fontSize: 13 }}>
                                Current status: <strong>{offerModal.existingOffer.status}</strong>
                                {offerModal.existingOffer.pdfUrl && (
                                    <a href={offerModal.existingOffer.pdfUrl} target="_blank" rel="noreferrer" className="ml-3 text-primary underline" style={{ fontSize: 12 }}>View current PDF</a>
                                )}
                            </div>
                        )}

                        <form onSubmit={handleSendOffer}>
                            <div className="form-group mb-4">
                                <label className="form-label">Offer Letter PDF *</label>
                                <div
                                    style={{ padding: '16px 20px', borderRadius: 12, border: '2px dashed rgba(99,102,241,0.3)', background: 'rgba(99,102,241,0.04)', cursor: 'pointer', textAlign: 'center' }}
                                    onClick={() => document.getElementById('offerPdfInput').click()}
                                >
                                    {offerForm.pdfFile ? (
                                        <div className="flex items-center justify-center gap-2" style={{ color: 'var(--primary)', fontWeight: 600, fontSize: 14 }}>
                                            <FileText size={16} /> {offerForm.pdfFile.name}
                                        </div>
                                    ) : (
                                        <div style={{ color: 'var(--text-muted)', fontSize: 14 }}>
                                            <Upload size={20} style={{ margin: '0 auto 8px' }} />
                                            Click to upload PDF
                                        </div>
                                    )}
                                    <input
                                        id="offerPdfInput"
                                        type="file"
                                        accept=".pdf"
                                        style={{ display: 'none' }}
                                        onChange={e => setOfferForm(f => ({ ...f, pdfFile: e.target.files[0] }))}
                                    />
                                </div>
                            </div>

                            <div className="form-group mb-6">
                                <label className="form-label">Message to Candidate (Optional)</label>
                                <textarea
                                    className="form-input"
                                    rows={4}
                                    placeholder="Dear candidate, we are pleased to offer you..."
                                    value={offerForm.message}
                                    onChange={e => setOfferForm(f => ({ ...f, message: e.target.value }))}
                                />
                            </div>

                            <div className="flex gap-4">
                                <button type="button" className="btn btn-outline flex-1" onClick={() => setOfferModal(null)}>Cancel</button>
                                <button type="submit" className="btn btn-primary flex-1 shadow-glow" disabled={offerLoading}>
                                    {offerLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Send size={16} /> Send Offer</>}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <style>{`
                .applicant-card:hover { border-color: rgba(99,102,241,0.3) !important; background: rgba(255,255,255,0.03); }
                .status-badge { padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; }
                .status-badge.applied { background: rgba(59,130,246,0.1); color: #3b82f6; border: 1px solid rgba(59,130,246,0.2); }
                .status-badge.shortlisted { background: rgba(16,185,129,0.1); color: #10b981; border: 1px solid rgba(16,185,129,0.2); }
                .status-badge.interview { background: rgba(139,92,246,0.1); color: #8b5cf6; border: 1px solid rgba(139,92,246,0.2); }
                .status-badge.selected { background: rgba(16,185,129,0.1); color: #10b981; border: 1px solid rgba(16,185,129,0.2); }
                .status-badge.rejected { background: rgba(239,68,68,0.1); color: #ef4444; border: 1px solid rgba(239,68,68,0.2); }
                .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.8); backdrop-filter: blur(8px); display: flex; align-items: center; justify-content: center; z-index: 2000; padding: 20px; }
                .modal-content { width: 100%; max-width: 500px; padding: 32px; border: 1px solid var(--border); }
                @keyframes scaleIn { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
                .animate-scale-in { animation: scaleIn 0.3s cubic-bezier(0.1, 0, 0.1, 1); }
            `}</style>
        </div>
    );
}
