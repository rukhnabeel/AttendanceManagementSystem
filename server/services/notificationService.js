const nodemailer = require('nodemailer');

// Mock configuration (In production, load from env)
const EMAIL_CONFIG = {
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
};

// 1. Email Notification
exports.sendEmail = async (to, subject, html) => {
    if (!process.env.EMAIL_USER) {
        console.log(`[Mock Email] To: ${to} | Subject: ${subject}`);
        return;
    }

    try {
        const transporter = nodemailer.createTransport(EMAIL_CONFIG);
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to,
            subject,
            html
        });
        console.log(`[Email Sent] To: ${to}`);
    } catch (error) {
        console.error('[Email Failed]', error);
    }
};

const axios = require('axios');

// 2. WhatsApp Notification (Ultramsg Integration)
exports.sendWhatsApp = async (phone, message) => {
    const instanceId = process.env.WHATSAPP_INSTANCE_ID;
    const token = process.env.WHATSAPP_TOKEN;

    if (!instanceId || !token) {
        console.log(`[Mock WhatsApp] To: ${phone} | Msg: ${message}`);
        return;
    }

    try {
        // Cleaning phone number (removing any non-numeric characters except +)
        const cleanPhone = phone.replace(/[^0-9]/g, '');

        const response = await axios.post(`https://api.ultramsg.com/${instanceId}/messages/chat`, {
            token: token,
            to: cleanPhone,
            body: message
        });

        if (response.data.sent === "true") {
            console.log(`[WhatsApp Sent] To: ${cleanPhone}`);
        } else {
            console.error('[WhatsApp API Error]', response.data);
        }
    } catch (error) {
        console.error('[WhatsApp Failed]', error.message);
    }
};

// 3. Main Event Handler
exports.notifyAttendance = async (attendance, staffEmail, staffPhone) => {
    const typeText = attendance.type === 'In' ? 'Punch In' : 'Punch Out';
    const timeText = attendance.time;
    const statusText = attendance.status;

    // Email Template
    const emailSubject = `Attendance Alert: ${typeText} Successful`;
    const emailBody = `
        <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
            <h2 style="color: #4F46E5;">Attendance Recorded</h2>
            <p>Hello <strong>${attendance.staffName}</strong>,</p>
            <p>Your <strong>${typeText}</strong> has been recorded successfully.</p>
            <ul style="background: #f9f9f9; padding: 15px; list-style: none; border-radius: 5px;">
                <li><strong>Time:</strong> ${timeText}</li>
                <li><strong>Date:</strong> ${attendance.date}</li>
                <li><strong>Status:</strong> ${statusText}</li>
            </ul>
            <p style="font-size: 12px; color: #888;">If this wasn't you, please contact HR immediately.</p>
        </div>
    `;

    // WhatsApp Template
    const whatsappMsg = `✅ Attendance: ${typeText} Recorded at ${timeText}. Status: ${statusText}.`;

    if (staffEmail) {
        await exports.sendEmail(staffEmail, emailSubject, emailBody);
    }

    if (staffPhone) {
        await exports.sendWhatsApp(staffPhone, whatsappMsg);
    }
};

// 4. Leave Status Handler
exports.notifyLeaveStatus = async (leave, staffEmail, staffPhone) => {
    const statusColor = leave.status === 'Approved' ? '#22C55E' : '#EF4444';
    const statusEmoji = leave.status === 'Approved' ? '✅' : '❌';

    // Email Template
    const emailSubject = `Leave Request: ${leave.status}`;
    const emailBody = `
        <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
            <h2 style="color: ${statusColor};">${leave.status}</h2>
            <p>Hello <strong>${leave.staffName}</strong>,</p>
            <p>Your leave request has been <strong>${leave.status.toLowerCase()}</strong> by the administrator.</p>
            <ul style="background: #f9f9f9; padding: 15px; list-style: none; border-radius: 5px;">
                <li><strong>Period:</strong> ${leave.startDate} to ${leave.endDate}</li>
                <li><strong>Type:</strong> ${leave.leaveType}</li>
                <li><strong>Reason:</strong> ${leave.reason}</li>
            </ul>
        </div>
    `;

    // WhatsApp Template
    const whatsappMsg = `${statusEmoji} Leave Request Update: Your request for ${leave.startDate} to ${leave.endDate} has been ${leave.status.toUpperCase()}.`;

    if (staffEmail) {
        await exports.sendEmail(staffEmail, emailSubject, emailBody);
    }

    if (staffPhone) {
        await exports.sendWhatsApp(staffPhone, whatsappMsg);
    }
};
