import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { assignmentService, schedulingRunService } from '../services';
import LoadingSpinner from '../components/LoadingSpinner';
import { format, parseISO } from 'date-fns';

const CalendarView = () => {
  const [searchParams] = useSearchParams();
  const runId = searchParams.get('run');

  const [run, setRun] = useState(null);
  const [calendarData, setCalendarData] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(null);

  useEffect(() => {
    if (runId) {
      loadCalendarData();
    }
  }, [runId]);

  const loadCalendarData = async () => {
    try {
      setLoading(true);
      const [runData, calData] = await Promise.all([
        schedulingRunService.getById(runId),
        assignmentService.getCalendar(runId),
      ]);
      setRun(runData);
      setCalendarData(calData);

      // Set first date as selected
      const dates = Object.keys(calData).sort();
      if (dates.length > 0) {
        setSelectedDate(dates[0]);
      }
    } catch (error) {
      console.error('Error loading calendar data:', error);
      alert('Failed to load calendar data');
    } finally {
      setLoading(false);
    }
  };

  if (!runId) {
    return (
      <div className="card text-center py-12">
        <div className="text-6xl mb-4">📆</div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">No Scheduling Run Selected</h3>
        <p className="text-gray-600">Please select a scheduling run from the Scheduling Runs page.</p>
      </div>
    );
  }

  if (loading) {
    return <LoadingSpinner text="Loading calendar..." />;
  }

  const dates = Object.keys(calendarData).sort();

  if (dates.length === 0) {
    return (
      <div className="card text-center py-12">
        <div className="text-6xl mb-4">📆</div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">No Assignments Found</h3>
        <p className="text-gray-600">This scheduling run doesn't have any assignments yet.</p>
      </div>
    );
  }

  const selectedDayData = selectedDate ? calendarData[selectedDate] : null;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Calendar View</h1>
        <p className="text-gray-600 mt-2">
          {run?.name} - {run?.event?.name}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="text-sm text-gray-600">Total Days</div>
          <div className="text-2xl font-bold text-gray-900">{dates.length}</div>
        </div>
        <div className="card">
          <div className="text-sm text-gray-600">Total Soldiers</div>
          <div className="text-2xl font-bold text-gray-900">{run?.soldiers_count}</div>
        </div>
        <div className="card">
          <div className="text-sm text-gray-600">Date Range</div>
          <div className="text-lg font-bold text-gray-900">
            {dates[0]} to {dates[dates.length - 1]}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Date List */}
        <div className="card lg:col-span-1 max-h-[600px] overflow-y-auto">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Select Date</h2>
          <div className="space-y-2">
            {dates.map((date) => {
              const dayData = calendarData[date];
              const onBaseCount = dayData.on_base.length;
              const atHomeCount = dayData.at_home.length;

              return (
                <button
                  key={date}
                  onClick={() => setSelectedDate(date)}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    selectedDate === date
                      ? 'bg-primary-100 border-2 border-primary-500'
                      : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                  }`}
                >
                  <div className="font-semibold text-gray-900">
                    {format(parseISO(date), 'EEE, MMM d, yyyy')}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    <span className="text-blue-600 font-medium">{onBaseCount} on base</span>
                    {' • '}
                    <span className="text-gray-500">{atHomeCount} at home</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Day Details */}
        <div className="lg:col-span-2 space-y-4">
          {selectedDayData && (
            <>
              <div className="card">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-900">
                    {format(parseISO(selectedDate), 'EEEE, MMMM d, yyyy')}
                  </h2>
                  <div className="text-sm text-gray-600">
                    Total: {selectedDayData.on_base.length + selectedDayData.at_home.length} soldiers
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* On Base */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-semibold text-gray-900">🏢 On Base</h3>
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 font-bold rounded-full">
                        {selectedDayData.on_base.length}
                      </span>
                    </div>
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {selectedDayData.on_base.length === 0 ? (
                        <p className="text-gray-500 text-sm">No soldiers on base</p>
                      ) : (
                        selectedDayData.on_base.map((soldier) => (
                          <div
                            key={soldier.id}
                            className="p-3 bg-blue-50 border border-blue-200 rounded-lg"
                          >
                            <div className="font-medium text-gray-900">{soldier.name}</div>
                            <div className="text-sm text-gray-600">{soldier.rank}</div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* At Home */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-semibold text-gray-900">🏠 At Home</h3>
                      <span className="px-3 py-1 bg-gray-100 text-gray-800 font-bold rounded-full">
                        {selectedDayData.at_home.length}
                      </span>
                    </div>
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {selectedDayData.at_home.length === 0 ? (
                        <p className="text-gray-500 text-sm">All soldiers on base</p>
                      ) : (
                        selectedDayData.at_home.map((soldier) => (
                          <div
                            key={soldier.id}
                            className="p-3 bg-gray-50 border border-gray-200 rounded-lg"
                          >
                            <div className="font-medium text-gray-900">{soldier.name}</div>
                            <div className="text-sm text-gray-600">{soldier.rank}</div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Summary Statistics */}
              <div className="card">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Daily Statistics</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <div className="text-sm text-gray-600">On Base</div>
                    <div className="text-2xl font-bold text-blue-600">
                      {selectedDayData.on_base.length}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">At Home</div>
                    <div className="text-2xl font-bold text-gray-600">
                      {selectedDayData.at_home.length}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Coverage</div>
                    <div className="text-2xl font-bold text-green-600">
                      {Math.round(
                        (selectedDayData.on_base.length /
                          (selectedDayData.on_base.length + selectedDayData.at_home.length)) *
                          100
                      )}
                      %
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CalendarView;
