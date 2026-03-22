import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import LandingPage from './pages/public/LandingPage';
import PremiumPage from './pages/public/PremiumPage';
import UserProfileView from './pages/public/UserProfileView';
import LoginPage from './pages/auth/LoginPage';
import SignupPage from './pages/auth/SignupPage';
import Dashboard from './pages/seeker/Dashboard';
import ProfilePage from './pages/seeker/ProfilePage';
import AIFeedbackPage from './pages/seeker/AIFeedbackPage';
import JobsPage from './pages/seeker/JobsPage';
import JobDetailPage from './pages/seeker/JobDetailPage';
import ApplicationsPage from './pages/seeker/ApplicationsPage';
import HRDashboard from './pages/hr/HRDashboard';
import PostJobPage from './pages/hr/PostJobPage';
import ManageJobsPage from './pages/hr/ManageJobsPage';
import CandidatesPage from './pages/hr/CandidatesPage';
import CandidateProfilePage from './pages/hr/CandidateProfilePage';
import JobApplicantsPage from './pages/hr/JobApplicantsPage';
import ShortlistedCandidatesPage from './pages/hr/ShortlistedCandidatesPage';
import NotificationsPage from './pages/shared/NotificationsPage';
import SocialFeed from './components/SocialFeed';
import MyProfileOverview from './pages/seeker/MyProfileOverview';
import ChatWidget from './components/ChatWidget';
import NotificationWidget from './components/NotificationWidget';

const PrivateRoute = ({ children, role }) => {
  const { user, token } = useSelector(s => s.auth);
  if (!token || !user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to={user.role === 'hr' ? '/hr/jobs' : '/dashboard'} replace />;
  return children;
};

const PublicRoute = ({ children }) => {
  const { user, token } = useSelector(s => s.auth);
  if (token && user) return <Navigate to={user.role === 'hr' ? '/hr/jobs' : '/dashboard'} replace />;
  return children;
};

function AppLayout() {
  const location = useLocation();
  const { user, token } = useSelector(s => s.auth);
  const hideNavbar = !user || !token ? !['/'].includes(location.pathname) : false; // Show navbar on landing even if not logged in
  // Actually, let's keep it simple: show navbar always unless it's login/signup and user is NOT logged in.
  const isAuthPage = ['/login', '/signup'].includes(location.pathname);
  const showNavbar = user || location.pathname === '/';
  const showFooter = !isAuthPage;

  return (
    <div className="app-shell">
      {showNavbar && <Navbar />}
      <main className="app-main">
        <Toaster position="top-right" toastOptions={{ style: { background: '#1f2937', color: '#f9fafb', border: '1px solid rgba(255,255,255,0.1)' } }} />
        <Routes>
          {/* Public */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/premium" element={<PremiumPage />} />

          {/* Auth */}
          <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
          <Route path="/signup" element={<PublicRoute><SignupPage /></PublicRoute>} />

          {/* Job Seeker & General Owned Profile */}
          <Route path="/dashboard" element={<PrivateRoute role="jobseeker"><Dashboard /></PrivateRoute>} />
          <Route path="/me" element={<PrivateRoute><UserProfileView /></PrivateRoute>} />
          <Route path="/profile" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
          <Route path="/profile/:userId" element={<PrivateRoute><UserProfileView /></PrivateRoute>} />
          <Route path="/ai-feedback" element={<PrivateRoute role="jobseeker"><AIFeedbackPage /></PrivateRoute>} />
          <Route path="/jobs" element={<PrivateRoute><JobsPage /></PrivateRoute>} />
          <Route path="/jobs/:id" element={<PrivateRoute><JobDetailPage /></PrivateRoute>} />
          <Route path="/applications" element={<PrivateRoute role="jobseeker"><ApplicationsPage /></PrivateRoute>} />
          <Route path="/notifications" element={<PrivateRoute><NotificationsPage /></PrivateRoute>} />
          <Route path="/feed" element={<PrivateRoute><SocialFeed /></PrivateRoute>} />

          {/* HR */}
          <Route path="/hr/jobs" element={<PrivateRoute role="hr"><ManageJobsPage /></PrivateRoute>} />
          <Route path="/hr/post-job" element={<PrivateRoute role="hr"><PostJobPage /></PrivateRoute>} />
          <Route path="/hr/jobs/:id/candidates" element={<PrivateRoute role="hr"><CandidatesPage /></PrivateRoute>} />
          <Route path="/hr/jobs/:id/applicants" element={<PrivateRoute role="hr"><JobApplicantsPage /></PrivateRoute>} />
          <Route path="/hr/candidates/:userId" element={<PrivateRoute role="hr"><CandidateProfilePage /></PrivateRoute>} />
          <Route path="/hr/shortlisted" element={<PrivateRoute role="hr"><ShortlistedCandidatesPage /></PrivateRoute>} />
          <Route path="/hr/candidates" element={<PrivateRoute role="hr"><HRDashboard /></PrivateRoute>} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      {showFooter && <Footer />}
      <ChatWidget />
      <NotificationWidget />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  );
}
