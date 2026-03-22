const axios = require('axios');

/**
 * Get Zoom access token using OAuth
 */
async function getZoomAccessToken() {
    const accountId = process.env.ZOOM_ACCOUNT_ID;
    const clientId = process.env.ZOOM_CLIENT_ID;
    const clientSecret = process.env.ZOOM_CLIENT_SECRET;

    if (!accountId || !clientId || !clientSecret) {
        throw new Error('Zoom credentials not configured. Please set ZOOM_ACCOUNT_ID, ZOOM_CLIENT_ID, and ZOOM_CLIENT_SECRET environment variables.');
    }

    try {
        const basic = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

        const res = await axios.post(
            `https://zoom.us/oauth/token?grant_type=account_credentials&account_id=${accountId}`,
            null,
            {
                headers: {
                    Authorization: `Basic ${basic}`
                },
                timeout: 10000 // 10 second timeout
            }
        );

        if (!res.data || !res.data.access_token) {
            throw new Error('Invalid response from Zoom token endpoint');
        }

        return res.data.access_token;
    } catch (error) {
        if (error.response) {
            console.error('Zoom Token Error:', {
                status: error.response.status,
                data: error.response.data
            });
            throw new Error(`Failed to get Zoom access token: ${error.response.data?.reason || error.message}`);
        }
        throw new Error(`Failed to connect to Zoom: ${error.message}`);
    }
}

/**
 * Format date for Zoom API (ISO 8601 in UTC without milliseconds)
 */
function formatZoomDate(date) {
    const d = new Date(date);
    if (isNaN(d.getTime())) {
        throw new Error('Invalid date format');
    }
    
    // Format: YYYY-MM-DDTHH:MM:SSZ
    return d.toISOString().replace(/\.\d{3}Z$/, 'Z');
}

/**
 * Validate meeting parameters
 */
function validateMeetingParams({ topic, startTime, durationMinutes }) {
    if (!topic || typeof topic !== 'string' || topic.trim().length === 0) {
        throw new Error('Topic is required and must be a non-empty string');
    }

    if (!startTime) {
        throw new Error('Start time is required');
    }

    const startDate = new Date(startTime);
    if (isNaN(startDate.getTime())) {
        throw new Error('Invalid start time format. Please provide a valid date string.');
    }

    // Check if start time is in the future (allow 1 minute buffer)
    const now = new Date();
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60000);
    if (startDate < fiveMinutesAgo) {
        throw new Error('Start time must be in the future');
    }

    if (!durationMinutes || typeof durationMinutes !== 'number' || durationMinutes < 1) {
        throw new Error('Duration minutes is required and must be a positive number');
    }

    if (durationMinutes > 150) {
        throw new Error('Duration cannot exceed 150 minutes');
    }

    return true;
}

/**
 * Create a Zoom meeting
 * @param {Object} params - Meeting parameters
 * @param {string} params.topic - Meeting topic/title
 * @param {string|Date} params.startTime - Meeting start time (ISO string or Date object)
 * @param {number} params.durationMinutes - Meeting duration in minutes
 * @returns {Promise<Object>} Meeting details
 */
async function createZoomMeeting({ topic, startTime, durationMinutes }) {
    try {
        // Validate input parameters
        validateMeetingParams({ topic, startTime, durationMinutes });

        // Get access token
        const token = await getZoomAccessToken();

        // Format start time for Zoom API
        const formattedStartTime = formatZoomDate(startTime);

        // Prepare request body
        const requestBody = {
            topic: topic.trim(),
            type: 2, // Scheduled meeting
            start_time: formattedStartTime,
            duration: durationMinutes,
            timezone: 'UTC',
            agenda: topic.trim(),
            settings: {
                host_video: true,
                participant_video: true,
                cn_meeting: false,
                in_meeting: false,
                join_before_host: false,
                mute_upon_entry: true,
                watermark: false,
                use_pmi: false,
                approval_type: 2,
                audio: 'both',
                auto_recording: 'none',
                enforce_login: false,
                registrants_email_notification: true,
                waiting_room: true
            }
        };

        console.log('Creating Zoom meeting with params:', {
            topic: requestBody.topic,
            start_time: requestBody.start_time,
            duration: requestBody.duration
        });

        // Create meeting
        const response = await axios.post(
            'https://api.zoom.us/v2/users/me/meetings',
            requestBody,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                timeout: 15000 // 15 second timeout
            }
        );

        // Validate response
        if (!response.data || !response.data.id) {
            throw new Error('Invalid response from Zoom API');
        }

        // Return formatted meeting details
        return {
            id: response.data.id,
            joinUrl: response.data.join_url,
            startUrl: response.data.start_url,
            password: response.data.password,
            topic: response.data.topic,
            startTime: response.data.start_time,
            duration: response.data.duration,
            createdAt: new Date().toISOString()
        };

    } catch (error) {
        // Handle axios errors
        if (error.response) {
            // The request was made and the server responded with a status code outside of 2xx
            console.error('Zoom API Error Response:', {
                status: error.response.status,
                statusText: error.response.statusText,
                data: error.response.data
            });

            // Map Zoom API error messages to user-friendly messages
            const errorMessage = error.response.data?.message || error.response.data?.reason || 'Unknown Zoom API error';
            
            switch (error.response.status) {
                case 400:
                    if (errorMessage.includes('start_time')) {
                        throw new Error('Invalid meeting start time. Please ensure it\'s a valid future date.');
                    } else if (errorMessage.includes('duration')) {
                        throw new Error('Invalid meeting duration. Please ensure it\'s between 1 and 150 minutes.');
                    } else {
                        throw new Error(`Invalid meeting parameters: ${errorMessage}`);
                    }
                
                case 401:
                    throw new Error('Zoom authentication failed. Please check your credentials.');
                
                case 403:
                    throw new Error('You don\'t have permission to create Zoom meetings. Please check your Zoom account plan.');
                
                case 404:
                    throw new Error('Zoom user not found. Please check your account configuration.');
                
                case 429:
                    throw new Error('Too many requests. Please try again later.');
                
                case 500:
                case 502:
                case 503:
                case 504:
                    throw new Error('Zoom service is temporarily unavailable. Please try again later.');
                
                default:
                    throw new Error(`Zoom API error (${error.response.status}): ${errorMessage}`);
            }
        } else if (error.request) {
            // The request was made but no response was received
            console.error('Zoom API No Response:', error.request);
            throw new Error('Unable to reach Zoom API. Please check your network connection.');
        } else {
            // Something happened in setting up the request
            console.error('Zoom API Request Error:', error.message);
            throw error; // Re-throw validation errors or other errors
        }
    }
}

/**
 * Create an instant meeting (alternative)
 * @param {Object} params - Meeting parameters
 * @param {string} params.topic - Meeting topic/title
 * @param {number} params.durationMinutes - Meeting duration in minutes
 * @returns {Promise<Object>} Meeting details
 */
async function createInstantZoomMeeting({ topic, durationMinutes = 60 }) {
    try {
        if (!topic || typeof topic !== 'string' || topic.trim().length === 0) {
            throw new Error('Topic is required and must be a non-empty string');
        }

        const token = await getZoomAccessToken();

        const requestBody = {
            topic: topic.trim(),
            type: 1, // Instant meeting
            duration: durationMinutes,
            timezone: 'UTC',
            settings: {
                host_video: true,
                participant_video: true,
                join_before_host: true,
                mute_upon_entry: true,
                waiting_room: true,
                audio: 'both',
                auto_recording: 'none'
            }
        };

        const response = await axios.post(
            'https://api.zoom.us/v2/users/me/meetings',
            requestBody,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        return {
            id: response.data.id,
            joinUrl: response.data.join_url,
            startUrl: response.data.start_url,
            password: response.data.password,
            topic: response.data.topic,
            createdAt: new Date().toISOString()
        };

    } catch (error) {
        if (error.response) {
            console.error('Zoom API Error:', {
                status: error.response.status,
                data: error.response.data
            });
            throw new Error(`Failed to create instant meeting: ${error.response.data?.message || error.message}`);
        }
        throw error;
    }
}

module.exports = { 
    createZoomMeeting,
    createInstantZoomMeeting 
};
