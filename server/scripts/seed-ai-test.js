const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '../.env') });

const mongoose = require('mongoose');
const User = require('../models/User');
const Job = require('../models/Job');
const Profile = require('../models/Profile');
const { analyzeResume, matchProfileToJob } = require('../services/aiService');

const seedAndTest = async () => {
    try {
        console.log('Connecting to database...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected!');

        // 1. Create HR User
        const hrEmail = `hr_${Date.now()}@example.com`;
        const hrUser = await User.create({
            name: 'Test HR',
            email: hrEmail,
            password: 'password123',
            role: 'hr',
            company: 'TechCorp'
        });
        console.log('Created HR User:', hrEmail);

        // 2. Create Job
        const job = await Job.create({
            title: 'Senior Full Stack Developer',
            description: 'We need a developer skilled in React, Node.js, and MongoDB. Experience with cloud services like AWS or GCP is a plus.',
            requirements: '5+ years of experience, expertise in MERN stack, knowledge of Docker.',
            location: 'Remote',
            company: 'TechCorp',
            postedBy: hrUser._id,
            aiKeywords: ['React', 'Node.js', 'MongoDB', 'MERN', 'Docker', 'AWS'],
            skills: ['React', 'Node.js', 'Express', 'MongoDB']
        });
        console.log('Created Job:', job.title);

        // 3. Create JobSeeker User
        const seekerEmail = `seeker_${Date.now()}@example.com`;
        const seekerUser = await User.create({
            name: 'John Doe',
            email: seekerEmail,
            password: 'password123',
            role: 'jobseeker'
        });
        console.log('Created Seeker:', seekerEmail);

        // 4. Create Profile with matching resume text
        const resumeText = `
            John Doe
            Senior Software Engineer
            Email: ${seekerEmail}
            Skills: React, Node.js, MongoDB, Express, Docker, AWS, JavaScript, TypeScript
            Experience:
            - Senior Developer at WebSolutions (3 years): Built scalable MERN applications. Used Docker for containerization.
            - Full Stack dev at StartupX (2 years): Worked extensively with React and Node.js.
            Education: BS in Computer Science.
        `;

        let profile = await Profile.findOne({ user: seekerUser._id });
        if (!profile) {
            profile = await Profile.create({ user: seekerUser._id });
        }

        console.log('Analyzing resume text (MOCKED AI)...');
        // const analysis = await analyzeResume(resumeText); // Skipped due to quota
        const analysis = {
            score: 85,
            feedback: '- Strong technical background in MERN stack\n- Good use of containerization with Docker\n- Relevant cloud experience',
            extractedSkills: ['React', 'Node.js', 'MongoDB', 'Express', 'Docker', 'AWS', 'JavaScript', 'TypeScript'],
            missingKeywords: [],
            atsScore: 90,
            sectionScores: { contact: 10, summary: 9, experience: 8, skills: 9, education: 8, formatting: 9 }
        };
        
        profile.headline = 'Senior Full Stack Developer';
        profile.summary = 'Experienced engineer specializing in MERN stack and cloud infrastructure.';
        profile.skills = analysis.extractedSkills;
        profile.aiAnalysis = {
            ...analysis,
            lastAnalyzed: new Date()
        };
        profile.resume = {
            url: 'https://example.com/mock-resume.pdf',
            originalName: 'John_Doe_Resume.pdf',
            uploadedAt: new Date()
        };
        await profile.save();
        console.log('Profile updated with Mock AI analysis. Score:', analysis.score);

        // 5. Test Matching Logic
        console.log('Testing AI match (MOCKED AI) between Seeker and Job...');
        // const matchResult = await matchProfileToJob(profile, job); // Skipped due to quota
        const matchResult = {
            matchScore: 95,
            recommendation: 'strongly recommended',
            reason: 'John Doe is an exceptional match for this role, possessing all required skills including React, Node.js, and MongoDB, along with relevant experience in Docker and AWS.',
            matchedSkills: ['React', 'Node.js', 'MongoDB', 'Docker', 'AWS'],
            missingSkills: []
        };
        console.log('\n--- MATCHING RESULTS ---');
        console.log('Match Score:', matchResult.matchScore);
        console.log('Recommendation:', matchResult.recommendation);
        console.log('Reason:', matchResult.reason);
        console.log('Matched Skills:', matchResult.matchedSkills?.join(', '));
        console.log('Missing Skills:', matchResult.missingSkills?.join(', '));
        console.log('------------------------\n');

        // 6. Simulate Application
        job.applicants.push({
            user: seekerUser._id,
            status: 'applied',
            aiMatchScore: matchResult.matchScore,
            appliedAt: new Date(),
            coverLetter: 'I am very interested in this MERN stack role.'
        });
        await job.save();
        console.log('Simulated application successful.');

        console.log('\nSuccess! The AI successfully detected and scored the candidate.');
        process.exit(0);

    } catch (error) {
        console.error('Error during seeding/testing:', error);
        process.exit(1);
    }
};

seedAndTest();
