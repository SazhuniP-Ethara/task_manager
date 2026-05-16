const express = require('express');
const router = express.Router();
const { registerUser, addTeamMember, loginUser, getMe, getUsers, updateUserRole, deleteUser } = require('../controllers/authController');
const { protect, admin } = require('../middleware/authMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', protect, getMe);
router.get('/users', protect, getUsers);
router.post('/users', protect, admin, addTeamMember);
router.put('/users/:id/role', protect, admin, updateUserRole);
router.delete('/users/:id', protect, admin, deleteUser);

module.exports = router;
