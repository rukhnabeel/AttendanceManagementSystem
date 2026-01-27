const express = require('express');
const router = express.Router();
const leaveController = require('../controllers/leaveController');

router.post('/apply', leaveController.applyLeave);
router.get('/', leaveController.getAllLeaves);
router.put('/:id/status', leaveController.updateLeaveStatus);
router.delete('/:id', leaveController.deleteLeave);

module.exports = router;
