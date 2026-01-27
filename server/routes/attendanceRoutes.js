const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');

// Existing routes
router.post('/', attendanceController.markAttendance);
router.get('/', attendanceController.getAttendanceLogs);
router.get('/export', attendanceController.exportLogs);

// Compatibility route matching the user's snippet
router.get('/records', attendanceController.getAttendanceLogs);

module.exports = router;
