import { useEffect, useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { getMyProfileAPI, updateMyProfileAPI, uploadResumeAPI, uploadCertificateAPI } from '../../api/axiosClient';
import { useSelector } from 'react-redux';
import { User, Briefcase, GraduationCap, Upload, X, Plus, FileText, Award, Link as LinkIcon, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import AvatarUpload from '../../components/AvatarUpload';

export default function ProfilePage() {
    const { user } = useSelector(s => s.auth);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [tab, setTab] = useState('basic');
    const [form, setForm] = useState({});
    const [skillInput, setSkillInput] = useState('');

    useEffect(() => {
        getMyProfileAPI().then(r => {
            setProfile(r.data);
            setForm(r.data);
        }).catch(() => toast.error('Failed to load profile'))
            .finally(() => setLoading(false));
    }, []);

    const handleSave = async () => {
        setSaving(true);
        try {
            const r = await updateMyProfileAPI(form);
            setProfile(r.data);
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
            toast.success('Resume uploaded & AI analysis started! 🧠');
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

    if (loading) return <div className="page-container"><div className="skeleton" style={{ height: 400, borderRadius: 20 }} /></div>;

    const tabs = [
        { id: 'basic', label: 'Basic Info', icon: User },
        { id: 'experience', label: 'Experience', icon: Briefcase },
        { id: 'education', label: 'Education', icon: GraduationCap },
        { id: 'resume', label: 'Resume & Certs', icon: FileText },
        { id: 'links', label: 'Links', icon: LinkIcon },
    ];

    return (
        <div className="page-container animate-fade-in">
            <div className="page-header flex justify-between items-center">
                <div>
                    <h1>Edit Profile</h1>
                    <p>Keep your profile up to date to attract the right opportunities</p>
                </div>
                <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                    {saving ? <span className="btn-spinner" /> : <><Save size={16} /> Save Changes</>}
                </button>
            </div>

            {/* Profile Tabs */}
            <div className="profile-tabs mb-6">
                {tabs.map(({ id, label, icon: Icon }) => (
                    <button key={id} className={`profile-tab ${tab === id ? 'active' : ''}`} onClick={() => setTab(id)}>
                        <Icon size={15} /> {label}
                    </button>
                ))}
            </div>

            <div className="glass-card" style={{ padding: 32 }}>
                {/* Basic Info */}
                {tab === 'basic' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                        <div className="grid-2">
                            <div className="form-group">
                                <label className="form-label">Professional Headline</label>
                                <input className="form-input" placeholder="e.g. Senior React Developer" value={form.headline || ''} onChange={e => setForm(f => ({ ...f, headline: e.target.value }))} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Location</label>
                                <input className="form-input" placeholder="e.g. New York, USA" value={form.location || ''} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} />
                            </div>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Professional Summary</label>
                            <textarea className="form-input" rows={4} placeholder="Write a compelling summary about yourself..." value={form.summary || ''} onChange={e => setForm(f => ({ ...f, summary: e.target.value }))} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Skills <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(press Enter or click +)</span></label>
                            <div className="flex gap-2">
                                <input className="form-input" placeholder="Add a skill..." value={skillInput} onChange={e => setSkillInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSkill())} />
                                <button type="button" className="btn btn-primary btn-icon" onClick={addSkill}><Plus size={18} /></button>
                            </div>
                            <div className="flex flex-wrap gap-2 mt-4">
                                {(form.skills || []).map(s => (
                                    <span key={s} className="skill-chip" style={{ gap: 6 }}>
                                        {s} <X size={12} style={{ cursor: 'pointer' }} onClick={() => removeSkill(s)} />
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Experience */}
                {tab === 'experience' && (
                    <div>
                        {(form.experience || []).map((exp, i) => (
                            <div key={i} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: 12, padding: 20, marginBottom: 16 }}>
                                <div className="flex justify-between mb-4">
                                    <h4 style={{ color: 'var(--text-secondary)' }}>Position #{i + 1}</h4>
                                    <button className="btn btn-danger btn-sm" onClick={() => removeExp(i)}><X size={14} /></button>
                                </div>
                                <div className="grid-2 mb-4">
                                    <div className="form-group">
                                        <label className="form-label">Job Title</label>
                                        <input className="form-input" placeholder="e.g. Software Engineer" value={exp.title || ''} onChange={e => updateExp(i, 'title', e.target.value)} />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Company</label>
                                        <input className="form-input" placeholder="e.g. Google" value={exp.company || ''} onChange={e => updateExp(i, 'company', e.target.value)} />
                                    </div>
                                </div>
                                <div className="grid-2 mb-4">
                                    <div className="form-group">
                                        <label className="form-label">Start Date</label>
                                        <input className="form-input" type="month" value={exp.startDate?.substring(0, 7) || ''} onChange={e => updateExp(i, 'startDate', e.target.value)} />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">End Date</label>
                                        <input className="form-input" type="month" value={exp.endDate?.substring(0, 7) || ''} onChange={e => updateExp(i, 'endDate', e.target.value)} disabled={exp.current} />
                                        <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8, fontSize: 13, cursor: 'pointer' }}>
                                            <input type="checkbox" checked={exp.current || false} onChange={e => updateExp(i, 'current', e.target.checked)} /> Currently working here
                                        </label>
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Description</label>
                                    <textarea className="form-input" rows={3} placeholder="Describe your role and achievements..." value={exp.description || ''} onChange={e => updateExp(i, 'description', e.target.value)} />
                                </div>
                            </div>
                        ))}
                        <button className="btn btn-secondary" onClick={addExp}><Plus size={16} /> Add Experience</button>
                    </div>
                )}


                {/* Education */}
                {tab === 'education' && (
                    <div>
                        {(form.education || []).map((edu, i) => (
                            <div key={i} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: 12, padding: 20, marginBottom: 16 }}>
                                <div className="flex justify-between mb-4">
                                    <h4 style={{ color: 'var(--text-secondary)' }}>Education #{i + 1}</h4>
                                    <button className="btn btn-danger btn-sm" onClick={() => removeEdu(i)}><X size={14} /></button>
                                </div>
                                <div className="grid-2 mb-4">
                                    <div className="form-group">
                                        <label className="form-label">Degree</label>
                                        <input className="form-input" placeholder="e.g. B.Tech, MBA" value={edu.degree || ''} onChange={e => updateEdu(i, 'degree', e.target.value)} />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Field of Study</label>
                                        <input className="form-input" placeholder="e.g. Computer Science" value={edu.fieldOfStudy || ''} onChange={e => updateEdu(i, 'fieldOfStudy', e.target.value)} />
                                    </div>
                                </div>
                                <div className="grid-2">
                                    <div className="form-group">
                                        <label className="form-label">Institution</label>
                                        <input className="form-input" placeholder="e.g. MIT" value={edu.institution || ''} onChange={e => updateEdu(i, 'institution', e.target.value)} />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Graduation Year</label>
                                        <input className="form-input" type="number" placeholder="2022" value={edu.endYear || ''} onChange={e => updateEdu(i, 'endYear', e.target.value)} />
                                    </div>
                                </div>
                            </div>
                        ))}
                        <button className="btn btn-secondary" onClick={addEdu}><Plus size={16} /> Add Education</button>
                    </div>
                )}

                {/* Resume Upload */}
                {tab === 'resume' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
                        <div>
                            <h3 className="mb-4"><FileText size={18} style={{ display: 'inline', marginRight: 8 }} />Resume</h3>
                            {profile?.resume?.url && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 10, padding: '12px 16px', marginBottom: 16 }}>
                                    <FileText size={18} style={{ color: '#34d399' }} />
                                    <span style={{ fontSize: 14 }}>{profile.resume.originalName || 'Resume uploaded'}</span>
                                    <span style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--text-muted)' }}>
                                        {profile.resume.uploadedAt ? new Date(profile.resume.uploadedAt).toLocaleDateString() : ''}
                                    </span>
                                </div>
                            )}
                            <div {...getResumeProps()} className={`dropzone ${isDragActive ? 'active' : ''}`}>
                                <input {...getResumeInputProps()} />
                                {uploading ? (
                                    <div style={{ textAlign: 'center', padding: '20px 0' }}>
                                        <span className="btn-spinner" style={{ width: 32, height: 32, borderWidth: 3 }} />
                                        <div style={{ marginTop: 12, color: 'var(--text-secondary)' }}>Uploading & analyzing with AI...</div>
                                    </div>
                                ) : (
                                    <>
                                        <Upload size={32} style={{ color: 'var(--primary-light)', marginBottom: 12 }} />
                                        <div style={{ fontSize: 15, fontWeight: 600 }}>{isDragActive ? 'Drop here!' : 'Drag & drop your resume'}</div>
                                        <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 6 }}>PDF, DOCX, or JPEG · Max 10MB</div>
                                        <button type="button" className="btn btn-secondary btn-sm mt-4">Browse Files</button>
                                    </>
                                )}
                            </div>
                            <div style={{ marginTop: 12, padding: '10px 14px', background: 'rgba(99,102,241,0.08)', borderRadius: 8, fontSize: 13, color: 'var(--primary-light)' }}>
                                🧠 After upload, our AI will automatically analyze your resume and provide an improvement score, feedback, and extract your skills.
                            </div>
                        </div>

                        {/* Certificates */}
                        <div>
                            <h3 className="mb-4"><Award size={18} style={{ display: 'inline', marginRight: 8 }} />Certificates</h3>
                            {(profile?.certificates || []).map((cert, i) => (
                                <div key={i} style={{ display: 'flex', align: 'center', gap: 12, background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: 10, padding: '12px 16px', marginBottom: 10 }}>
                                    <Award size={16} style={{ color: '#fcd34d' }} />
                                    <div>
                                        <div style={{ fontSize: 14, fontWeight: 600 }}>{cert.name}</div>
                                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{cert.issuer}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Links */}
                {tab === 'links' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        {[
                            { key: 'linkedIn', label: 'LinkedIn URL', placeholder: 'https://linkedin.com/in/yourname' },
                            { key: 'github', label: 'GitHub URL', placeholder: 'https://github.com/yourname' },
                            { key: 'portfolio', label: 'Portfolio / Website', placeholder: 'https://yoursite.com' },
                            { key: 'website', label: 'Other Website', placeholder: 'https://...' },
                        ].map(({ key, label, placeholder }) => (
                            <div key={key} className="form-group">
                                <label className="form-label">{label}</label>
                                <input className="form-input" placeholder={placeholder} value={form[key] || ''} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} />
                            </div>
                        ))}
                    </div>
                )}
                <div className="profile-header" style={{ display: 'flex', alignItems: 'center', gap: 24, marginBottom: 32 }}>
                    <AvatarUpload
                        size={120}
                        onUploadComplete={(avatar) => {
                            // Update local state if needed
                        }}
                    />
                    <div>
                        <h2 style={{ fontSize: 24, fontWeight: 800 }}>{user?.name}</h2>
                        <p style={{ color: 'var(--text-secondary)' }}>{profile?.headline || 'Add a professional headline'}</p>
                    </div>
                </div>
            </div>

            <style>{`
        .profile-tabs { display: flex; gap: 4; flex-wrap: wrap; background: rgba(255,255,255,0.03); border: 1px solid var(--border); border-radius: 12px; padding: 6px; }
        .profile-tab { display: flex; align-items: center; gap: 6px; padding: 8px 16px; border-radius: 8px; border: none; font-size: 13px; font-weight: 500; color: var(--text-muted); background: transparent; cursor: pointer; transition: all 0.15s; }
        .profile-tab:hover { color: var(--text-primary); background: rgba(255,255,255,0.05); }
        .profile-tab.active { background: var(--gradient-1); color: white; box-shadow: 0 4px 12px rgba(99,102,241,0.3); }
        .dropzone { border: 2px dashed var(--border); border-radius: 14px; padding: 40px 24px; text-align: center; cursor: pointer; transition: all 0.2s; display: flex; flex-direction: column; align-items: center; }
        .dropzone:hover, .dropzone.active { border-color: var(--primary); background: rgba(99,102,241,0.05); }
      `}</style>
        </div>
    );
}
