import { Navigate } from 'react-router-dom';
import Loader from '../components/Loader/Loader.jsx';
import { useAuth } from '../context/AuthContext.jsx';

function roleMatches(userRole, requiredRole) {
  if (!requiredRole) return true;
  if (Array.isArray(requiredRole)) return requiredRole.includes(userRole);
  return userRole === requiredRole;
}

export default function ProtectedRoute({ children, role }) {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!roleMatches(user?.role, role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}
