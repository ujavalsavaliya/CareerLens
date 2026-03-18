const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    requirements: { type: String, default: '' },
    location: { type: String, default: 'Remote' },
    jobType: { type: String, enum: ['full-time', 'part-time', 'contract', 'internship', 'remote'], default: 'full-time' },
    experienceLevel: { type: String, enum: ['entry', 'mid', 'senior', 'lead'], default: 'mid' },
    salaryRange: { type: String, default: 'Not disclosed' },
    company: { type: String, required: true },
    companyLogo: { type: String, default: '' },
    postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    aiKeywords: [{ type: String }],
    skills: [{ type: String }],
    applicants: [{
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        status: { type: String, enum: ['applied', 'shortlisted', 'rejected', 'interview'], default: 'applied' },
        appliedAt: { type: Date, default: Date.now },
        aiMatchScore: { type: Number, default: 0 },
        coverLetter: { type: String, default: '' }
    }],
    isActive: { type: Boolean, default: true },
    views: { type: Number, default: 0 }
}, { timestamps: true });

jobSchema.index({ title: 'text', description: 'text', skills: 'text' });

module.exports = mongoose.model('Job', jobSchema);
