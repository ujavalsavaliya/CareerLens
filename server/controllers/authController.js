const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Profile = require('../models/Profile');

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });

// @desc  Register user
const register = async (req, res) => {
    try {
        let { name, email, password, role, company } = req.body;
        if (!name || !email || !password) return res.status(400).json({ message: 'Please provide all required fields' });

        // Normalize email for consistent lookup
        email = email.toLowerCase().trim();

        const exists = await User.findOne({ email });
        if (exists) return res.status(400).json({ message: 'Email already registered' });

        const user = await User.create({ name, email, password, role: role || 'jobseeker', company: company || '' });

        // Auto-create profile for job seekers
        if (user.role === 'jobseeker') {
            const profile = await Profile.create({ user: user._id });
            user.profile = profile._id;
            await user.save();
        }

        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            company: user.company,
            premium: user.premium,
            profile: user.profile,
            hrmsAccount: user.hrmsAccount,
            token: generateToken(user._id)
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc  Login user
const login = async (req, res) => {
    try {
        let { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: 'Please provide email and password' });
        }

        // Normalize email so login is case-insensitive
        email = email.toLowerCase().trim();

        const user = await User.findOne({ email });
        if (!user || !(await user.matchPassword(password))) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            company: user.company,
            avatar: user.avatar,
            banner: user.banner,
            premium: user.premium,
            profile: user.profile,
            hrmsAccount: user.hrmsAccount,
            token: generateToken(user._id)
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc  Get current user
const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password').populate('profile');
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { register, login, getMe };
