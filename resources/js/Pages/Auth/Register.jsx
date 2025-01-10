import { Head, Link, useForm } from "@inertiajs/react";
import Header from "../../Components/AuthHeader";
import { useState, useEffect } from "react";
import "css/Register.css";
import LanguageToggler from "./LanguageToggler";
import { useTranslation } from "react-i18next";

export default function Register() {
    const { t } = useTranslation();
    const { data, setData, post, processing, errors, reset } = useForm({
        name: "",
        username: "",
        email: "",
        password: "",
        password_confirmation: "",
        terms: false, // Add terms to the form data
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isRegistering, setIsRegistering] = useState(false);

    const togglePasswordVisibility = () => setShowPassword(!showPassword);
    const toggleConfirmPasswordVisibility = () =>
        setShowConfirmPassword(!showConfirmPassword);
    const [modalContent, setModalContent] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);

    const validatePassword = (password) => {
        const passwordRegex =
            /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])[A-Za-z\d!@#$%^&*(),.?":{}|<>]{8,}$/;
        return passwordRegex.test(password);
    };

    const openModal = (content) => {
        setModalContent(content);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setModalContent("");
    };

    const submit = (e) => {
        e.preventDefault();
        if (!data.terms) {
            errors.terms = t("register.terms_required"); // Error for unchecked terms checkbox
            return;
        }
        setIsRegistering(true);
        post(route("register"), {
            onFinish: () => {
                reset("password", "password_confirmation");
                setIsRegistering(false);
            },
        });
    };

    const handleFieldChange = (field, value) => {
        setData(field, value);

        // Inline validation for email and username
        if (field === "username") {
            // Check if username already exists
            checkUsername(value);
        } else if (field === "email") {
            // Check if email already exists
            checkEmail(value);
        } else if (field === "password") {
            if (value && !validatePassword(value)) {
                errors.password = t("register.password_alert");
            } else {
                delete errors.password;
            }
        } else if (field === "password_confirmation") {
            if (value !== data.password) {
                errors.password_confirmation = t("register.password_mismatch");
            } else {
                delete errors.password_confirmation;
            }
        }
    };

    const checkUsername = async (username) => {
        // You can use your backend to check if the username exists
        try {
            const response = await fetch(`/api/check-username/${username}`);
            const data = await response.json();
            if (data.exists) {
                errors.username = t("register.username_taken");
            } else {
                delete errors.username;
            }
        } catch (error) {
            console.error("Error checking username:", error);
        }
    };

    const checkEmail = async (email) => {
        // You can use your backend to check if the email exists
        try {
            const response = await fetch(`/api/check-email/${email}`);
            const data = await response.json();
            if (data.exists) {
                errors.email = t("register.email_taken");
            } else {
                delete errors.email;
            }
        } catch (error) {
            console.error("Error checking email:", error);
        }
    };

    return (
        <div className="page-container">
            <Header />
            {/* Language Toggler */}
            <div style={{ position: "absolute", top: "20px", right: "20px" }}>
                <LanguageToggler />
            </div>
            <div className="main-content">
                <div className="left-container">
                    <div className="register-container">
                        <Head title={t("register.title")} />
                        <h2 className="register-title">
                            {t("register.create_account")}
                        </h2>
                        <p className="register-subtitle">
                            {t("register.fill_details")}
                        </p>

                        <form onSubmit={submit} className="register-form">
                            {/* Name Field */}
                            <div className="relative">
                                <input
                                    placeholder={t("register.placeholder_name")}
                                    id="name"
                                    type="text"
                                    name="name"
                                    value={data.name}
                                    className="register-input"
                                    required
                                    onChange={(e) =>
                                        handleFieldChange(
                                            "name",
                                            e.target.value
                                        )
                                    }
                                />
                                {errors.name && (
                                    <p className="error">{errors.name}</p>
                                )}
                                <label
                                    className="register-label"
                                    htmlFor="name"
                                >
                                    {t("register.name")}
                                </label>
                            </div>

                            {/* Username Field */}
                            <div className="relative">
                                <input
                                    placeholder={t(
                                        "register.placeholder_username"
                                    )}
                                    id="username"
                                    type="text"
                                    name="username"
                                    value={data.username}
                                    className="register-input"
                                    required
                                    onChange={(e) =>
                                        handleFieldChange(
                                            "username",
                                            e.target.value
                                        )
                                    }
                                />
                                {errors.username && (
                                    <p className="error">{errors.username}</p>
                                )}
                                <label
                                    className="register-label"
                                    htmlFor="username"
                                >
                                    {t("register.username")}
                                </label>
                            </div>

                            {/* Email Field */}
                            <div className="relative">
                                <input
                                    placeholder={t(
                                        "register.placeholder_email"
                                    )}
                                    id="email"
                                    type="email"
                                    name="email"
                                    value={data.email}
                                    className="register-input"
                                    required
                                    onChange={(e) =>
                                        handleFieldChange(
                                            "email",
                                            e.target.value
                                        )
                                    }
                                />
                                {errors.email && (
                                    <p className="error">{errors.email}</p>
                                )}
                                <label
                                    className="register-label"
                                    htmlFor="email"
                                >
                                    {t("register.email")}
                                </label>
                            </div>

                            {/* Password Field */}
                            <div className="relative">
                                <input
                                    placeholder={t(
                                        "register.placeholder_password"
                                    )}
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    value={data.password}
                                    className="register-input"
                                    required
                                    onChange={(e) =>
                                        handleFieldChange(
                                            "password",
                                            e.target.value
                                        )
                                    }
                                />
                                <button
                                    type="button"
                                    className="password-toggle-button-1"
                                    onClick={togglePasswordVisibility}
                                >
                                    {showPassword
                                        ? t("register.hide")
                                        : t("register.show")}
                                </button>
                                {errors.password && (
                                    <p className="error">{errors.password}</p>
                                )}
                                <label
                                    className="register-label"
                                    htmlFor="password"
                                >
                                    {t("register.password")}
                                </label>
                            </div>

                            {/* Confirm Password Field */}
                            <div className="relative">
                                <input
                                    placeholder={t(
                                        "register.placeholder_confirm_password"
                                    )}
                                    id="password_confirmation"
                                    type={
                                        showConfirmPassword
                                            ? "text"
                                            : "password"
                                    }
                                    name="password_confirmation"
                                    value={data.password_confirmation}
                                    className="register-input"
                                    required
                                    onChange={(e) =>
                                        handleFieldChange(
                                            "password_confirmation",
                                            e.target.value
                                        )
                                    }
                                />
                                <button
                                    type="button"
                                    className="password-toggle-button"
                                    onClick={toggleConfirmPasswordVisibility}
                                >
                                    {showConfirmPassword
                                        ? t("register.hide")
                                        : t("register.show")}
                                </button>
                                {errors.password_confirmation && (
                                    <p className="error">
                                        {errors.password_confirmation}
                                    </p>
                                )}
                                <label
                                    className="register-label"
                                    htmlFor="password_confirmation"
                                >
                                    {t("register.confirm_password")}
                                </label>
                            </div>

                            {/* Terms and Conditions Checkbox */}
                            <div className="relative terms-container">
                                <input
                                    id="terms"
                                    type="checkbox"
                                    name="terms"
                                    className="terms-checkbox"
                                    required
                                    onChange={(e) =>
                                        setData("terms", e.target.checked)
                                    }
                                />
                                <label htmlFor="terms" className="terms-label">
                                    {t("register.agree_terms")}{" "}
                                    <Link
                                        href={route("terms")}
                                        className="underline link"
                                    >
                                        {t("register.terms_and_conditions")}
                                    </Link>{" "}
                                    {t("and")}{" "}
                                    <Link
                                        href={route("data-privacy")}
                                        className="underline link"
                                    >
                                        {t("register.data_privacy")}
                                    </Link>
                                </label>
                                {errors.terms && (
                                    <p className="error">{errors.terms}</p>
                                )}
                            </div>

                            <div className="register-disclaimer-container">
                                <span className="register-disclaimer">
                                    {t("register.by_clicking_register")}
                                </span>
                            </div>

                            {/* Register Button */}
                            <div className="flex flex-col items-center justify-center mt-4">
                                <button
                                    className="register-button"
                                    disabled={isRegistering || processing}
                                >
                                    {isRegistering
                                        ? t("register.registering")
                                        : t("register.register")}
                                </button>

                                <div className="register-link">
                                    <Link
                                        href={route("login")}
                                        className="underline text-"
                                    >
                                        {t("register.already_registered")}
                                    </Link>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
                <div className="right-container">
                    <img
                        src="/images/image.png"
                        alt="Logo"
                        className="logo-placeholder"
                    />
                    <h1 className="right-header">
                        PWDirectory v3 - Ramp IT Up!
                    </h1>
                    <h2 className="right-subtitle">
                        Your directory for wheelchair accessible establishments
                    </h2>
                </div>
            </div>
        </div>
    );
}
