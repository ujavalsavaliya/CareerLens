const OfferLetter = require('../models/OfferLetter');
const Job = require('../models/Job');
const User = require('../models/User');
const { createNotification } = require('../services/notificationService');
const { sendEmail } = require('../services/emailService');

// @desc  HR sends (or updates) an offer letter to a selected candidate
const sendOffer = async (req, res) => {
    try {
        const { jobId, userId } = req.params;
        const { message = '' } = req.body;

        if (!req.file) return res.status(400).json({ message: 'Offer letter PDF is required' });

        const job = await Job.findById(jobId);
        if (!job) return res.status(404).json({ message: 'Job not found' });
        if (job.postedBy.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Not authorized' });

        const pdfUrl = req.file.path || req.file.cloudinaryUrl;
        const pdfPublicId = req.file.filename || req.file.cloudinaryId || '';

        const candidate = await User.findById(userId).select('name email');
        if (!candidate) return res.status(404).json({ message: 'Candidate not found' });

        // Upsert: if an offer already exists (pending), update it
        let offer = await OfferLetter.findOne({ job: jobId, applicantUser: userId });
        if (offer) {
            offer.pdfUrl = pdfUrl;
            offer.pdfPublicId = pdfPublicId;
            offer.message = message;
            offer.status = 'pending'; // reset status on update
            offer.respondedAt = null;
            await offer.save();
        } else {
            offer = await OfferLetter.create({
                job: jobId,
                applicantUser: userId,
                hrUser: req.user._id,
                pdfUrl,
                pdfPublicId,
                message
            });
        }

        // Update applicant status to 'selected' if not already
        const applicant = job.applicants.find(a => a.user && a.user.toString() === userId);
        if (applicant && applicant.status !== 'selected') {
            applicant.status = 'selected';
            await job.save();
        }

        // In-app notification to candidate
        try {
            await createNotification({
                recipient: userId,
                sender: req.user._id,
                type: 'offer_letter',
                comment: `Congratulations! You have received an offer letter for ${job.title} at ${job.company}. Log in to view and respond.`
            });

            if (candidate.email) {
                await sendEmail({
                    to: candidate.email,
                    subject: `Offer Letter – ${job.title} at ${job.company}`,
                    html: `
                        <p>Hi ${candidate.name},</p>
                        <p>Congratulations! 🎉 You have received an <strong>Offer Letter</strong> for <strong>${job.title}</strong> at <strong>${job.company}</strong>.</p>
                        ${message ? `<p><strong>Message from the hiring team:</strong><br>${message}</p>` : ''}
                        <p>Please log in to <strong>CareerLens</strong> to view your offer letter, download the PDF, and accept or reject the offer.</p>
                        <p>Best of luck!</p>
                    `
                });
            }
        } catch (err) {
            console.error('Offer letter notification error:', err.message);
        }

        res.json({ message: 'Offer letter sent successfully', offer });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc  Get all offers for logged-in job seeker
const getMyOffers = async (req, res) => {
    try {
        const offers = await OfferLetter.find({ applicantUser: req.user._id })
            .populate('job', 'title company location jobType')
            .populate('hrUser', 'name avatar company')
            .sort({ createdAt: -1 });
        res.json(offers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc  Candidate accepts or rejects an offer
const respondToOffer = async (req, res) => {
    try {
        const { response } = req.body; // 'accepted' or 'rejected'
        if (!['accepted', 'rejected'].includes(response)) {
            return res.status(400).json({ message: 'Response must be accepted or rejected' });
        }

        const offer = await OfferLetter.findById(req.params.id)
            .populate('job', 'title company')
            .populate('hrUser', 'name email');

        if (!offer) return res.status(404).json({ message: 'Offer not found' });
        if (offer.applicantUser.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Not authorized' });
        if (offer.status !== 'pending') return res.status(400).json({ message: 'Offer has already been responded to' });

        offer.status = response;
        offer.respondedAt = new Date();
        await offer.save();

        const candidate = await User.findById(req.user._id).select('name');

        // Notify HR
        try {
            await createNotification({
                recipient: offer.hrUser._id,
                sender: req.user._id,
                type: 'job_update',
                comment: `${candidate.name} has ${response} the offer letter for ${offer.job.title}.`
            });

            if (offer.hrUser?.email) {
                await sendEmail({
                    to: offer.hrUser.email,
                    subject: `Offer ${response} – ${offer.job.title}`,
                    html: `
                        <p>Hi ${offer.hrUser.name || 'Hiring Manager'},</p>
                        <p><strong>${candidate.name}</strong> has <strong>${response}</strong> the offer for <strong>${offer.job.title}</strong> at <strong>${offer.job.company}</strong>.</p>
                        <p>Log in to CareerLens to view the status and take further action.</p>
                    `
                });
            }
        } catch (err) {
            console.error('Offer response notification error:', err.message);
        }

        res.json({ message: `Offer ${response}`, offer });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc  HR gets offer status for a specific job + user
const getHROffer = async (req, res) => {
    try {
        const { jobId, userId } = req.params;
        const offer = await OfferLetter.findOne({ job: jobId, applicantUser: userId });
        res.json(offer || null);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { sendOffer, getMyOffers, respondToOffer, getHROffer };
