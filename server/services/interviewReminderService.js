const cron = require('node-cron');
const Job = require('../models/Job');
const User = require('../models/User');
const { createNotification } = require('./notificationService');
const { sendEmail } = require('./emailService');
const { createZoomMeeting } = require('./zoomService');

async function processReminders() {
    const now = new Date();
    const in15 = new Date(now.getTime() + 15 * 60 * 1000);

    const jobs = await Job.find({
        'applicants.interviews.scheduledAt': { $gte: now, $lte: in15 },
        'applicants.interviews.reminderSent': false
    }).populate('postedBy', 'name email');

    for (const job of jobs) {
        let updated = false;

        for (const applicant of job.applicants) {
            if (!applicant.interviews || applicant.interviews.length === 0) continue;

            const candidate = await User.findById(applicant.user).select('name email');
            const hr = job.postedBy;

            for (const interview of applicant.interviews) {
                if (interview.reminderSent) continue;

                const start = interview.scheduledAt;
                if (!start || start < now || start > in15) continue;

                // Use existing Zoom links if available, otherwise create just-in-time
                let meeting = { 
                    id: interview.zoomMeetingId, 
                    joinUrl: interview.zoomJoinUrl, 
                    startUrl: interview.zoomStartUrl 
                };

                if (!meeting.joinUrl) {
                    try {
                        console.log(`Zoom link missing for interview ${job.title}, creating now...`);
                        const newMeeting = await createZoomMeeting({
                            topic: `${job.title} – ${interview.round || 'Interview'}`,
                            startTime: start,
                            durationMinutes: interview.durationMinutes || 60
                        });
                        
                        meeting = newMeeting;
                        // Save Zoom details to the interview record
                        interview.zoomMeetingId = meeting.id;
                        interview.zoomJoinUrl = meeting.joinUrl;
                        interview.zoomStartUrl = meeting.startUrl;
                    } catch (err) {
                        console.error('Zoom meeting creation failed (reminderService fallback):', err.message);
                    }
                }

                await createNotification({
                    recipient: applicant.user,
                    sender: hr._id,
                    type: 'interview_reminder',
                    comment: `Your interview for ${job.title} (${interview.round}) starts in 15 minutes! ${meeting.joinUrl ? `Join here: ${meeting.joinUrl}` : 'Please check your email for the link.'}`
                });

                await createNotification({
                    recipient: hr._id,
                    sender: hr._id,
                    type: 'interview_reminder',
                    comment: `Interview with ${candidate?.name || 'candidate'} for ${job.title} (${interview.round}) starts in 15 minutes. ${meeting.startUrl ? `Start meeting: ${meeting.startUrl}` : ''}`
                });

                const startTime = start.toLocaleString();

                if (candidate?.email) {
                    await sendEmail({
                        to: candidate.email,
                        subject: `Reminder: your interview starts in 15 minutes – ${job.title}`,
                        html: `
                            <p>Hi ${candidate.name},</p>
                            <p>Your interview for <strong>${job.title}</strong> at <strong>${job.company}</strong> starts in about 15 minutes.</p>
                            <p><strong>Interview Details:</strong></p>
                            <ul>
                                <li><strong>Round:</strong> ${interview.round || 'Interview'}</li>
                                <li><strong>Time:</strong> ${startTime}</li>
                                ${meeting.joinUrl ? `<li><strong>Zoom Link:</strong> <a href="${meeting.joinUrl}">${meeting.joinUrl}</a></li>` : ''}
                            </ul>
                            ${!meeting.joinUrl ? `<p>Please log in to CareerLens for joining instructions.</p>` : ''}
                            <p>Good luck!</p>
                        `
                    });
                }

                if (hr?.email) {
                    await sendEmail({
                        to: hr.email,
                        subject: `Reminder: interview with ${candidate?.name || 'candidate'} in 15 minutes`,
                        html: `
                            <p>Hi ${hr.name || 'Hiring Manager'},</p>
                            <p>Your interview with <strong>${candidate?.name || 'candidate'}</strong> for <strong>${job.title}</strong> starts in about 15 minutes.</p>
                            <p><strong>Interview Details:</strong></p>
                            <ul>
                                <li><strong>Round:</strong> ${interview.round || 'Interview'}</li>
                                <li><strong>Time:</strong> ${startTime}</li>
                                ${meeting.startUrl ? `<li><strong>Host Link (Zoom):</strong> <a href="${meeting.startUrl}">${meeting.startUrl}</a></li>` : ''}
                            </ul>
                        `
                    });
                }

                interview.reminderSent = true;
                updated = true;
            }
        }

        if (updated) {
            await job.save();
        }
    }
}

function startInterviewReminderJob() {
    // Run every minute
    cron.schedule('* * * * *', processReminders);
}

module.exports = { startInterviewReminderJob, processReminders };

