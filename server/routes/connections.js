const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
    sendRequest,
    acceptRequest,
    rejectRequest,
    withdrawRequest,
    removeConnection,
    getConnections,
    getPendingRequests,
    getSentRequests,
    getSuggestions,
    getStatus,
    follow,
    unfollow
} = require('../controllers/connectionController');

router.use(protect);

router.get('/', getConnections);
router.get('/pending', getPendingRequests);
router.get('/sent', getSentRequests);
router.get('/suggestions', getSuggestions);
router.get('/status/:userId', getStatus);

router.post('/request/:userId', sendRequest);
router.put('/accept/:userId', acceptRequest);
router.put('/reject/:userId', rejectRequest);
router.delete('/withdraw/:userId', withdrawRequest);
router.delete('/remove/:userId', removeConnection);

router.post('/follow/:userId', follow);
router.delete('/unfollow/:userId', unfollow);

module.exports = router;

