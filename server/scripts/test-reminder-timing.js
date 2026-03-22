const mongoose = require('mongoose');
const Job = require('../models/Job');
const User = require('../models/User');
const { processReminders } = require('../services/interviewReminderService');
require('dotenv').config();

async function testReminderTiming() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');

        // 1. Find or create a test HR user and a candidate
        let hr = await User.findOne({ role: 'hr' });
        let candidate = await User.findOne({ role: 'jobseeker' });

        if (!hr || !candidate) {
            console.log('Ensure you have at least one HR and one jobseeker in DB');
            process.exit(0);
        }

        // 2. Create a test job
        const job = await Job.create({
            title: 'Timing Test Job',
            description: 'Test',
            company: 'Test Corp',
            postedBy: hr._id,
            applicants: []
        });

        // 3. Schedule interview for 16 minutes from now
        const now = new Date();
        const schedTime = new Date(now.getTime() + 16 * 60 * 1000); // exactly 16 mins from now

        job.applicants.push({
            user: candidate._id,
            status: 'interview',
            interview: {
                round: 'Timing Test Round',
                scheduledAt: schedTime,
                durationMinutes: 30,
                reminderSent: false
            }
        });
        await job.save();

        console.log(`\n--- Test Start ---`);
        console.log(`Current Time: ${now.toLocaleTimeString()}`);
        console.log(`Scheduled At: ${schedTime.toLocaleTimeString()} (16 mins away)`);

        // Run reminders immediately
        console.log('\nRunning reminders (expected: skip, > 15 mins)...');
        await processReminders();
        
        let updatedJob = await Job.findById(job._id);
        if (updatedJob.applicants[0].interview.reminderSent) {
            console.error('❌ BUG: Reminder sent for > 15 mins!');
        } else {
            console.log('✅ OK: Reminder skipped (correctly).');
        }

        // 4. Simulate being 2 minutes later (now 14 mins away)
        console.log('\nSimulating 2 minutes later...');
        // We can't actually "wait" 2 minutes easily in a script without stalling,
        // so we'll just manipulate the 'now' within a mocked processReminders style?
        // Actually, let's just RUN it again after modifying the DB to make it 14 mins away.
        
        updatedJob.applicants[0].interview.scheduledAt = new Date(Date.now() + 14 * 60 * 1000);
        await updatedJob.save();
        
        console.log(`Modified Schedule: ${updatedJob.applicants[0].interview.scheduledAt.toLocaleTimeString()} (14 mins away)`);
        console.log('Running reminders (expected: TRIGGER)...');
        await processReminders();

        updatedJob = await Job.findById(job._id);
        if (updatedJob.applicants[0].interview.reminderSent) {
            console.log('✅ SUCCESS: Reminder sent for <= 15 mins!');
        } else {
            console.error('❌ FAIL: Reminder NOT sent!');
        }

        // Cleanup
        await Job.findByIdAndDelete(job._id);
        console.log('\nTest cleanup done.');
        await mongoose.connection.close();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

testReminderTiming();
