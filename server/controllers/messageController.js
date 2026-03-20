const { Conversation, Message } = require('../models/Message');
const Notification = require('../models/Notification');

// Helper: find or create 1-on-1 conversation
const getOrCreateConversation = async (userA, userB) => {
    let conv = await Conversation.findOne({
        participants: { $all: [userA, userB], $size: 2 }
    });
    if (!conv) {
        conv = await Conversation.create({
            participants: [userA, userB],
            lastMessageAt: new Date()
        });
    }
    return conv;
};

// GET /api/messages — list conversations
exports.getConversations = async (req, res) => {
    try {
        const convs = await Conversation.find({ participants: req.user._id })
            .sort({ lastMessageAt: -1 })
            .populate('participants', 'name avatar role company')
            .populate('lastMessage');

        const list = convs.map(c => ({
            ...c.toObject(),
            other: c.participants.find(p => p._id.toString() !== req.user._id.toString())
        }));

        res.json(list);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// POST /api/messages/:userId — send message / start conversation
exports.sendMessage = async (req, res) => {
    try {
        const uploadedMedia = (req.files || []).map(f => ({
            url: f.path,
            type: f.mimetype.startsWith('image') ? 'image' : 
                  f.mimetype.startsWith('video') ? 'video' : 'document',
            name: f.originalname
        }));

        const { content } = req.body;

        const bodyMedia = Array.isArray(req.body.media) ? req.body.media : [];
        const media = uploadedMedia.length > 0 ? uploadedMedia : bodyMedia;

        if (!content && media.length === 0) return res.status(400).json({ message: 'Message content or media required' });

        const conv = await getOrCreateConversation(req.user._id, req.params.userId);

        const msg = await Message.create({
            conversation: conv._id,
            sender: req.user._id,
            content: content || '',
            media,
            readBy: [req.user._id]
        });

        conv.lastMessage = msg._id;
        conv.lastMessageAt = new Date();
        await conv.save();

        await Notification.create({
            recipient: req.params.userId,
            sender: req.user._id,
            type: 'message'
        });

        const populated = await msg.populate('sender', 'name avatar');
        res.status(201).json({ message: populated, conversationId: conv._id });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// GET /api/messages/:conversationId — get messages in conversation
exports.getMessages = async (req, res) => {
    try {
        const conv = await Conversation.findById(req.params.conversationId);
        if (!conv) return res.status(404).json({ message: 'Conversation not found' });

        // Ensure user is participant
        if (!conv.participants.some(p => p.toString() === req.user._id.toString())) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 30;
        const skip = (page - 1) * limit;

        const messages = await Message.find({ conversation: conv._id })
            .sort({ createdAt: -1 })
            .skip(skip).limit(limit)
            .populate('sender', 'name avatar');

        res.json(messages.reverse());
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// PUT /api/messages/:conversationId/read — mark messages as read
exports.markRead = async (req, res) => {
    try {
        await Message.updateMany(
            { conversation: req.params.conversationId, readBy: { $ne: req.user._id } },
            { $addToSet: { readBy: req.user._id } }
        );
        res.json({ message: 'Messages marked as read' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
