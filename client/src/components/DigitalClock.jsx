import { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Clock as ClockIcon } from 'lucide-react';
import { format } from 'date-fns';

const DigitalClock = () => {
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="flex flex-col items-center select-none">
            {/* Small Size Date Badge */}
            <div className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl shadow-lg text-white font-black text-[10px] uppercase tracking-[0.2em] mb-6 border-b-2 border-indigo-900/50 transform hover:scale-105 transition-transform cursor-default">
                <CalendarIcon size={14} className="animate-pulse" />
                <span>{format(time, 'EEEE, MMMM do, yyyy')}</span>
            </div>

            {/* Medium Size Hero Clock */}
            <div className="flex items-center gap-4">
                <div className="flex items-center bg-white dark:bg-gray-900 px-8 py-4 rounded-[32px] shadow-xl border-2 border-indigo-50 dark:border-indigo-900/20 group hover:border-indigo-500 transition-all duration-500">
                    {/* Hours : Minutes - Reduced from text-9xl to text-6xl */}
                    <span className="text-6xl sm:text-7xl font-black tracking-tighter bg-gradient-to-br from-gray-900 via-indigo-900 to-indigo-600 dark:from-white dark:via-indigo-100 dark:to-indigo-400 bg-clip-text text-transparent drop-shadow-sm font-mono leading-none">
                        {format(time, 'HH:mm')}
                    </span>

                    {/* Seconds & Label Stack - Reduced size */}
                    <div className="ml-4 flex flex-col items-center justify-center border-l-2 border-indigo-100 dark:border-indigo-900/40 pl-4 h-14 sm:h-16">
                        <span className="text-2xl sm:text-3xl font-black text-indigo-600 dark:text-indigo-400 font-mono tabular-nums leading-none mb-1">
                            {format(time, 'ss')}
                        </span>
                        <div className="flex items-center gap-1 px-2 py-0.5 bg-indigo-50 dark:bg-indigo-900/40 rounded-md">
                            <ClockIcon size={10} className="text-indigo-500" />
                            <span className="text-[8px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-[0.2em] leading-none">
                                HRS
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DigitalClock;
