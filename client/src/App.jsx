import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
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
import SocialFeed from './components/SocialFeed';
import MyProfileOverview from './pages/seeker/MyProfileOverview';

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
  const hideNavbar = !user || !token || ['/', '/login', '/signup'].includes(location.pathname);

  return (
    <div className="app-shell">
      {!hideNavbar && <Navbar />}
      <main className="app-main" style={hideNavbar ? { marginLeft: 0, paddingTop: 0 } : undefined}>
        <Toaster position="top-right" toastOptions={{ style: { background: '#1f2937', color: '#f9fafb', border: '1px solid rgba(255,255,255,0.1)' } }} />
        <Routes>
          {/* Public */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/premium" element={<PremiumPage />} />

          {/* Auth */}
          <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
          <Route path="/signup" element={<PublicRoute><SignupPage /></PublicRoute>} />

          {/* Job Seeker */}
          <Route path="/dashboard" element={<PrivateRoute role="jobseeker"><Dashboard /></PrivateRoute>} />
          <Route path="/me" element={<PrivateRoute><MyProfileOverview /></PrivateRoute>} />
          <Route path="/profile" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
          <Route path="/profile/:userId" element={<PrivateRoute><UserProfileView /></PrivateRoute>} />
          <Route path="/ai-feedback" element={<PrivateRoute role="jobseeker"><AIFeedbackPage /></PrivateRoute>} />
          <Route path="/jobs" element={<PrivateRoute><JobsPage /></PrivateRoute>} />
          <Route path="/jobs/:id" element={<PrivateRoute><JobDetailPage /></PrivateRoute>} />
          <Route path="/applications" element={<PrivateRoute role="jobseeker"><ApplicationsPage /></PrivateRoute>} />
          <Route path="/feed" element={<PrivateRoute><SocialFeed /></PrivateRoute>} />

          {/* HR */}
          <Route path="/hr/jobs" element={<PrivateRoute role="hr"><ManageJobsPage /></PrivateRoute>} />
          <Route path="/hr/post-job" element={<PrivateRoute role="hr"><PostJobPage /></PrivateRoute>} />
          <Route path="/hr/jobs/:id/candidates" element={<PrivateRoute role="hr"><CandidatesPage /></PrivateRoute>} />
          <Route path="/hr/candidates/:userId" element={<PrivateRoute role="hr"><CandidateProfilePage /></PrivateRoute>} />
          <Route path="/hr/candidates" element={<PrivateRoute role="hr"><HRDashboard /></PrivateRoute>} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
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
