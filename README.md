# Practical 6 — Full Stack Integration: React + Node + MongoDB

**ADWF (ITUE301) — TaskFlow Application**

A complete full-stack task management application integrating a React frontend with a Node/Express/MongoDB backend.

## Architecture

```
React Frontend (localhost:5173)
        | fetch/axios calls
        v
Express Backend (localhost:5001)
        | Mongoose
        v
MongoDB Database (taskdb_pr6)
```

## Project Structure

```
PR4/
├── server.js              # Express backend entry point
├── .env                   # Environment variables (PORT, MONGO_URI)
├── src/                   # Backend source code
│   ├── models/Task.js     # Mongoose Task schema
│   ├── routes/taskRoutes.js  # CRUD REST API routes
│   ├── middleware/        # Logger, CORS, error handler, etc.
│   └── utils/             # HATEOAS link generator
├── frontend/              # React frontend (Vite)
│   ├── src/
│   │   ├── api/taskApi.js       # Central API module (BASE_URL)
│   │   ├── components/          # TaskList, TaskCard, TaskForm, Toast, ConfirmDialog
│   │   ├── context/             # ToastContext (notification system)
│   │   ├── App.jsx              # Root component with React Router
│   │   └── index.css            # Global design system
│   └── index.html
├── package.json           # Backend dependencies
└── README.md
```

## Prerequisites

- Node.js v18+
- MongoDB running locally (port 27017)

## How to Run

### 1. Start MongoDB
```bash
mongod
```

### 2. Start the Backend (Terminal 1)
```bash
# From the PR4 directory
npm run dev
# → Express API running on http://localhost:5001
```

### 3. Start the Frontend (Terminal 2)
```bash
# From the PR4/frontend directory
cd frontend
npm run dev
# → React app running on http://localhost:5173
```

### 4. Open in Browser
Navigate to `http://localhost:5173` to use the application.

## Features

### Core CRUD Operations
- **Create** tasks with title, description, status, priority, and due date
- **Read** all tasks with search, status/priority filters, and pagination
- **Update** tasks via edit form with pre-populated data
- **Delete** tasks with confirmation dialog

### Full-Stack Integration
- CORS enabled on Express for cross-origin frontend requests
- Central `taskApi.js` module with single `BASE_URL` constant
- Server-confirmed state updates (UI re-fetches after every write)
- All data persisted in MongoDB — survives browser refresh

### Error & Loading Handling
- Loading skeleton animations during data fetch
- Error state with retry button on failed fetches
- Error handling on all write operations (POST/PUT/DELETE)
- Toast notifications for success/failure on every operation

### Supplementary Features
- ✅ Optimistic UI update for task creation
- ✅ Confirmation dialog before deleting a task
- ✅ Toast notification system (success/error/info)

## API Endpoints

| Method | Endpoint     | Description          |
|--------|-------------|----------------------|
| GET    | /tasks      | Get all tasks (paginated, filterable) |
| GET    | /tasks/:id  | Get single task      |
| POST   | /tasks      | Create a new task    |
| PUT    | /tasks/:id  | Update a task        |
| DELETE | /tasks/:id  | Delete a task        |

## Technologies Used

- **Frontend**: React 18, Vite, React Router DOM
- **Backend**: Node.js, Express.js, Mongoose
- **Database**: MongoDB
- **Middleware**: CORS, custom logger, content-type validator, error handler
