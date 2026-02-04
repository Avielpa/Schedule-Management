import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { soldierService, eventService } from '../services';
import LoadingSpinner from '../components/LoadingSpinner';
import { RANKS, CONSTRAINT_TYPES } from '../config/api';

const SoldiersList = () => {
  const [soldiers, setSoldiers] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [eventFilter, setEventFilter] = useState('');
  const [showBulkImport, setShowBulkImport] = useState(false);
  const [showAddSoldier, setShowAddSoldier] = useState(false);
  const [bulkImportData, setBulkImportData] = useState('');
  const [selectedEvent, setSelectedEvent] = useState('');
  const [importing, setImporting] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form state for adding a single soldier
  const [newSoldier, setNewSoldier] = useState({
    name: '',
    soldier_id: '',
    rank: 'REGULAR',
    event_id: '',
    is_exceptional_output: false,
    is_weekend_only_soldier_flag: false,
    constraints_data: [],
  });

  // Edit soldier state
  const [showEditSoldier, setShowEditSoldier] = useState(false);
  const [editingSoldier, setEditingSoldier] = useState(null);
  const [editConstraint, setEditConstraint] = useState({
    constraint_date: '',
    constraint_type: 'PERSONAL',
    description: '',
  });

  const [newConstraint, setNewConstraint] = useState({
    constraint_date: '',
    constraint_type: 'PERSONAL',
    description: '',
  });

  useEffect(() => {
    loadData();
  }, [eventFilter]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [eventsData, soldiersData] = await Promise.all([
        eventService.getAll(),
        soldierService.getAll(eventFilter ? { event: eventFilter } : {}),
      ]);
      setEvents(eventsData.results || eventsData || []);
      setSoldiers(soldiersData.results || soldiersData || []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`Are you sure you want to delete soldier "${name}"?`)) {
      return;
    }

    try {
      await soldierService.delete(id);
      setSoldiers(soldiers.filter((s) => s.id !== id));
      alert('Soldier deleted successfully');
    } catch (error) {
      console.error('Error deleting soldier:', error);
      alert('Failed to delete soldier');
    }
  };

  const handleAddConstraint = () => {
    if (!newConstraint.constraint_date) {
      alert('Please enter a constraint date');
      return;
    }

    setNewSoldier({
      ...newSoldier,
      constraints_data: [...newSoldier.constraints_data, { ...newConstraint }],
    });

    // Reset constraint form
    setNewConstraint({
      constraint_date: '',
      constraint_type: 'PERSONAL',
      description: '',
    });
  };

  const handleRemoveConstraint = (index) => {
    setNewSoldier({
      ...newSoldier,
      constraints_data: newSoldier.constraints_data.filter((_, i) => i !== index),
    });
  };

  const handleCreateSoldier = async () => {
    if (!newSoldier.name || !newSoldier.event_id) {
      alert('Please fill in soldier name and select an event');
      return;
    }

    try {
      setSaving(true);
      await soldierService.create(newSoldier);
      alert('Soldier created successfully');
      setShowAddSoldier(false);
      setNewSoldier({
        name: '',
        soldier_id: '',
        rank: 'REGULAR',
        event_id: '',
        is_exceptional_output: false,
        is_weekend_only_soldier_flag: false,
        constraints_data: [],
      });
      loadData();
    } catch (error) {
      console.error('Error creating soldier:', error);
      alert('Failed to create soldier: ' + (error.message || 'Unknown error'));
    } finally {
      setSaving(false);
    }
  };

  // Edit soldier functions
  const handleOpenEditSoldier = async (soldier) => {
    try {
      // Fetch full soldier data including constraints
      const fullSoldier = await soldierService.getById(soldier.id);
      setEditingSoldier({
        id: fullSoldier.id,
        name: fullSoldier.name,
        soldier_id: fullSoldier.soldier_id || '',
        rank: fullSoldier.rank || 'REGULAR',
        event_id: fullSoldier.event || '',
        is_exceptional_output: fullSoldier.is_exceptional_output || false,
        is_weekend_only_soldier_flag: fullSoldier.is_weekend_only_soldier_flag || false,
        constraints_data: fullSoldier.constraints || [],
      });
      setShowEditSoldier(true);
    } catch (error) {
      console.error('Error loading soldier:', error);
      alert('Failed to load soldier data');
    }
  };

  const handleAddEditConstraint = () => {
    if (!editConstraint.constraint_date) {
      alert('Please enter a constraint date');
      return;
    }
    setEditingSoldier({
      ...editingSoldier,
      constraints_data: [...editingSoldier.constraints_data, { ...editConstraint }],
    });
    setEditConstraint({ constraint_date: '', constraint_type: 'PERSONAL', description: '' });
  };

  const handleRemoveEditConstraint = (index) => {
    setEditingSoldier({
      ...editingSoldier,
      constraints_data: editingSoldier.constraints_data.filter((_, i) => i !== index),
    });
  };

  const handleUpdateSoldier = async () => {
    if (!editingSoldier.name) {
      alert('Please fill in soldier name');
      return;
    }

    try {
      setSaving(true);
      await soldierService.update(editingSoldier.id, {
        name: editingSoldier.name,
        soldier_id: editingSoldier.soldier_id,
        rank: editingSoldier.rank,
        is_exceptional_output: editingSoldier.is_exceptional_output,
        is_weekend_only_soldier_flag: editingSoldier.is_weekend_only_soldier_flag,
        constraints_data: editingSoldier.constraints_data,
      });
      alert('Soldier updated successfully');
      setShowEditSoldier(false);
      setEditingSoldier(null);
      loadData();
    } catch (error) {
      console.error('Error updating soldier:', error);
      alert('Failed to update soldier: ' + (error.message || 'Unknown error'));
    } finally {
      setSaving(false);
    }
  };

  const handleBulkImport = async () => {
    if (!selectedEvent) {
      alert('Please select an event');
      return;
    }

    if (!bulkImportData.trim()) {
      alert('Please provide soldier data');
      return;
    }

    try {
      setImporting(true);
      const data = JSON.parse(bulkImportData);

      // Ensure event_id is set
      const soldiersToImport = Array.isArray(data)
        ? data.map((s) => ({ ...s, event_id: parseInt(selectedEvent) }))
        : { ...data, event_id: parseInt(selectedEvent) };

      const result = await soldierService.bulkCreate(soldiersToImport);

      alert(`Successfully imported ${result.summary.created} soldiers`);
      setBulkImportData('');
      setShowBulkImport(false);
      loadData();
    } catch (error) {
      console.error('Error importing soldiers:', error);
      alert('Failed to import soldiers: ' + (error.message || 'Invalid JSON format'));
    } finally {
      setImporting(false);
    }
  };

  const filteredSoldiers = soldiers.filter(
    (soldier) =>
      soldier.name.toLowerCase().includes(filter.toLowerCase()) ||
      soldier.soldier_id?.toLowerCase().includes(filter.toLowerCase())
  );

  if (loading) {
    return <LoadingSpinner text="Loading soldiers..." />;
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Soldiers</h1>
          <p className="text-gray-600 mt-2">Manage soldiers and their constraints</p>
        </div>
        <div className="flex space-x-3">
          <button onClick={() => setShowAddSoldier(true)} className="btn-primary">
            ➕ Add Soldier
          </button>
          <button onClick={() => setShowBulkImport(!showBulkImport)} className="btn-secondary">
            📥 Bulk Import
          </button>
        </div>
      </div>

      {/* Add Soldier Modal */}
      {showAddSoldier && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Add New Soldier</h2>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Soldier Name *</label>
                  <input
                    type="text"
                    value={newSoldier.name}
                    onChange={(e) => setNewSoldier({ ...newSoldier, name: e.target.value })}
                    className="input-field"
                    placeholder="e.g., John Doe"
                  />
                </div>
                <div>
                  <label className="label">Soldier ID</label>
                  <input
                    type="text"
                    value={newSoldier.soldier_id}
                    onChange={(e) => setNewSoldier({ ...newSoldier, soldier_id: e.target.value })}
                    className="input-field"
                    placeholder="e.g., S001"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Event *</label>
                  <select
                    value={newSoldier.event_id}
                    onChange={(e) => setNewSoldier({ ...newSoldier, event_id: e.target.value })}
                    className="input-field"
                  >
                    <option value="">Select an event...</option>
                    {events.map((event) => (
                      <option key={event.id} value={event.id}>
                        {event.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label">Rank</label>
                  <select
                    value={newSoldier.rank}
                    onChange={(e) => setNewSoldier({ ...newSoldier, rank: e.target.value })}
                    className="input-field"
                  >
                    {RANKS.map((rank) => (
                      <option key={rank.value} value={rank.value}>
                        {rank.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="exceptional"
                    checked={newSoldier.is_exceptional_output}
                    onChange={(e) =>
                      setNewSoldier({ ...newSoldier, is_exceptional_output: e.target.checked })
                    }
                    className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                  />
                  <label htmlFor="exceptional" className="text-sm text-gray-700">
                    Exceptional Soldier (Leadership Role)
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="weekend"
                    checked={newSoldier.is_weekend_only_soldier_flag}
                    onChange={(e) =>
                      setNewSoldier({
                        ...newSoldier,
                        is_weekend_only_soldier_flag: e.target.checked,
                      })
                    }
                    className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                  />
                  <label htmlFor="weekend" className="text-sm text-gray-700">
                    Weekend Only Soldier
                  </label>
                </div>
              </div>

              {/* Constraints Section */}
              <div className="border-t pt-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Constraints (Optional)</h3>

                {/* Existing Constraints */}
                {newSoldier.constraints_data.length > 0 && (
                  <div className="space-y-2 mb-4">
                    {newSoldier.constraints_data.map((constraint, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">
                            {constraint.constraint_date}
                          </div>
                          <div className="text-sm text-gray-600">
                            {constraint.constraint_type} - {constraint.description || 'No description'}
                          </div>
                        </div>
                        <button
                          onClick={() => handleRemoveConstraint(index)}
                          className="text-red-600 hover:text-red-700 text-sm"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add New Constraint */}
                <div className="space-y-3 p-4 bg-blue-50 rounded-lg">
                  <h4 className="text-sm font-semibold text-gray-700">Add Constraint</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="label text-xs">Date</label>
                      <input
                        type="date"
                        value={newConstraint.constraint_date}
                        onChange={(e) =>
                          setNewConstraint({ ...newConstraint, constraint_date: e.target.value })
                        }
                        className="input-field text-sm"
                      />
                    </div>
                    <div>
                      <label className="label text-xs">Type</label>
                      <select
                        value={newConstraint.constraint_type}
                        onChange={(e) =>
                          setNewConstraint({ ...newConstraint, constraint_type: e.target.value })
                        }
                        className="input-field text-sm"
                      >
                        {CONSTRAINT_TYPES.map((type) => (
                          <option key={type.value} value={type.value}>
                            {type.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="label text-xs">Description</label>
                    <input
                      type="text"
                      value={newConstraint.description}
                      onChange={(e) =>
                        setNewConstraint({ ...newConstraint, description: e.target.value })
                      }
                      className="input-field text-sm"
                      placeholder="Optional description..."
                    />
                  </div>
                  <button
                    onClick={handleAddConstraint}
                    className="btn-secondary text-sm w-full"
                    type="button"
                  >
                    + Add Constraint
                  </button>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowAddSoldier(false);
                  setNewSoldier({
                    name: '',
                    soldier_id: '',
                    rank: 'PRIVATE',
                    event_id: '',
                    is_exceptional_output: false,
                    is_weekend_only_soldier_flag: false,
                    constraints_data: [],
                  });
                }}
                className="btn-secondary"
                disabled={saving}
              >
                Cancel
              </button>
              <button onClick={handleCreateSoldier} className="btn-primary" disabled={saving}>
                {saving ? 'Creating...' : 'Create Soldier'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Soldier Modal */}
      {showEditSoldier && editingSoldier && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Edit Soldier</h2>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Soldier Name *</label>
                  <input
                    type="text"
                    value={editingSoldier.name}
                    onChange={(e) => setEditingSoldier({ ...editingSoldier, name: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="label">Soldier ID</label>
                  <input
                    type="text"
                    value={editingSoldier.soldier_id}
                    onChange={(e) => setEditingSoldier({ ...editingSoldier, soldier_id: e.target.value })}
                    className="input-field"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Event</label>
                  <input
                    type="text"
                    value={events.find(e => e.id === editingSoldier.event_id)?.name || 'Unknown Event'}
                    disabled
                    className="input-field bg-gray-100"
                  />
                  <p className="text-xs text-gray-500 mt-1">Event cannot be changed after creation</p>
                </div>
                <div>
                  <label className="label">Rank</label>
                  <select
                    value={editingSoldier.rank}
                    onChange={(e) => setEditingSoldier({ ...editingSoldier, rank: e.target.value })}
                    className="input-field"
                  >
                    {RANKS.map((rank) => (
                      <option key={rank.value} value={rank.value}>
                        {rank.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="edit-exceptional"
                    checked={editingSoldier.is_exceptional_output}
                    onChange={(e) => setEditingSoldier({ ...editingSoldier, is_exceptional_output: e.target.checked })}
                    className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                  />
                  <label htmlFor="edit-exceptional" className="text-sm text-gray-700">
                    Exceptional Soldier (Leadership Role)
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="edit-weekend"
                    checked={editingSoldier.is_weekend_only_soldier_flag}
                    onChange={(e) => setEditingSoldier({ ...editingSoldier, is_weekend_only_soldier_flag: e.target.checked })}
                    className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                  />
                  <label htmlFor="edit-weekend" className="text-sm text-gray-700">
                    Weekend Only Soldier
                  </label>
                </div>
              </div>

              {/* Constraints Section */}
              <div className="border-t pt-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Constraints</h3>

                {/* Existing Constraints */}
                {editingSoldier.constraints_data.length > 0 && (
                  <div className="space-y-2 mb-4">
                    {editingSoldier.constraints_data.map((constraint, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">
                            {constraint.constraint_date}
                          </div>
                          <div className="text-sm text-gray-600">
                            {constraint.constraint_type} - {constraint.description || 'No description'}
                          </div>
                        </div>
                        <button
                          onClick={() => handleRemoveEditConstraint(index)}
                          className="text-red-600 hover:text-red-700 text-sm"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add New Constraint */}
                <div className="space-y-3 p-4 bg-blue-50 rounded-lg">
                  <h4 className="text-sm font-semibold text-gray-700">Add Constraint</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="label text-xs">Date</label>
                      <input
                        type="date"
                        value={editConstraint.constraint_date}
                        onChange={(e) => setEditConstraint({ ...editConstraint, constraint_date: e.target.value })}
                        className="input-field text-sm"
                      />
                    </div>
                    <div>
                      <label className="label text-xs">Type</label>
                      <select
                        value={editConstraint.constraint_type}
                        onChange={(e) => setEditConstraint({ ...editConstraint, constraint_type: e.target.value })}
                        className="input-field text-sm"
                      >
                        {CONSTRAINT_TYPES.map((type) => (
                          <option key={type.value} value={type.value}>
                            {type.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="label text-xs">Description</label>
                    <input
                      type="text"
                      value={editConstraint.description}
                      onChange={(e) => setEditConstraint({ ...editConstraint, description: e.target.value })}
                      className="input-field text-sm"
                      placeholder="Optional description..."
                    />
                  </div>
                  <button
                    onClick={handleAddEditConstraint}
                    className="btn-secondary text-sm w-full"
                    type="button"
                  >
                    + Add Constraint
                  </button>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowEditSoldier(false);
                  setEditingSoldier(null);
                }}
                className="btn-secondary"
                disabled={saving}
              >
                Cancel
              </button>
              <button onClick={handleUpdateSoldier} className="btn-primary" disabled={saving}>
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Import Panel */}
      {showBulkImport && (
        <div className="card bg-blue-50 border-2 border-blue-200">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Bulk Import Soldiers</h3>

          <div className="space-y-4">
            <div>
              <label className="label">Select Event *</label>
              <select
                value={selectedEvent}
                onChange={(e) => setSelectedEvent(e.target.value)}
                className="input-field"
              >
                <option value="">Choose an event...</option>
                {events.map((event) => (
                  <option key={event.id} value={event.id}>
                    {event.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="label">JSON Data</label>
              <textarea
                value={bulkImportData}
                onChange={(e) => setBulkImportData(e.target.value)}
                rows={10}
                className="input-field font-mono text-sm"
                placeholder={`[
  {
    "name": "John Doe",
    "soldier_id": "S001",
    "rank": "SERGEANT",
    "is_exceptional_output": true,
    "constraints_data": [
      {
        "constraint_date": "2026-02-15",
        "constraint_type": "PERSONAL",
        "description": "Personal leave"
      }
    ]
  }
]`}
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowBulkImport(false)}
                className="btn-secondary"
                disabled={importing}
              >
                Cancel
              </button>
              <button onClick={handleBulkImport} className="btn-primary" disabled={importing}>
                {importing ? 'Importing...' : 'Import Soldiers'}
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
              placeholder="Search by name or soldier ID..."
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

      {/* Soldiers List */}
      {filteredSoldiers.length === 0 ? (
        <div className="card text-center py-12">
          <div className="text-6xl mb-4">👥</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Soldiers Found</h3>
          <p className="text-gray-600 mb-6">
            {filter ? 'No soldiers match your search criteria.' : 'Add soldiers manually or use bulk import.'}
          </p>
        </div>
      ) : (
        <div className="card">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Name</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Soldier ID</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Rank</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Event</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Constraints</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Flags</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSoldiers.map((soldier) => (
                  <tr key={soldier.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium text-gray-900">{soldier.name}</td>
                    <td className="py-3 px-4 text-gray-600">{soldier.soldier_id || '-'}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded">
                        {soldier.rank}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-600 text-sm">{soldier.event_name}</td>
                    <td className="py-3 px-4">
                      <span className="text-primary-600 font-medium">{soldier.constraints_count || 0}</span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex space-x-1">
                        {soldier.is_exceptional_output && (
                          <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs font-medium rounded">
                            Exceptional
                          </span>
                        )}
                        {soldier.is_weekend_only_soldier_flag && (
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                            Weekend
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleOpenEditSoldier(soldier)}
                          className="text-blue-600 hover:text-blue-700 text-sm"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(soldier.id, soldier.name)}
                          className="text-red-600 hover:text-red-700 text-sm"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default SoldiersList;
