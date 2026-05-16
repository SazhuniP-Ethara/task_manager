const Project = require('../models/Project');
const Task = require('../models/Task');

// @desc    Get dashboard statistics
// @route   GET /api/dashboard/stats
// @access  Private
const getDashboardStats = async (req, res) => {
  try {
    let totalProjects = 0;
    let totalTasks = 0;
    let completedTasks = 0;
    let pendingTasks = 0;
    let overdueTasks = 0;

    const now = new Date();

    if (req.user.role === 'Admin') {
      // Admin sees stats for the entire system
      totalProjects = await Project.countDocuments();
      totalTasks = await Task.countDocuments();
      completedTasks = await Task.countDocuments({ status: 'Completed' });
      pendingTasks = await Task.countDocuments({ status: { $ne: 'Completed' } });
      overdueTasks = await Task.countDocuments({ 
        dueDate: { $lt: now }, 
        status: { $ne: 'Completed' } 
      });
    } else {
      // Members only see stats for projects/tasks they are involved in
      totalProjects = await Project.countDocuments({ members: req.user.id });
      totalTasks = await Task.countDocuments({ assignedMember: req.user.id });
      completedTasks = await Task.countDocuments({ assignedMember: req.user.id, status: 'Completed' });
      pendingTasks = await Task.countDocuments({ assignedMember: req.user.id, status: { $ne: 'Completed' } });
      overdueTasks = await Task.countDocuments({ 
        assignedMember: req.user.id,
        dueDate: { $lt: now }, 
        status: { $ne: 'Completed' } 
      });
    }

    res.status(200).json({
      totalProjects,
      totalTasks,
      completedTasks,
      pendingTasks,
      overdueTasks
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getDashboardStats
};
