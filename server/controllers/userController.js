const User = require('../models/User');
const { cloudinary } = require('../config/cloudinary');

// POST /api/users/avatar
exports.uploadAvatar = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        // Delete old avatar if exists
        if (user.avatar?.publicId) {
            await cloudinary.uploader.destroy(user.avatar.publicId);
        }

        user.avatar = {
            url: req.file.path,
            publicId: req.file.filename
        };
        await user.save();

        res.json({ message: 'Avatar uploaded successfully', avatar: user.avatar });
    } catch (err) {
        console.error('Avatar upload error:', err);
        res.status(500).json({ message: err.message });
    }
};

// DELETE /api/users/avatar
exports.removeAvatar = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        if (user.avatar?.publicId) {
            await cloudinary.uploader.destroy(user.avatar.publicId);
        }

        user.avatar = { url: '', publicId: '' };
        await user.save();

        res.json({ message: 'Avatar removed successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

