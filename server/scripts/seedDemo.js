require('dotenv').config();
const mongoose = require('mongoose');

const User = require('../models/User');
const Profile = require('../models/Profile');
const Post = require('../models/Post');
const { Connection, Follow } = require('../models/Connection');

const DEMO_PASSWORD = 'Password@123';

const randomPick = (arr) => arr[Math.floor(Math.random() * arr.length)];

const demoUsers = [
    {
        name: 'Aarav Mehta',
        email: 'aarav@demo.com',
        role: 'jobseeker',
        company: 'Acme Labs',
        industry: 'Software',
        headline: 'Full‑Stack Developer (React/Node)',
        location: 'Bengaluru, IN',
        skills: ['React', 'Node.js', 'MongoDB', 'Express', 'TypeScript', 'AWS'],
    },
    {
        name: 'Sara Khan',
        email: 'sara@demo.com',
        role: 'jobseeker',
        company: 'Nimbus',
        industry: 'Fintech',
        headline: 'Frontend Engineer · UI Systems',
        location: 'Karachi, PK',
        skills: ['React', 'Redux', 'Design Systems', 'CSS', 'Vite'],
    },
    {
        name: 'Daniel Chen',
        email: 'daniel@demo.com',
        role: 'jobseeker',
        company: 'Orbit Health',
        industry: 'Healthcare',
        headline: 'Data Analyst · SQL · Python',
        location: 'Toronto, CA',
        skills: ['SQL', 'Python', 'Power BI', 'Statistics', 'ETL'],
    },
    {
        name: 'Priya Sharma',
        email: 'priya.hr@demo.com',
        role: 'hr',
        company: 'TalentBridge',
        industry: 'Recruiting',
        headline: 'Technical Recruiter (SWE, Data)',
        location: 'Delhi, IN',
        skills: [],
    },
    {
        name: 'Michael Rivera',
        email: 'x',
        role: 'hr',
        company: 'BrightHire',
        industry: 'HR Tech',
        headline: 'HR Partner · Hiring & Culture',
        location: 'Austin, US',
        skills: [],
    }
];

async function main() {
    if (!process.env.MONGO_URI) {
        throw new Error('MONGO_URI is missing in server/.env');
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected');

    const demoEmails = demoUsers.map(u => u.email.toLowerCase());

    // Remove previous demo data
    const existingUsers = await User.find({ email: { $in: demoEmails } }).select('_id email');
    const existingUserIds = existingUsers.map(u => u._id);

    await Post.deleteMany({ author: { $in: existingUserIds } });
    await Profile.deleteMany({ user: { $in: existingUserIds } });
    await Connection.deleteMany({ $or: [{ sender: { $in: existingUserIds } }, { receiver: { $in: existingUserIds } }] });
    await Follow.deleteMany({ $or: [{ follower: { $in: existingUserIds } }, { following: { $in: existingUserIds } }] });
    await User.deleteMany({ _id: { $in: existingUserIds } });

    // Create users + profiles
    const created = [];
    for (const u of demoUsers) {
        const user = await User.create({
            name: u.name,
            email: u.email.toLowerCase(),
            password: DEMO_PASSWORD,
            role: u.role,
            company: u.company,
            industry: u.industry,
            avatar: { url: '', publicId: '' }
        });

        if (u.role === 'jobseeker') {
            const profile = await Profile.create({
                user: user._id,
                headline: u.headline,
                summary: `Hi, I'm ${u.name.split(' ')[0]}. I build practical products and love collaborating with teams. Open to new opportunities.`,
                location: u.location,
                skills: u.skills,
                experience: [
                    {
                        title: randomPick(['Software Engineer', 'Frontend Engineer', 'Full‑Stack Developer']),
                        company: u.company,
                        location: u.location,
                        startDate: new Date('2023-01-01'),
                        current: true,
                        description: 'Built features end‑to‑end, improved performance, and shipped polished UI.'
                    }
                ],
                education: [
                    {
                        degree: randomPick(['B.Tech', 'BS', 'BSc']),
                        fieldOfStudy: randomPick(['Computer Science', 'Information Systems', 'Statistics']),
                        institution: randomPick(['State University', 'Tech Institute', 'City College']),
                        startYear: 2018,
                        endYear: 2022,
                        grade: 'A'
                    }
                ],
                linkedIn: `https://linkedin.com/in/${u.email.split('@')[0]}`,
                github: `https://github.com/${u.email.split('@')[0]}`,
                portfolio: `https://${u.email.split('@')[0]}.dev`,
                resume: {
                    url: 'https://example.com/demo-resume.pdf',
                    publicId: 'demo/resume',
                    originalName: `${u.name.replace(/\s/g, '_')}_Resume.pdf`,
                    uploadedAt: new Date()
                },
                aiAnalysis: {
                    score: randomPick([72, 78, 84, 88]),
                    feedback: 'Strong baseline profile. Add measurable impact and more keywords matching target roles.',
                    missingKeywords: randomPick([['system design', 'testing'], ['CI/CD', 'Docker'], ['React performance', 'a11y']]),
                    extractedSkills: u.skills,
                    profileSummary: 'Well-structured, with clear experience and relevant skills.',
                    lastAnalyzed: new Date()
                },
                completionPercentage: 95
            });
            user.profile = profile._id;
            await user.save();
        }

        created.push(user);
    }

    const jobseekers = created.filter(u => u.role === 'jobseeker');
    const hrs = created.filter(u => u.role === 'hr');

    // Create some connections between jobseekers
    for (let i = 0; i < jobseekers.length; i++) {
        for (let j = i + 1; j < jobseekers.length; j++) {
            await Connection.create({ sender: jobseekers[i]._id, receiver: jobseekers[j]._id, status: 'accepted' });
        }
    }

    // HR follows all jobseekers
    for (const hr of hrs) {
        for (const js of jobseekers) {
            await Follow.create({ follower: hr._id, following: js._id });
        }
    }

    // Create sample posts
    const samplePosts = [
        'Just shipped a new feature today — performance improved by 40%.',
        'Looking for feedback on my resume — any tips for frontend roles?',
        'Today I learned: small UX tweaks can massively improve conversions.',
        'Open to opportunities. Happy to connect!',
    ];

    for (const js of jobseekers) {
        await Post.create({
            author: js._id,
            content: randomPick(samplePosts),
            images: [],
            hashtags: ['careerlens', 'career', 'networking'],
            visibility: 'public'
        });
        await Post.create({
            author: js._id,
            content: randomPick(samplePosts),
            images: [],
            hashtags: ['jobs', 'react', 'node'],
            visibility: 'public'
        });
    }

    console.log('✅ Demo seeded');
    console.log(`Login password for all demo users: ${DEMO_PASSWORD}`);
    console.log('Demo emails:');
    demoUsers.forEach(u => console.log(`- ${u.email} (${u.role})`));

    await mongoose.disconnect();
}

main().catch(async (err) => {
    console.error('❌ Seed failed:', err);
    try { await mongoose.disconnect(); } catch { }
    process.exit(1);
});

