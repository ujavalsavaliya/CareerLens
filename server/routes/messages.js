const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { upload } = require('../config/cloudinary');
const {
    getConversations,
    sendMessage,
    getMessages,
    markRead
} = require('../controllers/messageController');

router.use(protect);

router.get('/', getConversations);
router.post('/:userId', upload.array('media', 5), sendMessage);
router.get('/:conversationId', getMessages);
router.put('/:conversationId/read', markRead);

module.exports = router;

