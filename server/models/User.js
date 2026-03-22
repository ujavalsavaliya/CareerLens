const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true, minlength: 6 },
    role: { type: String, enum: ['jobseeker', 'hr'], default: 'jobseeker' },
    avatar: {
        url: { type: String, default: '' },
        publicId: { type: String, default: '' }
    },
    banner: {
        url: { type: String, default: '' },
        publicId: { type: String, default: '' }
    },
    premium: { type: Boolean, default: false },
    hrmsAccount: { type: Boolean, default: false },
    premiumExpiry: { type: Date },
    profile: { type: mongoose.Schema.Types.ObjectId, ref: 'Profile' },
    company: { type: String, default: '' },
    industry: { type: String, default: '' },
    connectionCount: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

// Normalize legacy avatar & banner strings -> object shape
userSchema.pre('init', function (doc) {
    if (doc && typeof doc.avatar === 'string') {
        doc.avatar = { url: doc.avatar, publicId: '' };
    }
    if (doc && typeof doc.banner === 'string') {
        doc.banner = { url: doc.banner, publicId: '' };
    }
});

// ✅ Mongoose v9 async pre-save — do NOT use next() callback with async
userSchema.pre('save', async function () {
    if (typeof this.avatar === 'string') {
        this.avatar = { url: this.avatar, publicId: '' };
    }
    if (typeof this.banner === 'string') {
        this.banner = { url: this.banner, publicId: '' };
    }
    if (!this.isModified('password')) return;
    this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.matchPassword = async function (enteredPassword) {
    const stored = this.password || '';

    // If it looks like a bcrypt hash, use bcrypt.compare
    const looksHashed = stored.startsWith('$2');
    if (looksHashed) {
        return bcrypt.compare(enteredPassword, stored);
    }

    // Legacy/plaintext password support
    const isMatch = enteredPassword === stored;
    if (isMatch) {
        // Transparently upgrade to hashed password
        this.password = await bcrypt.hash(stored, 12);
        await this.save();
    }
    return isMatch;
};

module.exports = mongoose.model('User', userSchema);
