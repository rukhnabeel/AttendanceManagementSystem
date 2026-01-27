const mongoose = require('mongoose');

const staffSchema = new mongoose.Schema({
    staffId: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    designation: {
        type: String,
        required: true,
        trim: true
    },
    department: {
        type: String,
        trim: true,
        default: 'General'
    },
    email: {
        type: String,
        trim: true
    },
    phone: {
        type: String,
        trim: true
    },
    joiningDate: {
        type: String,
        default: () => new Date().toISOString().split('T')[0]
    },
    shift: {
        type: String,
        enum: ['Morning', 'Evening', 'Night'],
        default: 'Morning'
    },
    gender: {
        type: String,
        enum: ['Male', 'Female', 'Other'],
        default: 'Male'
    },
    address: {
        type: String,
        trim: true
    },
    emergencyContact: {
        type: String,
        trim: true
    },
    bloodGroup: {
        type: String,
        trim: true
    },
    dateOfBirth: {
        type: String
    },
    status: {
        type: String,
        enum: ['Active', 'On Leave', 'Resigned'],
        default: 'Active'
    },
    salary: {
        type: String,
        trim: true
    },
    qrCode: {
        type: String // Base64 of QR code
    },
    password: {
        type: String,
        default: null // Will be set by Admin or default logic
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Staff', staffSchema);
