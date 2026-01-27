const mongoose = require('mongoose');
const Staff = require('./models/Staff');
const QRCode = require('qrcode');
const os = require('os');
require('dotenv').config();

const getNetworkIp = () => {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
            if (iface.family === 'IPv4' && !iface.internal) {
                return iface.address;
            }
        }
    }
    return 'localhost';
};

const staffData = [
    { staffId: 'TVH-101', name: 'MR HEERA LAL', designation: 'MARKETING', department: 'Marketing' },
    { staffId: 'TVH-102', name: 'MR SHIVA JI KUMAR', designation: 'MARKETING', department: 'Marketing' },
    { staffId: 'TVH-103', name: 'MS FARIYA', designation: 'MANPOWER', department: 'HR' },
    { staffId: 'TVH-104', name: 'MR HASMAT ALI', designation: 'MANAGER', department: 'General' },
    { staffId: 'TVH-105', name: 'MR NIZAM KHAN', designation: 'DIRECTOR OF SALES', department: 'Sales' },
    { staffId: 'TVH-106', name: 'MR JITENDRA KUMAR', designation: 'EMIGRATION DEP', department: 'General' },
    { staffId: 'TVH-107', name: 'MS SARA', designation: 'VISA DEPARTMENT', department: 'General' },
    { staffId: 'TVH-108', name: 'MR AMIT SINGH', designation: 'HR EXECUTIVE', department: 'HR' },
    { staffId: 'TVH-109', name: 'MS POOJA SHARMA', designation: 'ACCOUNTS', department: 'Finance' },
    { staffId: 'TVH-110', name: 'MR RAHUL VERMA', designation: 'IT SUPPORT', department: 'IT' },
    { staffId: 'TVH-111', name: 'MR VIKRAM ADITYA', designation: 'SECURITY HEAD', department: 'General' },
    { staffId: 'TVH-112', name: 'MS NEHA KAPOOR', designation: 'RECEPTIONIST', department: 'General' },
    { staffId: 'TVH-113', name: 'MR SIDDHARTH JAIN', designation: 'CONTENT WRITER', department: 'Marketing' },
    { staffId: 'TVH-114', name: 'MS ANANYA RAO', designation: 'UI/UX DESIGNER', department: 'IT' },
    { staffId: 'TVH-115', name: 'MR KABIR KHAN', designation: 'DRIVER', department: 'General' },
    { staffId: 'TVH-116', name: 'MS SIMRAN KAUR', designation: 'DATA ANALYST', department: 'IT' },
    { staffId: 'TVH-117', name: 'MR ARJUN MEHTA', designation: 'OPERATION HEAD', department: 'General' }
];

async function seed() {
    try {
        const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/attendance_db';
        console.log(`Connecting to: ${uri}`);
        await mongoose.connect(uri);

        const serverIp = getNetworkIp();
        const clientPort = '5173';

        for (const s of staffData) {
            const qrData = `http://${serverIp}:${clientPort}/?staffId=${encodeURIComponent(s.staffId)}&name=${encodeURIComponent(s.name)}`;
            const qrCodeUrl = await QRCode.toDataURL(qrData);

            await Staff.findOneAndUpdate(
                { staffId: s.staffId },
                {
                    ...s,
                    qrCode: qrCodeUrl,
                    shift: 'Morning',
                    status: 'Active',
                    email: `${s.staffId.toLowerCase()}@company.com`,
                    joiningDate: new Date().toISOString().split('T')[0]
                },
                { upsert: true, new: true }
            );
            console.log(`Synced: ${s.name}`);
        }

        console.log('Seeding finished successfully');
        process.exit(0);
    } catch (err) {
        console.error('Seeding error:', err);
        process.exit(1);
    }
}

seed();
