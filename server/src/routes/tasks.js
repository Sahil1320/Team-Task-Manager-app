const express = require('express');
const { body, validationResult } = require('express-validator');
const Task = require('../models/Task');
const Project = require('../models/Project');
const auth = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(auth);

// Helper: Check if user is a member of the project
const checkProjectMembership = async (projectId, userId) => {
  const project = await Project.findById(projectId);
  if (!project) return { error: 'Project not found', status: 404 };

  const member = project.members.find(
    (m) => m.user.toString() === userId.toString()
  );

  if (!member) return { error: 'Access denied', status: 403 };

  return { project, member };
};

// @route   POST /api/tasks
// @desc    Create a new task
// @access  Private (Admin only)
router.post(
  '/',
  [
    body('title')
      .trim()
      .isLength({ min: 2, max: 200 })
      .withMessage('Title must be between 2 and 200 characters'),
    body('project').isMongoId().withMessage('Valid project ID is required'),
    body('priority')
      .optional()
      .isIn(['Low', 'Medium', 'High', 'Urgent'])
      .withMessage('Invalid priority'),
    body('status')
      .optional()
      .isIn(['To Do', 'In Progress', 'Done'])
      .withMessage('Invalid status'),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: errors.array()[0].msg,
        });
      }

      const { title, description, project, assignee, priority, dueDate, status } =
        req.body;

      // Check membership and role
      const check = await checkProjectMembership(project, req.user._id);
      if (check.error) {
        return res.status(check.status).json({
          success: false,
          message: check.error,
        });
      }

      // Only admins can create tasks
      if (check.member.role !== 'Admin') {
        return res.status(403).json({
          success: false,
          message: 'Only admins can create tasks',
        });
      }

      // If assigning, check that assignee is a member
      if (assignee) {
        const isAssigneeMember = check.project.members.some(
          (m) => m.user.toString() === assignee
        );
        if (!isAssigneeMember) {
          return res.status(400).json({
            success: false,
            message: 'Assignee must be a member of the project',
          });
        }
      }

      const task = await Task.create({
        title,
        description: description || '',
        project,
        assignee: assignee || null,
        priority: priority || 'Medium',
        status: status || 'To Do',
        dueDate: dueDate || null,
        createdBy: req.user._id,
      });

      await task.populate('assignee', 'name email avatar');
      await task.populate('createdBy', 'name email avatar');

      res.status(201).json({
        success: true,
        data: { task },
      });
    } catch (error) {
      next(error);
    }
  }
);

// @route   GET /api/tasks?project=:projectId
// @desc    Get tasks for a project
// @access  Private (members only)
router.get('/', async (req, res, next) => {
  try {
    const { project, status, priority, assignee } = req.query;

    if (!project) {
      return res.status(400).json({
        success: false,
        message: 'Project ID is required',
      });
    }

    // Check membership
    const check = await checkProjectMembership(project, req.user._id);
    if (check.error) {
      return res.status(check.status).json({
        success: false,
        message: check.error,
      });
    }

    // Build filter
    const filter = { project };
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (assignee) filter.assignee = assignee;

    // Members can only see their own tasks
    if (check.member.role === 'Member') {
      filter.assignee = req.user._id;
    }

    const tasks = await Task.find(filter)
      .populate('assignee', 'name email avatar')
      .populate('createdBy', 'name email avatar')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: { tasks },
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/tasks/:id
// @desc    Get a single task
// @access  Private (members only)
router.get('/:id', async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('assignee', 'name email avatar')
      .populate('createdBy', 'name email avatar');

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    // Check membership
    const check = await checkProjectMembership(task.project, req.user._id);
    if (check.error) {
      return res.status(check.status).json({
        success: false,
        message: check.error,
      });
    }

    res.json({
      success: true,
      data: { task },
    });
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/tasks/:id
// @desc    Update a task
// @access  Private (Admin: full update, Member: status only)
router.put('/:id', async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    // Check membership
    const check = await checkProjectMembership(task.project, req.user._id);
    if (check.error) {
      return res.status(check.status).json({
        success: false,
        message: check.error,
      });
    }

    const { title, description, status, priority, dueDate, assignee } =
      req.body;

    if (check.member.role === 'Admin') {
      // Admin can update everything
      if (title) task.title = title;
      if (description !== undefined) task.description = description;
      if (status) task.status = status;
      if (priority) task.priority = priority;
      if (dueDate !== undefined) task.dueDate = dueDate;
      if (assignee !== undefined) {
        // Validate assignee is a project member
        if (assignee) {
          const isAssigneeMember = check.project.members.some(
            (m) => m.user.toString() === assignee
          );
          if (!isAssigneeMember) {
            return res.status(400).json({
              success: false,
              message: 'Assignee must be a member of the project',
            });
          }
        }
        task.assignee = assignee || null;
      }
    } else {
      // Members can only update status of their assigned tasks
      if (
        !task.assignee ||
        task.assignee.toString() !== req.user._id.toString()
      ) {
        return res.status(403).json({
          success: false,
          message: 'You can only update tasks assigned to you',
        });
      }

      if (status) {
        task.status = status;
      } else {
        return res.status(403).json({
          success: false,
          message: 'Members can only update task status',
        });
      }
    }

    await task.save();
    await task.populate('assignee', 'name email avatar');
    await task.populate('createdBy', 'name email avatar');

    res.json({
      success: true,
      data: { task },
    });
  } catch (error) {
    next(error);
  }
});

// @route   DELETE /api/tasks/:id
// @desc    Delete a task
// @access  Private (Admin only)
router.delete('/:id', async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    // Check membership and role
    const check = await checkProjectMembership(task.project, req.user._id);
    if (check.error) {
      return res.status(check.status).json({
        success: false,
        message: check.error,
      });
    }

    if (check.member.role !== 'Admin') {
      return res.status(403).json({
        success: false,
        message: 'Only admins can delete tasks',
      });
    }

    await Task.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Task deleted',
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
