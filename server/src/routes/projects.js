const express = require('express');
const { body, validationResult } = require('express-validator');
const Project = require('../models/Project');
const Task = require('../models/Task');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(auth);

// @route   POST /api/projects
// @desc    Create a new project
// @access  Private
router.post(
  '/',
  [
    body('name')
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('Project name must be between 2 and 100 characters'),
    body('description')
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage('Description cannot exceed 500 characters'),
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

      const { name, description, color } = req.body;

      const project = await Project.create({
        name,
        description: description || '',
        color: color || '#6366f1',
        owner: req.user._id,
        members: [{ user: req.user._id, role: 'Admin' }],
      });

      await project.populate('members.user', 'name email avatar');

      res.status(201).json({
        success: true,
        data: { project },
      });
    } catch (error) {
      next(error);
    }
  }
);

// @route   GET /api/projects
// @desc    Get all projects for the current user
// @access  Private
router.get('/', async (req, res, next) => {
  try {
    const projects = await Project.find({
      'members.user': req.user._id,
    })
      .populate('members.user', 'name email avatar')
      .populate('taskCount')
      .sort({ updatedAt: -1 });

    // Add task stats for each project
    const projectsWithStats = await Promise.all(
      projects.map(async (project) => {
        const taskStats = await Task.aggregate([
          { $match: { project: project._id } },
          {
            $group: {
              _id: '$status',
              count: { $sum: 1 },
            },
          },
        ]);

        const stats = {
          total: 0,
          'To Do': 0,
          'In Progress': 0,
          Done: 0,
        };

        taskStats.forEach((stat) => {
          stats[stat._id] = stat.count;
          stats.total += stat.count;
        });

        return {
          ...project.toObject(),
          taskStats: stats,
        };
      })
    );

    res.json({
      success: true,
      data: { projects: projectsWithStats },
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/projects/:id
// @desc    Get a single project
// @access  Private (members only)
router.get('/:id', async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('members.user', 'name email avatar');

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    // Check if user is a member
    const isMember = project.members.some(
      (m) => m.user._id.toString() === req.user._id.toString()
    );

    if (!isMember) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You are not a member of this project.',
      });
    }

    // Get task stats
    const taskStats = await Task.aggregate([
      { $match: { project: project._id } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    const stats = {
      total: 0,
      'To Do': 0,
      'In Progress': 0,
      Done: 0,
    };

    taskStats.forEach((stat) => {
      stats[stat._id] = stat.count;
      stats.total += stat.count;
    });

    res.json({
      success: true,
      data: {
        project: {
          ...project.toObject(),
          taskStats: stats,
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/projects/:id
// @desc    Update a project
// @access  Private (Admin only)
router.put('/:id', async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    // Check if user is admin
    const member = project.members.find(
      (m) => m.user.toString() === req.user._id.toString()
    );

    if (!member || member.role !== 'Admin') {
      return res.status(403).json({
        success: false,
        message: 'Only admins can update the project',
      });
    }

    const { name, description, color } = req.body;
    if (name) project.name = name;
    if (description !== undefined) project.description = description;
    if (color) project.color = color;

    await project.save();
    await project.populate('members.user', 'name email avatar');

    res.json({
      success: true,
      data: { project },
    });
  } catch (error) {
    next(error);
  }
});

// @route   DELETE /api/projects/:id
// @desc    Delete a project
// @access  Private (Admin only)
router.delete('/:id', async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    // Check if user is admin
    const member = project.members.find(
      (m) => m.user.toString() === req.user._id.toString()
    );

    if (!member || member.role !== 'Admin') {
      return res.status(403).json({
        success: false,
        message: 'Only admins can delete the project',
      });
    }

    // Delete all tasks associated with this project
    await Task.deleteMany({ project: project._id });

    await Project.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Project and all associated tasks deleted',
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/projects/:id/members
// @desc    Add a member to a project
// @access  Private (Admin only)
router.post('/:id/members', async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    // Check if user is admin
    const currentMember = project.members.find(
      (m) => m.user.toString() === req.user._id.toString()
    );

    if (!currentMember || currentMember.role !== 'Admin') {
      return res.status(403).json({
        success: false,
        message: 'Only admins can add members',
      });
    }

    const { email, role } = req.body;

    // Find user by email
    const userToAdd = await User.findOne({ email });
    if (!userToAdd) {
      return res.status(404).json({
        success: false,
        message: 'No user found with that email',
      });
    }

    // Check if already a member
    const isAlreadyMember = project.members.some(
      (m) => m.user.toString() === userToAdd._id.toString()
    );

    if (isAlreadyMember) {
      return res.status(400).json({
        success: false,
        message: 'User is already a member of this project',
      });
    }

    project.members.push({
      user: userToAdd._id,
      role: role || 'Member',
    });

    await project.save();
    await project.populate('members.user', 'name email avatar');

    res.json({
      success: true,
      data: { project },
      message: `${userToAdd.name} added to the project`,
    });
  } catch (error) {
    next(error);
  }
});

// @route   DELETE /api/projects/:id/members/:userId
// @desc    Remove a member from a project
// @access  Private (Admin only)
router.delete('/:id/members/:userId', async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    // Check if user is admin
    const currentMember = project.members.find(
      (m) => m.user.toString() === req.user._id.toString()
    );

    if (!currentMember || currentMember.role !== 'Admin') {
      return res.status(403).json({
        success: false,
        message: 'Only admins can remove members',
      });
    }

    // Can't remove yourself if you're the only admin
    if (req.params.userId === req.user._id.toString()) {
      const adminCount = project.members.filter(
        (m) => m.role === 'Admin'
      ).length;
      if (adminCount <= 1) {
        return res.status(400).json({
          success: false,
          message: 'Cannot remove the only admin. Assign another admin first.',
        });
      }
    }

    project.members = project.members.filter(
      (m) => m.user.toString() !== req.params.userId
    );

    // Unassign tasks assigned to the removed member
    await Task.updateMany(
      { project: project._id, assignee: req.params.userId },
      { assignee: null }
    );

    await project.save();
    await project.populate('members.user', 'name email avatar');

    res.json({
      success: true,
      data: { project },
      message: 'Member removed from the project',
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
