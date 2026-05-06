const express = require('express');
const Task = require('../models/Task');
const Project = require('../models/Project');
const auth = require('../middleware/auth');

const router = express.Router();

router.use(auth);

// @route   GET /api/dashboard
// @desc    Get dashboard statistics for the current user
// @access  Private
router.get('/', async (req, res, next) => {
  try {
    // Get all projects where user is a member
    const projects = await Project.find({
      'members.user': req.user._id,
    }).populate('members.user', 'name email avatar');

    const projectIds = projects.map((p) => p._id);

    // Get all tasks across user's projects
    const allTasks = await Task.find({ project: { $in: projectIds } })
      .populate('assignee', 'name email avatar')
      .populate('project', 'name color');

    // Total tasks
    const totalTasks = allTasks.length;

    // Tasks by status
    const tasksByStatus = {
      'To Do': 0,
      'In Progress': 0,
      Done: 0,
    };
    allTasks.forEach((task) => {
      tasksByStatus[task.status]++;
    });

    // Tasks per user (across all projects)
    const tasksPerUser = {};
    allTasks.forEach((task) => {
      if (task.assignee) {
        const key = task.assignee._id.toString();
        if (!tasksPerUser[key]) {
          tasksPerUser[key] = {
            user: {
              _id: task.assignee._id,
              name: task.assignee.name,
              email: task.assignee.email,
              avatar: task.assignee.avatar,
            },
            total: 0,
            completed: 0,
            inProgress: 0,
            todo: 0,
          };
        }
        tasksPerUser[key].total++;
        if (task.status === 'Done') tasksPerUser[key].completed++;
        if (task.status === 'In Progress') tasksPerUser[key].inProgress++;
        if (task.status === 'To Do') tasksPerUser[key].todo++;
      }
    });

    // Overdue tasks
    const now = new Date();
    const overdueTasks = allTasks.filter(
      (task) =>
        task.dueDate &&
        new Date(task.dueDate) < now &&
        task.status !== 'Done'
    );

    // Tasks by priority
    const tasksByPriority = {
      Low: 0,
      Medium: 0,
      High: 0,
      Urgent: 0,
    };
    allTasks.forEach((task) => {
      tasksByPriority[task.priority]++;
    });

    // Recent tasks (last 5)
    const recentTasks = allTasks
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5);

    // My tasks
    const myTasks = allTasks.filter(
      (task) =>
        task.assignee &&
        task.assignee._id.toString() === req.user._id.toString()
    );

    const myTasksByStatus = {
      'To Do': 0,
      'In Progress': 0,
      Done: 0,
    };
    myTasks.forEach((task) => {
      myTasksByStatus[task.status]++;
    });

    res.json({
      success: true,
      data: {
        totalProjects: projects.length,
        totalTasks,
        tasksByStatus,
        tasksByPriority,
        tasksPerUser: Object.values(tasksPerUser),
        overdueTasks: overdueTasks.length,
        overdueTasksList: overdueTasks.slice(0, 10),
        recentTasks,
        myTasks: {
          total: myTasks.length,
          byStatus: myTasksByStatus,
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
