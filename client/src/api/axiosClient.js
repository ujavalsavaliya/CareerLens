import axios from 'axios';

const API = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000/api',
    headers: { 'Content-Type': 'application/json' }
});

// Attach JWT token to every request
API.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

// Handle 401 globally
API.interceptors.response.use(
    (res) => res,
    (err) => {
        if (err.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(err);
    }
);

// AUTH
export const registerAPI = (data) => API.post('/auth/register', data);
export const loginAPI = (data) => API.post('/auth/login', data);
export const getMeAPI = () => API.get('/auth/me');

// PROFILE
export const getMyProfileAPI = () => API.get('/profile/me');
export const updateMyProfileAPI = (data) => API.put('/profile/me', data);
export const uploadResumeAPI = (formData) => API.post('/profile/resume', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const uploadCertificateAPI = (formData) => API.post('/profile/certificate', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const uploadBannerAPI = (formData) => API.post('/users/banner', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const getAIFeedbackAPI = () => API.get('/profile/ai-feedback');
export const getProfileByUserIdAPI = (userId) => API.get(`/profile/${userId}`);

// CONNECTIONS / FOLLOW
export const getConnectionStatusAPI = (userId) => API.get(`/connections/status/${userId}`);
export const sendConnectionRequestAPI = (userId) => API.post(`/connections/request/${userId}`);
export const acceptConnectionRequestAPI = (userId) => API.put(`/connections/accept/${userId}`);
export const withdrawConnectionRequestAPI = (userId) => API.delete(`/connections/withdraw/${userId}`);
export const removeConnectionAPI = (userId) => API.delete(`/connections/remove/${userId}`);
export const followUserAPI = (userId) => API.post(`/connections/follow/${userId}`);
export const unfollowUserAPI = (userId) => API.delete(`/connections/unfollow/${userId}`);

// MESSAGES
export const getConversationsAPI = () => API.get('/messages');
export const getMessagesAPI = (conversationId, params) => API.get(`/messages/${conversationId}`, { params });
export const markMessagesReadAPI = (conversationId) => API.put(`/messages/${conversationId}/read`);
export const sendMessageAPI = (userId, data) => 
    data instanceof FormData 
        ? API.post(`/messages/${userId}`, data, { headers: { 'Content-Type': 'multipart/form-data' } })
        : API.post(`/messages/${userId}`, data);

// JOBS
export const getJobsAPI = (params) => API.get('/jobs', { params });
export const createJobAPI = (data) => API.post('/jobs', data);
export const getJobByIdAPI = (id) => API.get(`/jobs/${id}`);
export const updateJobAPI = (id, data) => API.put(`/jobs/${id}`, data);
export const deleteJobAPI = (id) => API.delete(`/jobs/${id}`);
export const applyToJobAPI = (id, data) => API.post(`/jobs/${id}/apply`, data);
export const getRecommendedJobsAPI = () => API.get('/jobs/recommended');
export const getMyJobsAPI = () => API.get('/jobs/my-jobs');
export const getCandidatesAPI = (id) => API.get(`/jobs/${id}/candidates`);
export const updateApplicantStatusAPI = (jobId, userId, data) => API.put(`/jobs/${jobId}/applicants/${userId}`, data);
export const scheduleInterviewAPI = (jobId, userId, data) => API.put(`/jobs/${jobId}/applicants/${userId}/interview`, data);
export const getMyApplicationsAPI = () => API.get('/jobs/my-applications');
export const getShortlistedCandidatesAPI = () => API.get('/jobs/shortlisted');

// NOTIFICATIONS
export const getNotificationsAPI = () => API.get('/notifications');
export const markNotificationReadAPI = (id) => API.put(`/notifications/${id}/read`);
export const markAllNotificationsReadAPI = () => API.put('/notifications/read-all');
export const deleteNotificationAPI = (id) => API.delete(`/notifications/${id}`);

// POSTS
export const getUserPostsAPI = (userId, params) => API.get(`/posts/user/${userId}`, { params });

// INTERVIEW SCORING
export const updateInterviewScoreAPI = (jobId, userId, data) => API.put(`/jobs/${jobId}/applicants/${userId}/score`, data);

// OFFER LETTERS
export const sendOfferLetterAPI = (jobId, userId, formData) => API.post(`/offers/${jobId}/${userId}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const getMyOffersAPI = () => API.get('/offers/my-offers');
export const respondToOfferAPI = (offerId, data) => API.put(`/offers/${offerId}/respond`, data);
export const getHROfferAPI = (jobId, userId) => API.get(`/offers/${jobId}/${userId}`);

export default API;
