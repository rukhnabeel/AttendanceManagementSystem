import { useRef, useCallback, useState } from 'react';
import Webcam from 'react-webcam';
import { Camera, RefreshCw, CheckCircle2, User, Scan } from 'lucide-react';

const CameraOverlay = ({ onCapture, staffName }) => {
    const webcamRef = useRef(null);
    const [capturedImg, setCapturedImg] = useState(null);

    const capture = useCallback(() => {
        const imageSrc = webcamRef.current.getScreenshot();
        setCapturedImg(imageSrc);
    }, [webcamRef]);

    const retake = () => {
        setCapturedImg(null);
    };

    const confirm = () => {
        onCapture(capturedImg);
    };

    const videoConstraints = {
        width: 1280,
        height: 720,
        facingMode: "user"
    };

    return (
        <div className="flex flex-col items-center w-full">
            <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-gray-900 group">
                {!capturedImg ? (
                    <>
                        <Webcam
                            audio={false}
                            ref={webcamRef}
                            screenshotFormat="image/jpeg"
                            videoConstraints={videoConstraints}
                            className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                        />
                        {/* Viewfinder Overlay */}
                        <div className="absolute inset-0 border-[40px] border-black/40 pointer-events-none" />
                        <div className="absolute inset-x-[15%] inset-y-[10%] border-2 border-dashed border-white/30 rounded-full pointer-events-none flex items-center justify-center">
                            <div className="w-12 h-12 border-2 border-white/50 rounded-full animate-ping" />
                        </div>

                        <div className="absolute top-6 left-6 flex items-center gap-2 bg-red-600 px-3 py-1 rounded-md">
                            <div className="h-2 w-2 bg-white rounded-full animate-pulse" />
                            <span className="text-[10px] font-black text-white uppercase tracking-widest">Live Feed</span>
                        </div>

                        <div className="absolute bottom-6 inset-x-0 flex justify-center">
                            <button
                                onClick={capture}
                                className="h-16 w-16 bg-white rounded-full border-4 border-gray-300 shadow-xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all group"
                            >
                                <div className="h-12 w-12 bg-white rounded-full border-2 border-gray-900 group-hover:bg-gray-100" />
                            </button>
                        </div>
                    </>
                ) : (
                    <div className="relative w-full h-full">
                        <img src={capturedImg} alt="Selfie" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-green-500/10 pointer-events-none" />

                        <div className="absolute top-6 right-6 flex items-center gap-2 bg-green-500 px-3 py-1 rounded-md shadow-lg">
                            <CheckCircle2 size={12} className="text-white" />
                            <span className="text-[10px] font-black text-white uppercase tracking-widest">Capture OK</span>
                        </div>
                    </div>
                )}
            </div>

            <div className="w-full mt-6">
                {capturedImg && (
                    <div className="flex gap-3 animate-fade">
                        <button
                            onClick={retake}
                            className="flex-1 py-4 border border-gray-200 dark:border-gray-700 rounded-xl font-bold text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center justify-center gap-2 transition-all"
                        >
                            <RefreshCw className="h-4 w-4" />
                            RETAKE
                        </button>
                        <button
                            onClick={confirm}
                            className="flex-1 py-4 bg-green-600 text-white rounded-xl font-extrabold flex items-center justify-center gap-2 hover:bg-green-700 shadow-lg shadow-green-100 dark:shadow-none translate-y-0 active:translate-y-1 transition-all"
                        >
                            <CheckCircle2 className="h-5 w-5" />
                            USE THIS PHOTO
                        </button>
                    </div>
                )}

                {!capturedImg && (
                    <div className="flex items-center justify-center gap-4 text-gray-400 font-bold text-xs uppercase tracking-widest bg-gray-50 dark:bg-gray-900 py-4 rounded-xl border border-dashed border-gray-200 dark:border-gray-700">
                        <Scan size={14} className="text-blue-500" />
                        <span>Center your face in the oval and capture</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CameraOverlay;
