const Job = require('../models/Job');
const Profile = require('../models/Profile');
const User = require('../models/User');
const { extractJobKeywords, matchProfileToJob } = require('../services/aiService');

// @desc  Create a job (HR)
const createJob = async (req, res) => {
    try {
        const { title, description, requirements, location, jobType, experienceLevel, salaryRange, skills } = req.body;
        if (!title || !description) return res.status(400).json({ message: 'Title and description required' });

        const hrUser = await User.findById(req.user._id);

        // Extract AI keywords from job description
        let aiKeywords = [];
        try {
            const keywordData = await extractJobKeywords(description + ' ' + (requirements || ''));
            aiKeywords = keywordData.keywords || [];
        } catch (err) {
            console.error('Keyword extraction error:', err.message);
        }

        const job = await Job.create({
            title, description, requirements: requirements || '',
            location: location || 'Remote',
            jobType: jobType || 'full-time',
            experienceLevel: experienceLevel || 'mid',
            salaryRange: salaryRange || 'Not disclosed',
            company: hrUser.company || hrUser.name,
            postedBy: req.user._id,
            aiKeywords,
            skills: skills || []
        });

        res.status(201).json(job);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc  Get all jobs (with filters)
const getJobs = async (req, res) => {
    try {
        const { search, location, jobType, experienceLevel, page = 1, limit = 12 } = req.query;
        const query = { isActive: true };

        if (search) query.$text = { $search: search };
        if (location) query.location = { $regex: location, $options: 'i' };
        if (jobType) query.jobType = jobType;
        if (experienceLevel) query.experienceLevel = experienceLevel;

        const total = await Job.countDocuments(query);
        const jobs = await Job.find(query)
            .populate('postedBy', 'name avatar company')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(Number(limit));

        res.json({ jobs, total, page: Number(page), pages: Math.ceil(total / limit) });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc  Get single job
const getJobById = async (req, res) => {
    try {
        const job = await Job.findById(req.params.id).populate('postedBy', 'name avatar company email');
        if (!job) return res.status(404).json({ message: 'Job not found' });
        job.views += 1;
        await job.save();
        res.json(job);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc  Update job (HR)
const updateJob = async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);
        if (!job) return res.status(404).json({ message: 'Job not found' });
        if (job.postedBy.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Not authorized' });

        const updated = await Job.findByIdAndUpdate(req.params.id, req.body, { returnDocument: 'after' });
        res.json(updated);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc  Delete job (HR)
const deleteJob = async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);
        if (!job) return res.status(404).json({ message: 'Job not found' });
        if (job.postedBy.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Not authorized' });

        await Job.findByIdAndDelete(req.params.id);
        res.json({ message: 'Job deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc  Apply to job
const applyToJob = async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);
        if (!job) return res.status(404).json({ message: 'Job not found' });

        const alreadyApplied = job.applicants.some(a => a.user.toString() === req.user._id.toString());
        if (alreadyApplied) return res.status(400).json({ message: 'Already applied to this job' });

        // Compute AI match score
        let aiMatchScore = 0;
        try {
            const profile = await Profile.findOne({ user: req.user._id });
            if (profile) {
                const match = await matchProfileToJob(profile, job);
                aiMatchScore = match.matchScore || 0;
            }
        } catch (err) {
            console.error('Match error:', err.message);
        }

        job.applicants.push({
            user: req.user._id,
            status: 'applied',
            appliedAt: new Date(),
            aiMatchScore,
            coverLetter: req.body.coverLetter || ''
        });
        await job.save();

        res.json({ message: 'Applied successfully', aiMatchScore });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc  Get recommended jobs for job seeker
const getRecommendedJobs = async (req, res) => {
    try {
        const profile = await Profile.findOne({ user: req.user._id });
        if (!profile) return res.json([]);

        const skills = [
            ...(profile.skills || []),
            ...(profile.aiAnalysis?.extractedSkills || [])
        ];

        if (skills.length === 0) {
            const recent = await Job.find({ isActive: true }).sort({ createdAt: -1 }).limit(6).populate('postedBy', 'name company avatar');
            return res.json(recent.map(j => ({ ...j.toObject(), matchScore: 0 })));
        }

        const jobs = await Job.find({
            isActive: true,
            $or: [
                { aiKeywords: { $in: skills } },
                { skills: { $in: skills } },
                { title: { $regex: skills.slice(0, 3).join('|'), $options: 'i' } }
            ]
        }).populate('postedBy', 'name company avatar').limit(12);

        // Compute match scores with concurrency limit
        const scored = [];
        const CHUNK_SIZE = 4;
        for (let i = 0; i < jobs.length; i += CHUNK_SIZE) {
            const chunk = jobs.slice(i, i + CHUNK_SIZE);
            const results = await Promise.all(
                chunk.map(async (job) => {
                    try {
                        const match = await matchProfileToJob(profile, job);
                        return { ...job.toObject(), matchScore: match.matchScore, matchReason: match.reason };
                    } catch {
                        return { ...job.toObject(), matchScore: 0 };
                    }
                })
            );
            scored.push(...results);
            if (i + CHUNK_SIZE < jobs.length) await new Promise(r => setTimeout(r, 2000)); // 2s delay between job batches
        }

        scored.sort((a, b) => b.matchScore - a.matchScore);
        res.json(scored);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc  Get my posted jobs (HR)
const getMyJobs = async (req, res) => {
    try {
        const jobs = await Job.find({ postedBy: req.user._id }).sort({ createdAt: -1 });
        res.json(jobs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc  Get AI-suggested candidates for a job (HR)
const getCandidates = async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);
        if (!job) return res.status(404).json({ message: 'Job not found' });
        if (job.postedBy.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Not authorized' });

        // Get all job seekers with profiles
        const seekers = await User.find({ role: 'jobseeker' }).limit(50);
        const profiles = await Profile.find({ user: { $in: seekers.map(s => s._id) } }).populate('user', 'name email avatar');

        // Score candidates with concurrency limit
        const scored = [];
        const CHUNK_SIZE = 5;
        for (let i = 0; i < profiles.length; i += CHUNK_SIZE) {
            const chunk = profiles.slice(i, i + CHUNK_SIZE);
            const results = await Promise.all(
                chunk.map(async (profile) => {
                    try {
                        const match = await matchProfileToJob(profile, job);
                        return {
                            profile,
                            user: profile.user,
                            matchScore: match.matchScore || 0,
                            reason: match.reason || '',
                            matchedSkills: match.matchedSkills || [],
                            missingSkills: match.missingSkills || [],
                            recommendation: match.recommendation || 'consider'
                        };
                    } catch (err) {
                        console.error(`Error matching profile ${profile._id}:`, err.message);
                        return { profile, user: profile.user, matchScore: 0, reason: 'Matching failed.', matchedSkills: [], missingSkills: [], recommendation: 'not recommended' };
                    }
                })
            );
            scored.push(...results);
            if (i + CHUNK_SIZE < profiles.length) await new Promise(r => setTimeout(r, 2000)); // 2s delay between candidate batches
        }

        scored.sort((a, b) => b.matchScore - a.matchScore);
        res.json(scored.slice(0, 20));
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc  Update applicant status (HR)
const updateApplicantStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const job = await Job.findById(req.params.id);
        if (!job) return res.status(404).json({ message: 'Job not found' });
        if (job.postedBy.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Not authorized' });

        const applicant = job.applicants.find(a => a.user.toString() === req.params.userId);
        if (!applicant) return res.status(404).json({ message: 'Applicant not found' });

        applicant.status = status;
        await job.save();
        res.json({ message: 'Status updated', applicant });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc  Get my applications (job seeker)
const getMyApplications = async (req, res) => {
    try {
        const jobs = await Job.find({ 'applicants.user': req.user._id })
            .populate('postedBy', 'name company avatar');

        const applications = jobs.map(job => {
            const myApp = job.applicants.find(a => a.user.toString() === req.user._id.toString());
            return { job: { _id: job._id, title: job.title, company: job.company, location: job.location, jobType: job.jobType, postedBy: job.postedBy }, ...myApp.toObject() };
        });

        res.json(applications);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { createJob, getJobs, getJobById, updateJob, deleteJob, applyToJob, getRecommendedJobs, getMyJobs, getCandidates, updateApplicantStatus, getMyApplications };
