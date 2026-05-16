const express = require('express');
const router = express.Router();
const {
  getProjects,
  createProject,
  updateProject,
  deleteProject,
  getProjectById,
} = require('../controllers/projectController');
const { getTasksByProject } = require('../controllers/taskController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/').get(protect, getProjects).post(protect, createProject);
router
  .route('/:id')
  .get(protect, getProjectById)
  .put(protect, admin, updateProject)
  .delete(protect, admin, deleteProject);

// Route for getting tasks of a specific project
router.route('/:projectId/tasks').get(protect, getTasksByProject);

module.exports = router;
