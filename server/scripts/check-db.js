const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '../.env') });

const Job = require('../models/Job');
const Profile = require('../models/Profile');
const User = require('../models/User');

const checkDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');

        const jobs = await Job.find({}).sort({ createdAt: -1 }).limit(1);
        if (jobs.length > 0) {
            const job = jobs[0];
            console.log('\n--- RECENT JOB ---');
            console.log('Title:', job.title);
            console.log('AI Keywords:', job.aiKeywords);
            console.log('Skills:', job.skills);
        }

        const seekers = await User.find({ role: 'jobseeker' }).limit(5);
        console.log(`\n--- RECENT SEEKERS (${seekers.length}) ---`);
        for (const seeker of seekers) {
            const profile = await Profile.findOne({ user: seeker._id });
            console.log(`Seeker: ${seeker.name} (${seeker.email})`);
            if (profile) {
                console.log('  Profile Skills:', profile.skills);
                console.log('  AI Extracted Skills:', profile.aiAnalysis?.extractedSkills);
                console.log('  Match Score in Profile:', profile.aiAnalysis?.score);
            } else {
                console.log('  No Profile found');
            }
        }

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

checkDB();
