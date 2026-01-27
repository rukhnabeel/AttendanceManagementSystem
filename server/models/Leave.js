const mongoose = require('mongoose');

const leaveSchema = new mongoose.Schema({
    staffId: {
        type: String,
        required: true,
        trim: true
    },
    staffName: {
        type: String,
        required: true,
        trim: true
    },
    leaveType: {
        type: String,
        required: true,
        enum: ['Sick Leave', 'Casual Leave', 'Emergency', 'Other'],
        default: 'Casual Leave'
    },
    startDate: {
        type: String,
        required: true
    },
    endDate: {
        type: String,
        required: true
    },
    reason: {
        type: String,
        required: true,
        trim: true
    },
    status: {
        type: String,
        enum: ['Pending', 'Approved', 'Rejected'],
        default: 'Pending'
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Leave', leaveSchema);
