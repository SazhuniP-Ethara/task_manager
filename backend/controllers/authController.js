const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Project = require('../models/Project');
const Task = require('../models/Task');

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please add all fields' });
    }

    // Check if user exists
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role: role || 'Member',
    });

    if (user) {
      // Auto-assign to existing projects and create dummy tasks
      try {
        const projects = await Project.find().limit(2);
        if (projects.length > 0) {
          for (const project of projects) {
            // Add user to project members
            if (!project.members.includes(user._id)) {
              project.members.push(user._id);
              await project.save();
            }

            // Create a dummy task for the new user in this project
            await Task.create({
              title: `Welcome Task in ${project.title}`,
              description: `Hello ${user.name}! This is a dummy task assigned to you to help you get started with the project.`,
              priority: 'Medium',
              status: 'Pending',
              dueDate: new Date(new Date().setDate(new Date().getDate() + 7)),
              project: project._id,
              assignedMember: user._id,
              createdBy: user._id // Self-created welcome task or we could use an admin ID
            });
          }
        }
      } catch (err) {
        console.error('Error seeding data for new user:', err);
      }

      res.status(201).json({
        _id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add a new team member (Admin only, does NOT log in the new user)
// @route   POST /api/auth/users
// @access  Private/Admin
const addTeamMember = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please add name, email and password' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'A user with this email already exists' });
    }

    const user = await User.create({
      name,
      email,
      password,
      role: role || 'Member',
    });

    if (user) {
      // Auto-assign to existing projects and create dummy tasks
      try {
        const projects = await Project.find().limit(2);
        if (projects.length > 0) {
          for (const project of projects) {
            // Add user to project members
            if (!project.members.includes(user._id)) {
              project.members.push(user._id);
              await project.save();
            }

            // Create a dummy task for the new user
            await Task.create({
              title: `Onboarding Task: ${project.title}`,
              description: `Assigned task for the new team member ${user.name}.`,
              priority: 'Low',
              status: 'Pending',
              dueDate: new Date(new Date().setDate(new Date().getDate() + 3)),
              project: project._id,
              assignedMember: user._id,
              createdBy: req.user._id // Created by the admin who added the member
            });
          }
        }
      } catch (err) {
        console.error('Error seeding data for added member:', err);
      }

      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Authenticate a user
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check for user email
    const user = await User.findOne({ email }).select('+password');

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user data
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    res.status(200).json(req.user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all users (for assigning tasks/projects)
// @route   GET /api/auth/users
// @access  Private
const getUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// @desc    Update user role (Admin only)
// @route   PUT /api/auth/users/:id/role
// @access  Private/Admin
const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;

    if (!role || !['Admin', 'Member'].includes(role)) {
      return res.status(400).json({ message: 'Role must be Admin or Member' });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.role = role;
    await user.save();

    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a user (Admin only)
// @route   DELETE /api/auth/users/:id
// @access  Private/Admin
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent admin from deleting themselves
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot delete your own account' });
    }

    await User.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'User removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  registerUser,
  addTeamMember,
  loginUser,
  getMe,
  getUsers,
  updateUserRole,
  deleteUser,
};
