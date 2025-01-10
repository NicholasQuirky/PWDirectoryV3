import React, { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AdminAuthenticatedLayout';
import { Head } from '@inertiajs/react';
import axios from 'axios'; // Ensure axios is imported
import 'css/AdminDashboard.css'; // Ensure this path is correct

export default function AdminDashboard({ auth }) {
    const [activeUsersCount, setActiveUsersCount] = useState(0);
    const [loading, setLoading] = useState(true); // Add loading state
    const [error, setError] = useState(null); // Add error state

    useEffect(() => {
        axios
            .get('/admin/active-users-count')
            .then((response) => {
                setActiveUsersCount(response.data.count);
                setLoading(false); // Set loading to false when data is fetched
            })
            .catch((error) => {
                console.error('Error fetching active users count:', error);
                setError('Unable to fetch active users count.'); // Set error message
                setLoading(false); // Set loading to false even if error occurs
            });
    }, []);

    return (
        <AuthenticatedLayout>
            <Head title="Admin Dashboard" />

            <div className="main-content">
                <div className="dashboard-header">
                    {/* Logo Placeholder */}
                    <div className="logo-placeholder">
                        <img
                            src="/images/image.png"
                            alt="Logo"
                            className="logo"
                        />
                    </div>

                    <h1>Welcome, Ramp IT Up Admin!</h1>
                </div>

                <div className="dashboard-cards">
                    <div className="card">
                        <h2>Total Active Users</h2>
                        {loading ? (
                            <p>Loading...</p> // Show loading state
                        ) : error ? (
                            <p className="error">{error}</p> // Show error if any
                        ) : (
                            <p className="count">{activeUsersCount}</p> // Show the active users count
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
