import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import AuthLayout from '../layouts/AuthLayout.jsx';
import DashboardLayout from '../layouts/DashboardLayout.jsx';
import Loader from '../components/Loader/Loader.jsx';
import ProtectedRoute from './ProtectedRoute.jsx';
import Login from '../pages/Login/Login.jsx';
import Unauthorized from '../pages/Unauthorized.jsx';
import Dashboard from '../pages/Dashboard/Dashboard.jsx';
import VerifyCredential from '../pages/VerifyCredential/VerifyCredential.jsx';
import RequestVerification from '../pages/RequestVerification/RequestVerification.jsx';
import History from '../pages/History/History.jsx';
import RequestStatus from '../pages/RequestStatus/RequestStatus.jsx';

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
