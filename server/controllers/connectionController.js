const { Connection, Follow } = require('../models/Connection');
const User = require('../models/User');
const Notification = require('../models/Notification');

// Helper: create notification
const notify = async (recipient, sender, type) => {
    if (recipient.toString() === sender.toString()) return;
    await Notification.create({ recipient, sender, type });
};

// POST /api/connections/request/:userId
exports.sendRequest = async (req, res) => {
    try {
        const receiverId = req.params.userId;
        if (receiverId === req.user._id.toString()) {
            return res.status(400).json({ message: 'Cannot connect with yourself' });
        }

        const existing = await Connection.findOne({
            $or: [
                { sender: req.user._id, receiver: receiverId },
                { sender: receiverId, receiver: req.user._id }
            ]
        });
        if (existing) {
            return res.status(400).json({ message: `Connection already exists (status: ${existing.status})` });
        }

        const conn = await Connection.create({ sender: req.user._id, receiver: receiverId });
        await notify(receiverId, req.user._id, 'connection_request');
        res.status(201).json(conn);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// PUT /api/connections/accept/:userId
exports.acceptRequest = async (req, res) => {
    try {
        const conn = await Connection.findOne({
            sender: req.params.userId,
            receiver: req.user._id,
            status: 'pending'
        });
        if (!conn) return res.status(404).json({ message: 'Connection request not found' });

        conn.status = 'accepted';
        await conn.save();

        // Increment connection counts
        await User.findByIdAndUpdate(req.user._id, { $inc: { connectionCount: 1 } });
        await User.findByIdAndUpdate(req.params.userId, { $inc: { connectionCount: 1 } });

        await notify(conn.sender, req.user._id, 'connection_accepted');
        res.json(conn);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// PUT /api/connections/reject/:userId
exports.rejectRequest = async (req, res) => {
    try {
        const conn = await Connection.findOne({
            sender: req.params.userId,
            receiver: req.user._id,
            status: 'pending'
        });
        if (!conn) return res.status(404).json({ message: 'Connection request not found' });
        conn.status = 'rejected';
        await conn.save();
        res.json({ message: 'Request rejected' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// DELETE /api/connections/withdraw/:userId
exports.withdrawRequest = async (req, res) => {
    try {
        const conn = await Connection.findOneAndDelete({
            sender: req.user._id,
            receiver: req.params.userId,
            status: 'pending'
        });
        if (!conn) return res.status(404).json({ message: 'Pending request not found' });
        res.json({ message: 'Request withdrawn' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// DELETE /api/connections/remove/:userId
exports.removeConnection = async (req, res) => {
    try {
        const conn = await Connection.findOneAndDelete({
            $or: [
                { sender: req.user._id, receiver: req.params.userId, status: 'accepted' },
                { sender: req.params.userId, receiver: req.user._id, status: 'accepted' }
            ]
        });
        if (!conn) return res.status(404).json({ message: 'Connection not found' });

        await User.findByIdAndUpdate(req.user._id, { $inc: { connectionCount: -1 } });
        await User.findByIdAndUpdate(req.params.userId, { $inc: { connectionCount: -1 } });

        res.json({ message: 'Connection removed' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// GET /api/connections
exports.getConnections = async (req, res) => {
    try {
        const conns = await Connection.find({
            $or: [{ sender: req.user._id }, { receiver: req.user._id }],
            status: 'accepted'
        })
            .populate('sender', 'name avatar role company headline connectionCount')
            .populate('receiver', 'name avatar role company headline connectionCount');

        const list = conns.map(c => ({
            connection: c._id,
            user: c.sender._id.toString() === req.user._id.toString() ? c.receiver : c.sender,
            since: c.updatedAt
        }));

        res.json(list);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// GET /api/connections/pending
exports.getPendingRequests = async (req, res) => {
    try {
        const pending = await Connection.find({ receiver: req.user._id, status: 'pending' })
            .populate('sender', 'name avatar role company headline connectionCount')
            .sort({ createdAt: -1 });
        res.json(pending);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// GET /api/connections/sent
exports.getSentRequests = async (req, res) => {
    try {
        const sent = await Connection.find({ sender: req.user._id, status: 'pending' })
            .populate('receiver', 'name avatar role company headline')
            .sort({ createdAt: -1 });
        res.json(sent);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// GET /api/connections/suggestions
exports.getSuggestions = async (req, res) => {
    try {
        // Find existing connection user IDs
        const existingConns = await Connection.find({
            $or: [{ sender: req.user._id }, { receiver: req.user._id }]
        });
        const knownIds = existingConns.flatMap(c => [c.sender.toString(), c.receiver.toString()]);
        knownIds.push(req.user._id.toString());

        // Suggest users in same company/industry not yet connected
        const suggestions = await User.find({
            _id: { $nin: knownIds },
            $or: [
                { company: req.user.company, company: { $ne: '' } },
                { industry: req.user.industry, industry: { $ne: '' } }
            ]
        })
            .select('name avatar role company headline connectionCount industry')
            .limit(10);

        if (suggestions.length < 5) {
            // Fill with random users
            const extra = await User.find({ _id: { $nin: [...knownIds, ...suggestions.map(s => s._id.toString())] } })
                .select('name avatar role company headline connectionCount')
                .limit(10 - suggestions.length);
            suggestions.push(...extra);
        }

        res.json(suggestions);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// GET /api/connections/status/:userId
exports.getStatus = async (req, res) => {
    try {
        const userId = req.params.userId;
        const conn = await Connection.findOne({
            $or: [
                { sender: req.user._id, receiver: userId },
                { sender: userId, receiver: req.user._id }
            ]
        });

        const isFollowing = await Follow.exists({ follower: req.user._id, following: userId });

        if (!conn) return res.json({ status: 'none', isFollowing: !!isFollowing });

        let status = conn.status;
        if (conn.sender.toString() === req.user._id.toString()) {
            status = conn.status === 'pending' ? 'sent' : conn.status;
        } else {
            status = conn.status === 'pending' ? 'received' : conn.status;
        }

        res.json({ status, connectionId: conn._id, isFollowing: !!isFollowing });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// POST /api/connections/follow/:userId
exports.follow = async (req, res) => {
    try {
        const targetId = req.params.userId;
        if (targetId === req.user._id.toString()) {
            return res.status(400).json({ message: 'Cannot follow yourself' });
        }
        const exists = await Follow.findOne({ follower: req.user._id, following: targetId });
        if (exists) return res.status(400).json({ message: 'Already following' });

        await Follow.create({ follower: req.user._id, following: targetId });
        await notify(targetId, req.user._id, 'follow');
        res.status(201).json({ message: 'Following' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// DELETE /api/connections/unfollow/:userId
exports.unfollow = async (req, res) => {
    try {
        const result = await Follow.findOneAndDelete({ follower: req.user._id, following: req.params.userId });
        if (!result) return res.status(404).json({ message: 'Not following this user' });
        res.json({ message: 'Unfollowed' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
