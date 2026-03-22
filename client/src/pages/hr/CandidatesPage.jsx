import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCandidatesAPI, getJobByIdAPI, updateApplicantStatusAPI } from '../../api/axiosClient';
import { Brain, User, ChevronDown, Award, Mail, Sparkles, Target, ExternalLink, CheckCircle, XCircle, FileText } from 'lucide-react';
import toast from 'react-hot-toast';

export default function CandidatesPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [job, setJob] = useState(null);
    const [candidates, setCandidates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expanded, setExpanded] = useState(null);
    const [updatingUserId, setUpdatingUserId] = useState(null);

    useEffect(() => {
        if (!id) return;
        Promise.all([getJobByIdAPI(id), getCandidatesAPI(id)])
            .then(([jobRes, candRes]) => { 
                setJob(jobRes.data); 
                setCandidates(candRes.data || []); 
            })
            .catch(() => toast.error('Failed to load candidates'))
            .finally(() => setLoading(false));
    }, [id]);

    const setStatus = async (userId, status, score = 0) => {
        setUpdatingUserId(userId);
        try {
            await updateApplicantStatusAPI(id, userId, { status, aiMatchScore: score });
            toast.success(status === 'shortlisted' ? 'Candidate shortlisted' : 'Candidate rejected');
            // Move them out of AI list once actioned, so they show up in Shortlisted/Rejected pages.
            setCandidates((prev) => prev.filter((c) => c.user?._id !== userId));
            setExpanded(null);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Update failed');
        } finally {
            setUpdatingUserId(null);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-bg-dark p-6 lg:p-10">
                <div className="max-w-7xl mx-auto space-y-6 animate-pulse">
                    <div className="h-16 w-1/3 bg-white/5 rounded-2xl mb-12" />
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="h-28 bg-white/5 border border-white/10 rounded-[28px]" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-bg-dark p-6 lg:p-10 animate-fade-in relative overflow-hidden">
            {/* Background Decor */}
            <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-primary/10 blur-[120px] rounded-full pointer-events-none" />

            <div className="max-w-7xl mx-auto relative z-10">
                <div className="mb-12 flex items-center gap-5">
                    <div className="w-16 h-16 rounded-[24px] bg-linear-to-br from-primary to-secondary flex items-center justify-center text-white shadow-xl shadow-primary/20 shrink-0">
                        <Brain size={32} />
                    </div>
                    <div>
                        <h1 className="text-3xl lg:text-4xl font-display font-black text-text-primary uppercase tracking-tight">AI Matchboard</h1>
                        <p className="text-text-secondary text-lg mt-1 font-medium">
                            Analyzing <span className="text-primary-light font-black">{candidates.length}</span> top candidates for <span className="text-text-primary font-bold">"{job?.title}"</span>
                        </p>
                    </div>
                </div>

                {candidates.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-20 bg-bg-card/40 backdrop-blur-xl border border-white/10 rounded-[40px] text-center">
                        <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center text-text-muted mb-6 border border-white/10">
                            <User size={40} />
                        </div>
                        <h3 className="text-2xl font-display font-black text-text-primary mb-3">No Candidates Yet</h3>
                        <p className="text-text-secondary max-w-sm">Applications will be automatically ranked by our AI engine as they arrive. Check back shortly!</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {candidates.map((c, i) => {
                            const isExpanded = expanded === i;
                            const score = Math.round(c.matchScore || 0);
                            const scoreColorClass = score >= 80 ? 'text-success' : score >= 50 ? 'text-warning' : 'text-danger';
                            const scoreBgClass = score >= 80 ? 'bg-success/10' : score >= 50 ? 'bg-warning/10' : 'bg-danger/10';
                            const scoreBorderClass = score >= 80 ? 'border-success/20' : score >= 50 ? 'border-warning/20' : 'border-danger/20';
                            
                            return (
                                <div 
                                    key={i} 
                                    className={`group bg-bg-card/40 backdrop-blur-xl border transition-all duration-300 rounded-[28px] overflow-hidden ${
                                        isExpanded ? 'border-primary/50 shadow-2xl shadow-primary/10' : 'border-white/10 hover:border-white/20'
                                    }`}
                                >
                                    {/* Main Header Row */}
                                    <div 
                                        className="p-6 lg:p-8 flex items-center gap-6 cursor-pointer select-none"
                                        onClick={() => setExpanded(isExpanded ? null : i)}
                                    >
                                        <div className="relative shrink-0">
                                            <div className="w-16 h-16 rounded-[20px] bg-linear-to-br from-primary/20 to-secondary/20 border border-white/10 flex items-center justify-center text-white font-black text-2xl">
                                                {c.user?.name?.charAt(0) || 'U'}
                                            </div>
                                            <div className={`absolute -top-2 -left-2 w-7 h-7 rounded-lg border-2 border-bg-dark flex items-center justify-center text-[10px] font-black text-white ${
                                                i < 3 ? 'bg-linear-to-br from-primary to-secondary shadow-lg shadow-primary/30' : 'bg-bg-elevated'
                                            }`}>
                                                #{i + 1}
                                            </div>
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="text-xl font-display font-black text-text-primary truncate">{c.user?.name}</h3>
                                                {score >= 80 && <Sparkles size={16} className="text-amber-400 animate-pulse shrink-0" />}
                                            </div>
                                            <div className="flex items-center gap-2 text-text-secondary text-sm font-medium">
                                                <Award size={14} className="text-secondary" /> 
                                                <span className="truncate">{c.profile?.headline || 'Professional Profile'}</span>
                                            </div>
                                        </div>

                                        <div className="hidden sm:flex items-center gap-4 text-right">
                                            <div>
                                                <div className={`text-3xl font-black font-display leading-none ${scoreColorClass}`}>{score}%</div>
                                                <div className="text-[10px] font-black uppercase tracking-widest text-text-muted mt-1">AI Match</div>
                                            </div>
                                            <div className={`w-12 h-12 rounded-full border-4 flex items-center justify-center ${scoreBorderClass} ${scoreColorClass} border-t-current -rotate-45 shrink-0`}>
                                                <Target size={20} className="rotate-45" />
                                            </div>
                                        </div>

                                        <ChevronDown size={24} className={`text-text-muted transition-transform duration-400 ${isExpanded ? 'rotate-180' : ''}`} />
                                    </div>

                                    {/* Match Progress Bar */}
                                    <div className="h-1 bg-white/5 relative">
                                        <div 
                                            className="h-full bg-linear-to-r from-primary to-secondary transition-all duration-1000 ease-out"
                                            style={{ width: `${score}%` }}
                                        />
                                    </div>

                                    {/* Expandable Details */}
                                    {isExpanded && (
                                        <div className="p-8 lg:p-10 bg-white/[0.01] animate-fade-in border-t border-white/5">
                                            {/* AI Recommendation Header */}
                                            <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-xs font-black uppercase tracking-wider mb-8 ${scoreBgClass} ${scoreColorClass} ${scoreBorderClass}`}>
                                                <Brain size={14} /> 
                                                <span>Recommendation: <span className="font-black underline underline-offset-2">{c.recommendation}</span></span>
                                            </div>

                                            <div className="relative mb-10 pl-8 before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1 before:bg-linear-to-b before:from-primary before:to-secondary before:rounded-full">
                                                <p className="text-lg text-text-secondary leading-relaxed font-medium italic">
                                                    "{c.reason}"
                                                </p>
                                            </div>

                                            {/* Cover Letter Section */}
                                            <div className="mb-10 p-6 bg-white/5 border border-white/10 rounded-2xl">
                                                <h4 className="text-xs font-black uppercase tracking-widest text-primary-light mb-4 flex items-center gap-2">
                                                    <FileText size={14} /> Applicant Details
                                                </h4>
                                                {c.coverLetter ? (
                                                    <div className="text-sm text-text-secondary leading-relaxed whitespace-pre-wrap">
                                                        {c.coverLetter}
                                                    </div>
                                                ) : (
                                                    <div className="text-sm text-text-muted italic">No cover letter provided.</div>
                                                )}
                                                {c.coverLetterUrl && (
                                                    <a 
                                                        href={c.coverLetterUrl} 
                                                        target="_blank" 
                                                        rel="noreferrer" 
                                                        className="mt-4 inline-flex items-center gap-2 text-primary hover:text-primary-light text-sm font-bold transition-colors"
                                                    >
                                                        <ExternalLink size={14} /> View Attached Document
                                                    </a>
                                                )}
                                            </div>

                                            {/* AI Match Analysis */}
                                            {c.matchedAspects && c.matchedAspects.length > 0 && (
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                                                    {c.matchedAspects.map((aspect, idx) => (
                                                        <div key={idx} className="p-5 bg-white/5 border border-white/10 rounded-2xl group/aspect hover:bg-white/[0.08] transition-colors">
                                                            <h4 className="text-xs font-black uppercase tracking-widest text-primary-light mb-2">{aspect.title}</h4>
                                                            <p className="text-sm text-text-secondary leading-normal">{aspect.content}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                                <div>
                                                    <h4 className="text-xs font-black uppercase tracking-widest text-success mb-4 flex items-center gap-2">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-success" /> Key Matches
                                                    </h4>
                                                    <div className="flex flex-wrap gap-2">
                                                        {(c.matchedSkills || []).map(s => (
                                                            <span key={s} className="px-3 py-1.5 bg-success/10 text-success border border-success/20 rounded-xl text-xs font-bold">
                                                                {s}
                                                            </span>
                                                        ))}
                                                        {(!c.matchedSkills || c.matchedSkills.length === 0) && <span className="text-xs text-text-muted font-medium italic">High potential overlap detected</span>}
                                                    </div>
                                                </div>
                                                <div>
                                                    <h4 className="text-xs font-black uppercase tracking-widest text-danger mb-4 flex items-center gap-2">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-danger" /> Skill Gaps
                                                    </h4>
                                                    <div className="flex flex-wrap gap-2">
                                                        {(c.missingSkills || []).map(s => (
                                                            <span key={s} className="px-3 py-1.5 bg-danger/10 text-danger border border-danger/20 rounded-xl text-xs font-bold">
                                                                {s}
                                                            </span>
                                                        ))}
                                                        {(!c.missingSkills || c.missingSkills.length === 0) && <span className="text-xs text-text-muted font-medium italic">Exceptional skill coverage</span>}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Action Footer */}
                                            <div className="mt-12 pt-8 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-6">
                                                <div className="flex items-center gap-3 text-text-muted font-bold text-sm">
                                                    <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center"><Mail size={14} /></div>
                                                    {c.user?.email}
                                                </div>
                                                
                                                <div className="w-full sm:w-auto flex flex-wrap justify-center sm:justify-end gap-3">
                                                    <button
                                                        className="px-6 py-2.5 border border-white/10 hover:bg-danger/10 hover:border-danger/30 text-text-secondary hover:text-danger rounded-xl font-bold text-sm transition-all flex items-center gap-2 disabled:opacity-50"
                                                        disabled={updatingUserId === c.user?._id}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setStatus(c.user._id, 'rejected', Math.round(c.matchScore || 0));
                                                        }}
                                                    >
                                                        <XCircle size={16} /> Reject
                                                    </button>
                                                    
                                                    <button
                                                        className="px-6 py-2.5 border border-white/10 hover:bg-success/10 hover:border-success/30 text-text-secondary hover:text-success rounded-xl font-bold text-sm transition-all flex items-center gap-2 disabled:opacity-50"
                                                        disabled={updatingUserId === c.user?._id}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setStatus(c.user._id, 'shortlisted', Math.round(c.matchScore || 0));
                                                        }}
                                                    >
                                                        <CheckCircle size={16} /> Shortlist
                                                    </button>

                                                    <button 
                                                        className="px-6 py-2.5 bg-linear-to-r from-primary to-primary-dark text-white rounded-xl font-bold text-sm shadow-lg shadow-primary/25 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            navigate(`/hr/candidates/${c.user._id}`);
                                                        }}
                                                    >
                                                        Full Profile <ExternalLink size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
