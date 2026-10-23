import { Loader } from '@ethiocred/ui';
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import AuthLayout from '../layouts/AuthLayout.jsx';
import DashboardLayout from '../layouts/DashboardLayout.jsx';
import ProtectedRoute from './ProtectedRoute.jsx';
import Landing from '../pages/Landing/Landing.jsx';
import Login from '../pages/Login/Login.jsx';
import Register from '../pages/Login/Register.jsx';
import Unauthorized from '../pages/Unauthorized.jsx';
import Dashboard from '../pages/Dashboard/Dashboard.jsx';
import VerifyCredential from '../pages/VerifyCredential/VerifyCredential.jsx';
import RequestVerification from '../pages/RequestVerification/RequestVerification.jsx';
import History from '../pages/History/History.jsx';
import RequestStatus from '../pages/RequestStatus/RequestStatus.jsx';

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
      <Route
        element={
          <ProtectedRoute role="EMPLOYER">
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/verify" element={<VerifyCredential />} />
        <Route path="/request" element={<RequestVerification />} />
        <Route path="/history" element={<History />} />
        <Route path="/request-status" element={<RequestStatus />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
