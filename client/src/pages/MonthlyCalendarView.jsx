import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, addMonths, subMonths, isToday, parseISO } from 'date-fns';
import LoadingSpinner from '../components/LoadingSpinner';
import assignmentService from '../services/assignmentService';
import schedulingRunService from '../services/schedulingRunService';

const MonthlyCalendarView = () => {
  const { runId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [schedulingRun, setSchedulingRun] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(null);

  useEffect(() => {
    fetchData();
  }, [runId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [runData, assignmentsData] = await Promise.all([
        schedulingRunService.getById(runId),
        assignmentService.getBySchedulingRun(runId)
      ]);

      console.log('Scheduling Run Data:', runData);
      console.log('Assignments Data:', assignmentsData);

      setSchedulingRun(runData);
      const assignmentsList = assignmentsData.results || assignmentsData;
      console.log('Assignments List:', assignmentsList);
      setAssignments(assignmentsList);

      // Set initial month to the event start date
      if (runData.event?.start_date) {
        console.log('Setting month to:', runData.event.start_date);
        setCurrentMonth(parseISO(runData.event.start_date));
      }
    } catch (err) {
      setError('Failed to load calendar data');
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Get assignments grouped by date
  const getAssignmentsByDate = () => {
    const byDate = {};
    assignments.forEach(assignment => {
      const dateKey = assignment.assignment_date;
      if (!byDate[dateKey]) {
        byDate[dateKey] = { onBase: [], atHome: [] };
      }
      if (assignment.is_on_base) {
        byDate[dateKey].onBase.push(assignment);
      } else {
        byDate[dateKey].atHome.push(assignment);
      }
    });
    return byDate;
  };

  const assignmentsByDate = getAssignmentsByDate();

  // Calendar navigation
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

  // Generate calendar days
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Get the day of week the month starts on (0 = Sunday)
  const startDayOfWeek = getDay(monthStart);

  // Day names
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Check if a date is within the event range
  const isInEventRange = (date) => {
    if (!schedulingRun?.event?.start_date || !schedulingRun?.event?.end_date) return false;
    const eventStart = parseISO(schedulingRun.event.start_date);
    const eventEnd = parseISO(schedulingRun.event.end_date);
    return date >= eventStart && date <= eventEnd;
  };

  // Get day cell content
  const getDayContent = (date) => {
    const dateKey = format(date, 'yyyy-MM-dd');
    const dayData = assignmentsByDate[dateKey];

    if (!dayData) return null;

    return {
      onBase: dayData.onBase.length,
      atHome: dayData.atHome.length,
      soldiers: dayData
    };
  };

  if (loading) {
    return <LoadingSpinner text="Loading calendar..." />;
  }

  if (error) {
    return <div className="text-red-600 p-4">{error}</div>;
  }

  return (
    <>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Monthly Calendar</h1>
            {schedulingRun?.event && (
              <p className="text-gray-600">
                {schedulingRun.event.name} | {schedulingRun.event.start_date} to {schedulingRun.event.end_date}
              </p>
            )}
          </div>
          <button
            onClick={() => navigate('/scheduling-runs')}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            Back to Runs
          </button>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-6 mb-4 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded"></div>
            <span className="text-sm">On Base</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-500 rounded"></div>
            <span className="text-sm">At Home</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-200 rounded"></div>
            <span className="text-sm">Outside Event Range</span>
          </div>
        </div>

        {/* Month Navigation */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={prevMonth}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <h2 className="text-xl font-semibold">
            {format(currentMonth, 'MMMM yyyy')}
          </h2>

          <button
            onClick={nextMonth}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Calendar Grid */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {/* Day Headers */}
          <div className="grid grid-cols-7 bg-gray-100 border-b">
            {dayNames.map(day => (
              <div key={day} className="p-3 text-center font-semibold text-gray-700">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7">
            {/* Empty cells for days before month starts */}
            {Array.from({ length: startDayOfWeek }).map((_, index) => (
              <div key={`empty-${index}`} className="min-h-[120px] bg-gray-50 border-b border-r" />
            ))}

            {/* Actual days */}
            {calendarDays.map(date => {
              const dayContent = getDayContent(date);
              const inRange = isInEventRange(date);
              const isSelected = selectedDay && format(selectedDay, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd');

              return (
                <div
                  key={date.toISOString()}
                  onClick={() => inRange && dayContent && setSelectedDay(date)}
                  className={`min-h-[120px] border-b border-r p-2 transition-colors cursor-pointer
                    ${!inRange ? 'bg-gray-100 opacity-50' : 'hover:bg-gray-50'}
                    ${isToday(date) ? 'bg-yellow-50' : ''}
                    ${isSelected ? 'ring-2 ring-blue-500 ring-inset' : ''}
                  `}
                >
                  {/* Date Number */}
                  <div className={`text-sm font-medium mb-1 ${isToday(date) ? 'text-blue-600' : 'text-gray-700'}`}>
                    {format(date, 'd')}
                  </div>

                  {/* Assignment Summary */}
                  {inRange && dayContent && (
                    <div className="space-y-1">
                      {/* On Base */}
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 bg-green-500 rounded-sm flex-shrink-0"></div>
                        <span className="text-xs font-medium text-green-700">
                          {dayContent.onBase} on base
                        </span>
                      </div>

                      {/* At Home */}
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 bg-blue-500 rounded-sm flex-shrink-0"></div>
                        <span className="text-xs font-medium text-blue-700">
                          {dayContent.atHome} at home
                        </span>
                      </div>

                      {/* Warning if below minimum */}
                      {schedulingRun?.event?.min_required_soldiers_per_day &&
                       dayContent.onBase < schedulingRun.event.min_required_soldiers_per_day && (
                        <div className="text-xs text-red-600 font-medium">
                          Below min!
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Day Details */}
        {selectedDay && (
          <div className="mt-6 bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">
                {format(selectedDay, 'EEEE, MMMM d, yyyy')}
              </h3>
              <button
                onClick={() => setSelectedDay(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {(() => {
              const dateKey = format(selectedDay, 'yyyy-MM-dd');
              const dayData = assignmentsByDate[dateKey];

              if (!dayData) return <p className="text-gray-500">No data for this day</p>;

              return (
                <div className="grid md:grid-cols-2 gap-6">
                  {/* On Base */}
                  <div>
                    <h4 className="font-medium text-green-700 mb-2 flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-500 rounded"></div>
                      On Base ({dayData.onBase.length})
                    </h4>
                    <div className="max-h-60 overflow-y-auto">
                      {dayData.onBase.length > 0 ? (
                        <ul className="space-y-1">
                          {dayData.onBase.map(a => (
                            <li key={a.id} className="text-sm py-1 px-2 bg-green-50 rounded">
                              {a.soldier_name || `Soldier ${a.soldier}`}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm text-gray-500">No soldiers on base</p>
                      )}
                    </div>
                  </div>

                  {/* At Home */}
                  <div>
                    <h4 className="font-medium text-blue-700 mb-2 flex items-center gap-2">
                      <div className="w-3 h-3 bg-blue-500 rounded"></div>
                      At Home ({dayData.atHome.length})
                    </h4>
                    <div className="max-h-60 overflow-y-auto">
                      {dayData.atHome.length > 0 ? (
                        <ul className="space-y-1">
                          {dayData.atHome.map(a => (
                            <li key={a.id} className="text-sm py-1 px-2 bg-blue-50 rounded">
                              {a.soldier_name || `Soldier ${a.soldier}`}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm text-gray-500">No soldiers at home</p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* Statistics */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-2xl font-bold text-gray-900">
              {schedulingRun?.soldiers_count || 0}
            </div>
            <div className="text-sm text-gray-600">Total Soldiers</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-2xl font-bold text-green-600">
              {schedulingRun?.event?.min_required_soldiers_per_day || 0}
            </div>
            <div className="text-sm text-gray-600">Min Per Day</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-2xl font-bold text-blue-600">
              {assignments.length}
            </div>
            <div className="text-sm text-gray-600">Total Assignments</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-2xl font-bold text-purple-600">
              {schedulingRun?.event?.start_date && schedulingRun?.event?.end_date ?
                Math.ceil((new Date(schedulingRun.event.end_date) - new Date(schedulingRun.event.start_date)) / (1000 * 60 * 60 * 24)) + 1
                : 0}
            </div>
            <div className="text-sm text-gray-600">Event Days</div>
          </div>
        </div>
      </div>
    </>
  );
};

export default MonthlyCalendarView;
