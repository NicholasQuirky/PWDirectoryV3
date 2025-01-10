import { useState, useEffect } from "react";
import { Link, useForm } from "@inertiajs/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faBookmark,
    faHeart,
    faBell,
} from "@fortawesome/free-regular-svg-icons";
import { faHome, faGlobe } from "@fortawesome/free-solid-svg-icons";
import "css/UserAuthenticatedLayout.css";
import i18n from "../i18n";
import { useTranslation } from "react-i18next";
import axios from "axios";

export default function Authenticated({ user, header, children }) {
    const { t } = useTranslation();
    const [showingNavigationDropdown, setShowingNavigationDropdown] =
        useState(false);
    const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);

    // Notification dropdown state
    const [showNotifications, setShowNotifications] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [dropdownVisible, setDropdownVisible] = useState(false);
    const userProfilePhotoUrl = "path/to/profile/photo.jpg"; // Replace with the actual URL

    // Fetch notifications when the component mounts
    useEffect(() => {
        const savedLanguage = localStorage.getItem("language");
        if (savedLanguage) {
            i18n.changeLanguage(savedLanguage);
        }

        // Fetch notifications for the logged-in user
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

    const toggleLanguage = (locale) => {
        i18n.changeLanguage(locale);
        localStorage.setItem("language", locale);
        setShowLanguageDropdown(false);
    };

    const toggleNotificationDropdown = () => {
        setShowNotifications((prev) => !prev);
        if (!showNotifications) {
            markNotificationsAsRead();
        }
    };

    const removeNotification = async (id) => {
        try {
            await axios.delete(`/notifications/${id}`); // Soft delete the notification
            setNotifications((prevNotifications) =>
                prevNotifications.filter(
                    (notification) => notification.id !== id
                )
            );
        } catch (error) {
            console.error("Error removing notification:", error);
        }
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

    const toggleDropdown = () => {
        setDropdownVisible((prev) => !prev);
    };

    const profilePhotoUrl = user.profile_photo
        ? `/profile-photos/${user.profile_photo.split("/").pop()}`
        : "";

    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const { post } = useForm();

    const handleLogout = (e) => {
        e.preventDefault();
        setIsLoggingOut(true);
        post(route("logout"));
    };

    return (
        <div className="min-h-screen">
            <nav className="navbar">
                <div className="navbar-content">
                    <Link href="/userhome" className="navbar-title">
                        <FontAwesomeIcon
                            icon={faHome}
                            style={{ marginRight: "5px" }}
                        />
                        PWDirectory v3 - Ramp IT Up!
                    </Link>
                </div>
                <div className="icon-buttons">
                    {/* Language Dropdown */}
                    <button
                        className="icon-button"
                        onClick={() =>
                            setShowLanguageDropdown(!showLanguageDropdown)
                        }
                    >
                        <FontAwesomeIcon icon={faGlobe} />
                    </button>
                    {showLanguageDropdown && (
                        <div className="language-dropdown">
                            <div className="dropdown-header">
                                <strong>{t("choose_a_language")}</strong>
                            </div>
                            <button
                                onClick={() => toggleLanguage("en")}
                                className="dropdown-item"
                            >
                                English
                            </button>
                            <button
                                onClick={() => toggleLanguage("fil")}
                                className="dropdown-item"
                            >
                                Filipino
                            </button>
                        </div>
                    )}

                    {/* Notification Dropdown */}
                    <button
                        className="icon-button"
                        onClick={toggleNotificationDropdown}
                    >
                        <FontAwesomeIcon icon={faBell} />
                        {notifications.some((notif) => !notif.is_read) && (
                            <span className="notification-badge">
                                {
                                    notifications.filter(
                                        (notif) => !notif.is_read
                                    ).length
                                }
                            </span>
                        )}
                    </button>
                    {showNotifications && (
                        <div className="notification-dropdown">
                            {/* Notifications List */}
                            <div className="notification-list">
                                {notifications.filter(
                                    (notification) => notification.admin_message
                                ).length > 0 ? (
                                    notifications
                                        .filter(
                                            (notification) =>
                                                notification.admin_message
                                        )
                                        .map((notification) => (
                                            <div
                                                className={`notification-item ${
                                                    notification.is_read
                                                        ? "read"
                                                        : "unread"
                                                }`}
                                                key={notification.id}
                                            >
                                                <p>
                                                    {notification.admin_message}
                                                </p>
                                                <span>
                                                    {new Date(
                                                        notification.created_at
                                                    ).toLocaleString()}
                                                </span>
                                                {/* Close Button */}
                                                <button
                                                    className="notification-close"
                                                    onClick={() =>
                                                        removeNotification(
                                                            notification.id
                                                        )
                                                    }
                                                >
                                                    &times;
                                                </button>
                                            </div>
                                        ))
                                ) : (
                                    <div className="notification-item">
                                        <p>No notifications</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    <Link href="/favorites" className="icon-button">
                        <FontAwesomeIcon icon={faHeart} />
                    </Link>
                    <Link href="/bookmarks" className="icon-button">
                        <FontAwesomeIcon icon={faBookmark} />
                    </Link>

                    {/* Options Dropdown */}
                    <div className="dropdown-nav">
                        <button
                            className="dropdown-toggle"
                            onClick={toggleDropdown}
                        >
                            <img
                                src={profilePhotoUrl}
                                className="profile-photo"
                            />

                            {user.username}
                        </button>
                        {dropdownVisible && (
                            <div className="dropdown-nav-menu">
                                <Link
                                    href="/profile"
                                    className="dropdown-nav-item"
                                >
                                    {" "}
                                    Profile Settings
                                </Link>
                                <Link
                                    href="/userhome"
                                    className="dropdown-nav-item"
                                >
                                    {" "}
                                    Homepage
                                </Link>
                                <Link
                                    href="/favorites"
                                    className="dropdown-nav-item"
                                >
                                    {" "}
                                    Favorites
                                </Link>
                                <Link
                                    href="/bookmarks"
                                    className="dropdown-nav-item"
                                >
                                    {" "}
                                    Bookmark
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    disabled={isLoggingOut}
                                    className="dropdown-nav-item-logout"
                                >
                                    {isLoggingOut
                                        ? t("logging_out")
                                        : t("logout")}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </nav>

            {/* Header */}
            {header && (
                <header className="header">
                    <div className="header-content">{header}</div>
                </header>
            )}

            {/* Main Content */}
            <main>{children}</main>
        </div>
    );
}
