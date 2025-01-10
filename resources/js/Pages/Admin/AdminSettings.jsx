import AuthenticatedLayout from '@/Layouts/AdminAuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import UpdatePasswordForm from '@/Pages/Profile/Partials/UpdatePasswordForm'; // Import the UpdatePasswordForm component
import 'css/AdminSettings.css'; // CSS file for settings

export default function AdminSettings({ auth }) {
    const { post } = useForm();

    const handleLogout = () => {
        post(route('logout'));
    };

    return (
        <AuthenticatedLayout>
            <Head title="Admin Settings" />



                <div className="main-content">
                <h2 className="page-title">Admin Settings</h2>
                    <UpdatePasswordForm className="password-form" /> {/* Call the UpdatePasswordForm component */}
                    
                    {/* Logout button */}
                    <div className="logout-container">
                        <button onClick={handleLogout} className="logout-button">Logout</button>
                    </div>
                </div>
        </AuthenticatedLayout>
    );
}