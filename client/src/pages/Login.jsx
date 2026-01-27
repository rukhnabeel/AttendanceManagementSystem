import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, ShieldCheck, Mail, ArrowRight, Eye, EyeOff } from 'lucide-react';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = (e) => {
        e.preventDefault();
        // UPDATED SECURE CREDENTIALS
        if (email === 'admin@tvh.com' && password === 'tvh@2026') {
            localStorage.setItem('isAdminAuthenticated', 'true');
            navigate('/admin');
        } else {
            setError('Invalid credentials. Access denied.');
        }
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center py-10 px-4 animate-fade">
            <div className="w-full max-w-lg">
                <div className="card bg-white dark:bg-gray-800 p-12 border-t-8 border-t-indigo-600 shadow-3xl rounded-[3rem] relative overflow-hidden">
                    {/* Decorative Background Element */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 dark:bg-indigo-900/20 rounded-bl-[4rem] -z-0 opacity-50" />

                    <div className="relative z-10">
                        {/* Logo/Icon */}
                        <div className="flex justify-center mb-8">
                            <div className="h-20 w-20 bg-indigo-600 rounded-3xl flex items-center justify-center text-white shadow-2xl shadow-indigo-600/30 rotate-3">
                                <ShieldCheck size={40} strokeWidth={2.5} />
                            </div>
                        </div>

                        {/* Title */}
                        <div className="text-center mb-10">
                            <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">Admin <span className="text-indigo-600">Secure</span> Access</h1>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mt-2 italic">Authorized Personnel Only</p>
                        </div>

                        {/* Login Form */}
                        <form onSubmit={handleLogin} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-label ml-2">Email Address</label>
                                <div className="relative group">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                                    <input
                                        required
                                        type="email"
                                        placeholder="admin@tvh.com"
                                        className="input-field pl-12 bg-gray-50 dark:bg-gray-900 border-2 border-transparent focus:border-indigo-500 rounded-2xl"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-label ml-2">Secure Passcode</label>
                                <div className="relative group">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                                    <input
                                        required
                                        type={showPassword ? "text" : "password"}
                                        placeholder="••••••••"
                                        className="input-field pl-12 pr-12 bg-gray-50 dark:bg-gray-900 border-2 border-transparent focus:border-indigo-500 rounded-2xl"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
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
                                className="w-full py-5 bg-indigo-600 text-white rounded-3xl font-black text-lg shadow-xl shadow-indigo-600/20 hover:scale-[1.02] hover:bg-black transition-all flex items-center justify-center gap-3 active:scale-95"
                            >
                                AUTHORIZE ACCESS
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
