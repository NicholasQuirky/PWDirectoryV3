import React, { useEffect, useState } from 'react';
import axios from 'axios';
import AuthenticatedLayout from '@/Layouts/AdminAuthenticatedLayout';
import { Head } from '@inertiajs/react';
import 'css/ManageUserAccounts.css';
import DangerButton from '@/Components/DangerButton';
import Modal from '@/Components/Modal';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';

export default function ManageUserAccount() {
    const [users, setUsers] = useState([]);
    const [confirmingUserDeletion, setConfirmingUserDeletion] = useState(false);
    const [userIdToDelete, setUserIdToDelete] = useState(null);
    const [password, setPassword] = useState('');
    const [errors, setErrors] = useState({});
    const [processing, setProcessing] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);
    const [usersPerPage, setUsersPerPage] = useState(10); // Default users per page for larger screens

    useEffect(() => {
        // Adjust number of users per page based on screen size
        const handleResize = () => {
            if (window.innerWidth <= 599) {
                setUsersPerPage(2); // 2 users per page for mobile
            } else {
                setUsersPerPage(10); // Default 10 users per page for larger screens
            }
        };

        handleResize(); // Set initial users per page based on current window size

        // Add resize event listener to handle screen resizing
        window.addEventListener('resize', handleResize);

        // Clean up the event listener on component unmount
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        axios.get(`/users?page=${currentPage}&per_page=${usersPerPage}`)
            .then(response => {
                setUsers(response.data.data); // Only set the users data
                setLastPage(response.data.last_page); // Total number of pages
            })
            .catch(error => {
                console.error('Error fetching users:', error);
            });
    }, [currentPage, usersPerPage]);

    const confirmUserDeletion = (id) => {
        setUserIdToDelete(id);
        setConfirmingUserDeletion(true);
    };

    const deleteUser = (e) => {
        e.preventDefault();
        setProcessing(true);

        axios.delete(`/users/${userIdToDelete}`, { data: { password } })
            .then(() => {
                setUsers(users.filter(user => user.id !== userIdToDelete));
                closeModal();
            })
            .catch(error => {
                if (error.response && error.response.status === 422) {
                    setErrors(error.response.data.errors);
                } else {
                    console.error('Error deleting user:', error);
                }
            })
            .finally(() => {
                setProcessing(false);
            });
    };

    const closeModal = () => {
        setConfirmingUserDeletion(false);
        setUserIdToDelete(null);
        setPassword('');
        setErrors({});
    };

    const goToNextPage = () => {
        if (currentPage < lastPage) setCurrentPage(currentPage + 1);
    };

    const goToPreviousPage = () => {
        if (currentPage > 1) setCurrentPage(currentPage - 1);
    };

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    return (
        <AuthenticatedLayout>
            <Head title="Manage User Accounts" />

            <div className="main-content">
                <div className="manage-users-container">
                    <h1>Manage User Accounts</h1>
                    <table>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Username</th>
                                <th>Email</th>
                                <th>Profile Picture</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(user => (
                                <tr key={user.id}>
                                    <td>{user.id}</td>
                                    <td>{user.username}</td>
                                    <td>{user.email}</td>
                                    <td>
                                        <div className="profile-picture">
                                            {user.profile_photo ? (
                                                <img
                                                    src={`/profile-photos/${user.profile_photo.split('/').pop()}`}
                                                    alt={`${user.username}'s Profile`}
                                                    className="prof-photo-placeholder"
                                                />
                                            ) : (
                                                <span></span>
                                            )}
                                        </div>
                                    </td>
                                    <td>
                                        <button className="actions-button" onClick={() => confirmUserDeletion(user.id)}>
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div className="d-flex justify-content-between align-items-center mt-3">
                        <button
                            className="btn btn-secondary"
                            onClick={goToPreviousPage}
                            disabled={currentPage === 1}
                        >
                            Previous
                        </button>

                        <div className="pagination-container">
                            {Array.from({ length: lastPage }, (_, index) => index + 1).map(pageNumber => (
                                <button
                                    key={pageNumber}
                                    className={`pagination-btn ${currentPage === pageNumber ? 'active' : ''}`}
                                    onClick={() => handlePageChange(pageNumber)}
                                >
                                    {pageNumber}
                                </button>
                            ))}
                        </div>

                        <button
                            className="btn btn-secondary"
                            onClick={goToNextPage}
                            disabled={currentPage === lastPage}
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>

            <Modal show={confirmingUserDeletion} onClose={closeModal}>
                <form onSubmit={deleteUser} className="p-6">
                    <h2 className="text-lg font-medium text-gray-900">
                        Are you sure you want to delete this account?
                    </h2>
                    <p className="mt-1 text-sm text-gray-600">
                        Please enter your password to confirm you would like to delete the account.
                    </p>

                    <div className="mt-6">
                        <InputLabel htmlFor="password" value="Password" className="sr-only" />

                        <TextInput
                            id="password"
                            type="password"
                            name="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="mt-1 block w-3/4"
                            placeholder="Password"
                        />

                        <InputError message={errors.password} className="mt-2" />
                    </div>

                    <div className="mt-6 flex justify-end">
                        <DangerButton type="submit" disabled={processing}>
                            {processing ? 'Deleting...' : 'Delete Account'}
                        </DangerButton>
                    </div>
                </form>
            </Modal>
        </AuthenticatedLayout>
    );
}
