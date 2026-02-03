// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api';

export const API_ENDPOINTS = {
  // Events
  EVENTS: '/events/',
  EVENT_DETAIL: (id) => `/events/${id}/`,

  // Soldiers
  SOLDIERS: '/soldiers/',
  SOLDIER_DETAIL: (id) => `/soldiers/${id}/`,
  SOLDIERS_BULK_CREATE: '/soldiers/bulk_create/',

  // Constraints
  CONSTRAINTS: '/soldier-constraints/',
  CONSTRAINT_DETAIL: (id) => `/soldier-constraints/${id}/`,

  // Scheduling Runs
  SCHEDULING_RUNS: '/scheduling-runs/',
  SCHEDULING_RUN_DETAIL: (id) => `/scheduling-runs/${id}/`,
  EXECUTE_ALGORITHM: (id) => `/scheduling-runs/${id}/execute_algorithm/`,

  // Assignments
  ASSIGNMENTS: '/assignments/',
  ASSIGNMENTS_CALENDAR: '/assignments/calendar/',
};

export const EVENT_TYPES = [
  { value: 'TRAINING', label: 'Training' },
  { value: 'EXERCISE', label: 'Military Exercise' },
  { value: 'HOLIDAY', label: 'Holiday' },
  { value: 'MAINTENANCE', label: 'Equipment Maintenance' },
  { value: 'INSPECTION', label: 'Inspection' },
  { value: 'CEREMONY', label: 'Ceremony' },
  { value: 'OTHER', label: 'Other' },
];

export const RANKS = [
  { value: 'REGULAR', label: 'Regular Soldier' },
  { value: 'SERGEANT_MAJOR', label: 'Sergeant Major' },
  { value: 'SECOND_COMMANDER', label: 'Second Commander' },
];

export const CONSTRAINT_TYPES = [
  { value: 'PERSONAL', label: 'Personal Leave' },
  { value: 'MEDICAL', label: 'Medical' },
  { value: 'TRAINING', label: 'Training/Course' },
  { value: 'FAMILY', label: 'Family Event' },
  { value: 'OFFICIAL', label: 'Official Duty' },
  { value: 'OTHER', label: 'Other' },
];

export const STATUS_TYPES = [
  { value: 'PENDING', label: 'Pending', color: 'gray' },
  { value: 'IN_PROGRESS', label: 'In Progress', color: 'blue' },
  { value: 'SUCCESS', label: 'Successfully Completed', color: 'green' },
  { value: 'FAILURE', label: 'Failed', color: 'red' },
  { value: 'NO_SOLUTION', label: 'No Solution Found', color: 'orange' },
  { value: 'CANCELLED', label: 'Cancelled', color: 'gray' },
];
