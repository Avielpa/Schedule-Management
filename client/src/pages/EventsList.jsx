import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { eventService } from '../services';
import LoadingSpinner from '../components/LoadingSpinner';
import { format } from 'date-fns';

const EventsList = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const data = await eventService.getAll();
      setEvents(data.results || data || []);
    } catch (error) {
      console.error('Error loading events:', error);
      alert('Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`Are you sure you want to delete event "${name}"?`)) {
      return;
    }

    try {
      await eventService.delete(id);
      setEvents(events.filter((e) => e.id !== id));
      alert('Event deleted successfully');
    } catch (error) {
      console.error('Error deleting event:', error);
      alert('Failed to delete event');
    }
  };

  const filteredEvents = events.filter((event) =>
    event.name.toLowerCase().includes(filter.toLowerCase()) ||
    event.event_type.toLowerCase().includes(filter.toLowerCase())
  );

  if (loading) {
    return <LoadingSpinner text="Loading events..." />;
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Events</h1>
          <p className="text-gray-600 mt-2">Manage military training and operational events</p>
        </div>
        <Link to="/events/create" className="btn-primary">
          ➕ Create Event
        </Link>
      </div>

      {/* Search and Filter */}
      <div className="card">
        <input
          type="text"
          placeholder="Search events by name or type..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="input-field"
        />
      </div>

      {/* Events List */}
      {filteredEvents.length === 0 ? (
        <div className="card text-center py-12">
          <div className="text-6xl mb-4">📅</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Events Found</h3>
          <p className="text-gray-600 mb-6">
            {filter ? 'No events match your search criteria.' : 'Get started by creating your first event.'}
          </p>
          {!filter && (
            <Link to="/events/create" className="btn-primary inline-block">
              Create Your First Event
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredEvents.map((event) => (
            <div key={event.id} className="card hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-xl font-bold text-gray-900">{event.name}</h3>
                    <span className="px-2 py-1 bg-primary-100 text-primary-700 text-sm font-medium rounded">
                      {event.event_type}
                    </span>
                  </div>

                  {event.description && (
                    <p className="text-gray-600 mb-3">{event.description}</p>
                  )}

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Start Date:</span>
                      <div className="font-medium text-gray-900">{event.start_date}</div>
                    </div>
                    <div>
                      <span className="text-gray-500">End Date:</span>
                      <div className="font-medium text-gray-900">{event.end_date}</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Min Soldiers/Day:</span>
                      <div className="font-medium text-gray-900">{event.min_required_soldiers_per_day}</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Base/Home Days:</span>
                      <div className="font-medium text-gray-900">
                        {event.base_days_per_soldier}/{event.home_days_per_soldier}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2 ml-4">
                  <Link
                    to={`/events/${event.id}`}
                    className="px-4 py-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                  >
                    View
                  </Link>
                  <Link
                    to={`/events/${event.id}/edit`}
                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(event.id, event.name)}
                    className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EventsList;
