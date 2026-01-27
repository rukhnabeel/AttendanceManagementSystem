const Attendance = require('../models/Attendance');
const Staff = require('../models/Staff');
const { Parser } = require('json2csv');
const geolib = require('geolib');
const notificationService = require('../services/notificationService');

exports.markAttendance = async (req, res) => {
    try {
        const { staffId, name, photo, location, device, type: manualType } = req.body;

        if (!staffId || !name || !photo) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const now = new Date();
        const dateStr = now.toISOString().split('T')[0];
        const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });

        // 1. Determine Punch Type (In vs Out)
        // If manual type is provided (from UI toggle), use it. Otherwise, auto-toggle.
        let type = 'In';

        if (manualType && ['In', 'Out'].includes(manualType)) {
            type = manualType;
        } else {
            const lastEntry = await Attendance.findOne({
                staffId,
                date: dateStr
            }).sort({ timestamp: -1 });

            if (lastEntry && lastEntry.type === 'In') {
                type = 'Out';
            }
        }

        // 2. Logic for Late/Present (Only applies to Punch In)
        let status = 'Present';
        if (type === 'In') {
            const hour = now.getHours();
            const minute = now.getMinutes();
            // OFFICE TIME: 10:00 AM TO 19:00 PM
            // Late rule: After 10:00 AM
            if (hour > 10 || (hour === 10 && minute > 0)) {
                status = 'Late';
            }
        } else {
            status = 'Checked Out';
        }

        // 3. Optional: Geo-fencing Validation
        // If OFFICE_LAT/LONG are set in env, check distance
        let gpsVerified = false;
        if (process.env.OFFICE_LAT && process.env.OFFICE_LONG && location && location.latitude) {
            const distance = geolib.getDistance(
                { latitude: location.latitude, longitude: location.longitude },
                { latitude: process.env.OFFICE_LAT, longitude: process.env.OFFICE_LONG }
            );
            // Allow 200 meter radius
            if (distance <= 200) {
                gpsVerified = true;
            } else {
                console.warn(`User ${name} is ${distance}m away from office.`);
                // We can choose to block or just flag it. For now, we flag.
            }
        }

        const attendance = new Attendance({
            staffName: name,
            staffId: staffId,
            photo,
            date: dateStr,
            time: timeStr,
            status: status,
            timestamp: now,
            type: type,
            location: {
                ...location,
                verified: gpsVerified
            },
            device: device
        });

        await attendance.save();

        // Emit live event for Admin Dashboard
        if (req.io) {
            req.io.emit('newAttendance', attendance);
        }

        // 4. Send Notifications (Async - don't block response)
        const staff = await Staff.findOne({ staffId });
        if (staff) {
            notificationService.notifyAttendance(attendance, staff.email, staff.phone).catch(err => console.error('Notification Error:', err));
        }

        // Response with explicit status for UI
        res.status(201).json({
            ...attendance.toObject(),
            message: type === 'In' ? `Punch In Successful (${status})` : 'Punch Out Successful'
        });
    } catch (error) {
        console.error('Attendance Capture Error:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

exports.getAttendanceLogs = async (req, res) => {
    try {
        const logs = await Attendance.find().sort({ timestamp: -1 });
        res.json(logs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.exportLogs = async (req, res) => {
    try {
        const logs = await Attendance.find().lean();
        const fields = ['staffId', 'staffName', 'date', 'time', 'status', 'type'];
        const json2csvParser = new Parser({ fields });
        const csv = json2csvParser.parse(logs);

        res.header('Content-Type', 'text/csv');
        res.attachment(`attendance-report.csv`);
        res.send(csv);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
