# ⚡ TaskFlow - Team Task Manager

A full-stack collaborative task management application where teams can create projects, assign tasks, and track progress. Built with React, Node.js/Express, and MongoDB.

![TaskFlow](https://img.shields.io/badge/TaskFlow-Team%20Task%20Manager-6366f1?style=for-the-badge)

## 🚀 Features

### Authentication
- **Signup** with Name, Email, Password
- **Secure Login** with JWT token-based authentication
- Persistent sessions with auto-verification

### Project Management
- Create projects with custom colors
- Project creator becomes **Admin**
- Admin can **add/remove members** by email
- Members can view their assigned projects

### Task Management
- Create tasks with **Title, Description, Due Date, Priority**
- Assign tasks to project members
- Update status: **To Do → In Progress → Done**
- **Kanban board** and **list view** for tasks
- Priority levels: Low, Medium, High, Urgent

### Dashboard
- Total tasks & projects overview
- Tasks by status (with progress bars)
- Team workload visualization
- Overdue tasks tracking
- Personal task summary

### Role-Based Access Control
| Feature | Admin | Member |
|---------|-------|--------|
| Create/Edit/Delete Tasks | ✅ | ❌ |
| Add/Remove Members | ✅ | ❌ |
| Update Task Status | ✅ | ✅ (own tasks) |
| View Tasks | ✅ (all) | ✅ (assigned) |
| Delete Project | ✅ | ❌ |

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, React Router v7, Vite |
| Backend | Node.js, Express.js |
| Database | MongoDB (Mongoose ODM) |
| Auth | JWT (JSON Web Tokens) |
| Styling | Vanilla CSS (Custom Design System) |
| Deployment | Render |

Demonstration Video - https://www.loom.com/share/e648f6b546dc4f639c0c22dbf5339ae5

Live demo LInk- https://team-task-manager-app-l8ol.onrender.com/

------------------------
## 📁 Project Structure

```
├── client/                  # React frontend
│   ├── src/
│   │   ├── api/axios.js     # Axios instance with interceptors
│   │   ├── context/         # Auth context provider
│   │   ├── components/      # Reusable components
│   │   ├── pages/           # Page components
│   │   ├── App.jsx          # Root component with routing
│   │   ├── main.jsx         # Entry point
│   │   └── index.css        # Design system & styles
│   └── index.html
├── server/                  # Express backend
│   ├── src/
│   │   ├── config/db.js     # MongoDB connection
│   │   ├── middleware/      # Auth & error handling
│   │   ├── models/          # Mongoose schemas
│   │   ├── routes/          # API routes
│   │   └── index.js         # Server entry point
│   └── .env.example
├── render.yaml          # Render deployment config
├── package.json
└── README.md
```

## 🔧 Setup & Installation

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (or local MongoDB)
- npm or yarn

### 1. Clone the repository
```bash
git clone https://github.com/Sahil1320/Team-Task-Manager-app.git
cd team-task-manager
```

### 2. Install dependencies
```bash
# Install root dependencies
npm install

# Install server dependencies
cd server && npm install

# Install client dependencies
cd ../client && npm install
```

### 3. Configure environment variables
Create `server/.env`:
```env
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/taskmanager
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRES_IN=7d
NODE_ENV=development
CLIENT_URL=http://localhost:5173
```

### 4. Run development servers
```bash
# From root directory - runs both servers
npm run dev

# Or individually:
npm run dev:server  # Backend on port 5000
npm run dev:client  # Frontend on port 5173
```

## 🚀 Deployment (Render)

This app is deployed as a **single Web Service** on [Render](https://render.com). The Express server serves the built React frontend in production mode, so no separate frontend hosting is needed.

### Steps:
1. Push code to GitHub
2. Log in to [Render](https://render.com) → **New +** → **Web Service**
3. Connect your GitHub repository
4. Configure the service:
   - **Root Directory:** *(leave blank)*
   - **Runtime:** `Node`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
5. Add environment variables:
   - `MONGODB_URI` — Your MongoDB Atlas connection string
   - `JWT_SECRET` — A strong random secret
   - `JWT_EXPIRES_IN` — Token expiry (e.g., `7d`)
   - `NODE_ENV` — `production`
6. Click **Create Web Service** — Render will build and deploy automatically.

> **Note:** Render's free tier spins down after inactivity. The first request after idle may take ~30 seconds to wake up.

The server automatically serves the built React app from `client/dist` in production mode.

## 📡 API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Register new user |
| POST | `/api/auth/login` | Login user |
| GET | `/api/auth/me` | Get current user |

### Projects
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/projects` | Get user's projects |
| POST | `/api/projects` | Create project |
| GET | `/api/projects/:id` | Get project details |
| PUT | `/api/projects/:id` | Update project (Admin) |
| DELETE | `/api/projects/:id` | Delete project (Admin) |
| POST | `/api/projects/:id/members` | Add member (Admin) |
| DELETE | `/api/projects/:id/members/:userId` | Remove member (Admin) |

### Tasks
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tasks?project=:id` | Get project tasks |
| POST | `/api/tasks` | Create task (Admin) |
| PUT | `/api/tasks/:id` | Update task |
| DELETE | `/api/tasks/:id` | Delete task (Admin) |

### Dashboard
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dashboard` | Get dashboard stats |

## 🎨 Design

- **Dark theme** with indigo accent palette
- **Glassmorphism** effects on cards
- **Kanban board** view for task management
- **Responsive** design for mobile and desktop
- **Micro-animations** for enhanced UX
- Custom **progress bars** and **status badges**

## 📝 License

MIT
