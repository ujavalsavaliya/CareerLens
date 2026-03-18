const Post = require('../models/Post');
const Notification = require('../models/Notification');
const { Connection } = require('../models/Connection');
const User = require('../models/User');

// Helper: extract hashtags from content
const extractHashtags = (text) => {
    const tags = text.match(/#[a-zA-Z0-9_]+/g) || [];
    return tags.map(t => t.slice(1).toLowerCase());
};

// Helper: extract @mentions (simple handle matching)
const extractMentions = (text) => {
    const raw = text.match(/@[a-zA-Z0-9_]+/g) || [];
    return raw.map(m => m.slice(1));
};

// Helper: create notification safely
const notify = async (recipient, sender, type, post = null, comment = '') => {
    if (recipient.toString() === sender.toString()) return;
    await Notification.create({ recipient, sender, type, post, comment });
};

// GET /api/posts/feed
exports.getFeed = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        let query;
        if (req.user.role === 'hr') {
            // HR: see all public posts
            query = { visibility: 'public' };
        } else {
            // Jobseeker: see own + connections' public posts
            const connections = await Connection.find({
                $or: [{ sender: req.user._id }, { receiver: req.user._id }],
                status: 'accepted'
            });
            const connectionIds = connections.map(c =>
                c.sender.toString() === req.user._id.toString() ? c.receiver : c.sender
            );
            const authorIds = [...connectionIds, req.user._id];
            query = { author: { $in: authorIds }, visibility: 'public' };
        }

        const posts = await Post.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate('author', 'name avatar role company headline')
            .populate('comments.author', 'name avatar')
            .populate('comments.replies.author', 'name avatar')
            .populate('originalPost', 'content author')
            .lean();

        const postsWithStatus = posts.map(p => ({
            ...p,
            userReaction: p.reactions?.find(r => r.user?.toString() === req.user._id.toString())?.type || null,
            reactionCount: p.reactions?.length || 0
        }));

        const total = await Post.countDocuments(query);

        res.json({ posts: postsWithStatus, total, page, pages: Math.ceil(total / limit) });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// POST /api/posts
exports.createPost = async (req, res) => {
    try {
        const { content, visibility } = req.body;

        const uploadedImages = (req.files || []).map(f => ({
            url: f.path,
            publicId: f.filename
        }));

        // Back-compat: allow passing images array in JSON
        const bodyImages = Array.isArray(req.body.images) ? req.body.images : [];
        const images = uploadedImages.length > 0 ? uploadedImages : bodyImages;

        if (!content && (!images || images.length === 0)) {
            return res.status(400).json({ message: 'Post must have content or images' });
        }
        const hashtags = extractHashtags(content || '');
        const mentions = extractMentions(content || '');

        // Resolve mentions to user IDs (by name or email contains handle)
        const mentionedUsers = [];
        if (mentions.length > 0) {
            const users = await User.find({
                $or: mentions.map(m => ({
                    $or: [
                        { name: new RegExp(m, 'i') },
                        { email: new RegExp(m, 'i') }
                    ]
                }))
            }).select('_id');
            mentionedUsers.push(...users.map(u => u._id));
        }

        const post = await Post.create({
            author: req.user._id,
            content: content || '',
            images: images || [],
            hashtags,
            mentions: mentionedUsers,
            visibility: visibility || 'public'
        });

        // Notify mentions
        for (const uid of mentionedUsers) {
            await notify(uid, req.user._id, 'post_mention', post._id);
        }

        const populated = await post.populate('author', 'name avatar role company');
        res.status(201).json(populated);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// GET /api/posts/:id
exports.getPost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id)
            .populate('author', 'name avatar role company headline')
            .populate('comments.author', 'name avatar')
            .populate('comments.replies.author', 'name avatar');
        if (!post) return res.status(404).json({ message: 'Post not found' });
        res.json(post);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// PUT /api/posts/:id
exports.updatePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ message: 'Post not found' });
        if (post.author.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }
        const { content, visibility } = req.body;
        if (content !== undefined) {
            post.content = content;
            post.hashtags = extractHashtags(content);
        }
        if (visibility) post.visibility = visibility;
        await post.save();
        res.json(post);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// DELETE /api/posts/:id
exports.deletePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ message: 'Post not found' });
        if (post.author.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }
        await post.deleteOne();
        res.json({ message: 'Post deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// POST /api/posts/:id/react
exports.reactToPost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ message: 'Post not found' });

        const { type = 'like' } = req.body;
        const userId = req.user._id;
        const existingIdx = post.reactions.findIndex(r => r.user?.toString() === userId.toString());

        if (existingIdx > -1) {
            if (post.reactions[existingIdx].type === type) {
                // toggle off
                post.reactions.splice(existingIdx, 1);
            } else {
                // change reaction type
                post.reactions[existingIdx].type = type;
            }
        } else {
            post.reactions.push({ user: userId, type });
            await notify(post.author, userId, 'post_like', post._id);
        }

        await post.save();
        res.json({
            reactions: post.reactions,
            count: post.reactions.length,
            userReaction: post.reactions.find(r => r.user?.toString() === userId.toString())?.type || null
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// POST /api/posts/:id/comment
exports.addComment = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ message: 'Post not found' });

        const { text } = req.body;
        if (!text) return res.status(400).json({ message: 'Comment text required' });

        post.comments.push({ author: req.user._id, text });
        await post.save();
        await notify(post.author, req.user._id, 'post_comment', post._id, text.slice(0, 100));

        const updated = await Post.findById(post._id)
            .populate('comments.author', 'name avatar');
        res.status(201).json(updated.comments[updated.comments.length - 1]);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// POST /api/posts/:id/comments/:cid/reply
exports.replyToComment = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ message: 'Post not found' });

        const comment = post.comments.id(req.params.cid);
        if (!comment) return res.status(404).json({ message: 'Comment not found' });

        const { text } = req.body;
        if (!text) return res.status(400).json({ message: 'Reply text required' });

        comment.replies.push({ author: req.user._id, text });
        await post.save();
        await notify(comment.author, req.user._id, 'comment_reply', post._id, text.slice(0, 100));

        res.status(201).json(comment.replies[comment.replies.length - 1]);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// POST /api/posts/:id/comments/:cid/like
exports.likeComment = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ message: 'Post not found' });

        const comment = post.comments.id(req.params.cid);
        if (!comment) return res.status(404).json({ message: 'Comment not found' });

        const userId = req.user._id;
        const idx = comment.likes.indexOf(userId.toString());
        if (idx > -1) {
            comment.likes.splice(idx, 1);
        } else {
            comment.likes.push(userId);
            await notify(comment.author, userId, 'comment_like', post._id);
        }
        await post.save();
        res.json({ likes: comment.likes.length });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// POST /api/posts/:id/share
exports.sharePost = async (req, res) => {
    try {
        const original = await Post.findById(req.params.id);
        if (!original) return res.status(404).json({ message: 'Post not found' });

        const { content } = req.body;
        original.shareCount += 1;
        await original.save();

        const repost = await Post.create({
            author: req.user._id,
            content: content || '',
            hashtags: extractHashtags(content || ''),
            originalPost: original._id,
            isRepost: true,
            visibility: 'public'
        });

        await notify(original.author, req.user._id, 'post_share', original._id);
        const populated = await repost.populate('author', 'name avatar role company');
        res.status(201).json(populated);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// GET /api/posts/hashtag/:tag
exports.getByHashtag = async (req, res) => {
    try {
        const tag = req.params.tag.toLowerCase();
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const posts = await Post.find({ hashtags: tag, visibility: 'public' })
            .sort({ createdAt: -1 })
            .skip(skip).limit(limit)
            .populate('author', 'name avatar role company');

        const total = await Post.countDocuments({ hashtags: tag, visibility: 'public' });
        res.json({ posts, total, page });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// GET /api/posts/user/:userId
exports.getUserPosts = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const posts = await Post.find({ author: req.params.userId, visibility: 'public' })
            .sort({ createdAt: -1 })
            .skip(skip).limit(limit)
            .populate('author', 'name avatar role company headline');

        const total = await Post.countDocuments({ author: req.params.userId });
        res.json({ posts, total, page });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
