const Profile = require('../models/Profile');
const User = require('../models/User');
const { analyzeResume, generateProfileSummary } = require('../services/aiService');
const { Follow } = require('../models/Connection');
const pdfParse = require('pdf-parse');
const fs = require('fs');
const path = require('path');

// @desc  Get my profile
const getMyProfile = async (req, res) => {
    try {
        let profile = await Profile.findOne({ user: req.user._id });
        if (!profile) {
            profile = await Profile.create({ user: req.user._id });
            await User.findByIdAndUpdate(req.user._id, { profile: profile._id });
        }
        res.json(profile);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc  Update my profile
const updateMyProfile = async (req, res) => {
    try {
        const updates = req.body;
        
        // Handle name update for User model
        if (updates.name) {
            await User.findByIdAndUpdate(req.user._id, { name: updates.name });
        }

        delete updates.user; delete updates.aiAnalysis; delete updates.resume; delete updates.certificates;
        delete updates.name; // Don't save name in Profile model

        const profile = await Profile.findOneAndUpdate(
            { user: req.user._id },
            { ...updates, completionPercentage: calcCompletion(updates) },
            { returnDocument: 'after', upsert: true, runValidators: true }
        );
        res.json(profile);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc  Upload resume and trigger AI analysis
const uploadResume = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

        const profile = await Profile.findOne({ user: req.user._id });
        if (!profile) return res.status(404).json({ message: 'Profile not found' });

        const resumeUrl = req.file.cloudinaryUrl || req.file.path || `/uploads/resume`;
        const publicId = req.file.cloudinaryId || req.file.originalname;
        const originalName = req.file.originalname;

        profile.resume = { url: resumeUrl, publicId, originalName, uploadedAt: new Date() };
        await profile.save();

        // Cloudinary stores the file remotely — use original name for AI context
        let resumeText = `Resume file uploaded: ${originalName}. Candidate: ${req.user.name}. Please analyze based on filename and any available profile data.`;
        // If you want actual text extraction, use a text-extraction service on the Cloudinary URL


        // Run AI analysis
        try {
            const analysis = await analyzeResume(resumeText || `Resume: ${originalName}`);
            const summary = await generateProfileSummary({ ...profile.toObject(), ...analysis });

            profile.aiAnalysis = {
                score: analysis.score || 0,
                atsScore: analysis.atsScore || 0,
                sectionScores: analysis.sectionScores || { contact: 0, summary: 0, experience: 0, skills: 0, education: 0, formatting: 0 },
                feedback: analysis.feedback || '',
                missingKeywords: analysis.missingKeywords || [],
                extractedSkills: analysis.extractedSkills || [],
                improvements: analysis.improvements || [],
                profileSummary: summary,
                lastAnalyzed: new Date()
            };

            // Merge extracted skills
            const existingSkills = profile.skills || [];
            const newSkills = [...new Set([...existingSkills, ...(analysis.extractedSkills || [])])];
            profile.skills = newSkills;

            await profile.save();
        } catch (aiErr) {
            console.error('AI analysis error:', aiErr.message);
        }

        res.json({ message: 'Resume uploaded and analyzed successfully', profile });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc  Upload certificate
const uploadCertificate = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

        const { name, issuer } = req.body;
        const profile = await Profile.findOne({ user: req.user._id });
        if (!profile) return res.status(404).json({ message: 'Profile not found' });

        profile.certificates.push({
            url: req.file.path || `/uploads/${req.file.filename}`,
            publicId: req.file.filename,
            name: name || req.file.originalname,
            issuer: issuer || '',
            uploadedAt: new Date()
        });
        await profile.save();

        res.json({ message: 'Certificate uploaded', profile });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc  Get AI feedback
const getAIFeedback = async (req, res) => {
    try {
        const profile = await Profile.findOne({ user: req.user._id });
        if (!profile) return res.status(404).json({ message: 'Profile not found' });

        if (!profile.aiAnalysis || !profile.aiAnalysis.lastAnalyzed) {
            return res.json({ score: 0, feedback: 'No analysis found', extractedSkills: [], missingKeywords: [] });
        }

        res.json(profile.aiAnalysis);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc  Get a user profile (public)
const getProfileByUserId = async (req, res) => {
    try {
        let profile = await Profile.findOne({ user: req.params.userId }).populate('user', 'name email avatar banner role company connectionCount premium');
        
        if (!profile) {
            // Check if user exists even if profile document doesn't
            const user = await User.findById(req.params.userId).select('name email avatar banner role company connectionCount premium');
            if (!user) return res.status(404).json({ message: 'User not found' });
            
            // Return a "virtual" profile object so the frontend doesn't crash
            return res.json({
                user,
                bio: '',
                skills: [],
                experience: [],
                education: [],
                followersCount: 0,
                followingCount: 0
            });
        }
        
        const followersCount = await Follow.countDocuments({ following: req.params.userId });
        const followingCount = await Follow.countDocuments({ follower: req.params.userId });

        res.json({
            ...profile.toObject(),
            followersCount,
            followingCount
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Helper to calculate profile completion %
const calcCompletion = (p) => {
    let score = 0;
    if (p.headline) score += 15;
    if (p.summary) score += 15;
    if (p.skills && p.skills.length > 0) score += 15;
    if (p.experience && p.experience.length > 0) score += 20;
    if (p.education && p.education.length > 0) score += 15;
    if (p.resume && p.resume.url) score += 20;
    return score;
};

module.exports = { getMyProfile, updateMyProfile, uploadResume, uploadCertificate, getAIFeedback, getProfileByUserId };
