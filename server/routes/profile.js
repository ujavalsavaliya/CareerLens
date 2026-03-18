const express = require('express');
const router = express.Router();
const multer = require('multer');
const { v2: cloudinary } = require('cloudinary');
const { protect } = require('../middleware/auth');
const {
    getMyProfile,
    updateMyProfile,
    uploadResume,
    uploadCertificate,
    getAIFeedback,
    getProfileByUserId,
} = require('../controllers/profileController');

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Use memory storage (multer v2 compatible)
const memStorage = multer.memoryStorage();
const upload = multer({
    storage: memStorage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

// Middleware: upload buffer to Cloudinary and attach URL to req
const toCloudinary = (folder) => async (req, res, next) => {
    if (!req.file) return next();
    try {
        const result = await new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
                { folder: `careerlens/${folder}`, resource_type: 'auto' },
                (err, result) => { if (err) reject(err); else resolve(result); }
            );
            stream.end(req.file.buffer);
        });
        req.file.cloudinaryUrl = result.secure_url;
        req.file.cloudinaryId = result.public_id;
        next();
    } catch (err) {
        console.error('Cloudinary upload error:', err.message);
        // Even if Cloudinary fails, continue without cloud URL
        next();
    }
};

router.get('/me', protect, getMyProfile);
router.put('/me', protect, updateMyProfile);

router.post('/upload-resume',
    protect,
    upload.single('resume'),
    toCloudinary('resumes'),
    uploadResume
);
// Alias for older/different frontend calls
router.post('/resume',
    protect,
    upload.single('resume'),
    toCloudinary('resumes'),
    uploadResume
);

router.post('/upload-certificate',
    protect,
    upload.single('certificate'),
    toCloudinary('certificates'),
    uploadCertificate
);
// Alias for older/different frontend calls
router.post('/certificate',
    protect,
    upload.single('certificate'),
    toCloudinary('certificates'),
    uploadCertificate
);

router.get('/ai-feedback', protect, getAIFeedback);
router.get('/:userId', protect, getProfileByUserId);

module.exports = router;
