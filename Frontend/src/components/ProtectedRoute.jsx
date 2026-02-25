import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ children, requiredRole = null }) {
  // Get authentication data from sessionStorage
  const loggedInUser = sessionStorage.getItem('loggedInUser');
  const userType = sessionStorage.getItem('userType');
  const adminEmail = sessionStorage.getItem('adminEmail');
  
  // Check if user is authenticated
  if (!loggedInUser) {
    return <Navigate to="/admin-login" replace />;
  }

  // If role is required, check the appropriate field
  if (requiredRole) {
    if (requiredRole === 'employee') {
      // For employee role, check userType
      if (userType !== 'employee') {
        return <Navigate to="/admin-login" replace />;
      }
    } else if (requiredRole === 'Admin') {
      // For admin role, check userType or adminEmail
      if (userType !== 'admin' && !adminEmail) {
        return <Navigate to="/admin-login" replace />;
      }
    } else {
      // Generic role check against loggedInUser
      if (loggedInUser !== requiredRole) {
        return <Navigate to="/admin-login" replace />;
      }
    }
  }

  // User is authenticated and authorized
  return children;
}
