import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import AuthLayout from '../layouts/AuthLayout.jsx';
import DashboardLayout from '../layouts/DashboardLayout.jsx';
import Loader from '../components/Loader/Loader.jsx';
import ProtectedRoute from './ProtectedRoute.jsx';
import Login from '../pages/Login/Login.jsx';
import Unauthorized from '../pages/Unauthorized.jsx';
import Dashboard from '../pages/Dashboard/Dashboard.jsx';
import Institutions from '../pages/Institutions/Institutions.jsx';
import CreateAdmin from '../pages/CreateAdmin/CreateAdmin.jsx';
import SecurityDemo from '../pages/SecurityDemo/SecurityDemo.jsx';

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
          <ProtectedRoute role="ADMIN">
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/institutions" element={<Institutions />} />
        <Route path="/create-admin" element={<CreateAdmin />} />
        <Route path="/security-demo" element={<SecurityDemo />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
