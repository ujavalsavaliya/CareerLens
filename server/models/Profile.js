const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    headline: { type: String, default: '' },
    summary: { type: String, default: '' },
    location: { type: String, default: '' },
    website: { type: String, default: '' },
    phone: { type: String, default: '' },
    skills: [{ type: String }],
    experience: [{
        title: String,
        company: String,
        location: String,
        startDate: Date,
        endDate: Date,
        current: { type: Boolean, default: false },
        description: String
    }],
    education: [{
        degree: String,
        fieldOfStudy: String,
        institution: String,
        startYear: Number,
        endYear: Number,
        grade: String
    }],
    resume: {
        url: { type: String, default: '' },
        publicId: { type: String, default: '' },
        originalName: { type: String, default: '' },
        uploadedAt: Date
    },
    certificates: [{
        url: String,
        publicId: String,
        name: String,
        issuer: String,
        uploadedAt: { type: Date, default: Date.now }
    }],
    aiAnalysis: {
        score: { type: Number, default: 0 },
        atsScore: { type: Number, default: 0 },
        sectionScores: {
            contact: { type: Number, default: 0 },
            summary: { type: Number, default: 0 },
            experience: { type: Number, default: 0 },
            skills: { type: Number, default: 0 },
            education: { type: Number, default: 0 },
            formatting: { type: Number, default: 0 }
        },
        feedback: { type: String, default: '' },
        missingKeywords: [String],
        extractedSkills: [String],
        improvements: [String],
        profileSummary: { type: String, default: '' },
        lastAnalyzed: Date
    },
    completionPercentage: { type: Number, default: 0 },
    linkedIn: { type: String, default: '' },
    github: { type: String, default: '' },
    portfolio: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('Profile', profileSchema);
