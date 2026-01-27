const express = require('express');
const router = express.Router();
const staffController = require('../controllers/staffController');

router.post('/', staffController.addStaff);
router.get('/', staffController.getAllStaff);
router.get('/system-qr', staffController.getSystemQR);
router.get('/:staffId', staffController.getStaffById);
router.put('/:id', staffController.updateStaff);
router.delete('/:id', staffController.deleteStaff);

module.exports = router;
