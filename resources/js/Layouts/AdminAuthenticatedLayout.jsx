import { useEffect, useState } from "react";
import { Link, usePage } from "@inertiajs/react";
import { FaBell } from "react-icons/fa";
import axios from "axios";
import "css/AdminAuthenticatedLayout.css";

export default function AdminAuthenticatedLayout({ user, header, children }) {
    const { url } = usePage();
    const [showingNavigationDropdown, setShowingNavigationDropdown] =
        useState(true);
    const [notifications, setNotifications] = useState([]); // State for notifications
    const [showNotifications, setShowNotifications] = useState(false); // Toggle dropdown

    useEffect(() => {
        const sidebarState = localStorage.getItem("sidebarVisible");
        if (sidebarState !== null) {
            setShowingNavigationDropdown(JSON.parse(sidebarState));
        }

        // Fetch notifications from backend
        const fetchNotifications = async () => {
            try {
                const response = await axios.get("/notifications");
                setNotifications(response.data);
            } catch (error) {
                if (error.response && error.response.status === 401) {
                    // Redirect to login if unauthorized
                    window.location.href = "/login";
                } else {
                    console.error("Error fetching notifications:", error);
                }
            }
        };

        fetchNotifications();
    }, []);

    const toggleSidebar = () => {
        const newState = !showingNavigationDropdown;
        setShowingNavigationDropdown(newState);
        localStorage.setItem("sidebarVisible", JSON.stringify(newState));
    };

    const markNotificationsAsRead = async () => {
        try {
            await axios.post("/notifications/mark-as-read");
            setNotifications((prev) =>
                prev.map((notif) => ({ ...notif, is_read: true }))
            );
        } catch (error) {
            console.error("Error marking notifications as read:", error);
        }
    };

    const toggleNotifications = () => {
        setShowNotifications(!showNotifications);
        if (!showNotifications) {
            markNotificationsAsRead(); // Mark as read when opening
        }
    };

    return (
        <div className="min-h-screen">
            <nav className="admin-nav">
                <div className="nav-left">
                    <button onClick={toggleSidebar} className="nav-toggle">
                        &#9776;
                    </button>
                    <Link href="/admin/dashboard" className="nav-title">
                        PWDirectory v3 - Ramp IT Up!
                    </Link>
                </div>
                <div className="nav-right">
                    {/* Notification Icon */}
                    <div
                        className="notification-icon"
                        onClick={toggleNotifications}
                    >
                        <FaBell size={24} />
                        {notifications.some((notif) => !notif.is_read) && (
                            <span className="notification-badge">
                                {
                                    notifications.filter(
                                        (notif) => !notif.is_read
                                    ).length
                                }
                            </span>
                        )}
                    </div>

                    {/* Notifications Dropdown */}
                    {showNotifications && (
                        <div className="notifications-dropdown">
                            <div className="notifications">
                                {notifications.length > 0 ? (
                                    notifications.map((notification) => (
                                        <div
                                            key={notification.id}
                                            className={`notification ${
                                                notification.is_read
                                                    ? "read"
                                                    : "unread"
                                            }`}
                                        >
                                            <p>{notification.message}</p>
                                            <span>
                                                {new Date(
                                                    notification.created_at
                                                ).toLocaleString()}
                                            </span>
                                        </div>
                                    ))
                                ) : (
                                    <p className="no-notifications">
                                        No notifications
                                    </p>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </nav>

            {header && (
                <header className="header">
                    <div className="header-content">{header}</div>
                </header>
            )}

            <div className="admin-dashboard-container">
                {showingNavigationDropdown && (
                    <div className="sidebar">
                        <ul className="menu">
                            <li
                                className={
                                    url === "/admin/dashboard" ? "active" : ""
                                }
                            >
                                <Link href="/admin/dashboard">Home</Link>
                            </li>
                            <li
                                className={
                                    url === "/admin/manage-users"
                                        ? "active"
                                        : ""
                                }
                            >
                                <Link href={route("admin.manageusers")}>
                                    Manage User Accounts
                                </Link>
                            </li>
                            <li
                                className={
                                    url === "/admin/review-feedback"
                                        ? "active"
                                        : ""
                                }
                            >
                                <Link href={route("admin.reviewFeedback")}>
                                    Review Feedback
                                </Link>
                            </li>
                        </ul>

                        <div className="settings">
                            <ul>
                                <li
                                    className={
                                        url === "/admin/settings"
                                            ? "active"
                                            : ""
                                    }
                                >
                                    <Link href={route("admin.settings")}>
                                        Settings
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href={route("logout")}
                                        method="post"
                                        className="logout-button"
                                    >
                                        Logout
                                    </Link>
                                </li>
                            </ul>
                        </div>
                    </div>
                )}

                <main
                    className={`main-content ${
                        showingNavigationDropdown ? "" : "full-width"
                    }`}
                >
                    {children}
                </main>
            </div>
        </div>
    );
}
