const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  deleteUser,
  getPendingDoctors,
  verifyDoctor,
  getSystemAnalytics,
  addCategory,
  getCategories,
  deleteCategory
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

// Public routes
router.get('/categories', getCategories);

// Protected routes (Admin only)
router.use(protect, authorize('admin'));

router.route('/users')
  .get(getAllUsers);

router.route('/users/:id')
  .delete(deleteUser);

router.get('/doctors/pending', getPendingDoctors);
router.put('/doctors/:id/verify', verifyDoctor);
router.get('/analytics', getSystemAnalytics);

router.route('/categories')
  .post(addCategory);

router.route('/categories/:id')
  .delete(deleteCategory);

module.exports = router;
