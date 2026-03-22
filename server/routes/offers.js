const express = require('express');
const router = express.Router();
const { sendOffer, getMyOffers, respondToOffer, getHROffer } = require('../controllers/offerController');
const { protect, requireRole } = require('../middleware/auth');
const { upload } = require('../config/cloudinary');

// Candidate gets their own offers (MUST be before dynamic /:id routes)
router.get('/my-offers', protect, requireRole('jobseeker'), getMyOffers);

// Candidate responds to an offer (accept or reject)
router.put('/:id/respond', protect, requireRole('jobseeker'), respondToOffer);

// HR sends or updates an offer letter (PDF upload required)
router.post('/:jobId/:userId', protect, requireRole('hr'), upload.single('offerPdf'), sendOffer);

// HR checks offer status for a specific applicant
router.get('/:jobId/:userId', protect, requireRole('hr'), getHROffer);

module.exports = router;
