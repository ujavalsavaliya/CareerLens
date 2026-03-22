import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { getMyProfileAPI, updateMyProfileAPI, uploadResumeAPI, uploadCertificateAPI, uploadBannerAPI } from '../../api/axiosClient';
import { useSelector, useDispatch } from 'react-redux';
import { updateUserName } from '../../app/slices/authSlice';
import { User, Briefcase, GraduationCap, Upload, X, Plus, FileText, Award, Link as LinkIcon, Save, ChevronRight, Globe, Github, Linkedin, Sparkles, Brain, CheckCircle, Camera, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';
import AvatarUpload from '../../components/AvatarUpload';

export default function ProfilePage() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { user } = useSelector(s => s.auth);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [bannerUploading, setBannerUploading] = useState(false);
    const [tab, setTab] = useState('basic');
    const [form, setForm] = useState({});
    const [skillInput, setSkillInput] = useState('');

    useEffect(() => {
        getMyProfileAPI().then(r => {
            setProfile(r.data);
            setForm({ ...r.data, name: user?.name || '' });
        }).catch(() => toast.error('Failed to load profile'))
            .finally(() => setLoading(false));
    }, [user?.name]);

    const handleSave = async () => {
        setSaving(true);
        try {
            const r = await updateMyProfileAPI(form);
            setProfile(r.data);
            if (form.name) dispatch(updateUserName(form.name));
            toast.success('Profile updated!');
        } catch { toast.error('Save failed'); }
        finally { setSaving(false); }
    };

    const onResumeDrop = useCallback(async (files) => {
        const file = files[0];
        if (!file) return;
        setUploading(true);
        const fd = new FormData();
        fd.append('resume', file);
        try {
            const r = await uploadResumeAPI(fd);
            setProfile(r.data.profile);
            setForm(f => ({ ...f, resume: r.data.profile.resume, aiAnalysis: r.data.profile.aiAnalysis, skills: r.data.profile.skills }));
            toast.success('Resume uploaded & analyzed!');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Upload failed');
        } finally { setUploading(false); }
    }, []);

    const { getRootProps: getResumeProps, getInputProps: getResumeInputProps, isDragActive } = useDropzone({
        onDrop: onResumeDrop,
        accept: {
            'application/pdf': ['.pdf'],
            'application/msword': ['.doc'],
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
            'image/jpeg': ['.jpg', '.jpeg']
        },
        maxFiles: 1
    });

    const addSkill = () => {
        const s = skillInput.trim();
        if (!s) return;
        const existing = form.skills || [];
        if (!existing.includes(s)) setForm(f => ({ ...f, skills: [...existing, s] }));
        setSkillInput('');
    };

    const removeSkill = (s) => setForm(f => ({ ...f, skills: f.skills.filter(x => x !== s) }));

    const updateExp = (i, key, val) => {
        const exp = [...(form.experience || [])];
        exp[i] = { ...exp[i], [key]: val };
        setForm(f => ({ ...f, experience: exp }));
    };

    const addExp = () => setForm(f => ({ ...f, experience: [...(f.experience || []), { title: '', company: '', description: '', current: false }] }));
    const removeExp = (i) => setForm(f => ({ ...f, experience: f.experience.filter((_, idx) => idx !== i) }));

    const addEdu = () => setForm(f => ({ ...f, education: [...(f.education || []), { degree: '', fieldOfStudy: '', institution: '', endYear: '' }] }));
    const removeEdu = (i) => setForm(f => ({ ...f, education: f.education.filter((_, idx) => idx !== i) }));
    const updateEdu = (i, key, val) => {
        const edu = [...(form.education || [])];
        edu[i] = { ...edu[i], [key]: val };
        setForm(f => ({ ...f, education: edu }));
    };

    if (loading) return (
        <div className="min-h-[60vh] bg-bg-dark flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
        </div>
    );

    const tabs = [
        { id: 'basic', label: 'Basic Info', icon: User },
        { id: 'experience', label: 'Experience', icon: Briefcase },
        { id: 'education', label: 'Education', icon: GraduationCap },
        { id: 'resume', label: 'Resume', icon: FileText },
        { id: 'links', label: 'Social', icon: LinkIcon },
    ];

    const handleBannerUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        setBannerUploading(true);
        const fd = new FormData();
        fd.append('banner', file);
        
        try {
            const r = await uploadBannerAPI(fd);
            setProfile(prev => ({ ...prev, user: { ...prev.user, banner: r.data.banner } }));
            toast.success('Banner updated!');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Banner upload failed');
        } finally {
            setBannerUploading(false);
        }
    };

    return (
        <div className="min-h-screen bg-bg-dark p-4 lg:p-6 animate-fade-in relative overflow-hidden">
            {/* Background Decor */}
            <div className="absolute top-0 left-0 w-[400px] h-[400px] bg-primary/5 blur-[100px] rounded-full pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-secondary/5 blur-[100px] rounded-full pointer-events-none" />

            <div className="max-w-4xl mx-auto relative z-10">
                {/* Header Profile Card with Banner */}
                <div className="bg-bg-card/40 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden mb-6 shadow-xl group/banner">
                    {/* Banner section */}
                    <div className="h-28 md:h-36 w-full relative bg-linear-to-r from-primary/40 to-secondary/40 bg-cover bg-center overflow-hidden" 
                         style={{ backgroundImage: profile?.user?.banner?.url ? `url(${profile.user.banner.url})` : undefined }}>
                        
                        {bannerUploading && (
                            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-20">
                                <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                            </div>
                        )}

                        <label className="absolute inset-0 bg-black/0 hover:bg-black/40 flex flex-col items-center justify-center cursor-pointer transition-all opacity-0 group-hover/banner:opacity-100 z-10">
                            <Camera size={24} className="text-white mb-1" />
                            <span className="text-[10px] font-black text-white uppercase tracking-tighter">Change Banner</span>
                            <input type="file" className="hidden" accept="image/*" onChange={handleBannerUpload} disabled={bannerUploading} />
                        </label>
                    </div>

                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-5 relative">
                        <div className="flex items-center gap-5">
                        <AvatarUpload
                            size={80}
                            onUploadComplete={(avatar) => {
                                // Update local state if needed
                            }}
                        />
                        <div>
                            <h1 className="text-2xl font-display font-black text-text-primary leading-none">{user?.name}</h1>
                            <p className="text-text-secondary text-sm font-medium mt-1">{profile?.headline || 'Update your profile to stand out.'}</p>
                            <div className="flex gap-2 mt-2">
                                <div className="px-2 py-0.5 bg-primary/10 border border-primary/20 rounded-md text-[10px] font-bold text-primary-light uppercase tracking-wider">{user?.role === 'hr' ? 'Recruiter' : 'Job Seeker'}</div>
                                <div className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded-md text-[10px] font-bold text-emerald-400 uppercase tracking-wider">{profile?.completionPercentage}% Complete</div>
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3">
                        <button 
                            className="bg-white/5 hover:bg-white/10 text-text-primary border border-white/10 rounded-xl px-4 py-2.5 font-bold transition-all flex items-center justify-center gap-2 text-sm shrink-0"
                            onClick={() => navigate('/me')}
                        >
                            <ExternalLink size={16} /> Preview
                        </button>
                        <button 
                            className="bg-primary hover:bg-primary-light text-white rounded-xl px-5 py-2.5 font-bold shadow-md shadow-primary/20 transition-all flex items-center justify-center gap-2 text-sm shrink-0" 
                            onClick={handleSave} 
                            disabled={saving}
                        >
                            {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Save size={16} /> Save Changes</>}
                        </button>
                    </div>
                </div>
            </div>

            {/* Profile Tabs Navigation */}
                <div className="flex flex-wrap gap-2 mb-6 p-1.5 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md">
                    {tabs.map(({ id, label, icon: Icon }) => (
                        <button 
                            key={id} 
                            className={`flex-1 min-w-[100px] flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                                tab === id 
                                    ? 'bg-primary text-white shadow-md' 
                                    : 'text-text-muted hover:bg-white/5 hover:text-text-primary'
                            }`}
                            onClick={() => setTab(id)}
                        >
                            <Icon size={16} className="hidden sm:block" /> {label}
                        </button>
                    ))}
                </div>

                <div className="bg-bg-card/40 backdrop-blur-xl border border-white/10 rounded-2xl p-5 lg:p-6 shadow-xl">
                    {/* Basic Info Section */}
                    {tab === 'basic' && (
                        <div className="space-y-6 animate-fade-in">
                            {/* AI Intelligence Insight Preview */}
                            {profile?.aiAnalysis?.profileSummary && (
                                <div className="bg-linear-to-br from-success/10 to-transparent border border-success/20 rounded-xl p-5 relative overflow-hidden group">
                                    <div className="absolute top-4 right-5 text-success/10 group-hover:text-success/20 transition-colors">
                                        <Sparkles size={24} />
                                    </div>
                                    <div className="flex items-center gap-2.5 mb-2.5">
                                        <div className="p-1.5 rounded-lg bg-success/20 text-success border border-success/30">
                                            <Brain size={14} />
                                        </div>
                                        <h4 className="text-xs font-black text-success uppercase tracking-widest leading-none">AI Profile Intelligence</h4>
                                    </div>
                                    <p className="text-[13px] font-bold text-text-primary italic opacity-90 leading-relaxed">
                                        "{profile.aiAnalysis.profileSummary}"
                                    </p>
                                    <div className="mt-3 flex items-center gap-1.5 text-[10px] font-black text-success/60 uppercase tracking-tighter">
                                        <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                                        Live insight generated from your latest resume
                                    </div>
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-text-muted ml-0.5">Full Name</label>
                                    <input 
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-text-primary text-sm font-medium placeholder:text-text-muted focus:border-primary/50 focus:bg-white/10 outline-none transition-all" 
                                        placeholder="Enter your full name" 
                                        value={form.name || ''} 
                                        onChange={e => setForm(f => ({ ...f, name: e.target.value }))} 
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-text-muted ml-0.5">Professional Headline</label>
                                    <input 
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-text-primary text-sm font-medium placeholder:text-text-muted focus:border-primary/50 focus:bg-white/10 outline-none transition-all" 
                                        placeholder="e.g. Senior Frontend Developer" 
                                        value={form.headline || ''} 
                                        onChange={e => setForm(f => ({ ...f, headline: e.target.value }))} 
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-text-muted ml-0.5">Location</label>
                                <input 
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-text-primary text-sm font-medium placeholder:text-text-muted focus:border-primary/50 focus:bg-white/10 outline-none transition-all" 
                                    placeholder="e.g. San Francisco, CA" 
                                    value={form.location || ''} 
                                    onChange={e => setForm(f => ({ ...f, location: e.target.value }))} 
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-text-muted ml-0.5">Summary</label>
                                <textarea 
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-text-primary text-sm font-medium leading-relaxed placeholder:text-text-muted focus:border-primary/50 focus:bg-white/10 outline-none transition-all min-h-[100px]" 
                                    placeholder="Write a brief overview of your background and career goals..." 
                                    value={form.summary || ''} 
                                    onChange={e => setForm(f => ({ ...f, summary: e.target.value }))} 
                                />
                            </div>

                            <div className="space-y-3">
                                <label className="text-xs font-bold text-text-muted ml-0.5 flex items-center gap-1">
                                    Skills <span className="opacity-60 font-normal">(press enter to add)</span>
                                </label>
                                <div className="flex gap-2">
                                    <input 
                                        className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-text-primary text-sm font-medium placeholder:text-text-muted focus:border-primary/50 focus:bg-white/10 outline-none transition-all" 
                                        placeholder="Add skill (e.g. React.js)..." 
                                        value={skillInput} 
                                        onChange={e => setSkillInput(e.target.value)} 
                                        onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSkill())} 
                                    />
                                    <button 
                                        type="button" 
                                        className="w-10 h-10 bg-white/5 border border-white/10 rounded-xl text-text-primary flex items-center justify-center hover:bg-primary/20 hover:text-primary transition-all shrink-0" 
                                        onClick={addSkill}
                                    >
                                        <Plus size={18} />
                                    </button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {(form.skills || []).map(s => (
                                        <span key={s} className="px-3 py-1.5 bg-primary/10 border border-primary/20 rounded-lg text-xs font-bold text-primary-light flex items-center gap-1.5 group transition-all hover:bg-primary hover:text-white cursor-default">
                                            {s} 
                                            <X size={12} className="cursor-pointer opacity-60 hover:opacity-100 transition-all font-bold" onClick={() => removeSkill(s)} />
                                        </span>
                                    ))}
                                    {(!form.skills || form.skills.length === 0) && (
                                        <div className="text-xs italic text-text-muted">No skills added yet.</div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Timeline / Experience Section */}
                    {tab === 'experience' && (
                        <div className="space-y-4 animate-fade-in">
                            {(form.experience || []).map((exp, i) => (
                                <div key={i} className="group bg-white/5 border border-white/10 rounded-2xl p-5 relative overflow-hidden transition-all hover:border-white/20">
                                    <div className="absolute top-2 right-2">
                                        <button className="p-1.5 rounded-lg text-text-muted hover:bg-red-500/10 hover:text-red-400 transition-all opacity-0 group-hover:opacity-100" onClick={() => removeExp(i)} title="Remove Experience">
                                            <X size={16} />
                                        </button>
                                    </div>
                                    
                                    <div className="flex items-center gap-2 mb-4">
                                        <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                                            {i + 1}
                                        </div>
                                        <h3 className="text-sm font-bold text-text-primary">Role</h3>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-text-muted ml-0.5">Job Title</label>
                                            <input 
                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-text-primary text-sm font-medium placeholder:text-text-muted focus:border-primary/50 outline-none transition-all" 
                                                placeholder="e.g. Lead Developer" 
                                                value={exp.title || ''} 
                                                onChange={e => updateExp(i, 'title', e.target.value)} 
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-text-muted ml-0.5">Company</label>
                                            <input 
                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-text-primary text-sm font-medium placeholder:text-text-muted focus:border-primary/50 outline-none transition-all" 
                                                placeholder="e.g. Acme Corp" 
                                                value={exp.company || ''} 
                                                onChange={e => updateExp(i, 'company', e.target.value)} 
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-text-muted ml-0.5">Start Date</label>
                                            <input 
                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-text-primary text-sm font-medium appearance-none outline-none transition-all cursor-pointer invert" 
                                                type="month" 
                                                value={exp.startDate?.substring(0, 7) || ''} 
                                                onChange={e => updateExp(i, 'startDate', e.target.value)} 
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <div className="flex justify-between items-center px-0.5">
                                                <label className="text-xs font-bold text-text-muted">End Date</label>
                                                <label className="inline-flex items-center gap-1.5 cursor-pointer group/check">
                                                    <input 
                                                        type="checkbox" 
                                                        className="hidden peer"
                                                        checked={exp.current || false} 
                                                        onChange={e => updateExp(i, 'current', e.target.checked)} 
                                                    />
                                                    <div className="w-3.5 h-3.5 rounded-sm border border-white/20 peer-checked:bg-primary peer-checked:border-primary transition-all flex items-center justify-center">
                                                        <CheckCircle size={10} className="text-white opacity-0 peer-checked:opacity-100" />
                                                    </div>
                                                    <span className="text-xs font-bold text-text-muted peer-checked:text-primary-light">Current</span>
                                                </label>
                                            </div>
                                            <input 
                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-text-primary text-sm font-medium appearance-none outline-none transition-all cursor-pointer invert disabled:opacity-30 disabled:cursor-not-allowed" 
                                                type="month" 
                                                value={exp.endDate?.substring(0, 7) || ''} 
                                                onChange={e => updateExp(i, 'endDate', e.target.value)} 
                                                disabled={exp.current} 
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-text-muted ml-0.5">Description</label>
                                        <textarea 
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-text-primary text-sm font-medium leading-relaxed placeholder:text-text-muted focus:border-primary/50 outline-none transition-all min-h-[80px]" 
                                            placeholder="Describe your responsibilities and achievements..." 
                                            value={exp.description || ''} 
                                            onChange={e => updateExp(i, 'description', e.target.value)} 
                                        />
                                    </div>
                                </div>
                            ))}
                            <button 
                                className="w-full py-4 border border-dashed border-white/20 rounded-2xl text-xs font-bold text-text-muted hover:border-primary/50 hover:bg-primary/5 hover:text-primary transition-all flex items-center justify-center gap-2 group" 
                                onClick={addExp}
                            >
                                <Plus size={16} className="group-hover:rotate-90 transition-transform" /> Add Experience
                            </button>
                        </div>
                    )}

                    {/* Education Section */}
                    {tab === 'education' && (
                        <div className="space-y-4 animate-fade-in">
                            {(form.education || []).map((edu, i) => (
                                <div key={i} className="group bg-white/5 border border-white/10 rounded-2xl p-5 relative transition-all hover:border-white/20">
                                    <div className="absolute top-2 right-2">
                                        <button className="p-1.5 rounded-lg text-text-muted hover:bg-red-500/10 hover:text-red-400 transition-all opacity-0 group-hover:opacity-100" onClick={() => removeEdu(i)} title="Remove Education">
                                            <X size={16} />
                                        </button>
                                    </div>
                                    <div className="flex items-center gap-2 mb-4">
                                        <div className="w-8 h-8 rounded-lg bg-secondary/10 text-secondary flex items-center justify-center font-bold text-sm">
                                            {i + 1}
                                        </div>
                                        <h3 className="text-sm font-bold text-text-primary">Degree</h3>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-text-muted ml-0.5">Degree</label>
                                            <input 
                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-text-primary text-sm font-medium placeholder:text-text-muted focus:border-primary/50 outline-none transition-all" 
                                                placeholder="e.g. Bachelor of Science" 
                                                value={edu.degree || ''} 
                                                onChange={e => updateEdu(i, 'degree', e.target.value)} 
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-text-muted ml-0.5">Field of Study</label>
                                            <input 
                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-text-primary text-sm font-medium placeholder:text-text-muted focus:border-primary/50 outline-none transition-all" 
                                                placeholder="e.g. Computer Science" 
                                                value={edu.fieldOfStudy || ''} 
                                                onChange={e => updateEdu(i, 'fieldOfStudy', e.target.value)} 
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-text-muted ml-0.5">Institution</label>
                                            <input 
                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-text-primary text-sm font-medium placeholder:text-text-muted focus:border-primary/50 outline-none transition-all" 
                                                placeholder="e.g. Stanford University" 
                                                value={edu.institution || ''} 
                                                onChange={e => updateEdu(i, 'institution', e.target.value)} 
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-text-muted ml-0.5">Graduation Year</label>
                                            <input 
                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-text-primary text-sm font-medium placeholder:text-text-muted focus:border-primary/50 outline-none transition-all" 
                                                type="number" 
                                                placeholder="e.g. 2024" 
                                                value={edu.endYear || ''} 
                                                onChange={e => updateEdu(i, 'endYear', e.target.value)} 
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <button 
                                className="w-full py-4 border border-dashed border-white/20 rounded-2xl text-xs font-bold text-text-muted hover:border-secondary/50 hover:bg-secondary/5 hover:text-secondary transition-all flex items-center justify-center gap-2 group" 
                                onClick={addEdu}
                            >
                                <Plus size={16} className="group-hover:rotate-90 transition-transform" /> Add Education
                            </button>
                        </div>
                    )}

                    {/* Resume / Assets Section */}
                    {tab === 'resume' && (
                        <div className="space-y-6 animate-fade-in">
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 px-1">
                                    <FileText size={18} className="text-primary" />
                                    <h3 className="text-lg font-bold text-text-primary">Resume Setup</h3>
                                </div>

                                {profile?.resume?.url && (
                                    <div className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-xl p-4 group transition-all">
                                        <div className="w-10 h-10 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                                            <FileText size={20} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="text-sm font-bold text-text-primary truncate">{profile.resume.originalName || 'Resume.pdf'}</div>
                                            <div className="text-xs font-medium text-text-muted mt-0.5">
                                                Uploaded {profile.resume.uploadedAt ? new Date(profile.resume.uploadedAt).toLocaleDateString() : 'recently'}
                                            </div>
                                        </div>
                                        <div className="px-3 py-1 bg-emerald-500/10 rounded-lg text-xs font-bold text-emerald-400">Processed</div>
                                    </div>
                                )}

                                <div {...getResumeProps()} className={`relative border border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 group ${isDragActive ? 'border-primary bg-primary/5' : 'border-white/20 hover:border-primary/50 hover:bg-white/2'}`}>
                                    <input {...getResumeInputProps()} />
                                    {uploading ? (
                                        <div className="space-y-3">
                                            <div className="w-10 h-10 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto" />
                                            <div className="text-sm font-bold text-text-primary">Analyzing Resume...</div>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center text-text-muted mb-3 group-hover:text-primary transition-all">
                                                <Upload size={24} />
                                            </div>
                                            <div className="space-y-1 mb-4">
                                                <div className="text-base font-bold text-text-primary">{isDragActive ? 'Drop file here' : 'Drop your resume here, or click to browse'}</div>
                                                <p className="text-text-muted text-xs">Supports PDF, DOCX, JPG (Max 10MB)</p>
                                            </div>
                                            <div className="px-5 py-2 bg-white/5 border border-white/10 rounded-lg text-xs font-bold text-text-primary group-hover:bg-primary/20 transition-all">Select File</div>
                                        </>
                                    )}
                                </div>

                                <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 flex items-start gap-3">
                                    <Sparkles size={16} className="text-primary shrink-0 mt-0.5" />
                                    <p className="text-xs font-medium text-text-primary leading-relaxed opacity-90">
                                        Uploading your resume enables our AI features. We will extract capabilities and metrics to match you precisely with top recruiters.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Links Section */}
                    {tab === 'links' && (
                        <div className="space-y-5 animate-fade-in">
                            <div className="flex items-center gap-2 px-1 mb-2">
                                <Globe size={18} className="text-primary" />
                                <h3 className="text-lg font-bold text-text-primary">Social Presence</h3>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                {[
                                    { key: 'linkedIn', label: 'LinkedIn', icon: Linkedin, color: 'text-blue-400', placeholder: 'https://linkedin.com/in/...' },
                                    { key: 'github', label: 'GitHub', icon: Github, color: 'text-white', placeholder: 'https://github.com/...' },
                                    { key: 'portfolio', label: 'Portfolio', icon: Briefcase, color: 'text-secondary', placeholder: 'https://...' },
                                    { key: 'website', label: 'Personal Website', icon: Globe, color: 'text-primary-light', placeholder: 'https://...' },
                                ].map(({ key, label, icon: Icon, color, placeholder }) => (
                                    <div key={key} className="space-y-1.5">
                                        <label className="text-xs font-bold text-text-muted ml-0.5 flex items-center gap-1.5">
                                            <Icon size={14} className={color} /> {label}
                                        </label>
                                        <input 
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-text-primary text-sm font-medium placeholder:text-text-muted focus:border-primary/50 outline-none transition-all" 
                                            placeholder={placeholder} 
                                            value={form[key] || ''} 
                                            onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} 
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
