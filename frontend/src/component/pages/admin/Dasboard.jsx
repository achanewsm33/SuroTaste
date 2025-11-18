import { useState, useEffect } from 'react';

export default function Dashboard() {
    const [stats, setStats] = useState({
        totalBusinesses: 0,
        totalProducts: 0,
        activeUsers: 0
    });

    useEffect(() => {
        setStats({
            totalBusinesses: 5,
            totalProducts: 23,
            activeUsers: 12
        });
    }, []);

    return (
        // Pastikan wrapper ini tidak melebihi parent; gunakan w-full & box-border
        <div className="space-y-6 w-full content- box-border min-h-0">
            {/* Container responsive agar mengikuti padding dari parent (overview) */}
            <div className="w-full max-w-[925px] px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center">
                    {/* break-words agar judul tidak memaksa overflow */}
                    <h1 className="text-3xl font-bold text-gray-900 break-words">Dashboard Overview</h1>
                    <div className="text-sm text-gray-500">
                        Welcome back, Admin!
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
                    <div className="bg-white p-6 rounded-lg shadow-md w-full">
                        <div className="flex items-center">
                            <div className="p-3 bg-blue-100 rounded-lg">
                                <Store className="w-6 h-6 text-blue-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Total Businesses</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.totalBusinesses}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-md w-full">
                        <div className="flex items-center">
                            <div className="p-3 bg-green-100 rounded-lg">
                                <Package className="w-6 h-6 text-green-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Total Products</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.totalProducts}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-md w-full">
                        <div className="flex items-center">
                            <div className="p-3 bg-purple-100 rounded-lg">
                                <Users className="w-6 h-6 text-purple-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Active Users</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.activeUsers}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="mt-6 bg-white rounded-lg shadow-md p-6 w-full">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Activity</h2>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded w-full">
                            <div>
                                <p className="font-medium">New business registered</p>
                                <p className="text-sm text-gray-500">Waroeng Sederhana</p>
                            </div>
                            <span className="text-sm text-gray-500">2 hours ago</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded w-full">
                            <div>
                                <p className="font-medium">New product added</p>
                                <p className="text-sm text-gray-500">Nasi Goreng Special</p>
                            </div>
                            <span className="text-sm text-gray-500">4 hours ago</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Icon components
const Store = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
);

const Package = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
);

const Users = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
    </svg>
);
