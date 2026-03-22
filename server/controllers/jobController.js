const Job = require('../models/Job');
const Profile = require('../models/Profile');
const User = require('../models/User');
const { extractJobKeywords, matchProfileToJob } = require('../services/aiService');
const { createNotification } = require('../services/notificationService');
const { sendEmail } = require('../services/emailService');
const { createZoomMeeting } = require('../services/zoomService');

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
        let q = Job.findById(req.params.id).populate('postedBy', 'name avatar company email');

        // Never leak applicants list to non-owner users.
        // Only the HR who posted the job can see applicants (with user details).
        const requesterId = req.user?._id?.toString();
        const isHr = req.user?.role === 'hr';

        if (!(isHr && requesterId)) {
            q = q.select('-applicants');
        }

        const job = await q;
        if (!job) return res.status(404).json({ message: 'Job not found' });

        if (isHr && requesterId && job.postedBy?._id?.toString?.() === requesterId) {
            await job.populate('applicants.user', 'name email avatar');
        }

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

const applyToJob = async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);
        if (!job) return res.status(404).json({ message: 'Job not found' });

        const alreadyApplied = job.applicants.find(a => a.user && a.user.toString() === req.user._id.toString());
        if (alreadyApplied) return res.status(400).json({ message: 'Already applied' });

        const profile = await Profile.findOne({ user: req.user._id });
        if (!profile) return res.status(404).json({ message: 'Profile not found. Please create a profile first.' });

        // Handle cover letter: can be text from body (coverLetter) or file from multer (coverLetterFile)
        let coverLetterText = req.body.coverLetter || '';
        let coverLetterUrl = '';
        let coverLetterPublicId = '';

        if (req.file) {
            coverLetterUrl = req.file.path || req.file.cloudinaryUrl;
            coverLetterPublicId = req.file.filename || req.file.cloudinaryId;
            coverLetterText = `File uploaded: ${req.file.originalname}. ` + (req.body.coverLetter || '');
        }

        // AI Matching
        let aiMatchScore = 0;
        try {
            const match = await matchProfileToJob(profile, job);
            aiMatchScore = match.matchScore || 0;
        } catch (err) {
            console.error('Match error (applyToJob):', err.message);
        }
        
        const newApplicant = {
            user: req.user._id,
            status: 'applied',
            appliedAt: new Date(),
            aiMatchScore,
            coverLetter: req.body.coverLetter || '',
            coverLetterUrl,
            coverLetterPublicId
        };

        job.applicants.push(newApplicant);
        await job.save();

        // Notify HR
        try {
            await createNotification({
                recipient: job.postedBy,
                sender: req.user._id,
                type: 'job_application',
                comment: `${req.user.name} applied for ${job.title} (Match: ${aiMatchScore}%)`
            });

            const hr = await User.findById(job.postedBy).select('email name');
            if (hr?.email) {
                await sendEmail({
                    to: hr.email,
                    subject: `New application for ${job.title}`,
                    html: `
                        <p>Hi ${hr.name || 'Hiring Manager'},</p>
                        <p>${req.user.name} just applied to <strong>${job.title}</strong>.</p>
                        <p><strong>AI Match Score:</strong> ${aiMatchScore}%</p>
                        <p>Log in to CareerLens to review their profile and resume.</p>
                    `
                });
            }
        } catch (err) {
            console.error('Notification error (applyToJob):', err.message);
        }

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

        // Get job seekers with profiles (prefilter quickly to avoid slow AI scoring on everyone)
        const seekers = await User.find({ role: 'jobseeker' }).select('_id').limit(200).lean();
        const seekerIds = seekers.map(s => s._id);

        const profiles = await Profile.find({ user: { $in: seekerIds } })
            .select('user headline skills aiAnalysis.extractedSkills')
            .populate('user', 'name email avatar')
            .lean();

        const jobSignals = new Set([
            ...(job.aiKeywords || []),
            ...(job.skills || []),
            ...(String(job.title || '').split(/\W+/).filter(Boolean))
        ].map(s => String(s).toLowerCase()));

        const scoredByOverlap = profiles
            .map(p => {
                const pSkills = [
                    ...((p.skills || []).map(s => String(s).toLowerCase())),
                    ...(((p.aiAnalysis?.extractedSkills) || []).map(s => String(s).toLowerCase()))
                ];
                const overlap = pSkills.reduce((acc, s) => acc + (jobSignals.has(s) ? 1 : 0), 0);
                return { profile: p, overlap };
            })
            .sort((a, b) => b.overlap - a.overlap)
            .slice(0, 60)
            .map(x => x.profile);

        // Score candidates with concurrency limit
        const scored = [];
        const CHUNK_SIZE = 6;
        for (let i = 0; i < scoredByOverlap.length; i += CHUNK_SIZE) {
            const chunk = scoredByOverlap.slice(i, i + CHUNK_SIZE);
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
        }

        scored.sort((a, b) => b.matchScore - a.matchScore);
        res.json(scored.slice(0, 20));
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc  Get shortlisted candidates across my jobs (HR)
const getShortlistedCandidates = async (req, res) => {
    try {
        const jobs = await Job.find({
            postedBy: req.user._id,
            'applicants.status': { $in: ['shortlisted', 'interview', 'selected'] }
        })
            .select('title company location jobType applicants')
            .populate('applicants.user', 'name email avatar')
            .lean();

        const OfferLetter = require('../models/OfferLetter');
        const items = [];
        for (const job of jobs) {
            const jobOffers = await OfferLetter.find({ job: job._id }).lean();
            for (const app of job.applicants || []) {
                if (app.status !== 'shortlisted' && app.status !== 'interview' && app.status !== 'selected') continue;
                const offer = jobOffers.find(o => o.applicantUser.toString() === app.user._id.toString());
                items.push({
                    job: {
                        _id: job._id,
                        title: job.title,
                        company: job.company,
                        location: job.location,
                        jobType: job.jobType
                    },
                    applicant: app,
                    offer: offer || null
                });
            }
        }

        // Sort: interview first, then newest applications
        items.sort((a, b) => {
            const prA = a.applicant.status === 'interview' ? 0 : 1;
            const prB = b.applicant.status === 'interview' ? 0 : 1;
            if (prA !== prB) return prA - prB;
            return new Date(b.applicant.appliedAt || 0) - new Date(a.applicant.appliedAt || 0);
        });

        res.json(items);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc  Update applicant status (HR)
const updateApplicantStatus = async (req, res) => {
    try {
        const { status, aiMatchScore = 0 } = req.body;
        const job = await Job.findById(req.params.id);
        if (!job) return res.status(404).json({ message: 'Job not found' });
        if (job.postedBy.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Not authorized' });

        let applicant = job.applicants.find(a => a.user.toString() === req.params.userId);
        if (!applicant) {
            // Allow HR to shortlist/reject directly from AI candidate list even if the user hasn't applied yet.
            job.applicants.push({
                user: req.params.userId,
                status,
                appliedAt: new Date(),
                aiMatchScore: Number(aiMatchScore) || 0,
                coverLetter: ''
            });
            applicant = job.applicants[job.applicants.length - 1];
        } else {
            applicant.status = status;
            // Keep any existing score unless a new one is provided.
            if (Number.isFinite(Number(aiMatchScore)) && Number(aiMatchScore) > 0) {
                applicant.aiMatchScore = Number(aiMatchScore);
            }
        }
        await job.save();

        // Notify candidate about status change
        try {
            const candidate = await User.findById(applicant.user).select('name email');
            await createNotification({
                recipient: applicant.user,
                sender: req.user._id,
                type: 'job_application',
                comment: `Your application for ${job.title} is now ${status}.`
            });

            if (candidate?.email) {
                await sendEmail({
                    to: candidate.email,
                    subject: `Application update – ${job.title}`,
                    html: `
                        <p>Hi ${candidate.name || 'there'},</p>
                        <p>Your application for <strong>${job.title}</strong> is now: <strong>${status}</strong>.</p>
                        <p>Log in to CareerLens to see full details.</p>
                    `
                });
            }
        } catch (err) {
            console.error('Notification/email error (updateApplicantStatus):', err.message);
        }

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
            return {
                job: {
                    _id: job._id,
                    title: job.title,
                    company: job.company,
                    location: job.location,
                    jobType: job.jobType,
                    postedBy: job.postedBy
                },
                ...myApp.toObject()
            };
        });

        res.json(applications);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc  Schedule interview for an applicant (HR)
const scheduleInterview = async (req, res) => {
    try {
        const { round, scheduledAt, durationMinutes = 60, notes = '' } = req.body;

        if (!round || !scheduledAt) {
            return res.status(400).json({ message: 'round and scheduledAt are required' });
        }

        const job = await Job.findById(req.params.id).populate('postedBy', 'name email');
        if (!job) return res.status(404).json({ message: 'Job not found' });
        if (job.postedBy._id.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const applicant = job.applicants.find(a => a.user.toString() === req.params.userId);
        if (!applicant) return res.status(404).json({ message: 'Applicant not found' });

        const candidate = await User.findById(applicant.user).select('name email');
        if (!candidate) return res.status(404).json({ message: 'Candidate user not found' });

        // Zoom is optional: if credentials aren't configured, still allow scheduling.
        let meeting = { id: '', joinUrl: '', startUrl: '' };
        try {
            meeting = await createZoomMeeting({
                topic: `${job.title} – ${round}`,
                startTime: scheduledAt,
                durationMinutes
            });
        } catch (err) {
            console.error('Zoom meeting creation failed (scheduleInterview):', err.message);
        }

        applicant.status = 'interview';
        if (!applicant.interviews) applicant.interviews = [];
        
        applicant.interviews.push({
            round,
            scheduledAt: new Date(scheduledAt),
            durationMinutes,
            zoomMeetingId: meeting.id || '',
            zoomJoinUrl: meeting.joinUrl || '',
            zoomStartUrl: meeting.startUrl || '',
            notes,
            reminderSent: false
        });

        await job.save();

        try {
            await createNotification({
                recipient: applicant.user,
                sender: req.user._id,
                type: 'interview_scheduled',
                comment: `Interview scheduled for ${job.title} (${round}) at ${new Date(scheduledAt).toLocaleString()}. A Zoom link will be sent to you 15 minutes before the interview.`
            });

            await createNotification({
                recipient: req.user._id,
                sender: req.user._id,
                type: 'interview_scheduled',
                comment: `Interview scheduled with ${candidate.name} for ${job.title} (${round}) ${meeting.startUrl ? `| Host link: ${meeting.startUrl}` : ''}`
            });

            const startTime = new Date(scheduledAt).toLocaleString();

            if (candidate.email) {
                await sendEmail({
                    to: candidate.email,
                    subject: `Interview scheduled – ${job.title}`,
                    html: `
                        <p>Hi ${candidate.name},</p>
                        <p>Your interview for <strong>${job.title}</strong> at <strong>${job.company}</strong> has been scheduled.</p>
                        <p><strong>Interview Details:</strong></p>
                        <ul>
                            <li><strong>Position:</strong> ${job.title}</li>
                            <li><strong>Company:</strong> ${job.company}</li>
                            <li><strong>Round:</strong> ${round}</li>
                            <li><strong>Time:</strong> ${startTime}</li>
                            <li><strong>Duration:</strong> ${durationMinutes} minutes</li>
                            ${job.location ? `<li><strong>Location:</strong> ${job.location}</li>` : ''}
                        </ul>
                        <p>A Zoom meeting link will be sent to you <strong>15 minutes before the interview starts</strong>. Please keep an eye on your email and in-app notifications.</p>
                        <p>Notes from the recruiter: ${notes || 'N/A'}</p>
                        <p>Log in to CareerLens for more details.</p>
                    `
                });
            }

            if (job.postedBy.email) {
                await sendEmail({
                    to: job.postedBy.email,
                    subject: `Interview scheduled with ${candidate.name} – ${job.title}`,
                    html: `
                        <p>Hi ${job.postedBy.name || 'Hiring Manager'},</p>
                        <p>You scheduled an interview with <strong>${candidate.name}</strong> for <strong>${job.title}</strong>.</p>
                        <ul>
                            <li><strong>Round:</strong> ${round}</li>
                            <li><strong>Time:</strong> ${startTime}</li>
                            <li><strong>Duration:</strong> ${durationMinutes} minutes</li>
                            ${meeting.startUrl ? `<li><strong>Host Link (Zoom):</strong> <a href="${meeting.startUrl}">${meeting.startUrl}</a></li>` : ''}
                        </ul>
                        <p>A reminder will be sent to you 15 minutes before the start time.</p>
                    `
                });
            }
        } catch (err) {
            console.error('Notification/email error (scheduleInterview):', err.message);
        }

        res.json({ message: 'Interview scheduled', applicant });
    } catch (error) {
        console.error('scheduleInterview error:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc  Update score for a specific interview round (HR)
const updateInterviewScore = async (req, res) => {
    try {
        const { roundIndex, score } = req.body;
        if (score === undefined || score === null || score < 0 || score > 10) {
            return res.status(400).json({ message: 'Score must be between 0 and 10' });
        }

        const job = await Job.findById(req.params.id);
        if (!job) return res.status(404).json({ message: 'Job not found' });
        if (job.postedBy.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Not authorized' });

        const applicant = job.applicants.find(a => a.user.toString() === req.params.userId);
        if (!applicant) return res.status(404).json({ message: 'Applicant not found' });

        const interview = applicant.interviews[roundIndex];
        if (!interview) return res.status(404).json({ message: 'Interview round not found' });

        interview.score = Number(score);
        await job.save();

        // Calculate total and average
        const scoredRounds = applicant.interviews.filter(iv => iv.score !== null && iv.score !== undefined);
        const totalScore = scoredRounds.reduce((sum, iv) => sum + iv.score, 0);
        const avgScore = scoredRounds.length > 0 ? (totalScore / scoredRounds.length).toFixed(1) : null;

        res.json({ message: 'Score updated', interview, totalScore, avgScore, scoredRounds: scoredRounds.length });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createJob,
    getJobs,
    getJobById,
    updateJob,
    deleteJob,
    applyToJob,
    getRecommendedJobs,
    getMyJobs,
    getCandidates,
    updateApplicantStatus,
    getMyApplications,
    scheduleInterview,
    getShortlistedCandidates,
    updateInterviewScore
};
