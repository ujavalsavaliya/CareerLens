const mongoose = require('mongoose');

const replySchema = new mongoose.Schema({
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String, required: true, maxlength: 1000 },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    createdAt: { type: Date, default: Date.now }
});

const commentSchema = new mongoose.Schema({
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String, required: true, maxlength: 1000 },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    replies: [replySchema],
    createdAt: { type: Date, default: Date.now }
});

const reactionSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['like', 'celebrate', 'support', 'insightful', 'curious'], default: 'like' }
}, { _id: false });

const postSchema = new mongoose.Schema({
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, maxlength: 3000, default: '' },
    images: [{ url: String, publicId: String }],
    mentions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    reactions: [reactionSchema],
    comments: [commentSchema],
    shareCount: { type: Number, default: 0 },
    hashtags: [{ type: String, lowercase: true }],
    visibility: { type: String, enum: ['public', 'connections'], default: 'public' },
    originalPost: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', default: null },
    isRepost: { type: Boolean, default: false }
}, { timestamps: true });

postSchema.index({ author: 1, createdAt: -1 });
postSchema.index({ hashtags: 1 });

module.exports = mongoose.model('Post', postSchema);
