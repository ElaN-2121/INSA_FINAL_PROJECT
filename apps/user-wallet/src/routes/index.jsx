import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import AuthLayout from '../layouts/AuthLayout.jsx';
import DashboardLayout from '../layouts/DashboardLayout.jsx';
import Loader from '../components/Loader/Loader.jsx';
import ProtectedRoute from './ProtectedRoute.jsx';
import Login from '../pages/Login/Login.jsx';
import Unauthorized from '../pages/Unauthorized.jsx';
import Dashboard from '../pages/Dashboard/Dashboard.jsx';
import Credentials from '../pages/Credentials/Credentials.jsx';
import CredentialDetail from '../pages/CredentialDetail/CredentialDetail.jsx';
import VerificationRequests from '../pages/VerificationRequests/VerificationRequests.jsx';
import Notifications from '../pages/Notifications/Notifications.jsx';

function RootRedirect() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  return <Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />;
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<RootRedirect />} />
      <Route
        path="/login"
        element={
          <AuthLayout>
            <Login />
          </AuthLayout>
        }
      />
      <Route path="/unauthorized" element={<Unauthorized />} />
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
        <Route path="/notifications" element={<Notifications />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
