# Team Task Manager

A full-stack Team Task Manager application built with the MERN stack (MongoDB, Express, React, Node.js). It features role-based access control (Admin/Member), project tracking, task assignments, and a dynamic dashboard.

## Features

- **Authentication:** JWT-based login/signup with secure password hashing (bcrypt).
- **Role-Based Access Control:** 
  - Admins can create projects, assign tasks, and manage everything.
  - Members can view assigned tasks, update their status, and view projects they are a part of.
- **Dashboard:** Interactive dashboard displaying total projects, tasks, completed vs pending, and overdue tasks.
- **Project Management:** Full CRUD operations for projects.
- **Task Management:** Full CRUD operations for tasks, including priority levels and status updates.
- **Responsive UI:** Modern, responsive design built with Tailwind CSS v4.

## Tech Stack

- **Frontend:** React (Vite), Tailwind CSS, React Router, Axios, Lucide React (Icons).
- **Backend:** Node.js, Express.js, MongoDB (Mongoose), JWT.

## Installation Steps

### Prerequisites
- Node.js installed
- MongoDB installed locally or a MongoDB Atlas URI

### 1. Clone the repository
\`\`\`bash
git clone <repository-url>
cd task_manager
\`\`\`

### 2. Backend Setup
\`\`\`bash
cd backend
npm install
\`\`\`
Create a `.env` file in the `backend` directory (see `backend/.env.example` for reference).
\`\`\`env
PORT=5000
MONGO_URI=mongodb://localhost:27017/taskmanager
JWT_SECRET=supersecretjwtkey12345
CLIENT_URL=http://localhost:5173
NODE_ENV=development
\`\`\`
Start the backend server:
\`\`\`bash
npm run dev
\`\`\`

### 3. Frontend Setup
\`\`\`bash
cd frontend
npm install
\`\`\`
Start the frontend development server:
\`\`\`bash
npm run dev
\`\`\`

## Deployment Link
- [Railway App Link] - Replace with your live Railway URL.

## Demo Credentials
- **Admin User:** admin@example.com / password123 (Create this user via signup and assign Admin role).
- **Member User:** member@example.com / password123.

## API Endpoints

### Auth
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Authenticate a user

### Projects
- `GET /api/projects` - Get all projects (based on role)
- `POST /api/projects` - Create a project (Admin)
- `PUT /api/projects/:id` - Update a project (Admin)
- `DELETE /api/projects/:id` - Delete a project (Admin)

### Tasks
- `GET /api/tasks` - Get all tasks (based on role)
- `POST /api/tasks` - Create a task (Admin)
- `PUT /api/tasks/:id` - Update a task (Member can only update status)
- `DELETE /api/tasks/:id` - Delete a task (Admin)
