import { Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import AuthLayout from '../layouts/AuthLayout.jsx';
import DashboardLayout from '../layouts/DashboardLayout.jsx';
import Loader from '../components/Loader/Loader.jsx';
import ProtectedRoute from './ProtectedRoute.jsx';
import Landing from '../pages/Landing/Landing.jsx';
import Login from '../pages/Login/Login.jsx';
import Register from '../pages/Login/Register.jsx';
import Unauthorized from '../pages/Unauthorized.jsx';
import Dashboard from '../pages/Dashboard/Dashboard.jsx';
import Credentials from '../pages/Credentials/Credentials.jsx';
import CredentialDetail from '../pages/CredentialDetail/CredentialDetail.jsx';
import VerificationRequests from '../pages/VerificationRequests/VerificationRequests.jsx';
import Notifications from '../pages/Notifications/Notifications.jsx';
import ShareVerify from '../pages/ShareVerify/ShareVerify.jsx';
import ShareLinks from '../pages/ShareLinks/ShareLinks.jsx';
import VerificationHistory from '../pages/VerificationHistory/VerificationHistory.jsx';
import Profile from '../pages/Profile/Profile.jsx';

function LandingRoute() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Landing />;
}

function RegisterPage() {
  const navigate = useNavigate();
  return <Register onBack={() => navigate('/login')} />;
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingRoute />} />
      <Route
        path="/login"
        element={
          <AuthLayout>
            <Login />
          </AuthLayout>
        }
      />
      <Route
        path="/register"
        element={
          <AuthLayout>
            <RegisterPage />
          </AuthLayout>
        }
      />
      <Route path="/unauthorized" element={<Unauthorized />} />
      <Route path="/verify/:token" element={<ShareVerify />} />
      <Route
        element={
          <ProtectedRoute role="STUDENT">
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/credentials" element={<Credentials />} />
        <Route path="/credentials/:id" element={<CredentialDetail />} />
        <Route path="/requests" element={<VerificationRequests />} />
        <Route path="/share-links" element={<ShareLinks />} />
        <Route path="/verification-history" element={<VerificationHistory />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/notifications" element={<Notifications />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
