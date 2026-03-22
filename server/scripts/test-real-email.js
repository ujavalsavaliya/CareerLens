const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '../.env') });

const Job = require('../models/Job');
const User = require('../models/User');

const { scheduleInterview } = require('../controllers/jobController');

const runRealTest = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to Database');

        const targetEmail = 'ujavalsavaliya@gmail.com';
        
        // 1. Get or Create HR and Candidate
        let hr = await User.findOne({ role: 'hr' });
        if (!hr) {
             hr = await User.create({ name: 'Admin HR', email: 'admin@test.com', password: 'password', role: 'hr', company: 'CareerLens' });
        }
        
        let candidate = await User.findOne({ email: targetEmail });
        if (!candidate) {
            candidate = await User.create({ name: 'Test User', email: targetEmail, password: 'password', role: 'jobseeker' });
            console.log('Created candidate user for:', targetEmail);
        }

        // 2. Create a Mock Job
        const job = await Job.create({
            title: 'Real Zoom Test Job',
            description: 'This is a test for Zoom and Email integration.',
            company: 'CareerLens Test Dept.',
            postedBy: hr._id,
            applicants: [{
                user: candidate._id,
                status: 'applied',
                appliedAt: new Date()
            }]
        });
        console.log('Created Job:', job._id);

        // 3. Trigger Real Scheduling (Real email + Real Zoom)
        console.log('\n--- Trendering Real Interview Scheduling ---');
        const req = {
            params: { 
                id: job._id.toString(), 
                userId: candidate._id.toString() 
            },
            user: { _id: hr._id },
            body: {
                round: 'Live Integration Test',
                scheduledAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // 1 hour from now
                durationMinutes: 30,
                notes: 'This is a REAL test from Antigravity. Please verify the Zoom link and details.'
            }
        };
        const res = {
            status: function(code) { this.statusCode = code; return this; },
            json: function(data) { this.data = data; return this; }
        };

        await scheduleInterview(req, res);
        console.log('Schedule Response Status:', res.statusCode || 200);

        const jobFinal = await Job.findById(job._id);
        const app = jobFinal.applicants.find(a => a.user.toString() === candidate._id.toString());
        
        console.log('\n--- REAL TEST RESULTS ---');
        console.log('Zoom Join URL:', app.interview.zoomJoinUrl);
        console.log('If Zoom link start with zoom.us, it is GENUINE.');

    } catch (err) {
        console.error('Real Test Error:', err);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
};

runRealTest();
