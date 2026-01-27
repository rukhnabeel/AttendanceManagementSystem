const Leave = require('../models/Leave');
const Staff = require('../models/Staff');
const notificationService = require('../services/notificationService');

exports.applyLeave = async (req, res) => {
    try {
        const { staffId, leaveType, startDate, endDate, reason } = req.body;

        if (!staffId || !leaveType || !startDate || !endDate || !reason) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        const staff = await Staff.findOne({ staffId });
        if (!staff) {
            return res.status(404).json({ message: 'Staff ID not found' });
        }

        const leaveRequest = new Leave({
            staffId,
            staffName: staff.name,
            leaveType,
            startDate,
            endDate,
            reason
        });

        await leaveRequest.save();

        // Emit socket event for real-time admin notification
        if (req.io) {
            req.io.emit('newLeaveRequest', leaveRequest);
        }

        res.status(201).json({
            message: 'Leave request submitted successfully',
            data: leaveRequest
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getAllLeaves = async (req, res) => {
    try {
        // Aggregate to join with Staff collection and get phone numbers
        const leaves = await Leave.aggregate([
            {
                $lookup: {
                    from: 'staffs', // Ensure matches your collection name (Mongoose usually pluralizes 'Staff' -> 'staffs')
                    localField: 'staffId',
                    foreignField: 'staffId',
                    as: 'staffDetails'
                }
            },
            {
                $unwind: {
                    path: '$staffDetails',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $addFields: {
                    phone: '$staffDetails.phone'
                }
            },
            {
                $project: {
                    staffDetails: 0 // Remove the full staff object to keep response clean
                }
            },
            { $sort: { timestamp: -1 } }
        ]);
        res.json(leaves);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateLeaveStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!['Approved', 'Rejected'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        const leave = await Leave.findByIdAndUpdate(id, { status }, { new: true });
        if (!leave) {
            return res.status(404).json({ message: 'Leave request not found' });
        }

        // Send Notification (WhatsApp/Email)
        const staff = await Staff.findOne({ staffId: leave.staffId });
        if (staff) {
            notificationService.notifyLeaveStatus(leave, staff.email, staff.phone).catch(err => console.error('Notification Error:', err));
        }

        res.json({ message: `Leave ${status} successfully`, data: leave });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.deleteLeave = async (req, res) => {
    try {
        const { id } = req.params;
        await Leave.findByIdAndDelete(id);
        res.json({ message: 'Leave request removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
