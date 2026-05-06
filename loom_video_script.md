# 🎬 Loom Video Script — Team Task Manager Demo (3–5 mins)

---

## ✅ BEFORE YOU RECORD — SETUP CHECKLIST
- Open the live Render URL in your browser (already logged out)
- Have 2 accounts ready: one as **Admin/Manager**, one as **Member**
- Have the Render dashboard open in a separate tab (to show server is live)
- Use a clean browser window (no extensions visible)

---

## 🎙️ SCRIPT

---

### [0:00 – 0:20] — INTRO

> *"Hey everyone! In this video, I'm going to walk you through my Team Task Manager web application — a full-stack MERN app that I built and deployed on Render.*
>
> *It lets teams create projects, assign tasks, track progress, and collaborate — all in real time. Let me show you how it works."*

---

### [0:20 – 0:50] — SHOW THE LIVE APP & ARCHITECTURE

> *"So here's the live application, deployed on Render. The backend is a Node.js Express REST API, the frontend is built with React and Vite, and the database is MongoDB Atlas. Everything runs as a single service on Render."*

👉 **Show:** The landing/login page of the app on the Render URL.

> *"Let me start by creating a new account."*

---

### [0:50 – 1:20] — REGISTER & LOGIN

> *"I'll click on Sign Up, enter my name, email, and password, and register."*

👉 **Action:** Fill the Register form and submit.

> *"Great, I'm now logged in and landed on the Dashboard. You can see it gives me a quick overview — total projects, tasks assigned to me, tasks completed, and tasks that are pending. Everything is clean and easy to read."*

👉 **Show:** The dashboard stats/overview page briefly.

---

### [1:20 – 2:00] — CREATE A PROJECT & ADD MEMBERS

> *"Now let me create a new project. I'll click on 'New Project' and give it a name — let's say 'Website Redesign' — add a description, and set a deadline."*

👉 **Action:** Click New Project → fill in name, description, deadline → Submit.

> *"The project is created and I'm now the admin/owner of this project. Now, a real team needs members, so let me add a teammate."*

👉 **Action:** Go to the Project → Members section → Add Member by email.

> *"I'll type in my teammate's email and add them as a member. They now have access to this project and can be assigned tasks."*

---

### [2:00 – 2:45] — CREATE & ASSIGN TASKS

> *"Now the core feature — Tasks. I'll go into the project and click 'Add Task'."*

👉 **Action:** Click Add Task.

> *"I'll give it a title — 'Design Homepage Mockup', add a description, set a priority — let's say High, set a due date, and assign it to my teammate."*

👉 **Action:** Fill in task form → Assign to member → Submit.

> *"The task is now created and assigned. My teammate will see this task on their dashboard when they log in. Let me add one more task and assign it to myself."*

👉 **Action:** Create another task → Assign to yourself → Submit.

> *"You can see both tasks are now listed under this project — who they're assigned to, their priority, and their due date. Everything is organized."*

---

### [2:45 – 3:20] — UPDATE TASK STATUS (COMPLETE A TASK)

> *"Now let me show the task workflow. Tasks start as 'To Do', then move to 'In Progress', and finally 'Completed'. I'll update the status of this task."*

👉 **Action:** Click on a task → Change status from "To Do" to "In Progress".

> *"And now when the work is done, I'll mark it as Completed."*

👉 **Action:** Change status to "Completed".

> *"Notice the dashboard stats update automatically — the completed count went up. This gives the whole team a live picture of project progress."*

👉 **Show:** Dashboard briefly to show updated numbers.

---

### [3:20 – 3:50] — REMOVE A MEMBER / DELETE A TASK

> *"As the project admin, I also have control over the team. If I need to remove a member from the project, I can go to the Members section and remove them with one click."*

👉 **Action:** Go to Members → click Remove next to a member.

> *"And if a task is no longer needed, I can delete it from the task view."*

👉 **Action:** Open a task → click Delete → confirm.

---

### [3:50 – 4:20] — SHOW AS A DIFFERENT USER (OPTIONAL)

> *"Now quickly, let me show you what a member sees. I'll log in with my second account."*

👉 **Action:** Logout → Login with the second account (member).

> *"As a member, I can see the project I was added to, and the task that was assigned to me. I can update the status, but I don't have admin controls like deleting the project or managing members. Role-based access is enforced throughout the app."*

---

### [4:20 – 4:50] — SHOW THE BACKEND / API

> *"Let me also quickly show you the backend. The server is running as a Node.js Express API on Render. If I hit the health check endpoint..."*

👉 **Action:** Open a new tab → go to `https://your-render-url.onrender.com/api/health`

> *"...you can see the server responds with status OK and a timestamp. All the API routes — for auth, projects, tasks, and the dashboard — are secured with JWT authentication. If you try to access them without a token, you get a 401 Unauthorized response."*

---

### [4:50 – 5:00] — OUTRO

> *"And that's the Team Task Manager — a fully functional, deployed full-stack application built with MongoDB, Express, React, and Node.js.*
>
> *It covers user authentication, role-based access, project and task management, and team collaboration — all deployed live on Render.*
>
> *Thanks for watching!"*

---

## ⏱️ TIMING SUMMARY

| Section | Time |
|---|---|
| Intro + Architecture | 0:00 – 0:50 |
| Register & Login | 0:50 – 1:20 |
| Create Project & Add Members | 1:20 – 2:00 |
| Create & Assign Tasks | 2:00 – 2:45 |
| Update / Complete Task | 2:45 – 3:20 |
| Remove Member / Delete Task | 3:20 – 3:50 |
| Show as Different User | 3:50 – 4:20 |
| Show Backend API | 4:20 – 4:50 |
| Outro | 4:50 – 5:00 |

---

> **💡 Tip:** Speak slowly and clearly. Don't rush the clicks — let the viewer see what's happening on screen before you move to the next action.
