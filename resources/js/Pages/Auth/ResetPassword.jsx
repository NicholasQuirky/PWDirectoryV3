import { useState } from "react";
import { Head, useForm } from "@inertiajs/react";
import Header from "../../Components/AuthHeader"; // Adjust path as necessary
import "css/ResetPassword.css"; // Import the external CSS file
import LanguageToggler from "./LanguageToggler";
import { useTranslation } from "react-i18next";

export default function ResetPassword({ token, email, status, errors }) {
    const { t } = useTranslation();
    const { data, setData, post, processing, reset } = useForm({
        token: token,
        email: email,
        password: "",
        password_confirmation: "",
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const togglePasswordVisibility = () => setShowPassword(!showPassword);
    const toggleConfirmPasswordVisibility = () =>
        setShowConfirmPassword(!showConfirmPassword);

    // Password validation function
    const validatePassword = (password) => {
        const passwordRegex =
            /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])[A-Za-z\d!@#$%^&*(),.?":{}|<>]{8,}$/;
        return passwordRegex.test(password);
    };

    const submit = (e) => {
        e.preventDefault();

        // Perform password validation
        if (!validatePassword(data.password)) {
            alert(t("resetPassword.password_validation_alert"));
            return;
        }

        post(route("password.store"), {
            onFinish: () => reset("password", "password_confirmation"),
        });
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
                    <div className="reset-password-container">

                        <p className="reset-password-subtitle">
                            {t("resetPassword.reset_password")}
                        </p>

                        {status && (
                            <div className="status-message">{status}</div>
                        )}
                        {errors.email && (
                            <div className="error-message">{errors.email}</div>
                        )}
                        {errors.password && (
                            <div className="error-message">
                                {errors.password}
                            </div>
                        )}
                        {errors.password_confirmation && (
                            <div className="error-message">
                                {errors.password_confirmation}
                            </div>
                        )}

                        <form onSubmit={submit} className="reset-password-form">
                            <div className="relative">
                                <input
                                    placeholder={t(
                                        "resetPassword.placeholder_email"
                                    )}
                                    id="email"
                                    type="email"
                                    name="email"
                                    value={data.email}
                                    className="reset-password-input"
                                    required
                                    autoComplete="username"
                                    onChange={(e) =>
                                        setData("email", e.target.value)
                                    }
                                />
                                <label
                                    className="reset-password-label"
                                    htmlFor="email"
                                >
                                    {t("resetPassword.email")}
                                </label>
                            </div>

                            <div className="relative">
                                <input
                                    placeholder={t(
                                        "resetPassword.placeholder_new_password"
                                    )}
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    value={data.password}
                                    className="reset-password-input"
                                    required
                                    autoComplete="new-password"
                                    onChange={(e) =>
                                        setData("password", e.target.value)
                                    }
                                />
                                <label
                                    className="reset-password-label"
                                    htmlFor="password"
                                >
                                    {t("resetPassword.new_password")}
                                </label>
                                <button
                                    type="button"
                                    className="toggle-password-visibility"
                                    onClick={togglePasswordVisibility}
                                >
                                    {showPassword
                                        ? t("resetPassword.hide")
                                        : t("resetPassword.show")}
                                </button>
                            </div>

                            <div className="relative">
                                <input
                                    placeholder={t(
                                        "resetPassword.placeholder_confirm_password"
                                    )}
                                    id="password_confirmation"
                                    type={
                                        showConfirmPassword
                                            ? "text"
                                            : "password"
                                    }
                                    name="password_confirmation"
                                    value={data.password_confirmation}
                                    className="reset-password-input"
                                    required
                                    autoComplete="new-password"
                                    onChange={(e) =>
                                        setData(
                                            "password_confirmation",
                                            e.target.value
                                        )
                                    }
                                />
                                <label
                                    className="reset-password-label"
                                    htmlFor="password_confirmation"
                                >
                                    {t("resetPassword.confirm_password")}
                                </label>
                                <button
                                    type="button"
                                    className="toggle-password-visibility"
                                    onClick={toggleConfirmPasswordVisibility}
                                >
                                    {showConfirmPassword
                                        ? t("resetPassword.hide")
                                        : t("resetPassword.show")}
                                </button>
                            </div>

                            <div className="flex items-center justify-end mt-4">
                                <button
                                    className="reset-password-button"
                                    disabled={processing}
                                >
                                    {t("resetPassword.reset_password_button")}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
                <div className="right-container">
                    <img src="/images/image.png" alt="Logo" className="logo-placeholder" />
                    <h1 className="right-header">PWDirectory v3 - Ramp IT Up!</h1>
                    <h2 className="right-subtitle">Your directory for wheelchair accessible establishments</h2>
                </div>
            </div>
        </div>
    );
}
