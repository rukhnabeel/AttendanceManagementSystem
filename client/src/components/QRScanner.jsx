import { useEffect } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { QrCode, X } from 'lucide-react';

const QRScanner = ({ onScan, onClose }) => {
    useEffect(() => {
        const scanner = new Html5QrcodeScanner(
            "qr-reader",
            {
                fps: 10,
                qrbox: { width: 250, height: 250 },
                aspectRatio: 1.0
            },
            false
        );

        scanner.render(
            (decodedText) => {
                try {
                    const data = JSON.parse(decodedText);
                    onScan(data);
                    scanner.clear();
                } catch {
                    onScan({ staffId: decodedText });
                    scanner.clear();
                }
            },
            () => {
                // ignore errors
            }
        );

        return () => {
            scanner.clear().catch(e => console.error(e));
        };
    }, [onScan]);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <div className="relative w-full max-w-md bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="p-4 bg-gray-800 flex items-center justify-between text-white">
                    <div className="flex items-center gap-2">
                        <QrCode className="h-5 w-5" />
                        <h3 className="font-bold">QR Scanner</h3>
                    </div>
                    <button onClick={onClose} className="p-1 hover:bg-gray-700 rounded transition-colors">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="p-6">
                    <div id="qr-reader" className="overflow-hidden rounded border border-gray-200" />
                    <p className="mt-4 text-center text-sm text-gray-500">
                        Hold QR code in front of the camera
                    </p>
                </div>
            </div>
        </div>
    );
};

export default QRScanner;
