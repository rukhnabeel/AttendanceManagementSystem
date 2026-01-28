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
        const dateStr = now.toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
        const timeStr = now.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true,
            timeZone: 'Asia/Kolkata'
        });

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
            const parts = new Intl.DateTimeFormat('en-US', {
                timeZone: 'Asia/Kolkata',
                hour: 'numeric',
                minute: 'numeric',
                hour12: false
            }).formatToParts(now);

            const hour = parseInt(parts.find(p => p.type === 'hour').value);
            const minute = parseInt(parts.find(p => p.type === 'minute').value);
            // OFFICE TIME: 10:00 AM TO 19:00 PM
            // Late rule: After 10:00 AM
            if (hour > 10 || (hour === 10 && minute > 0)) {
                status = 'Late';
            }
        } else {
            status = 'Checked Out';
        }

        // 3. Strict: Geo-fencing Validation
        // If OFFICE_LAT/LONG are set in env, check distance
        let gpsVerified = false;
        if (process.env.OFFICE_LAT && process.env.OFFICE_LONG) {
            if (!location || !location.latitude || !location.longitude) {
                return res.status(400).json({ message: 'GPS Location is mandatory. Please enable location.' });
            }

            const distance = geolib.getDistance(
                { latitude: location.latitude, longitude: location.longitude },
                { latitude: process.env.OFFICE_LAT, longitude: process.env.OFFICE_LONG }
            );

            // Dynamic Radius: 20m for Punch OUT, 50m for Punch IN
            const allowedRadius = type === 'Out' ? 20 : 50;

            if (distance <= allowedRadius) {
                gpsVerified = true;
            } else {
                console.warn(`User ${name} is ${distance}m away from office.`);
                return res.status(403).json({ message: `You are ${distance}m away. Punch ${type} must be within ${allowedRadius}m.` });
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

        // Transform logs to use IST time from timestamp
        const transformedLogs = logs.map(log => {
            if (log.timestamp) {
                const dateObj = new Date(log.timestamp);
                return {
                    ...log,
                    date: dateObj.toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' }),
                    time: dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true, timeZone: 'Asia/Kolkata' })
                };
            }
            return log;
        });

        const fields = ['staffId', 'staffName', 'date', 'time', 'status', 'type'];
        const json2csvParser = new Parser({ fields });
        const csv = json2csvParser.parse(transformedLogs);

        res.header('Content-Type', 'text/csv');
        res.attachment(`attendance-report.csv`);
        res.send(csv);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
