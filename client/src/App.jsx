import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Dashboard from './pages/Dashboard';
import EventsList from './pages/EventsList';
import EventForm from './pages/EventForm';
import SoldiersList from './pages/SoldiersList';
import SchedulingRunsList from './pages/SchedulingRunsList';
import CalendarView from './pages/CalendarView';
import MonthlyCalendarView from './pages/MonthlyCalendarView';
import Login from './pages/Login';
import Register from './pages/Register';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public routes - no auth needed */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected routes - require login */}
        <Route path="/" element={
          <ProtectedRoute>
            <Layout><Dashboard /></Layout>
          </ProtectedRoute>
        } />

        {/* Events */}
        <Route path="/events" element={
          <ProtectedRoute>
            <Layout><EventsList /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/events/create" element={
          <ProtectedRoute>
            <Layout><EventForm /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/events/:id" element={
          <ProtectedRoute>
            <Layout><EventForm /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/events/:id/edit" element={
          <ProtectedRoute>
            <Layout><EventForm /></Layout>
          </ProtectedRoute>
        } />

        {/* Soldiers */}
        <Route path="/soldiers" element={
          <ProtectedRoute>
            <Layout><SoldiersList /></Layout>
          </ProtectedRoute>
        } />

        {/* Scheduling Runs */}
        <Route path="/scheduling-runs" element={
          <ProtectedRoute>
            <Layout><SchedulingRunsList /></Layout>
          </ProtectedRoute>
        } />

        {/* Calendar */}
        <Route path="/calendar" element={
          <ProtectedRoute>
            <Layout><CalendarView /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/calendar/month/:runId" element={
          <ProtectedRoute>
            <Layout><MonthlyCalendarView /></Layout>
          </ProtectedRoute>
        } />

        {/* 404 */}
        <Route path="*" element={
          <Layout>
            <div className="card text-center py-12">
              <div className="text-6xl mb-4">404</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Page Not Found</h3>
              <p className="text-gray-600">The page you're looking for doesn't exist.</p>
            </div>
          </Layout>
        } />
      </Routes>
    </Router>
  );
}

export default App;
