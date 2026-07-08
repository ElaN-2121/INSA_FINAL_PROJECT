import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import AuthLayout from '../layouts/AuthLayout.jsx';
import DashboardLayout from '../layouts/DashboardLayout.jsx';
import Loader from '../components/Loader/Loader.jsx';
import ProtectedRoute from './ProtectedRoute.jsx';
import Landing from '../pages/Landing/Landing.jsx';
import Login from '../pages/Login/Login.jsx';
import Unauthorized from '../pages/Unauthorized.jsx';
import Dashboard from '../pages/Dashboard/Dashboard.jsx';
import UploadBatch from '../pages/UploadBatch/UploadBatch.jsx';
import StagingDashboard from '../pages/StagingDashboard/StagingDashboard.jsx';
import IssuedCredentials from '../pages/IssuedCredentials/IssuedCredentials.jsx';
import CredentialDetail from '../pages/CredentialDetail/CredentialDetail.jsx';
import Settings from '../pages/Settings/Settings.jsx';
import PublicLeaderboard from '../pages/PublicLeaderboard/PublicLeaderboard.jsx';
import Analytics from '../pages/Analytics/Analytics.jsx';

const UNIVERSITY_ROLES = ['UNIVERSITY'];

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
      <Route path="/unauthorized" element={<Unauthorized />} />
      <Route path="/leaderboard" element={<PublicLeaderboard />} />
      <Route
        element={
          <ProtectedRoute role={UNIVERSITY_ROLES}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/upload" element={<UploadBatch />} />
        <Route path="/staging/:batchId" element={<StagingDashboard />} />
        <Route path="/credentials" element={<IssuedCredentials />} />
        <Route path="/credentials/:id" element={<CredentialDetail />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/settings" element={<Settings />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
