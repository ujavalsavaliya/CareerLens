const User = require('../models/User');
const Post = require('../models/Post');
const Profile = require('../models/Profile');

// GET /api/search?q=&type=users|posts|hashtags
exports.search = async (req, res) => {
    try {
        const { q, type = 'all' } = req.query;
        if (!q || q.trim().length < 1) {
            return res.status(400).json({ message: 'Search query required' });
        }

        const regex = new RegExp(q.trim(), 'i');
        const results = {};

        if (type === 'all' || type === 'users') {
            results.users = await User.find({
                $or: [
                    { name: regex },
                    { company: regex },
                    { industry: regex }
                ]
            })
                .select('name avatar role company headline connectionCount industry')
                .limit(10);
        }

        if (type === 'all' || type === 'posts') {
            results.posts = await Post.find({
                content: regex,
                visibility: 'public'
            })
                .sort({ createdAt: -1 })
                .limit(10)
                .populate('author', 'name avatar role company');
        }

        if (type === 'all' || type === 'hashtags') {
            const tag = q.replace(/^#/, '').toLowerCase();
            const postsByTag = await Post.find({ hashtags: tag, visibility: 'public' })
                .sort({ createdAt: -1 })
                .limit(10)
                .populate('author', 'name avatar');
            results.hashtags = { tag, posts: postsByTag };
        }

        res.json(results);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
