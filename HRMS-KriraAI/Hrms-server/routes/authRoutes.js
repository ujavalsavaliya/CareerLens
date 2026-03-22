import express from 'express';
import { login, changePassword, getCurrentUser, resetPassword, sendResetPasswordOTP, sendAdminLoginOTP, verifyAdminLoginOTP, registerAdmin } from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.post('/login', login);
router.post('/change-password', authenticate, changePassword);
router.get('/me', authenticate, getCurrentUser);

// Reset Password with OTP (no authentication required)
router.post('/reset-password/send-otp', sendResetPasswordOTP);
router.post('/reset-password', resetPassword);

// Admin Login via OTP
router.post('/admin-login/send-otp', sendAdminLoginOTP);
router.post('/admin-login/verify-otp', verifyAdminLoginOTP);

// Internal: Register Admin (called from CareerLens server, secured by x-internal-secret header)
router.post('/register-admin', registerAdmin);

export default router;



