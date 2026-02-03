# Military Scheduling System - Web UI

Modern React web application for managing military soldier scheduling.

## Features

- 📅 **Event Management** - Create and manage training events with configurable parameters
- 👥 **Soldier Management** - Add soldiers individually or via bulk import with constraints
- 🗓️ **Scheduling Runs** - Create scheduling runs and execute the optimization algorithm
- 📆 **Calendar View** - Visual calendar display of soldier assignments
- 🎨 **Modern UI** - Built with React, Tailwind CSS, and modern best practices

## Prerequisites

- Node.js 20.x or higher
- Django backend server running on `http://127.0.0.1:8000`

## Installation

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file (or use the existing one):
```bash
cp .env.example .env
```

3. Configure API endpoint in `.env`:
```
VITE_API_BASE_URL=http://127.0.0.1:8000/api
```

## Development

Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Build for Production

Build the production bundle:
```bash
npm run build
```

Preview the production build:
```bash
npm run preview
```

## Project Structure

```
client/
├── src/
│   ├── components/       # Reusable UI components
│   │   ├── Layout.jsx
│   │   ├── LoadingSpinner.jsx
│   │   └── StatusBadge.jsx
│   ├── pages/           # Page components
│   │   ├── Dashboard.jsx
│   │   ├── EventsList.jsx
│   │   ├── EventForm.jsx
│   │   ├── SoldiersList.jsx
│   │   ├── SchedulingRunsList.jsx
│   │   └── CalendarView.jsx
│   ├── services/        # API service layer
│   │   ├── apiClient.js
│   │   ├── eventService.js
│   │   ├── soldierService.js
│   │   ├── schedulingRunService.js
│   │   └── assignmentService.js
│   ├── config/          # Configuration
│   │   └── api.js
│   ├── App.jsx          # Main app component with routing
│   ├── main.jsx         # Application entry point
│   └── index.css        # Global styles with Tailwind
├── public/              # Static assets
├── index.html           # HTML template
├── package.json         # Dependencies
├── vite.config.js       # Vite configuration
└── tailwind.config.js   # Tailwind CSS configuration
```

## Usage Workflow

1. **Create an Event**
   - Go to Events → Create Event
   - Fill in event details and scheduling parameters
   - Save the event

2. **Add Soldiers**
   - Go to Soldiers
   - Use Bulk Import to add multiple soldiers
   - Provide JSON data with soldier information and constraints

3. **Create Scheduling Run**
   - Go to Scheduling Runs → Create Scheduling Run
   - Select an event
   - Create the run

4. **Execute Algorithm**
   - Click "Execute" on a pending scheduling run
   - Wait for the algorithm to complete

5. **View Results**
   - Click "View Calendar" to see the schedule
   - Navigate through dates to see daily assignments

## API Endpoints

The application connects to the following Django REST API endpoints:

- `GET/POST /api/events/` - List/create events
- `GET/PUT/DELETE /api/events/{id}/` - Get/update/delete event
- `GET/POST /api/soldiers/` - List/create soldiers
- `POST /api/soldiers/bulk_create/` - Bulk create soldiers
- `GET/POST /api/scheduling-runs/` - List/create scheduling runs
- `POST /api/scheduling-runs/{id}/execute_algorithm/` - Execute algorithm
- `GET /api/assignments/` - List assignments
- `GET /api/assignments/calendar/` - Get calendar view

## Technologies

- **React 18** - UI library
- **Vite** - Build tool and dev server
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **Tailwind CSS** - Utility-first CSS framework
- **date-fns** - Date manipulation
- **React Hook Form** - Form handling

## Troubleshooting

### API Connection Issues

If you see "No response from server" errors:
1. Ensure Django backend is running on `http://127.0.0.1:8000`
2. Check CORS settings in Django
3. Verify API base URL in `.env` file

### Build Errors

If you encounter build errors:
1. Delete `node_modules` and reinstall: `rm -rf node_modules && npm install`
2. Clear Vite cache: `rm -rf node_modules/.vite`
3. Ensure Node version matches requirements

## License

MIT
