const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '../.env') });

const Job = require('../models/Job');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

const testEndpoint = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const jobs = await Job.find({}).sort({ createdAt: -1 }).limit(1);
        if (jobs.length === 0) return console.log('No jobs found');
        const job = jobs[0];

        const hr = await User.findById(job.postedBy);
        const token = jwt.sign({ id: hr._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        console.log(`Testing endpoint for Job ID: ${job._id} (${job.title})`);
        
        // We can't hit the localhost server easily if it's in another process, 
        // but we can call the controller function directly!
        
        const { getCandidates } = require('../controllers/jobController');
        
        const req = {
            params: { id: job._id.toString() },
            user: { _id: hr._id }
        };
        
        const res = {
            status: function(code) { this.statusCode = code; return this; },
            json: function(data) { this.data = data; return this; }
        };

        await getCandidates(req, res);
        
        console.log('\n--- RESULTS ---');
        console.log(`Status: ${res.statusCode || 200}`);
        console.log(`Candidates found: ${res.data.length}`);
        if (res.data.length > 0) {
            const first = res.data[0];
            console.log('Top Candidate:', first.user.name);
            console.log('Match Score:', first.matchScore);
            console.log('Recommendation:', first.recommendation);
            console.log('Reason:', first.reason);
            console.log('Matched Skills:', first.matchedSkills);
        }
    } catch (err) {
        console.error(err);
    } finally {
        process.exit(0);
    }
};

testEndpoint();
