import { useState, useEffect } from 'react';
import { Camera, MapPin, AlertCircle, CheckCircle, Shield } from 'lucide-react';

const PermissionsHandler = ({ onPermissionsGranted }) => {
    const [cameraPermission, setCameraPermission] = useState('prompt'); // 'prompt', 'granted', 'denied'
    const [locationPermission, setLocationPermission] = useState('prompt');
    const [isRequesting, setIsRequesting] = useState(false);
    const [error, setError] = useState('');

    // Check existing permissions on mount
    useEffect(() => {
        checkPermissions();
    }, []);

    const checkPermissions = async () => {
        try {
            // Check camera permission
            if (navigator.permissions) {
                const cameraStatus = await navigator.permissions.query({ name: 'camera' });
                setCameraPermission(cameraStatus.state);

                // Check location permission
                const locationStatus = await navigator.permissions.query({ name: 'geolocation' });
                setLocationPermission(locationStatus.state);

                // If both granted, auto-proceed
                if (cameraStatus.state === 'granted' && locationStatus.state === 'granted') {
                    onPermissionsGranted?.();
                }
            }
        } catch (err) {
            console.log('Permissions API not fully supported, will request directly');
        }
    };

    const requestCameraPermission = async () => {
        setIsRequesting(true);
        setError('');

        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'user' },
                audio: false
            });

            // Stop the stream immediately, we just needed permission
            stream.getTracks().forEach(track => track.stop());

            setCameraPermission('granted');
            setError('');
            return true;
        } catch (err) {
            console.error('Camera permission error:', err);
            setCameraPermission('denied');
            setError('Camera access denied. Please allow camera access in your browser settings.');
            return false;
        } finally {
            setIsRequesting(false);
        }
    };

    const requestLocationPermission = async () => {
        setIsRequesting(true);
        setError('');

        try {
            await new Promise((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        setLocationPermission('granted');
                        resolve(position);
                    },
                    (error) => {
                        setLocationPermission('denied');
                        reject(error);
                    },
                    {
                        enableHighAccuracy: true,
                        timeout: 10000,
                        maximumAge: 0
                    }
                );
            });

            setError('');
            return true;
        } catch (err) {
            console.error('Location permission error:', err);
            setLocationPermission('denied');
            setError('Location access denied. Please allow location access in your browser settings.');
            return false;
        } finally {
            setIsRequesting(false);
        }
    };

    const requestAllPermissions = async () => {
        setIsRequesting(true);
        setError('');

        // Request camera first
        const cameraGranted = await requestCameraPermission();

        if (!cameraGranted) {
            setIsRequesting(false);
            return;
        }

        // Then request location
        const locationGranted = await requestLocationPermission();

        setIsRequesting(false);

        // If both granted, notify parent
        if (cameraGranted && locationGranted) {
            onPermissionsGranted?.();
        }
    };

    const getPermissionIcon = (status) => {
        switch (status) {
            case 'granted':
                return <CheckCircle className="text-green-500" size={20} />;
            case 'denied':
                return <AlertCircle className="text-red-500" size={20} />;
            default:
                return <Shield className="text-gray-400" size={20} />;
        }
    };

    const getPermissionText = (status) => {
        switch (status) {
            case 'granted':
                return 'Granted';
            case 'denied':
                return 'Denied';
            default:
                return 'Not Requested';
        }
    };

    const allPermissionsGranted = cameraPermission === 'granted' && locationPermission === 'granted';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] shadow-3xl w-full max-w-md overflow-hidden animate-scale">
                {/* Header */}
                <div className="px-8 py-6 border-b dark:border-gray-700 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20">
                    <div className="flex items-center justify-center mb-4">
                        <div className="h-16 w-16 bg-indigo-600 rounded-3xl flex items-center justify-center text-white shadow-xl shadow-indigo-600/30">
                            <Shield size={32} />
                        </div>
                    </div>
                    <h3 className="text-2xl font-black text-gray-900 dark:text-white text-center tracking-tight">
                        Permissions Required
                    </h3>
                    <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest text-center mt-2">
                        For Attendance Verification
                    </p>
                </div>

                {/* Content */}
                <div className="p-8 space-y-6">
                    <p className="text-sm text-gray-600 dark:text-gray-400 text-center leading-relaxed">
                        To mark your attendance, we need access to your camera and location. This ensures secure and verified attendance records.
                    </p>

                    {/* Permission Status Cards */}
                    <div className="space-y-3">
                        {/* Camera Permission */}
                        <div className={`p-4 rounded-2xl border-2 transition-all ${cameraPermission === 'granted'
                                ? 'border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-800'
                                : cameraPermission === 'denied'
                                    ? 'border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800'
                                    : 'border-gray-200 bg-gray-50 dark:bg-gray-900 dark:border-gray-700'
                            }`}>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-xl bg-white dark:bg-gray-800 flex items-center justify-center shadow-sm">
                                        <Camera size={20} className="text-indigo-600" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-sm text-gray-900 dark:text-white">Camera Access</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">For photo verification</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    {getPermissionIcon(cameraPermission)}
                                    <span className="text-xs font-bold">{getPermissionText(cameraPermission)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Location Permission */}
                        <div className={`p-4 rounded-2xl border-2 transition-all ${locationPermission === 'granted'
                                ? 'border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-800'
                                : locationPermission === 'denied'
                                    ? 'border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800'
                                    : 'border-gray-200 bg-gray-50 dark:bg-gray-900 dark:border-gray-700'
                            }`}>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-xl bg-white dark:bg-gray-800 flex items-center justify-center shadow-sm">
                                        <MapPin size={20} className="text-indigo-600" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-sm text-gray-900 dark:text-white">Location Access</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">For attendance tracking</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    {getPermissionIcon(locationPermission)}
                                    <span className="text-xs font-bold">{getPermissionText(locationPermission)}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                            <div className="flex items-start gap-3">
                                <AlertCircle size={18} className="text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                                <p className="text-xs font-bold text-red-700 dark:text-red-400 leading-relaxed">{error}</p>
                            </div>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="space-y-3 pt-2">
                        {!allPermissionsGranted && (
                            <button
                                onClick={requestAllPermissions}
                                disabled={isRequesting}
                                className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-sm shadow-xl shadow-indigo-600/20 hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                            >
                                {isRequesting ? (
                                    <>
                                        <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                                        Requesting Permissions...
                                    </>
                                ) : (
                                    <>
                                        <Shield size={18} />
                                        GRANT PERMISSIONS
                                    </>
                                )}
                            </button>
                        )}

                        {allPermissionsGranted && (
                            <button
                                onClick={() => onPermissionsGranted?.()}
                                className="w-full py-4 bg-green-600 text-white rounded-2xl font-black text-sm shadow-xl shadow-green-600/20 hover:bg-green-700 transition-all flex items-center justify-center gap-2"
                            >
                                <CheckCircle size={18} />
                                CONTINUE TO ATTENDANCE
                            </button>
                        )}
                    </div>

                    {/* Privacy Note */}
                    <div className="pt-4 border-t dark:border-gray-700">
                        <p className="text-[10px] text-gray-400 text-center leading-relaxed">
                            🔒 Your privacy is protected. Camera and location data are used only for attendance verification and are not stored permanently.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PermissionsHandler;
