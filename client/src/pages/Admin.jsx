import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    Users,
    ClipboardList,
    Plus,

    Trash2,
    Edit2,
    QrCode,
    Search,
    UserCheck,
    Calendar,
    LayoutDashboard,

    MapPin,
    AlertCircle,
    CheckCircle,
    Printer,
    Monitor,
    X,
    UserPlus,
    Clock,
    ShieldCheck,
    LogIn,
    LogOut,
    Database,
    Zap,
    FileSpreadsheet
} from 'lucide-react';
import { io } from 'socket.io-client';
import DashboardStats from '../components/DashboardStats';

const Admin = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('overview');

    // AUTHENTICATION CHECK
    useEffect(() => {
        const isAuthenticated = localStorage.getItem('isAdminAuthenticated');
        if (!isAuthenticated) {
            navigate('/login');
        }
    }, [navigate]);


    const [staff, setStaff] = useState([]);
    const [logs, setLogs] = useState([]);
    const [leaves, setLeaves] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [socketConnected, setSocketConnected] = useState(false);

    const initialStaffState = {
        staffId: '',
        name: '',
        designation: '',
        department: 'General',
        email: '',
        phone: '',
        shift: 'Morning',
        joiningDate: new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' }),
        gender: 'Male',
        address: '',
        emergencyContact: '',
        bloodGroup: '',
        dateOfBirth: '',
        status: 'Active',
        salary: ''
    };

    const [newStaff, setNewStaff] = useState(initialStaffState);
    const [showStaffModal, setShowStaffModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [viewItem, setViewItem] = useState(null);
    const [showSystemQR, setShowSystemQR] = useState(null);
    const [selectedMonth, setSelectedMonth] = useState(new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' }).slice(0, 7)); // YYYY-MM

    useEffect(() => {
        const socket = io('/', {
            transports: ['polling'], // WebSocket fails on serverless/Vercel, use polling
            reconnectionAttempts: 5,
            reconnectionDelay: 1000
        });
        socket.on('connect', () => setSocketConnected(true));
        socket.on('disconnect', () => setSocketConnected(false));
        socket.on('newAttendance', (newLog) => {
            setLogs(prevLogs => [newLog, ...prevLogs]);
        });
        socket.on('newLeaveRequest', (newLeave) => {
            setLeaves(prevLeaves => [newLeave, ...prevLeaves]);
        });
        return () => socket.disconnect();
    }, []);



    const fetchData = async () => {
        setLoading(true);
        try {
            const [staffRes, logsRes, leavesRes] = await Promise.all([
                axios.get('/api/staff'),
                axios.get('/api/attendance'),
                axios.get('/api/leaves')
            ]);
            setStaff(Array.isArray(staffRes.data) ? staffRes.data : []);
            setLogs(Array.isArray(logsRes.data) ? logsRes.data : []);
            setLeaves(Array.isArray(leavesRes.data) ? leavesRes.data : []);
        } catch (err) {
            console.error('Error fetching data', err);
        }
        setLoading(false);
    };

    useEffect(() => {
        // eslint-disable-next-line
        fetchData();
    }, []);

    const handleSaveStaff = async (e) => {
        if (e) e.preventDefault();
        try {
            if (isEditing) {
                await axios.put(`/api/staff/${newStaff._id}`, newStaff);
            } else {
                await axios.post('/api/staff', newStaff);
            }
            setShowStaffModal(false);
            setIsEditing(false);
            setNewStaff(initialStaffState);
            fetchData();
        } catch (err) {
            console.error('Save Error Details:', err);
            const errMsg = err.response?.data?.message || err.message || 'Error saving staff';
            alert(`Failed: ${errMsg}`);
        }
    };

    // BULK SEED DATA FUNCTION
    const loadSampleData = async () => {
        if (!window.confirm('This will populate the server with 17 sample staff members. Proceed?')) return;
        setLoading(true);
        const samples = [
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

        let successCount = 0;
        let failCount = 0;

        for (const s of samples) {
            try {
                await axios.post('/api/staff', { ...initialStaffState, ...s });
                successCount++;
            } catch (err) {
                console.error(`Failed to load ${s.staffId}:`, err);
                failCount++;
            }
        }

        fetchData();
        setLoading(false);
        alert(`Process complete.\nSuccessfully loaded: ${successCount}\nFailed: ${failCount}\n${failCount > 0 ? 'Check console for details.' : ''}`);

    };

    const fetchSystemQR = async () => {
        try {
            const res = await axios.get('/api/staff/system-qr');
            setShowSystemQR(res.data);
        } catch {
            alert('Failed to generate system QR');
        }
    };

    const handleLeaveAction = async (id, status) => {
        try {
            await axios.put(`/api/leaves/${id}/status`, { status });

            // Find the leave request to get details for WhatsApp
            const leaveRequest = leaves.find(l => l._id === id);
            if (leaveRequest && leaveRequest.phone) {
                const message = `Hello ${leaveRequest.staffName}, your leave request for ${leaveRequest.startDate} has been *${status.toUpperCase()}*.`;
                const whatsappUrl = `https://wa.me/${leaveRequest.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`;
                window.open(whatsappUrl, '_blank');
            } else if (leaveRequest && !leaveRequest.phone) {
                alert(`Leave updated, but cannot open WhatsApp: No phone number found for ${leaveRequest.staffName}`);
            }

            fetchData();
        } catch {
            alert('Failed to update leave status');
        }
    };

    const handleDeleteStaff = async (id) => {
        if (!window.confirm('Are you sure you want to remove this employee?')) return;
        try {
            await axios.delete(`/api/staff/${id}`);
            fetchData();
        } catch (err) {
            console.error(err);
        }
    };

    const handleExport = () => {
        window.open('/api/attendance/export', '_blank');
    };

    const filteredStaff = (Array.isArray(staff) ? staff : []).filter(s =>
        (s.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (s.staffId || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="max-w-6xl mx-auto px-4 py-8 space-y-10 animate-fade">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-black dark:text-white tracking-tight">Admin <span className="text-gradient">Console</span></h1>
                    <div className="flex items-center gap-3 mt-2">
                        <button
                            onClick={() => {
                                setIsEditing(false);
                                setNewStaff(initialStaffState);
                                setShowStaffModal(true);
                            }}
                            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-bold uppercase tracking-widest text-[10px] hover:bg-indigo-700 shadow-lg shadow-indigo-200 dark:shadow-none transition-all"
                        >
                            <UserPlus size={16} />
                            Register Staff
                        </button>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                        <input
                            type="text"
                            placeholder="Search personnel..."
                            className="pl-11 pr-6 py-3 bg-white dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 rounded-2xl focus:border-indigo-500 shadow-sm outline-none w-full md:w-72 text-sm font-bold transition-all text-gray-900 dark:text-white placeholder-gray-400"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button onClick={fetchSystemQR} className="btn bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-indigo-500 hover:text-indigo-600 shadow-sm rounded-2xl" title="Office QR">
                        <QrCode size={20} />
                        <span className="hidden sm:inline">Office QR</span>
                    </button>

                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Personnel', value: (Array.isArray(staff) ? staff : []).length, icon: Users, grad: 'from-blue-500 to-indigo-600' },
                    { label: 'Present Today', value: (Array.isArray(logs) ? logs : []).filter(l => l.date === new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' })).length, icon: UserCheck, grad: 'from-emerald-500 to-teal-600' },
                    { label: 'Unpunctual', value: (Array.isArray(logs) ? logs : []).filter(l => l.status === 'Late' && l.date === new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' })).length, icon: Clock, grad: 'from-orange-400 to-rose-500' },
                    { label: 'Active Status', value: (Array.isArray(staff) ? staff : []).filter(s => s.status === 'Active').length, icon: ShieldCheck, grad: 'from-purple-500 to-pink-600' }
                ].map((stat, i) => (
                    <div key={i} className="card p-6 flex flex-col gap-4 bg-white dark:bg-gray-800 group hover:scale-[1.02]">
                        <div className={`h-12 w-12 rounded-2xl bg-gradient-to-br ${stat.grad} flex items-center justify-center text-white shadow-lg`}>
                            <stat.icon size={24} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">{stat.label}</p>
                            <p className="text-3xl font-black text-gray-900 dark:text-white mt-1">{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="card bg-white dark:bg-gray-800 p-2 overflow-hidden flex flex-col md:flex-row gap-2">
                {[
                    { id: 'overview', label: 'Dashboard Stats', icon: LayoutDashboard },
                    { id: 'staff', label: 'Staff Management', icon: Users },
                    { id: 'logs', label: 'Attendance Feed', icon: ClipboardList },
                    { id: 'leaves', label: 'Leave Requests', icon: Calendar }
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`md:flex-1 py-4 px-6 rounded-xl text-sm font-black uppercase tracking-widest flex items-center justify-center gap-3 transition-all ${activeTab === tab.id ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/20' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-900 group'}`}
                    >
                        <tab.icon size={18} className={activeTab === tab.id ? '' : 'group-hover:text-indigo-500'} />
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className="min-h-[400px]">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4 opacity-50">
                        <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
                        <span className="text-xs font-black uppercase tracking-widest text-indigo-500">Syncing Data...</span>
                    </div>
                ) : (
                    <div className="animate-slide">
                        {activeTab === 'overview' && <DashboardStats logs={Array.isArray(logs) ? logs : []} staff={Array.isArray(staff) ? staff : []} />}

                        {activeTab === 'staff' && (
                            <div className="card overflow-hidden bg-white dark:bg-gray-800">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-sm whitespace-nowrap">
                                        <thead>
                                            <tr className="bg-gray-50 dark:bg-gray-900 border-b border-gray-100 dark:border-gray-700">
                                                <th className="px-6 py-5 font-black uppercase tracking-widest text-[10px] text-gray-500">Employee Details</th>
                                                <th className="px-6 py-5 font-black uppercase tracking-widest text-[10px] text-gray-500">Staff ID</th>
                                                <th className="px-6 py-5 font-black uppercase tracking-widest text-[10px] text-gray-500">Role & Dept</th>
                                                <th className="px-6 py-5 font-black uppercase tracking-widest text-[10px] text-gray-500">Timing</th>
                                                <th className="px-4 py-5 font-black uppercase tracking-widest text-[10px] text-gray-500">Status</th>
                                                <th className="px-6 py-5 font-black uppercase tracking-widest text-[10px] text-gray-500 text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                            {filteredStaff.length > 0 ? filteredStaff.map((s) => (
                                                <tr key={s._id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/30 group transition-colors">
                                                    <td className="px-6 py-5">
                                                        <div className="flex items-center gap-4">
                                                            <div className="h-10 w-10 rounded-xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center font-black text-gray-500 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm">{s.name.charAt(0)}</div>
                                                            <div>
                                                                <div className="font-bold text-gray-900 dark:text-white">{s.name}</div>
                                                                <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{s.email || 'No Email'}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-5 font-black text-indigo-600 dark:text-indigo-400 tracking-tighter text-base">#{s.staffId}</td>
                                                    <td className="px-6 py-5">
                                                        <div className="font-bold text-gray-900 dark:text-gray-200">{s.designation}</div>
                                                        <div className="text-[10px] text-gray-500 uppercase font-black tracking-widest">{s.department}</div>
                                                    </td>
                                                    <td className="px-6 py-5">
                                                        <span className="px-3 py-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-[10px] font-black uppercase tracking-widest">{s.shift}</span>
                                                    </td>
                                                    <td className="px-4 py-5 text-center">
                                                        <div className={`h-2 w-2 rounded-full mx-auto ${s.status === 'Active' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-red-500'}`} />
                                                    </td>
                                                    <td className="px-6 py-5 text-right">
                                                        <div className="flex justify-end gap-2">
                                                            <button onClick={() => setViewItem({ type: 'QR', src: s.qrCode, title: s.name })} className="p-2 border-2 border-transparent hover:border-indigo-100 dark:hover:border-indigo-900 rounded-xl text-gray-400 hover:text-indigo-600 transition-all"><QrCode size={18} /></button>
                                                            <button onClick={() => { setNewStaff(s); setIsEditing(true); setShowStaffModal(true); }} className="p-2 border-2 border-transparent hover:border-blue-100 dark:hover:border-blue-900 rounded-xl text-gray-400 hover:text-blue-600 transition-all"><Edit2 size={18} /></button>
                                                            <button onClick={() => handleDeleteStaff(s._id)} className="p-2 border-2 border-transparent hover:border-red-100 dark:hover:border-red-900 rounded-xl text-gray-400 hover:text-red-600 transition-all"><Trash2 size={18} /></button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )) : (
                                                <tr>
                                                    <td colSpan="6" className="py-20 text-center">
                                                        <div className="flex flex-col items-center gap-3 opacity-30">
                                                            <Database size={48} />
                                                            <p className="font-black uppercase tracking-widest text-xs">Waiting for personnel data...</p>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {activeTab === 'logs' && (
                            <div className="card overflow-hidden bg-white dark:bg-gray-800">
                                {/* Month Selector */}
                                <div className="p-6 bg-gray-50/50 dark:bg-gray-900/50 border-b dark:border-gray-700 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div>
                                        <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-widest">Temporal Records</h3>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Filtering by month cycle</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={handleExport}
                                            className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 hover:bg-green-100 border border-green-200 rounded-xl text-xs font-black uppercase tracking-widest transition-all"
                                        >
                                            <FileSpreadsheet size={16} />
                                            Export CSV
                                        </button>
                                        <div className="h-8 w-[1px] bg-gray-200 dark:bg-gray-700 mx-2 hidden md:block"></div>
                                        <Calendar size={18} className="text-indigo-500" />
                                        <input
                                            type="month"
                                            value={selectedMonth}
                                            onChange={(e) => setSelectedMonth(e.target.value)}
                                            className="bg-white dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 rounded-xl px-4 py-2 text-sm font-black text-indigo-600 outline-none focus:border-indigo-500 transition-all"
                                        />
                                    </div>
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-sm whitespace-nowrap">
                                        <thead>
                                            <tr className="bg-gray-50 dark:bg-gray-900 border-b border-gray-100 dark:border-gray-700">
                                                <th className="px-6 py-5 font-black uppercase tracking-widest text-[10px] text-gray-500">Personnel</th>
                                                <th className="px-6 py-5 font-black uppercase tracking-widest text-[10px] text-gray-500 text-center">Verification</th>
                                                <th className="px-6 py-5 font-black uppercase tracking-widest text-[10px] text-gray-500">Timeline</th>
                                                <th className="px-6 py-5 font-black uppercase tracking-widest text-[10px] text-gray-500">Type</th>
                                                <th className="px-6 py-5 font-black uppercase tracking-widest text-[10px] text-gray-500">Result</th>
                                                <th className="px-6 py-5 font-black uppercase tracking-widest text-[10px] text-gray-500 text-center">Source</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                            {(Array.isArray(logs) ? logs : []).filter(log => log.date && log.date.startsWith(selectedMonth)).length > 0 ? (Array.isArray(logs) ? logs : []).filter(log => log.date && log.date.startsWith(selectedMonth)).map((log) => (
                                                <tr key={log._id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition-colors">
                                                    <td className="px-6 py-5 font-black text-gray-900 dark:text-white">{log.staffName}</td>
                                                    <td className="px-6 py-5 text-center">
                                                        <button onClick={() => setViewItem({ type: 'Photo', src: log.photo, title: log.staffName })} className="h-12 w-12 border-2 border-white dark:border-gray-700 rounded-xl overflow-hidden shadow-sm hover:scale-110 transition-transform">
                                                            <img src={log.photo} className="w-full h-full object-cover" alt="Check-in" />
                                                        </button>
                                                    </td>
                                                    <td className="px-6 py-5">
                                                        <div className="font-bold text-gray-900 dark:text-gray-200">
                                                            {log.timestamp ? new Date(log.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true, timeZone: 'Asia/Kolkata' }) : log.time}
                                                        </div>
                                                        <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                                                            {log.timestamp ? new Date(log.timestamp).toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' }) : log.date}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-5">
                                                        <div className={`flex items-center gap-2 font-black uppercase text-[10px] tracking-[0.2em] ${log.type === 'In' ? 'text-blue-600' : 'text-orange-600'}`}>
                                                            {log.type === 'In' ? <LogIn size={14} /> : <LogOut size={14} />}
                                                            {log.type}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-5">
                                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${log.status === 'Present' || log.status === 'Checked Out' ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400'}`}>
                                                            {log.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-5">
                                                        <div className="flex justify-center">
                                                            {log.location && log.location.latitude && log.location.longitude ? (
                                                                <a href={`https://www.google.com/maps?q=${log.location.latitude},${log.location.longitude}`} target="_blank" className="p-2 border-2 border-transparent hover:border-indigo-100 dark:hover:border-indigo-900 rounded-xl text-gray-400 hover:text-indigo-600 transition-all">
                                                                    <MapPin size={18} />
                                                                </a>
                                                            ) : <span className="text-gray-300">N/A</span>}
                                                        </div>
                                                    </td>
                                                </tr>
                                            )) : (
                                                <tr>
                                                    <td colSpan="6" className="py-20 text-center">
                                                        <div className="flex flex-col items-center gap-3 opacity-30">
                                                            <ClipboardList size={48} />
                                                            <p className="font-black uppercase tracking-widest text-xs">No records found for {new Date(selectedMonth).toLocaleString('default', { month: 'long', year: 'numeric' })}</p>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {activeTab === 'leaves' && (
                            <div className="card overflow-hidden bg-white dark:bg-gray-800">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-sm whitespace-nowrap">
                                        <thead>
                                            <tr className="bg-gray-50 dark:bg-gray-900 border-b border-gray-100 dark:border-gray-700">
                                                <th className="px-6 py-5 font-black uppercase tracking-widest text-[10px] text-gray-400">Employee</th>
                                                <th className="px-6 py-5 font-black uppercase tracking-widest text-[10px] text-gray-400">Duration</th>
                                                <th className="px-6 py-5 font-black uppercase tracking-widest text-[10px] text-gray-400">Type & Reason</th>
                                                <th className="px-6 py-5 font-black uppercase tracking-widest text-[10px] text-gray-400">Current Status</th>
                                                <th className="px-6 py-5 font-black uppercase tracking-widest text-[10px] text-gray-400 text-right">Decisions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                            {(Array.isArray(leaves) ? leaves : []).length > 0 ? (Array.isArray(leaves) ? leaves : []).map((leave) => (
                                                <tr key={leave._id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition-colors">
                                                    <td className="px-6 py-5">
                                                        <div className="font-bold text-gray-900 dark:text-white">{leave.staffName}</div>
                                                        <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">#{leave.staffId}</div>
                                                    </td>
                                                    <td className="px-6 py-5">
                                                        <div className="flex items-center gap-2">
                                                            <div className="px-2 py-1 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-100 dark:border-gray-700 text-[10px] font-black">{leave.startDate}</div>
                                                            <div className="h-[1px] w-2 bg-gray-300" />
                                                            <div className="px-2 py-1 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-100 dark:border-gray-700 text-[10px] font-black">{leave.endDate}</div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-5">
                                                        <span className="px-2.5 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg text-[10px] font-black uppercase tracking-widest mb-1 inline-block">{leave.leaveType}</span>
                                                        <div className="text-xs text-gray-500 max-w-[200px] truncate" title={leave.reason}>{leave.reason}</div>
                                                    </td>
                                                    <td className="px-6 py-5">
                                                        <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest inline-block ${leave.status === 'Pending' ? 'bg-amber-100 text-amber-700' :
                                                            leave.status === 'Approved' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                                            }`}>
                                                            {leave.status}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-5 text-right">
                                                        {leave.status === 'Pending' ? (
                                                            <div className="flex justify-end gap-2">
                                                                <button onClick={() => handleLeaveAction(leave._id, 'Approved')} className="p-2 bg-green-50 text-green-600 rounded-xl hover:bg-green-600 hover:text-white transition-all"><CheckCircle size={18} /></button>
                                                                <button onClick={() => handleLeaveAction(leave._id, 'Rejected')} className="p-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all"><X size={18} /></button>
                                                            </div>
                                                        ) : (
                                                            <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest italic leading-none">Processed</span>
                                                        )}
                                                    </td>
                                                </tr>
                                            )) : (
                                                <tr>
                                                    <td colSpan="5" className="py-20 text-center">
                                                        <div className="flex flex-col items-center gap-3 opacity-30">
                                                            <Calendar size={48} />
                                                            <p className="font-black uppercase tracking-widest text-xs">No leave requests to show</p>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* REGISTER/EDIT MODAL */}
            {showStaffModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] shadow-3xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh] animate-scale">
                        <div className="px-10 py-8 border-b dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-gray-900/50">
                            <div>
                                <h3 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">{isEditing ? 'Modify Personnel' : 'Register Member'}</h3>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Staff management system v2</p>
                            </div>
                            <button onClick={() => setShowStaffModal(false)} className="p-3 bg-white dark:bg-gray-800 rounded-2xl text-gray-400 hover:text-red-500 shadow-sm transition-colors border-2 border-transparent hover:border-red-100"><X size={24} /></button>
                        </div>

                        <form onSubmit={handleSaveStaff} className="p-10 overflow-y-auto space-y-10">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                <div className="space-y-2">
                                    <label className="text-label">Full Name</label>
                                    <input required className="input-field" placeholder="Entry Name..." value={newStaff.name} onChange={e => setNewStaff({ ...newStaff, name: e.target.value })} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-label">Staff ID</label>
                                    <input required disabled={isEditing} className={`input-field ${isEditing ? 'opacity-50 cursor-not-allowed bg-gray-50' : ''}`} placeholder="ST-XYZ" value={newStaff.staffId} onChange={e => setNewStaff({ ...newStaff, staffId: e.target.value })} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-label">Role</label>
                                    <input required className="input-field" placeholder="e.g. Director" value={newStaff.designation} onChange={e => setNewStaff({ ...newStaff, designation: e.target.value })} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-label">Department</label>
                                    <select className="input-field cursor-pointer" value={newStaff.department} onChange={e => setNewStaff({ ...newStaff, department: e.target.value })}>
                                        <option value="General">General</option>
                                        <option value="IT">IT</option>
                                        <option value="HR">HR</option>
                                        <option value="Marketing">Marketing</option>
                                        <option value="Sales">Sales</option>
                                        <option value="Finance">Finance</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-label">Assigned Shift</label>
                                    <select className="input-field cursor-pointer" value={newStaff.shift} onChange={e => setNewStaff({ ...newStaff, shift: e.target.value })}>
                                        <option value="Morning">Morning</option>
                                        <option value="Evening">Evening</option>
                                        <option value="Night">Night</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-label">Email Address</label>
                                    <input type="email" className="input-field" placeholder="office@work.com" value={newStaff.email} onChange={e => setNewStaff({ ...newStaff, email: e.target.value })} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-label">Phone Contact</label>
                                    <input type="tel" className="input-field" placeholder="+123..." value={newStaff.phone} onChange={e => setNewStaff({ ...newStaff, phone: e.target.value })} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-label">Password</label>
                                    <input type="text" className="input-field" placeholder={isEditing ? "Leave blank to keep current" : "Set Login Password"} value={newStaff.password || ''} onChange={e => setNewStaff({ ...newStaff, password: e.target.value })} />
                                </div>
                            </div>

                            <div className="flex gap-4 pt-6 border-t dark:border-gray-700">
                                <button type="submit" className="btn btn-primary px-10 py-5 text-lg flex-1">
                                    {isEditing ? 'Save Changes' : 'Confirm Registration'}
                                </button>
                                <button type="button" onClick={() => setShowStaffModal(false)} className="py-5 px-10 rounded-[14px] font-black text-gray-400 uppercase tracking-widest text-sm hover:text-gray-900 transition-colors">
                                    Discard
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* VIEWER MODAL */}
            {viewItem && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90" onClick={() => setViewItem(null)}>
                    <div className="bg-white dark:bg-gray-800 rounded-[3rem] p-10 max-w-sm w-full text-center animate-scale relative overflow-hidden" onClick={e => e.stopPropagation()}>
                        <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-indigo-500 to-purple-600" />
                        <h4 className="text-xs font-black text-indigo-500 uppercase tracking-[0.3em] mb-6">{viewItem.type} Verification</h4>
                        <div className="bg-gray-50 dark:bg-gray-900 rounded-[2rem] p-4 border-2 border-gray-100 dark:border-gray-700 shadow-inner mb-8">
                            <img src={viewItem.src.startsWith('data:') ? viewItem.src : `/${viewItem.src}`} className="mx-auto rounded-2xl w-full object-contain" alt="Viewer" />
                        </div>
                        <div className="mb-8">
                            <p className="font-bold text-gray-900 dark:text-white uppercase tracking-tighter text-xl">{viewItem.title}</p>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Personnel Record #2026</p>
                        </div>
                        <button onClick={() => setViewItem(null)} className="btn btn-primary w-full py-5 rounded-3xl">CLOSE VIEWER</button>
                    </div>
                </div>
            )}

            {/* OFFICE QR MODAL */}
            {showSystemQR && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/90 scrollbar-hide" onClick={() => setShowSystemQR(null)}>
                    <div className="bg-white rounded-[3rem] p-12 max-w-md w-full text-center relative shadow-3xl animate-scale" onClick={e => e.stopPropagation()}>
                        <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-50 rounded-bl-[6rem] -z-0" />
                        <div className="relative z-10 flex flex-col items-center">
                            <div className="h-16 w-16 bg-indigo-600 rounded-3xl flex items-center justify-center text-white shadow-xl mb-6">
                                <QrCode size={32} />
                            </div>
                            <h3 className="text-3xl font-black text-gray-900 tracking-tight leading-none">Office QR</h3>
                            <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.4em] mt-3">Mobile Attendance Link</p>
                            <div className="bg-white p-8 rounded-[2.5rem] border-8 border-gray-50 my-10 shadow-2xl">
                                <img src={showSystemQR.qrCode} className="w-64 h-64 object-contain mx-auto" alt="Office QR" />
                            </div>
                            <div className="bg-gray-50 p-5 rounded-2xl mb-10 border border-gray-100 w-full text-left">
                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                                    <Monitor size={10} /> Local Network Access
                                </p>
                                <p className="text-xs font-bold text-gray-600 break-all bg-white px-3 py-2 rounded-lg border border-gray-100">{showSystemQR.url}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4 w-full">
                                <button onClick={() => setTimeout(() => window.print(), 100)} className="btn btn-primary py-5 rounded-[22px] flex-1">
                                    <Printer size={18} /> PRINT
                                </button>
                                <button onClick={() => setShowSystemQR(null)} className="py-5 px-6 rounded-[22px] font-black text-gray-400 uppercase tracking-widest text-[10px] hover:text-gray-900 transition-colors">
                                    DISMISS
                                </button>
                            </div>
                            <p className="mt-8 text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">Post this QR near the entrance for scan-to-work</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Admin;
