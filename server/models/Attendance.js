const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
    staffName: {
        type: String,
        required: true
    },
    staffId: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['In', 'Out'],
        default: 'In'
    },
    location: {
        latitude: Number,
        longitude: Number,
        accuracy: Number,
        verified: Boolean
    },
    device: {
        userAgent: String,
        ip: String,
        hash: String
    },
    photo: {
        type: String, // Base64 image
        required: true
    },
    date: {
        type: String, // e.g., "2026-01-26"
        required: true
    },
    time: {
        type: String, // e.g., "09:45:12 AM"
        required: true
    },
    status: {
        type: String, // Present, Late, Half Day
        default: 'Present'
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Attendance', attendanceSchema);
