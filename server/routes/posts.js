const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { upload } = require('../config/cloudinary');
const {
    getFeed,
    createPost,
    getPost,
    updatePost,
    deletePost,
    reactToPost,
    addComment,
    replyToComment,
    likeComment,
    likeReply,
    sharePost,
    getByHashtag,
    getUserPosts
} = require('../controllers/postController');

router.use(protect);

router.get('/feed', getFeed);
router.get('/hashtag/:tag', getByHashtag);
router.get('/user/:userId', getUserPosts);

router.route('/')
    .post(upload.array('images', 5), createPost);

router.route('/:id')
    .get(getPost)
    .put(updatePost)
    .delete(deletePost);

router.post('/:id/react', reactToPost);
router.post('/:id/comment', addComment);
router.post('/:id/comments/:cid/reply', replyToComment);
router.post('/:id/comments/:cid/like', likeComment);
router.post('/:id/comments/:cid/replies/:rid/like', likeReply);
router.post('/:id/share', sharePost);

module.exports = router;

