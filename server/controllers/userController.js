const User = require('../models/User');
const { cloudinary } = require('../config/cloudinary');
const https = require('https');
const http = require('http');


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

// POST /api/users/banner
exports.uploadBanner = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        if (user.banner?.publicId) {
            await cloudinary.uploader.destroy(user.banner.publicId);
        }

        user.banner = {
            url: req.file.path,
            publicId: req.file.filename
        };
        await user.save();

        res.json({ message: 'Banner uploaded successfully', banner: user.banner });
    } catch (err) {
        console.error('Banner upload error:', err);
        res.status(500).json({ message: err.message });
    }
};

// DELETE /api/users/banner
exports.removeBanner = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        if (user.banner?.publicId) {
            await cloudinary.uploader.destroy(user.banner.publicId);
        }

        user.banner = { url: '', publicId: '' };
        await user.save();

        res.json({ message: 'Banner removed successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// POST /api/users/setup-hrms
exports.setupHrmsAccount = async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ message: 'Username and password are required' });
        }

        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: 'User not found' });
        if (user.role !== 'hr') return res.status(403).json({ message: 'Only HR users can set up an HRMS account' });
        if (user.hrmsAccount) return res.status(400).json({ message: 'HRMS account already set up' });

        const HRMS_INTERNAL_SECRET = process.env.HRMS_INTERNAL_SECRET || 'careerlens-hrms-secret-2024';
        const HRMS_API_URL = process.env.HRMS_API_URL || 'http://localhost:5001';

        // Build payload for HRMS admin creation
        const payload = JSON.stringify({
            name: user.name,
            username: username.trim().toLowerCase(),
            password,
            email: user.email,
            careerLensUserId: user._id.toString(),
            department: user.company || 'HR'
        });

        // Call HRMS server to register admin
        await new Promise((resolve, reject) => {
            const urlObj = new URL(`${HRMS_API_URL}/api/auth/register-admin`);
            const options = {
                hostname: urlObj.hostname,
                port: urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80),
                path: urlObj.pathname,
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': Buffer.byteLength(payload),
                    'x-internal-secret': HRMS_INTERNAL_SECRET
                }
            };

            const transport = urlObj.protocol === 'https:' ? https : http;
            const hrmsReq = transport.request(options, (hrmsRes) => {
                let data = '';
                hrmsRes.on('data', chunk => data += chunk);
                hrmsRes.on('end', () => {
                    if (hrmsRes.statusCode >= 200 && hrmsRes.statusCode < 300) {
                        resolve(JSON.parse(data));
                    } else {
                        try {
                            const err = JSON.parse(data);
                            reject(new Error(err.message || `HRMS error: ${hrmsRes.statusCode}`));
                        } catch {
                            reject(new Error(`HRMS error: ${hrmsRes.statusCode}`));
                        }
                    }
                });
            });

            hrmsReq.on('error', (err) => reject(new Error(`Cannot connect to HRMS server: ${err.message}`)));
            hrmsReq.write(payload);
            hrmsReq.end();
        });

        // Mark HRMS account as set up
        user.hrmsAccount = true;
        await user.save();

        res.json({ message: 'HRMS account created successfully', hrmsAccount: true });
    } catch (err) {
        console.error('Setup HRMS account error:', err);
        res.status(500).json({ message: err.message || 'Failed to set up HRMS account' });
    }
};
