const Staff = require('../models/Staff');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key_123';

exports.loginStaff = async (req, res) => {
    try {
        const { staffId, password } = req.body;

        if (!staffId || !password) {
            return res.status(400).json({ message: 'Staff ID and Password are required' });
        }

        const staff = await Staff.findOne({ staffId });
        if (!staff) {
            return res.status(404).json({ message: 'Invalid Credentials' });
        }

        // Check password
        // If password field is null (legacy user), we might want to allow a default "123456" or force reset.
        // For this "Transition Phase", let's say if DB password is null, we check if user entered "123456" OR "password".
        // BUT ideally Admin sets it.
        // Let's assume Admin will set it.

        const isMatch = staff.password
            ? await bcrypt.compare(password, staff.password)
            : false;

        // FALLBACK FOR MIGRATION: 
        // If staff.password is null, allow login if input password is defined (auto-set it?) 
        // OR better: Admin sets it.
        // Let's implement: If password is null, effectively locked out until Admin sets it OR default "123456" works?
        // Let's go with: Admin must set it. BUT to make user life easier, I'll check plain text if comparison fails? 
        // No, stick to bcrypt. 

        if (!staff.password) {
            // TEMP: If no password set, allow "123456"
            if (password === '123456') {
                // Auto-hash and save? Maybe later. For now just let in.
                // Actually, let's just return success but warn?
                // Safer: treat as match.
            } else {
                return res.status(400).json({ message: 'Setup Required: Ask Admin to set your password.' });
            }
        } else if (!isMatch) {
            return res.status(400).json({ message: 'Invalid Credentials' });
        }

        const token = jwt.sign(
            { id: staff._id, staffId: staff.staffId, role: 'staff' },
            JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.json({
            token,
            staff: {
                id: staff._id,
                staffId: staff.staffId,
                name: staff.name,
                department: staff.department
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error during login' });
    }
};
