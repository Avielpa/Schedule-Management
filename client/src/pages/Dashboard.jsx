import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { eventService, schedulingRunService } from '../services';
import LoadingSpinner from '../components/LoadingSpinner';
import StatusBadge from '../components/StatusBadge';

const Dashboard = () => {
  const [events, setEvents] = useState([]);
  const [schedulingRuns, setSchedulingRuns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [eventsData, runsData] = await Promise.all([
        eventService.getAll(),
        schedulingRunService.getAll(),
      ]);
      setEvents(eventsData.results || eventsData || []);
      setSchedulingRuns(runsData.results || runsData || []);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading dashboard..." />;
  }

  const recentEvents = events.slice(0, 5);
  const recentRuns = schedulingRuns.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">Overview of your military scheduling system</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <div className="text-4xl mb-2">📅</div>
          <div className="text-3xl font-bold">{events.length}</div>
          <div className="text-blue-100">Total Events</div>
        </div>

        <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white">
          <div className="text-4xl mb-2">🗓️</div>
          <div className="text-3xl font-bold">{schedulingRuns.length}</div>
          <div className="text-green-100">Scheduling Runs</div>
        </div>

        <div className="card bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <div className="text-4xl mb-2">✅</div>
          <div className="text-3xl font-bold">
            {schedulingRuns.filter((r) => r.status === 'SUCCESS').length}
          </div>
          <div className="text-purple-100">Successful Runs</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Events */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Recent Events</h2>
            <Link to="/events" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
              View All →
            </Link>
          </div>

          {recentEvents.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <div className="text-4xl mb-2">📅</div>
              <p>No events yet</p>
              <Link to="/events/create" className="text-primary-600 hover:text-primary-700 mt-2 inline-block">
                Create your first event
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {recentEvents.map((event) => (
                <Link
                  key={event.id}
                  to={`/events/${event.id}`}
                  className="block p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900">{event.name}</h3>
                      <p className="text-sm text-gray-600">
                        {event.start_date} to {event.end_date}
                      </p>
                    </div>
                    <span className="text-xs font-medium px-2 py-1 bg-gray-100 text-gray-700 rounded">
                      {event.event_type}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Recent Scheduling Runs */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Recent Scheduling Runs</h2>
            <Link to="/scheduling-runs" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
              View All →
            </Link>
          </div>

          {recentRuns.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <div className="text-4xl mb-2">🗓️</div>
              <p>No scheduling runs yet</p>
              <Link to="/scheduling-runs/create" className="text-primary-600 hover:text-primary-700 mt-2 inline-block">
                Create your first run
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {recentRuns.map((run) => (
                <Link
                  key={run.id}
                  to={`/scheduling-runs/${run.id}`}
                  className="block p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-900">{run.name}</h3>
                    <StatusBadge status={run.status} />
                  </div>
                  <p className="text-sm text-gray-600">
                    {run.event_name} • {run.soldiers_count} soldiers
                  </p>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Link to="/events/create" className="btn-primary text-center">
            📅 Create Event
          </Link>
          <Link to="/soldiers" className="btn-secondary text-center">
            👥 Manage Soldiers
          </Link>
          <Link to="/scheduling-runs/create" className="btn-secondary text-center">
            🗓️ New Schedule Run
          </Link>
          <Link to="/calendar" className="btn-secondary text-center">
            📆 View Calendar
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
