import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Lock, ShieldCheck, Mail, ArrowRight, Eye, EyeOff, User, Briefcase } from 'lucide-react';

const Login = () => {
    const [mode, setMode] = useState('staff'); // 'admin' or 'staff'

    // Admin State
    const [adminEmail, setAdminEmail] = useState('');
    const [adminPassword, setAdminPassword] = useState('');

    // Staff State
    const [staffId, setStaffId] = useState('');
    const [staffPassword, setStaffPassword] = useState('');

    // Shared State
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        if (mode === 'admin') {
            // UPDATED SECURE CREDENTIALS (Hardcoded for now as per legacy)
            if (adminEmail === 'admin@tvh.com' && adminPassword === 'tvh@2026') {
                localStorage.setItem('isAdminAuthenticated', 'true');
                navigate('/admin');
            } else {
                setError('Invalid Admin credentials. Access denied.');
                setLoading(false);
            }
        } else {
            // Staff Login
            try {
                const res = await axios.post('/api/auth/login', {
                    staffId: staffId,
                    password: staffPassword
                });

                // Save Staff Session
                localStorage.setItem('staffToken', res.data.token);
                localStorage.setItem('staffUser', JSON.stringify(res.data.staff));

                navigate('/');
            } catch (err) {
                console.error(err);
                setError(err.response?.data?.message || 'Login failed. Check ID and Password.');
            } finally {
                setLoading(false);
            }
        }
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center py-10 px-4 animate-fade">
            <div className="w-full max-w-lg">
                <div className="card bg-white dark:bg-gray-800 p-8 md:p-12 border-t-8 border-t-indigo-600 shadow-3xl rounded-[3rem] relative overflow-hidden">
                    {/* Decorative Background Element */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 dark:bg-indigo-900/20 rounded-bl-[4rem] -z-0 opacity-50" />

                    <div className="relative z-10">
                        {/* Logo/Icon */}
                        <div className="flex justify-center mb-8">
                            <div className="h-20 w-20 bg-indigo-600 rounded-3xl flex items-center justify-center text-white shadow-2xl shadow-indigo-600/30 rotate-3 transition-transform hover:rotate-6">
                                {mode === 'admin' ? <ShieldCheck size={40} strokeWidth={2.5} /> : <Briefcase size={40} strokeWidth={2.5} />}
                            </div>
                        </div>

                        {/* Title */}
                        <div className="text-center mb-8">
                            <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
                                {mode === 'admin' ? 'Admin' : 'Staff'} <span className="text-indigo-600">Secure</span> Access
                            </h1>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mt-2 italic">
                                {mode === 'admin' ? 'Authorized Personnel Only' : 'Attendance Portal Login'}
                            </p>
                        </div>

                        {/* Mode Switcher */}
                        <div className="flex p-1 bg-gray-100 dark:bg-gray-900/50 rounded-2xl mb-8">
                            <button
                                type="button"
                                onClick={() => { setMode('admin'); setError(''); }}
                                className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${mode === 'admin' ? 'bg-white dark:bg-gray-800 text-indigo-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                            >
                                Admin
                            </button>
                            <button
                                type="button"
                                onClick={() => { setMode('staff'); setError(''); }}
                                className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${mode === 'staff' ? 'bg-white dark:bg-gray-800 text-indigo-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                            >
                                Staff
                            </button>
                        </div>

                        {/* Login Form */}
                        <form onSubmit={handleLogin} className="space-y-6">
                            {mode === 'admin' ? (
                                <div className="space-y-2">
                                    <label className="text-label ml-2">Email Address</label>
                                    <div className="relative group">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                                        <input
                                            required
                                            type="email"
                                            placeholder="admin@tvh.com"
                                            className="input-field !pl-16 bg-gray-50 dark:bg-gray-900 border-2 border-transparent focus:border-indigo-500 rounded-2xl text-gray-900 dark:text-white"
                                            value={adminEmail}
                                            onChange={(e) => setAdminEmail(e.target.value)}
                                        />
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    <label className="text-label ml-2">Staff ID Code</label>
                                    <div className="relative group">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                                        <input
                                            required
                                            type="text"
                                            placeholder="TVH-123"
                                            className="input-field !pl-16 bg-gray-50 dark:bg-gray-900 border-2 border-transparent focus:border-indigo-500 rounded-2xl uppercase text-gray-900 dark:text-white"
                                            value={staffId}
                                            onChange={(e) => setStaffId(e.target.value)}
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="space-y-2">
                                <label className="text-label ml-2">Secure Passcode</label>
                                <div className="relative group">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                                    <input
                                        required
                                        type={showPassword ? "text" : "password"}
                                        placeholder="••••••••"
                                        className="input-field !pl-16 pr-12 bg-gray-50 dark:bg-gray-900 border-2 border-transparent focus:border-indigo-500 rounded-2xl text-gray-900 dark:text-white"
                                        value={mode === 'admin' ? adminPassword : staffPassword}
                                        onChange={(e) => mode === 'admin' ? setAdminPassword(e.target.value) : setStaffPassword(e.target.value)}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-indigo-600"
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>

                            {error && (
                                <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-2xl text-[10px] font-black uppercase tracking-widest text-center border border-red-100 dark:border-red-900/40 animate-pulse">
                                    {error}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className={`w-full py-5 bg-indigo-600 text-white rounded-3xl font-black text-lg shadow-xl shadow-indigo-600/20 hover:scale-[1.02] hover:bg-black transition-all flex items-center justify-center gap-3 active:scale-95 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                            >
                                {loading ? 'VERIFYING...' : 'AUTHORIZE ACCESS'}
                                <ArrowRight size={20} />
                            </button>
                        </form>

                        <div className="mt-8 text-center pt-8 border-t dark:border-gray-700">
                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-relaxed">
                                Encrypted Session Protocol<br />
                                Node.js Secure Backend v2.4
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
