const mongoose = require('mongoose');

const connectionSchema = new mongoose.Schema({
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected', 'withdrawn'],
        default: 'pending'
    }
}, { timestamps: true });

// Prevent duplicate connection requests
connectionSchema.index({ sender: 1, receiver: 1 }, { unique: true });
connectionSchema.index({ receiver: 1, status: 1 });
connectionSchema.index({ sender: 1, status: 1 });

// Follow model (one-directional)
const followSchema = new mongoose.Schema({
    follower: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    following: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

followSchema.index({ follower: 1, following: 1 }, { unique: true });

const Connection = mongoose.model('Connection', connectionSchema);
const Follow = mongoose.model('Follow', followSchema);

module.exports = { Connection, Follow };
