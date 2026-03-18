const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Profile = require('../models/Profile');
const Job = require('../models/Job');
const connectDB = require('../config/db');

// Sample Data
const techTitles = [
    'Senior React Developer', 'Node.js Backend Engineer', 'Full Stack Developer',
    'DevOps Engineer', 'Data Scientist', 'Mobile App Developer (iOS/Android)',
    'Cloud Architect', 'Cybersecurity Analyst', 'UI/UX Designer', 'Machine Learning Engineer',
    'System Administrator', 'Software Architect', 'Frontend Engineer', 'Backend Specialist',
    'Database Administrator', 'QA Engineer', 'Product Manager (Tech)', 'Solution Architect',
    'Blockchain Developer', 'Embedded Systems Engineer'
];

const nonTechTitles = [
    'Marketing Manager', 'HR Generalist', 'Sales Executive', 'Content Writer',
    'Customer Success Associate', 'Financial Analyst', 'Operations Lead',
    'Legal Counsel', 'Public Relations Specialist', 'Event Coordinator',
    'Social Media Strategist', 'Office Administrator', 'Supply Chain Planner',
    'Accountant', 'Business Development Manager', 'Recruiter', 'Graphic Designer',
    'Project Coordinator', 'Executive Assistant', 'Inventory Specialist'
];

const companies = [
    'TechNova Solutions', 'Global Systems Inc.', 'Creative Minds Agency',
    'FinEdge Group', 'GreenEnergy Corp', 'NextGen Logistics', 'BrightFuture Education',
    'HealthFirst Labs', 'PureWater Solutions', 'Skylark Aviation'
];

const locations = ['Remote', 'New York, NY', 'San Francisco, CA', 'London, UK', 'Berlin, Germany', 'Bangalore, India', 'Singapore', 'Austin, TX', 'Toronto, Canada'];

const techSkills = ['React', 'Node.js', 'MongoDB', 'PostgreSQL', 'AWS', 'Docker', 'Kubernetes', 'Python', 'Java', 'JavaScript', 'TypeScript', 'Tailwind CSS', 'Redis', 'GraphQL'];
const softSkills = ['Communication', 'Leadership', 'Problem Solving', 'Teamwork', 'Project Management', 'Agile', 'Strategic Planning', 'Negotiation'];

const generatePassword = async () => await bcrypt.hash('password123', 12);

const seedData = async () => {
    try {
        await connectDB();
        console.log('🗑️ Clearing existing data...');
        await User.deleteMany({});
        await Profile.deleteMany({});
        await Job.deleteMany({});

        const plainPassword = 'password123';
        const hrUsers = [];
        const seekers = [];

        console.log('👥 Generating users...');

        // Generate 5 HR Users
        for (let i = 1; i <= 5; i++) {
            const hr = await User.create({
                name: `HR Manager ${i}`,
                email: `hr${i}@example.com`,
                password: plainPassword,
                role: 'hr',
                company: companies[i % companies.length],
            });
            hrUsers.push(hr);
        }

        // Generate 30 Jobseekers
        for (let i = 1; i <= 30; i++) {
            const user = await User.create({
                name: `Candidate ${i}`,
                email: `candidate${i}@example.com`,
                password: plainPassword,
                role: 'jobseeker',
            });

            const profileSkills = Array.from({ length: 5 }, () => techSkills[Math.floor(Math.random() * techSkills.length)]);
            const profile = await Profile.create({
                user: user._id,
                headline: i % 2 === 0 ? 'Full Stack Developer' : 'Marketing Professional',
                summary: `Experienced professional with a passion for building great products and helping teams grow. Candidate ${i} has a background in ${i % 2 === 0 ? 'Engineering' : 'Business'}.`,
                skills: [...new Set([...profileSkills, ...softSkills.slice(0, 2)])],
                location: locations[i % locations.length],
                experience: [
                    {
                        title: i % 2 === 0 ? 'Software Engineer' : 'Specialist',
                        company: companies[i % companies.length],
                        description: `Built scalable systems and managed cross-functional teams for ${i} years.`,
                        startDate: new Date(2020, 0, 1),
                        current: true
                    }
                ]
            });

            user.profile = profile._id;
            await user.save();
            seekers.push(user);
        }

        console.log('💼 Generating 100 job posts...');

        // Generate 100 Jobs
        for (let i = 1; i <= 100; i++) {
            const isTech = i <= 70;
            const title = isTech ? techTitles[i % techTitles.length] : nonTechTitles[i % nonTechTitles.length];
            const hr = hrUsers[i % hrUsers.length];

            const job = await Job.create({
                title: `${title} - ${i}`,
                description: `We are looking for a highly motivated ${title} to join our team at ${hr.company}. You should have experience with ${isTech ? 'modern technologies' : 'market trends'} and be a team player.`,
                requirements: `Must have 3+ years of experience. \nKnowledge of ${isTech ? techSkills.slice(0, 3).join(', ') : 'industry best practices'}. \nDegree in related field.`,
                location: locations[i % locations.length],
                company: hr.company,
                postedBy: hr._id,
                skills: isTech ? techSkills.slice(0, 4) : softSkills.slice(0, 4),
                isActive: true
            });

            // Randomly attach some applicants
            const applicantCount = Math.floor(Math.random() * 5);
            for (let j = 0; j < applicantCount; j++) {
                const seeker = seekers[Math.floor(Math.random() * seekers.length)];
                if (!job.applicants.some(a => a.user.toString() === seeker._id.toString())) {
                    job.applicants.push({
                        user: seeker._id,
                        status: 'applied',
                        aiMatchScore: Math.floor(Math.random() * 60) + 30 // Seed with some random scores
                    });
                }
            }
            await job.save();
        }

        console.log('✅ Seeding completed!');
        console.log('\n--- CREDENTIALS ---');
        console.log('HR Accounts: hr1@example.com to hr5@example.com');
        console.log('Jobseeker Accounts: candidate1@example.com to candidate30@example.com');
        console.log('Default Password: password123');
        process.exit(0);
    } catch (err) {
        console.error('❌ Seeding failed:', err);
        process.exit(1);
    }
};

seedData();
