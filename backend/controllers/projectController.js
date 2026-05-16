const Project = require('../models/Project');

// @desc    Get all projects
// @route   GET /api/projects
// @access  Private
const getProjects = async (req, res) => {
  try {
    let projects;
    
    // If admin, get all projects. If member, get projects they are a part of.
    if (req.user.role === 'Admin') {
      projects = await Project.find().populate('members', 'name email').populate('createdBy', 'name');
    } else {
      projects = await Project.find({ members: req.user.id }).populate('members', 'name email').populate('createdBy', 'name');
    }
    
    res.status(200).json(projects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a project
// @route   POST /api/projects
// @access  Private/Admin
const createProject = async (req, res) => {
  try {
    const { title, description, dueDate, members, status } = req.body;

    if (!title || !description || !dueDate) {
      return res.status(400).json({ message: 'Please add all required fields' });
    }

    const projectMembers = members || [];
    if (!projectMembers.includes(req.user.id)) {
      projectMembers.push(req.user.id);
    }

    const project = await Project.create({
      title,
      description,
      dueDate,
      members: projectMembers,
      status: status || 'Active',
      createdBy: req.user.id,
    });

    const populatedProject = await Project.findById(project._id).populate('members', 'name email').populate('createdBy', 'name');

    res.status(201).json(populatedProject);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update project
// @route   PUT /api/projects/:id
// @access  Private/Admin
const updateProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const updatedProject = await Project.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    ).populate('members', 'name email').populate('createdBy', 'name');

    res.status(200).json(updatedProject);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete project
// @route   DELETE /api/projects/:id
// @access  Private/Admin
const deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    await project.deleteOne();

    res.status(200).json({ id: req.params.id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single project
// @route   GET /api/projects/:id
// @access  Private
const getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id).populate('members', 'name email').populate('createdBy', 'name');

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check if user is admin or a member of the project
    if (req.user.role !== 'Admin' && !project.members.some(member => member._id.toString() === req.user.id)) {
      return res.status(403).json({ message: 'Not authorized to view this project' });
    }

    res.status(200).json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getProjects,
  createProject,
  updateProject,
  deleteProject,
  getProjectById,
};
