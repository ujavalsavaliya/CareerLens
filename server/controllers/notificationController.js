const Notification = require('../models/Notification');

// GET /api/notifications
exports.getNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({ recipient: req.user._id })
            .sort({ createdAt: -1 })
            .limit(50)
            .populate('sender', 'name avatar')
            .populate('post', 'content');

        const unreadCount = await Notification.countDocuments({ recipient: req.user._id, read: false });
        res.json({ notifications, unreadCount });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// PUT /api/notifications/:id/read
exports.markRead = async (req, res) => {
    try {
        const n = await Notification.findOneAndUpdate(
            { _id: req.params.id, recipient: req.user._id },
            { read: true },
            { returnDocument: 'after' }
        );
        if (!n) return res.status(404).json({ message: 'Notification not found' });
        res.json(n);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// PUT /api/notifications/read-all
exports.markAllRead = async (req, res) => {
    try {
        await Notification.updateMany({ recipient: req.user._id, read: false }, { read: true });
        res.json({ message: 'All notifications marked as read' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// DELETE /api/notifications/:id
exports.deleteNotification = async (req, res) => {
    try {
        await Notification.findOneAndDelete({ _id: req.params.id, recipient: req.user._id });
        res.json({ message: 'Notification deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
