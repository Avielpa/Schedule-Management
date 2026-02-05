import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { eventService } from '../services';
import { EVENT_TYPES } from '../config/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { validateSchedulingParameters, generateRecommendedParameters } from '../utils/scheduleValidator';

const EventForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [validation, setValidation] = useState(null);
  const [showAddSoldiersPrompt, setShowAddSoldiersPrompt] = useState(false);
  const [createdEventId, setCreatedEventId] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    event_type: 'TRAINING',
    description: '',
    start_date: '',
    end_date: '',
    min_required_soldiers_per_day: 10,
    base_days_per_soldier: 14,
    home_days_per_soldier: 13,
    max_consecutive_base_days: 7,
    max_consecutive_home_days: 10,
    min_base_block_days: 3,
  });

  useEffect(() => {
    if (isEdit) {
      loadEvent();
    }
  }, [id]);

  useEffect(() => {
    // Validate whenever form data changes
    if (formData.start_date && formData.end_date) {
      const result = validateSchedulingParameters(formData);
      setValidation(result);
    }
  }, [formData]);

  const loadEvent = async () => {
    try {
      setLoading(true);
      const data = await eventService.getById(id);
      setFormData(data);
    } catch (error) {
      console.error('Error loading event:', error);
      alert('Failed to load event');
      navigate('/events');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value) || 0 : value,
    }));
  };

  const handleUseRecommended = () => {
    if (!formData.start_date || !formData.end_date) {
      alert('Please select start and end dates first');
      return;
    }

    const recommended = generateRecommendedParameters(formData.start_date, formData.end_date);
    setFormData((prev) => ({ ...prev, ...recommended }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.name || !formData.start_date || !formData.end_date) {
      alert('Please fill in all required fields');
      return;
    }

    if (new Date(formData.start_date) >= new Date(formData.end_date)) {
      alert('End date must be after start date');
      return;
    }

    // Check validation
    if (validation && !validation.isValid) {
      const proceed = confirm(
        'Your configuration has issues that may prevent scheduling from working:\n\n' +
        validation.errors.join('\n') +
        '\n\nDo you want to save anyway?'
      );
      if (!proceed) return;
    }

    try {
      setSaving(true);
      if (isEdit) {
        await eventService.update(id, formData);
        alert('Event updated successfully');
        navigate('/events');
      } else {
        const createdEvent = await eventService.create(formData);
        setCreatedEventId(createdEvent.id);
        setShowAddSoldiersPrompt(true);
      }
    } catch (error) {
      console.error('Error saving event:', error);
      alert('Failed to save event: ' + (error.message || 'Unknown error'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading event..." />;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          {isEdit ? 'Edit Event' : 'Create New Event'}
        </h1>
        <p className="text-gray-600 mt-2">
          {isEdit ? 'Update event details and scheduling parameters' : 'Set up a new military training or operational event'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Basic Information</h2>

          <div className="space-y-4">
            <div>
              <label className="label">Event Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="input-field"
                placeholder="e.g., Winter Training Exercise 2026"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Event Type *</label>
                <select
                  name="event_type"
                  value={formData.event_type}
                  onChange={handleChange}
                  required
                  className="input-field"
                >
                  {EVENT_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="label">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="input-field"
                placeholder="Brief description of the event..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Start Date *</label>
                <input
                  type="date"
                  name="start_date"
                  value={formData.start_date}
                  onChange={handleChange}
                  required
                  className="input-field"
                />
              </div>
              <div>
                <label className="label">End Date *</label>
                <input
                  type="date"
                  name="end_date"
                  value={formData.end_date}
                  onChange={handleChange}
                  required
                  className="input-field"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Scheduling Parameters */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Scheduling Parameters</h2>
            <button
              type="button"
              onClick={handleUseRecommended}
              className="btn-secondary text-sm"
              disabled={!formData.start_date || !formData.end_date}
            >
              ✨ Use Recommended
            </button>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="label">Min Soldiers Per Day</label>
                <input
                  type="number"
                  name="min_required_soldiers_per_day"
                  value={formData.min_required_soldiers_per_day}
                  onChange={handleChange}
                  min={1}
                  className="input-field"
                />
                <p className="text-xs text-gray-500 mt-1">Minimum soldiers required on base each day</p>
              </div>

              <div>
                <label className="label">Base Days Per Soldier</label>
                <input
                  type="number"
                  name="base_days_per_soldier"
                  value={formData.base_days_per_soldier}
                  onChange={handleChange}
                  min={0}
                  className="input-field"
                />
                <p className="text-xs text-gray-500 mt-1">Target days on base</p>
              </div>

              <div>
                <label className="label">Home Days Per Soldier</label>
                <input
                  type="number"
                  name="home_days_per_soldier"
                  value={formData.home_days_per_soldier}
                  onChange={handleChange}
                  min={0}
                  className="input-field"
                />
                <p className="text-xs text-gray-500 mt-1">Target days at home</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="label">Max Consecutive Base Days</label>
                <input
                  type="number"
                  name="max_consecutive_base_days"
                  value={formData.max_consecutive_base_days}
                  onChange={handleChange}
                  min={1}
                  className="input-field"
                />
                <p className="text-xs text-gray-500 mt-1">Maximum days in a row on base</p>
              </div>

              <div>
                <label className="label">Max Consecutive Home Days</label>
                <input
                  type="number"
                  name="max_consecutive_home_days"
                  value={formData.max_consecutive_home_days}
                  onChange={handleChange}
                  min={1}
                  className="input-field"
                />
                <p className="text-xs text-gray-500 mt-1">Maximum days in a row at home</p>
              </div>

              <div>
                <label className="label">Min Base Block Days</label>
                <input
                  type="number"
                  name="min_base_block_days"
                  value={formData.min_base_block_days}
                  onChange={handleChange}
                  min={1}
                  className="input-field"
                />
                <p className="text-xs text-gray-500 mt-1">Minimum consecutive base days</p>
              </div>
            </div>
          </div>
        </div>

        {/* Validation Feedback */}
        {validation && (
          <div className={`card ${
            !validation.isValid ? 'bg-red-50 border-2 border-red-200' :
            validation.warnings.length > 0 ? 'bg-yellow-50 border-2 border-yellow-200' :
            'bg-green-50 border-2 border-green-200'
          }`}>
            <div className="flex items-start space-x-3">
              <div className="text-2xl">
                {!validation.isValid ? '❌' : validation.warnings.length > 0 ? '⚠️' : '✅'}
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 mb-2">
                  {!validation.isValid ? 'Configuration Issues' :
                   validation.warnings.length > 0 ? 'Warnings' :
                   'Configuration Looks Good'}
                </h3>

                {!validation.isValid && (
                  <div className="space-y-2 mb-3">
                    <p className="font-semibold text-red-700">Errors:</p>
                    <ul className="list-disc list-inside space-y-1">
                      {validation.errors.map((error, i) => (
                        <li key={i} className="text-sm text-red-600">{error}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {validation.warnings.length > 0 && (
                  <div className="space-y-2 mb-3">
                    <p className="font-semibold text-yellow-700">Warnings:</p>
                    <ul className="list-disc list-inside space-y-1">
                      {validation.warnings.map((warning, i) => (
                        <li key={i} className="text-sm text-yellow-600">{warning}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {validation.suggestions.length > 0 && (
                  <div className="space-y-2 mb-3">
                    <p className="font-semibold text-blue-700">💡 Suggestions:</p>
                    <ul className="list-disc list-inside space-y-1">
                      {validation.suggestions.map((suggestion, i) => (
                        <li key={i} className="text-sm text-blue-600">{suggestion}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {validation.stats && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <p className="text-sm text-gray-600">
                      📊 <strong>Stats:</strong> {validation.stats.totalDays} total days,
                      {validation.stats.minBaseBlocks} base blocks,
                      {validation.stats.minHomeBlocks} home blocks
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      <strong>Feasibility Score:</strong>{' '}
                      <span className={`font-bold ${
                        validation.stats.feasibilityScore >= 80 ? 'text-green-600' :
                        validation.stats.feasibilityScore >= 60 ? 'text-yellow-600' :
                        'text-red-600'
                      }`}>
                        {validation.stats.feasibilityScore}/100
                      </span>
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Form Actions */}
        <div className="flex items-center justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/events')}
            className="btn-secondary"
            disabled={saving}
          >
            Cancel
          </button>
          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? 'Saving...' : isEdit ? 'Update Event' : 'Create Event'}
          </button>
        </div>
      </form>

      {/* Add Soldiers Prompt Modal */}
      {showAddSoldiersPrompt && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 text-center">
            <div className="text-5xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Event Created!</h2>
            <p className="text-gray-600 mb-6">
              Your event has been created successfully. Would you like to add soldiers to this event now?
            </p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => navigate('/events')}
                className="btn-secondary"
              >
                Later
              </button>
              <button
                onClick={() => navigate(`/soldiers?event=${createdEventId}&addNew=true`)}
                className="btn-primary"
              >
                Add Soldiers Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventForm;
