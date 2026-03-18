const express = require('express');
const router = express.Router();
const {
    createJob, getJobs, getJobById, updateJob, deleteJob,
    applyToJob, getRecommendedJobs, getMyJobs,
    getCandidates, updateApplicantStatus, getMyApplications
} = require('../controllers/jobController');
const { protect, requireRole } = require('../middleware/auth');

router.get('/', protect, getJobs);
router.post('/', protect, requireRole('hr'), createJob);
router.get('/recommended', protect, requireRole('jobseeker'), getRecommendedJobs);
router.get('/my-jobs', protect, requireRole('hr'), getMyJobs);
router.get('/my-applications', protect, requireRole('jobseeker'), getMyApplications);
router.get('/:id', protect, getJobById);
router.put('/:id', protect, requireRole('hr'), updateJob);
router.delete('/:id', protect, requireRole('hr'), deleteJob);
router.post('/:id/apply', protect, requireRole('jobseeker'), applyToJob);
router.get('/:id/candidates', protect, requireRole('hr'), getCandidates);
router.put('/:id/applicants/:userId', protect, requireRole('hr'), updateApplicantStatus);

module.exports = router;
