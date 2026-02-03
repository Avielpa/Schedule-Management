import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { schedulingRunService, eventService, soldierService } from '../services';
import LoadingSpinner from '../components/LoadingSpinner';
import StatusBadge from '../components/StatusBadge';

const SchedulingRunsList = () => {
  const navigate = useNavigate();
  const [runs, setRuns] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [eventFilter, setEventFilter] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);

  const [newRun, setNewRun] = useState({
    name: '',
    description: '',
    event_id: '',
    soldiers_ids: [],
  });

  useEffect(() => {
    loadData();
  }, [eventFilter]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [eventsData, runsData] = await Promise.all([
        eventService.getAll(),
        schedulingRunService.getAll(eventFilter ? { event: eventFilter } : {}),
      ]);
      setEvents(eventsData.results || eventsData || []);
      setRuns(runsData.results || runsData || []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`Are you sure you want to delete scheduling run "${name}"?`)) {
      return;
    }

    try {
      await schedulingRunService.delete(id);
      setRuns(runs.filter((r) => r.id !== id));
      alert('Scheduling run deleted successfully');
    } catch (error) {
      console.error('Error deleting scheduling run:', error);
      alert('Failed to delete scheduling run');
    }
  };

  const handleExecuteAlgorithm = async (id, name) => {
    if (!confirm(`Execute scheduling algorithm for "${name}"? This may take a few minutes.`)) {
      return;
    }

    try {
      // Update UI to show in progress
      setRuns(
        runs.map((r) => (r.id === id ? { ...r, status: 'IN_PROGRESS' } : r))
      );

      const result = await schedulingRunService.executeAlgorithm(id);
      alert(`Algorithm executed successfully! Created ${result.assignments_created} assignments.`);

      // Reload data
      loadData();
    } catch (error) {
      console.error('Error executing algorithm:', error);
      alert('Failed to execute algorithm: ' + (error.message || 'Unknown error'));
      loadData();
    }
  };

  const handleCreateRun = async () => {
    if (!newRun.name || !newRun.event_id) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      setCreating(true);
      // Convert event_id to integer
      const runData = {
        ...newRun,
        event_id: parseInt(newRun.event_id),
      };
      await schedulingRunService.create(runData);
      alert('Scheduling run created successfully');
      setShowCreateModal(false);
      setNewRun({ name: '', description: '', event_id: '', soldiers_ids: [] });
      loadData();
    } catch (error) {
      console.error('Error creating scheduling run:', error);
      alert('Failed to create scheduling run: ' + (error.message || JSON.stringify(error)));
    } finally {
      setCreating(false);
    }
  };

  const filteredRuns = runs.filter((run) =>
    run.name.toLowerCase().includes(filter.toLowerCase())
  );

  if (loading) {
    return <LoadingSpinner text="Loading scheduling runs..." />;
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Scheduling Runs</h1>
          <p className="text-gray-600 mt-2">Create and manage soldier scheduling runs</p>
        </div>
        <button onClick={() => setShowCreateModal(true)} className="btn-primary">
          ➕ Create Scheduling Run
        </button>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Create Scheduling Run</h2>

            <div className="space-y-4">
              <div>
                <label className="label">Run Name *</label>
                <input
                  type="text"
                  value={newRun.name}
                  onChange={(e) => setNewRun({ ...newRun, name: e.target.value })}
                  className="input-field"
                  placeholder="e.g., January 2026 Schedule"
                />
              </div>

              <div>
                <label className="label">Description</label>
                <textarea
                  value={newRun.description}
                  onChange={(e) => setNewRun({ ...newRun, description: e.target.value })}
                  rows={3}
                  className="input-field"
                  placeholder="Optional description..."
                />
              </div>

              <div>
                <label className="label">Event *</label>
                <select
                  value={newRun.event_id}
                  onChange={(e) => setNewRun({ ...newRun, event_id: e.target.value })}
                  className="input-field"
                >
                  <option value="">Select an event...</option>
                  {events.map((event) => (
                    <option key={event.id} value={event.id}>
                      {event.name} ({event.start_date} to {event.end_date})
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  All soldiers from this event will be included in the scheduling run
                </p>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="btn-secondary"
                disabled={creating}
              >
                Cancel
              </button>
              <button onClick={handleCreateRun} className="btn-primary" disabled={creating}>
                {creating ? 'Creating...' : 'Create Run'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="card">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Search</label>
            <input
              type="text"
              placeholder="Search by name..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="input-field"
            />
          </div>
          <div>
            <label className="label">Filter by Event</label>
            <select
              value={eventFilter}
              onChange={(e) => setEventFilter(e.target.value)}
              className="input-field"
            >
              <option value="">All Events</option>
              {events.map((event) => (
                <option key={event.id} value={event.id}>
                  {event.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Runs List */}
      {filteredRuns.length === 0 ? (
        <div className="card text-center py-12">
          <div className="text-6xl mb-4">🗓️</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Scheduling Runs Found</h3>
          <p className="text-gray-600 mb-6">
            {filter ? 'No runs match your search criteria.' : 'Create your first scheduling run to get started.'}
          </p>
          {!filter && (
            <button onClick={() => setShowCreateModal(true)} className="btn-primary inline-block">
              Create Your First Run
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredRuns.map((run) => (
            <div key={run.id} className="card hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-xl font-bold text-gray-900">{run.name}</h3>
                    <StatusBadge status={run.status} />
                  </div>

                  {run.description && (
                    <p className="text-gray-600 mb-3">{run.description}</p>
                  )}

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Event:</span>
                      <div className="font-medium text-gray-900">{run.event_name}</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Soldiers:</span>
                      <div className="font-medium text-gray-900">{run.soldiers_count}</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Assignments:</span>
                      <div className="font-medium text-gray-900">{run.assignments_count || 0}</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Created:</span>
                      <div className="font-medium text-gray-900">
                        {new Date(run.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2 ml-4">
                  {run.status === 'PENDING' && (
                    <button
                      onClick={() => handleExecuteAlgorithm(run.id, run.name)}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                    >
                      Execute
                    </button>
                  )}
                  {(run.status === 'FAILURE' || run.status === 'NO_SOLUTION') && (
                    <button
                      onClick={() => handleExecuteAlgorithm(run.id, run.name)}
                      className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors"
                    >
                      Re-run
                    </button>
                  )}
                  {run.status === 'SUCCESS' && (
                    <Link
                      to={`/calendar/month/${run.id}`}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
                    >
                      Monthly View
                    </Link>
                  )}
                  {(run.status === 'SUCCESS' || run.status === 'IN_PROGRESS') && (
                    <Link
                      to={`/calendar?run=${run.id}`}
                      className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
                    >
                      List View
                    </Link>
                  )}
                  <button
                    onClick={() => handleDelete(run.id, run.name)}
                    className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>

              {run.status === 'IN_PROGRESS' && (
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-blue-700 font-medium">Executing algorithm...</span>
                  </div>
                </div>
              )}

              {(run.status === 'FAILURE' || run.status === 'NO_SOLUTION') && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  {run.solution_details && (
                    <p className="text-red-700 text-sm font-medium mb-3">{run.solution_details}</p>
                  )}
                  <div className="text-sm text-gray-700">
                    <p className="font-medium mb-2">Suggestions to fix:</p>
                    <ul className="list-disc list-inside space-y-1 text-gray-600">
                      <li>Reduce the minimum soldiers per day requirement</li>
                      <li>Add more soldiers to the event</li>
                      <li>Reduce soldier constraints (days they cannot be on base)</li>
                      <li>Increase max consecutive days on base/home</li>
                      <li>Reduce minimum base block days</li>
                      <li>Extend the event duration</li>
                    </ul>
                    <p className="mt-3 text-gray-500 italic">
                      After adjusting the event settings, click "Re-run" to try again.
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SchedulingRunsList;
