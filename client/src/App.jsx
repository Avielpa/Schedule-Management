import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import EventsList from './pages/EventsList';
import EventForm from './pages/EventForm';
import SoldiersList from './pages/SoldiersList';
import SchedulingRunsList from './pages/SchedulingRunsList';
import CalendarView from './pages/CalendarView';
import MonthlyCalendarView from './pages/MonthlyCalendarView';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          {/* Dashboard */}
          <Route path="/" element={<Dashboard />} />

          {/* Events */}
          <Route path="/events" element={<EventsList />} />
          <Route path="/events/create" element={<EventForm />} />
          <Route path="/events/:id" element={<EventForm />} />
          <Route path="/events/:id/edit" element={<EventForm />} />

          {/* Soldiers */}
          <Route path="/soldiers" element={<SoldiersList />} />

          {/* Scheduling Runs */}
          <Route path="/scheduling-runs" element={<SchedulingRunsList />} />

          {/* Calendar */}
          <Route path="/calendar" element={<CalendarView />} />
          <Route path="/calendar/month/:runId" element={<MonthlyCalendarView />} />

          {/* 404 */}
          <Route path="*" element={
            <div className="card text-center py-12">
              <div className="text-6xl mb-4">❌</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Page Not Found</h3>
              <p className="text-gray-600">The page you're looking for doesn't exist.</p>
            </div>
          } />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
