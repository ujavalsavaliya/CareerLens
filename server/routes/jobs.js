const express = require('express');
const router = express.Router();
const {
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
} = require('../controllers/jobController');
const { protect, requireRole } = require('../middleware/auth');
const { upload } = require('../config/cloudinary');

router.get('/', protect, getJobs);
router.post('/', protect, requireRole('hr'), createJob);
router.get('/recommended', protect, requireRole('jobseeker'), getRecommendedJobs);
router.get('/my-jobs', protect, requireRole('hr'), getMyJobs);
router.get('/my-applications', protect, requireRole('jobseeker'), getMyApplications);
router.get('/shortlisted', protect, requireRole('hr'), getShortlistedCandidates);
router.get('/:id', protect, getJobById);
router.put('/:id', protect, requireRole('hr'), updateJob);
router.delete('/:id', protect, requireRole('hr'), deleteJob);
router.post('/:id/apply', protect, requireRole('jobseeker'), upload.single('coverLetterFile'), applyToJob);
router.get('/:id/candidates', protect, requireRole('hr'), getCandidates);
router.put('/:id/applicants/:userId', protect, requireRole('hr'), updateApplicantStatus);
router.put('/:id/applicants/:userId/interview', protect, requireRole('hr'), scheduleInterview);
router.put('/:id/applicants/:userId/score', protect, requireRole('hr'), updateInterviewScore);

module.exports = router;
