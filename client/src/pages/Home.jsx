import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import DigitalClock from '../components/DigitalClock';
import CameraOverlay from '../components/CameraOverlay';

import {
    IdCard,
    CheckCircle,
    AlertCircle,
    LogOut,
    LogIn,
    Camera,
    X,
    Calendar as CalendarIcon
} from 'lucide-react';

import FingerprintJS from '@fingerprintjs/fingerprintjs';

const Home = () => {
    const navigate = useNavigate();
    const [staffUser, setStaffUser] = useState(null);
    const [formData, setFormData] = useState({ staffName: '', staffId: '' });

    // UI State
    const [step, setStep] = useState(1);
    const [capturedPhoto, setCapturedPhoto] = useState(null);
    const [loading, setLoading] = useState(false);
    const [attendanceStatus, setAttendanceStatus] = useState('Present');
    const [error, setError] = useState('');
    const [punchType, setPunchType] = useState('In');

    // PERMISSIONS STATE
    const [userLocation] = useState(null);

    // LEAVE MANAGEMENT STATE
    const [showLeaveModal, setShowLeaveModal] = useState(false);
    const [leaveFormData, setLeaveFormData] = useState({
        staffId: '',
        leaveType: 'Casual Leave',
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
        reason: ''
    });

    useEffect(() => {
        // Authenticate User
        const token = localStorage.getItem('staffToken');
        const userStr = localStorage.getItem('staffUser');

        if (!token || !userStr) {
            navigate('/login');
            return;
        }

        const user = JSON.parse(userStr);
        setStaffUser(user);
        setFormData({ staffName: user.name, staffId: user.staffId });
        setLeaveFormData(prev => ({ ...prev, staffId: user.staffId }));

    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('staffToken');
        localStorage.removeItem('staffUser');
        navigate('/login');
    };

    const handleCapture = (photo) => {
        setCapturedPhoto(photo);
        setError('');
    };

    const handleApplyLeave = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Force staffId from logged in user
            await axios.post('/api/leaves/apply', { ...leaveFormData, staffId: staffUser.staffId });
            alert('Leave request submitted successfully!');
            setShowLeaveModal(false);
            setLeaveFormData({
                staffId: staffUser.staffId,
                leaveType: 'Casual Leave',
                startDate: new Date().toISOString().split('T')[0],
                endDate: new Date().toISOString().split('T')[0],
                reason: ''
            });
        } catch (err) {
            alert(err.response?.data?.message || 'Error submitting leave request');
        }
        setLoading(false);
    };

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();

        if (!capturedPhoto) {
            setError('Please capture your photo (Step 1)');
            return;
        }

        setLoading(true);
        setError('');

        try {
            // Get current location
            let currentLocation = userLocation;
            if (!currentLocation) {
                try {
                    const position = await new Promise((resolve, reject) => {
                        navigator.geolocation.getCurrentPosition(resolve, reject, {
                            enableHighAccuracy: true,
                            timeout: 5000,
                            maximumAge: 0
                        });
                    });
                    currentLocation = {
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                        accuracy: position.coords.accuracy
                    };
                } catch (locErr) {
                    console.error('Location error:', locErr);
                }
            }

            const fp = await FingerprintJS.load();
            const result = await fp.get();
            const deviceHash = result.visitorId;

            const res = await axios.post('/api/attendance', {
                staffId: formData.staffId,
                name: formData.staffName,
                photo: capturedPhoto,
                device: { userAgent: navigator.userAgent, hash: deviceHash },
                type: punchType,
                location: currentLocation
            });

            setAttendanceStatus(res.data.status);
            setStep(2);

            setTimeout(() => {
                setStep(1);
                setCapturedPhoto(null);
                setAttendanceStatus('Present');
            }, 5000);
        } catch (err) {
            setError(err.response?.data?.message || 'Submission failed. Try again.');
        } finally {
            setLoading(false);
        }
    };

    if (!staffUser) return null; // Prevent flash of unauthorized content

    return (
        <div className="animate-fade py-2 md:py-6 relative">

            {/* Logout Button */}
            <button
                onClick={handleLogout}
                className="absolute top-4 right-4 flex items-center gap-2 px-4 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-red-100 transition-colors"
            >
                <LogOut size={14} />
                Logout
            </button>

            <header className="flex flex-col items-center justify-center py-6 text-center mb-4">
                <DigitalClock />
                <div className="mt-6">
                    <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-5xl">
                        Welcome, <span className="text-gradient">{staffUser.name}</span>
                    </h1>
                    <p className="mt-4 text-[11px] font-black text-indigo-500/60 dark:text-indigo-400/50 uppercase tracking-[0.3em] max-w-2xl mx-auto">
                        Ready to mark your attendance?
                    </p>
                </div>
            </header>

            {step === 1 ? (
                <div className="max-w-6xl mx-auto px-4">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">

                        {/* LEFT COLUMN: CAMERA DISPLAY */}
                        <div className="lg:col-span-7 flex flex-col h-full">
                            <div className="card p-6 border-4 border-white dark:border-gray-700 flex flex-col justify-center">
                                <div className="mb-4 flex items-center justify-between">
                                    <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                        <Camera size={16} className="text-indigo-500" />
                                        Visual Verification
                                    </h3>
                                    <div className="flex items-center gap-2 px-3 py-1 bg-red-100 dark:bg-red-900/30 rounded-full">
                                        <div className="h-1.5 w-1.5 bg-red-600 rounded-full animate-pulse" />
                                        <span className="text-[10px] font-bold text-red-700 dark:text-red-400 uppercase tracking-widest">Live Feed</span>
                                    </div>
                                </div>
                                <CameraOverlay
                                    staffName={formData.staffName}
                                    onCapture={handleCapture}
                                />
                            </div>
                        </div>

                        {/* RIGHT COLUMN: ACTION PANEL */}
                        <div className="lg:col-span-5 flex flex-col h-full">
                            <div className="card p-8 flex flex-col h-full bg-white dark:bg-gray-800 border-t-8 border-t-indigo-600">
                                <div className="flex items-center gap-3 mb-8">
                                    <div className="p-2.5 bg-indigo-50 dark:bg-indigo-900/40 rounded-xl text-indigo-600">
                                        <IdCard size={22} />
                                    </div>
                                    <h2 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">Daily Log</h2>
                                </div>

                                <div className="space-y-6 flex-grow">

                                    {/* Staff Info Display (Read Only) */}
                                    <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-700 flex items-center gap-4">
                                        <div className="h-10 w-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-black">
                                            {staffUser.name.charAt(0)}
                                        </div>
                                        <div>
                                            <div className="text-sm font-bold text-gray-900 dark:text-white">{staffUser.name}</div>
                                            <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">#{staffUser.staffId}</div>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Attendance Mode</label>
                                        <div className="grid grid-cols-2 gap-4">
                                            <button
                                                onClick={() => setPunchType('In')}
                                                className={`py-6 rounded-2xl font-black flex flex-col items-center gap-2 border-2 transition-all ${punchType === 'In' ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg scale-[1.02]' : 'bg-gray-50 dark:bg-gray-900 border-transparent text-gray-400 hover:border-gray-200'}`}
                                            >
                                                <LogIn size={22} />
                                                <div className="flex flex-col items-center">
                                                    <span className="text-[9px] uppercase tracking-widest opacity-60">Arrival</span>
                                                    <span className="text-sm">PUNCH IN</span>
                                                </div>
                                            </button>
                                            <button
                                                onClick={() => setPunchType('Out')}
                                                className={`py-6 rounded-2xl font-black flex flex-col items-center gap-2 border-2 transition-all ${punchType === 'Out' ? 'bg-orange-500 border-orange-500 text-white shadow-lg scale-[1.02]' : 'bg-gray-50 dark:bg-gray-900 border-transparent text-gray-400 hover:border-gray-200'}`}
                                            >
                                                <LogOut size={22} />
                                                <div className="flex flex-col items-center">
                                                    <span className="text-[9px] uppercase tracking-widest opacity-60">Departure</span>
                                                    <span className="text-sm">PUNCH OUT</span>
                                                </div>
                                            </button>
                                        </div>
                                    </div>

                                    {error && (
                                        <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-xl text-[10px] flex items-center gap-2 border border-red-100 dark:border-red-900/30 animate-pulse">
                                            <AlertCircle size={16} />
                                            <span className="font-black uppercase tracking-tight">{error}</span>
                                        </div>
                                    )}

                                    <div className="mt-auto space-y-3 pt-6">
                                        <button
                                            onClick={handleSubmit}
                                            disabled={loading || !capturedPhoto}
                                            className={`w-full py-4 rounded-2xl font-black text-lg shadow-xl transition-all active:scale-95 ${loading || !capturedPhoto ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed' : 'bg-indigo-600 text-white hover:bg-black'}`}
                                        >
                                            {loading && !showLeaveModal ? (
                                                <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin mx-auto" />
                                            ) : (
                                                <div className="flex items-center justify-center gap-3 uppercase tracking-tighter">
                                                    <CheckCircle size={24} strokeWidth={3} />
                                                    CONFIRM ENTRY
                                                </div>
                                            )}
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => setShowLeaveModal(true)}
                                            className="w-full py-3.5 border-2 border-indigo-100 dark:border-indigo-900 text-indigo-600 dark:text-indigo-400 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-50 dark:hover:bg-indigo-900/10 transition-all flex items-center justify-center gap-2"
                                        >
                                            <CalendarIcon size={14} />
                                            Apply for Leave
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="max-w-xl mx-auto px-4 mt-8 animate-slide">
                    <div className="card p-10 flex flex-col items-center text-center gap-8 bg-white dark:bg-gray-800 border-b-8 border-b-green-500 shadow-3xl rounded-[2.5rem]">
                        <div className={`w-32 h-32 rounded-[32px] flex items-center justify-center transform rotate-6 ${attendanceStatus === 'Late' ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-600 shadow-amber-200' : 'bg-green-100 dark:bg-green-900/40 text-green-600 shadow-green-200'} shadow-xl animate-scale`}>
                            {attendanceStatus === 'Late' ? <AlertCircle className="h-16 w-16" /> : <CheckCircle className="h-16 w-16" />}
                        </div>
                        <div className="space-y-3">
                            <h2 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight">
                                {attendanceStatus === 'Late' ? 'Late Entry Logged' : 'Access Verified!'}
                            </h2>
                            <p className="text-xl text-gray-500 dark:text-gray-400 font-bold leading-tight">
                                See you later, <span className="text-indigo-600 dark:text-indigo-400 font-black">{formData.staffName}</span>.
                                <br /> <span className="text-[10px] uppercase font-black tracking-widest opacity-60">Success • {new Date().toLocaleTimeString()}</span>
                            </p>
                        </div>
                        <div className="w-full h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden mt-4 shadow-inner relative">
                            <div className="absolute inset-y-0 bg-green-500 animate-[loading_5s_linear_forwards]" />
                        </div>
                        <p className="text-[9px] text-gray-400 uppercase tracking-[0.4em] font-black">Back to Dashboard in 5 Seconds</p>
                    </div>
                </div>
            )}

            {/* LEAVE REQUEST MODAL */}
            {showLeaveModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] shadow-3xl w-full max-w-lg overflow-hidden animate-scale">
                        <div className="px-8 py-6 border-b dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-gray-900/50">
                            <div>
                                <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Request Leave</h3>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Personnel Management System</p>
                            </div>
                            <button onClick={() => setShowLeaveModal(false)} className="p-2.5 bg-white dark:bg-gray-800 rounded-xl text-gray-400 hover:text-red-500 shadow-sm transition-colors"><X size={20} /></button>
                        </div>

                        <form onSubmit={handleApplyLeave} className="p-8 space-y-6">
                            <div className="space-y-4">
                                {/* Staff ID is now auto-filled and hidden/disabled */}

                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Type of Leave</label>
                                    <select
                                        className="input-field py-3 cursor-pointer"
                                        value={leaveFormData.leaveType}
                                        onChange={e => setLeaveFormData({ ...leaveFormData, leaveType: e.target.value })}
                                    >
                                        <option value="Casual Leave">Casual Leave</option>
                                        <option value="Sick Leave">Sick Leave</option>
                                        <option value="Emergency">Emergency</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Start Date</label>
                                        <input
                                            type="date"
                                            required
                                            className="input-field py-3"
                                            value={leaveFormData.startDate}
                                            onChange={e => setLeaveFormData({ ...leaveFormData, startDate: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">End Date</label>
                                        <input
                                            type="date"
                                            required
                                            className="input-field py-3"
                                            value={leaveFormData.endDate}
                                            onChange={e => setLeaveFormData({ ...leaveFormData, endDate: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Reason for Leave</label>
                                    <textarea
                                        required
                                        rows="3"
                                        className="input-field py-3 resize-none"
                                        placeholder="Brief explanation..."
                                        value={leaveFormData.reason}
                                        onChange={e => setLeaveFormData({ ...leaveFormData, reason: e.target.value })}
                                    />
                                </div>
                            </div>

                            <button type="submit" className="btn btn-primary w-full py-4 text-sm">
                                {loading ? 'Processing...' : 'Submit Leave Request'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Home;
