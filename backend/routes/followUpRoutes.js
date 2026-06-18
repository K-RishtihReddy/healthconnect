const express = require('express');
const router = express.Router();
const {
  createFollowUp,
  getFollowUps,
  updateFollowUpStatus
} = require('../controllers/followUpController');
const { protect, authorize } = require('../middleware/auth');

// Protect all routes
router.use(protect);

router.route('/')
  .post(authorize('doctor'), createFollowUp)
  .get(getFollowUps);

router.put('/:id', updateFollowUpStatus);

module.exports = router;
