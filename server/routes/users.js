const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { upload } = require('../config/cloudinary');
const { uploadAvatar, removeAvatar, uploadBanner, removeBanner, setupHrmsAccount } = require('../controllers/userController');

router.use(protect);

router.post('/avatar', upload.single('avatar'), uploadAvatar);
router.delete('/avatar', removeAvatar);

router.post('/banner', upload.single('banner'), uploadBanner);
router.delete('/banner', removeBanner);

router.post('/setup-hrms', setupHrmsAccount);

module.exports = router;

