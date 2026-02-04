import { Navigate } from 'react-router-dom';
import authService from '../services/authService';

/**
 * ProtectedRoute - Wraps routes that require authentication
 *
 * Usage:
 *   <Route path="/events" element={
 *     <ProtectedRoute>
 *       <EventsList />
 *     </ProtectedRoute>
 *   } />
 *
 * If user is not logged in, redirects to /login
 */
function ProtectedRoute({ children }) {
  const isLoggedIn = authService.isLoggedIn();

  if (!isLoggedIn) {
    // Redirect to login page
    return <Navigate to="/login" replace />;
  }

  // User is logged in, show the protected content
  return children;
}

export default ProtectedRoute;
