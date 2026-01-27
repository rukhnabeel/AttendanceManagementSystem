const Staff = require('../models/Staff');
const QRCode = require('qrcode');
const os = require('os');

// Helper to get local network IP
const getNetworkIp = () => {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
            // Skip internal and non-IPv4 addresses
            if (iface.family === 'IPv4' && !iface.internal) {
                return iface.address;
            }
        }
    }
    return 'localhost';
};

exports.addStaff = async (req, res) => {
    try {
        const {
            staffId, name, designation, department, email,
            phone, joiningDate, shift, gender, address,
            emergencyContact, bloodGroup, dateOfBirth, status, salary
        } = req.body;

        const isProduction = process.env.NODE_ENV === 'production';
        const clientUrl = isProduction
            ? 'https://attendance.tripvenzaholidays.com'
            : `http://${process.env.CLIENT_HOST || getNetworkIp()}:5173`;

        const qrData = `${clientUrl}/?staffId=${encodeURIComponent(staffId)}&name=${encodeURIComponent(name)}`;
        const qrCodeUrl = await QRCode.toDataURL(qrData);

        // SYSTEMATIC FIX: Check for required fields explicitly
        if (!staffId || !name || !designation) {
            return res.status(400).json({ message: 'Missing required fields: Staff ID, Name, and Designation are mandatory.' });
        }

        let staff = await Staff.findOneAndUpdate(
            { staffId },
            {
                staffId, name, designation, department, email,
                phone, joiningDate, shift, gender, address,
                emergencyContact, bloodGroup, dateOfBirth, status, salary,
                qrCode: qrCodeUrl
            },
            {
                new: true,
                upsert: true,
                runValidators: true,
                setDefaultsOnInsert: true,
                context: 'query'
            }
        );

        res.status(staff.isNew ? 201 : 200).json(staff);
    } catch (error) {
        console.error('Error adding/updating staff:', error);
        res.status(500).json({ message: error.message || 'Failed to process personnel record' });
    }
};

exports.updateStaff = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        // 1. Check if the updated staffId is already taken by ANOTHER staff member
        if (updates.staffId) {
            const existingWithId = await Staff.findOne({ staffId: updates.staffId, _id: { $ne: id } });
            if (existingWithId) {
                return res.status(400).json({ message: 'This Staff ID is already assigned to someone else' });
            }
        }

        // 2. If updating Name or ID, or explicit regenerate flag, we must regenerate the QR
        if (updates.name || updates.staffId || updates.regenerateQR) {

            // Fetch existing if only partial update
            let currentStaff = {};
            if (!updates.name || !updates.staffId) {
                currentStaff = await Staff.findById(id);
            }

            const nameToUse = updates.name || currentStaff.name;
            const idToUse = updates.staffId || currentStaff.staffId;

            if (nameToUse && idToUse) {
                const isProduction = process.env.NODE_ENV === 'production';
                const clientUrl = isProduction
                    ? 'https://attendance.tripvenzaholidays.com'
                    : `http://${process.env.CLIENT_HOST || getNetworkIp()}:5173`;

                const qrData = `${clientUrl}/?staffId=${encodeURIComponent(idToUse)}&name=${encodeURIComponent(nameToUse)}`;
                updates.qrCode = await QRCode.toDataURL(qrData);
            }
        }

        const staff = await Staff.findByIdAndUpdate(id, updates, { new: true });
        if (!staff) return res.status(404).json({ message: 'Staff not found' });

        res.json(staff);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getAllStaff = async (req, res) => {
    try {
        const staff = await Staff.find().sort({ createdAt: -1 });
        res.json(staff);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getStaffById = async (req, res) => {
    try {
        const staff = await Staff.findOne({ staffId: req.params.staffId });
        if (!staff) {
            return res.status(404).json({ message: 'Staff not found' });
        }
        res.json(staff);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.deleteStaff = async (req, res) => {
    try {
        const staff = await Staff.findByIdAndDelete(req.params.id);
        if (!staff) return res.status(404).json({ message: 'Staff not found' });
        res.json({ message: 'Staff removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getSystemQR = async (req, res) => {
    try {
        const isProduction = process.env.NODE_ENV === 'production';
        const clientUrl = isProduction
            ? 'https://attendance.tripvenzaholidays.com'
            : `http://${process.env.CLIENT_HOST || getNetworkIp()}:5173`;

        const qrData = `${clientUrl}/`;

        const qrCodeUrl = await QRCode.toDataURL(qrData);

        res.json({
            qrCode: qrCodeUrl,
            url: qrData
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
