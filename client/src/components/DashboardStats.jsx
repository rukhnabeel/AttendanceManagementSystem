import React from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell
} from 'recharts';
import { format, subDays, parseISO } from 'date-fns';

const DashboardStats = ({ logs, staff }) => {
    // 1. Calculate On-Time vs Late (Today)
    const today = new Date().toISOString().split('T')[0];
    const todaysLogs = logs.filter(l => l.date === today && l.type === 'In');

    const lateCount = todaysLogs.filter(l => l.status === 'Late').length;
    const onTimeCount = todaysLogs.filter(l => l.status === 'Present').length;

    // Pie Chart Data
    const pieData = [
        { name: 'On Time', value: onTimeCount },
        { name: 'Late', value: lateCount },
    ];
    const COLORS = ['#22c55e', '#f59e0b']; // Green, Amber

    // 2. Weekly Attendance Trend
    const last7Days = Array.from({ length: 7 }, (_, i) => {
        const d = subDays(new Date(), 6 - i);
        return format(d, 'yyyy-MM-dd');
    });

    const barData = last7Days.map(date => {
        const dayLogs = logs.filter(l => l.date === date && l.type === 'In');
        return {
            name: format(parseISO(date), 'EEE'),
            Present: dayLogs.length,
            Absent: Math.max(0, staff.length - dayLogs.length)
        };
    });

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Attendance Trend */}
            <div className="card p-6 bg-white">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Weekly Attendance Trend</h3>
                <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={barData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis
                                dataKey="name"
                                tick={{ fill: '#6b7280', fontSize: 12 }}
                            />
                            <YAxis
                                tick={{ fill: '#6b7280', fontSize: 12 }}
                            />
                            <Tooltip
                                contentStyle={{ borderRadius: '4px', border: '1px solid #e5e7eb' }}
                            />
                            <Bar dataKey="Present" fill="#2563eb" barSize={30} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Today's Status */}
            <div className="card p-6 bg-white">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Today's Punctuality</h3>
                <div className="h-64 flex items-center justify-center relative">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={pieData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {pieData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip contentStyle={{ borderRadius: '4px', border: '1px solid #e5e7eb' }} />
                            <Legend verticalAlign="bottom" height={36} />
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <span className="text-2xl font-bold text-gray-800">{onTimeCount + lateCount}</span>
                        <span className="text-[10px] font-bold text-gray-400 uppercase">Entries</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardStats;
