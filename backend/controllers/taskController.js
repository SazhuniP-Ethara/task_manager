const Task = require('../models/Task');
const Project = require('../models/Project');

// @desc    Get tasks
// @route   GET /api/tasks
// @access  Private
const getTasks = async (req, res) => {
  try {
    let tasks;
    
    if (req.user.role === 'Admin') {
      tasks = await Task.find().populate('assignedMember', 'name email').populate('project', 'title');
    } else {
      tasks = await Task.find({ assignedMember: req.user.id }).populate('assignedMember', 'name email').populate('project', 'title');
    }
    
    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get tasks for a specific project
// @route   GET /api/projects/:projectId/tasks
// @access  Private
const getTasksByProject = async (req, res) => {
  try {
    const tasks = await Task.find({ project: req.params.projectId }).populate('assignedMember', 'name email').populate('project', 'title');
    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a task
// @route   POST /api/tasks
// @access  Private/Admin
const createTask = async (req, res) => {
  try {
    const { title, description, priority, status, dueDate, assignedMember, project } = req.body;

    if (!title || !description || !dueDate || !project) {
      return res.status(400).json({ message: 'Please add all required fields' });
    }

    // Check if project exists
    const projectExists = await Project.findById(project);
    if (!projectExists) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const task = await Task.create({
      title,
      description,
      priority: priority || 'Medium',
      status: status || 'Pending',
      dueDate,
      assignedMember: assignedMember || null,
      project,
      createdBy: req.user.id,
    });

    const populatedTask = await Task.findById(task._id).populate('assignedMember', 'name email').populate('project', 'title');

    res.status(201).json(populatedTask);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update task
// @route   PUT /api/tasks/:id
// @access  Private
const updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Admins can update anything. Members can only update status of their assigned tasks.
    if (req.user.role !== 'Admin') {
      if (task.assignedMember && task.assignedMember.toString() !== req.user.id) {
         return res.status(403).json({ message: 'Not authorized to update this task' });
      }

      // If user is a member, they should only be able to update 'status'
      // We'll enforce this by only updating status if role is Member
      task.status = req.body.status || task.status;
      await task.save();
      
      const updatedTask = await Task.findById(req.params.id).populate('assignedMember', 'name email').populate('project', 'title');
      return res.status(200).json(updatedTask);
    }

    // If Admin, update everything provided
    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    ).populate('assignedMember', 'name email').populate('project', 'title');

    res.status(200).json(updatedTask);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Private/Admin
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    await task.deleteOne();

    res.status(200).json({ id: req.params.id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getTasks,
  getTasksByProject,
  createTask,
  updateTask,
  deleteTask,
};
