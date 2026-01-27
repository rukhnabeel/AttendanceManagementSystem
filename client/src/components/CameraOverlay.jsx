import { useRef, useCallback, useState, useEffect } from 'react';
import Webcam from 'react-webcam';
import { Camera, RefreshCw, CheckCircle2, User, Scan, AlertCircle } from 'lucide-react';

const CameraOverlay = ({ onCapture, staffName }) => {
    const webcamRef = useRef(null);
    const [capturedImg, setCapturedImg] = useState(null);
    const [cameraError, setCameraError] = useState(null);
    const [isMobile, setIsMobile] = useState(false);

    // Detect mobile device
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const capture = useCallback(() => {
        try {
            const imageSrc = webcamRef.current?.getScreenshot();
            if (imageSrc) {
                setCapturedImg(imageSrc);
                setCameraError(null);
            } else {
                setCameraError('Failed to capture image. Please try again.');
            }
        } catch (error) {
            setCameraError('Camera capture failed. Please check permissions.');
        }
    }, [webcamRef]);

    const retake = () => {
        setCapturedImg(null);
        setCameraError(null);
    };

    const confirm = () => {
        onCapture(capturedImg);
    };

    const handleUserMediaError = (error) => {
        console.error('Camera error:', error);
        setCameraError('Camera access denied. Please allow camera permissions in your browser settings.');
    };

    // Responsive video constraints based on device
    const videoConstraints = {
        width: { ideal: isMobile ? 720 : 1280 },
        height: { ideal: isMobile ? 1280 : 720 },
        facingMode: isMobile ? { exact: "user" } : "user",
        aspectRatio: isMobile ? 0.75 : 1.777
    };

    return (
        <div className="flex flex-col items-center w-full">
            <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-gray-900 group">
                {cameraError ? (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-gray-900 text-white p-6 text-center">
                        <AlertCircle size={48} className="text-red-500 mb-4" />
                        <p className="text-sm font-bold mb-2">Camera Error</p>
                        <p className="text-xs text-gray-400">{cameraError}</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="mt-4 px-4 py-2 bg-indigo-600 rounded-lg text-xs font-bold hover:bg-indigo-700"
                        >
                            Reload Page
                        </button>
                    </div>
                ) : !capturedImg ? (
                    <>
                        <Webcam
                            audio={false}
                            ref={webcamRef}
                            screenshotFormat="image/jpeg"
                            videoConstraints={videoConstraints}
                            onUserMediaError={handleUserMediaError}
                            className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                            mirrored={true}
                        />
                        {/* Viewfinder Overlay */}
                        <div className="absolute inset-0 border-[20px] md:border-[40px] border-black/40 pointer-events-none" />
                        <div className="absolute inset-x-[15%] inset-y-[10%] border-2 border-dashed border-white/30 rounded-full pointer-events-none flex items-center justify-center">
                            <div className="w-8 h-8 md:w-12 md:h-12 border-2 border-white/50 rounded-full animate-ping" />
                        </div>

                        <div className="absolute top-3 left-3 md:top-6 md:left-6 flex items-center gap-2 bg-red-600 px-2 py-1 md:px-3 md:py-1 rounded-md">
                            <div className="h-1.5 w-1.5 md:h-2 md:w-2 bg-white rounded-full animate-pulse" />
                            <span className="text-[9px] md:text-[10px] font-black text-white uppercase tracking-widest">Live Feed</span>
                        </div>

                        <div className="absolute bottom-4 md:bottom-6 inset-x-0 flex justify-center">
                            <button
                                onClick={capture}
                                className="h-14 w-14 md:h-16 md:w-16 bg-white rounded-full border-4 border-gray-300 shadow-xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all group"
                            >
                                <div className="h-10 w-10 md:h-12 md:w-12 bg-white rounded-full border-2 border-gray-900 group-hover:bg-gray-100" />
                            </button>
                        </div>
                    </>
                ) : (
                    <div className="relative w-full h-full">
                        <img src={capturedImg} alt="Selfie" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-green-500/10 pointer-events-none" />

                        <div className="absolute top-3 right-3 md:top-6 md:right-6 flex items-center gap-2 bg-green-500 px-2 py-1 md:px-3 md:py-1 rounded-md shadow-lg">
                            <CheckCircle2 size={12} className="text-white" />
                            <span className="text-[9px] md:text-[10px] font-black text-white uppercase tracking-widest">Capture OK</span>
                        </div>
                    </div>
                )}
            </div>

            <div className="w-full mt-4 md:mt-6">
                {capturedImg && (
                    <div className="flex gap-2 md:gap-3 animate-fade">
                        <button
                            onClick={retake}
                            className="flex-1 py-3 md:py-4 border border-gray-200 dark:border-gray-700 rounded-xl font-bold text-sm md:text-base text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center justify-center gap-2 transition-all"
                        >
                            <RefreshCw className="h-4 w-4" />
                            <span className="hidden sm:inline">RETAKE</span>
                            <span className="sm:hidden">RETRY</span>
                        </button>
                        <button
                            onClick={confirm}
                            className="flex-1 py-3 md:py-4 bg-green-600 text-white rounded-xl font-extrabold text-sm md:text-base flex items-center justify-center gap-2 hover:bg-green-700 shadow-lg shadow-green-100 dark:shadow-none translate-y-0 active:translate-y-1 transition-all"
                        >
                            <CheckCircle2 className="h-4 w-4 md:h-5 md:w-5" />
                            <span className="hidden sm:inline">USE THIS PHOTO</span>
                            <span className="sm:hidden">CONFIRM</span>
                        </button>
                    </div>
                )}

                {!capturedImg && (
                    <div className="flex items-center justify-center gap-2 md:gap-4 text-gray-400 font-bold text-[10px] md:text-xs uppercase tracking-widest bg-gray-50 dark:bg-gray-900 py-3 md:py-4 rounded-xl border border-dashed border-gray-200 dark:border-gray-700">
                        <Scan size={14} className="text-blue-500" />
                        <span className="text-center">Center your face and capture</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CameraOverlay;
