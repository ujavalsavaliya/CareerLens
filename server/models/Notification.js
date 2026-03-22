const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: {
        type: String,
        enum: [
            'connection_request',
            'connection_accepted',
            'post_like',
            'post_comment',
            'comment_like',
            'comment_reply',
            'post_share',
            'post_mention',
            'message',
            'follow',
            'job_application',
            'interview_scheduled',
            'interview_reminder'
        ],
        required: true
    },
    post: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', default: null },
    comment: { type: String, default: '' }, // snippet for display
    read: { type: Boolean, default: false }
}, { timestamps: true });

notificationSchema.index({ recipient: 1, read: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
