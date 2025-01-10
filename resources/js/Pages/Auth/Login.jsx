import { Head, Link, useForm } from "@inertiajs/react";
import Header from "../../Components/AuthHeader"; // Adjust path as necessary
import { useState } from "react"; // Import useState for visibility toggle
import "css/Login.css";
import LanguageToggler from "./LanguageToggler";
import { useTranslation } from "react-i18next"; // Import useTranslation for translations

export default function Login({ status, canResetPassword, errors }) {
    const { t } = useTranslation(); // Initialize translation hook
    const { data, setData, post, processing, reset } = useForm({
        identifier: "",
        password: "",
        remember: false,
    });

    const [showPassword, setShowPassword] = useState(false);

    const togglePasswordVisibility = () => setShowPassword(!showPassword);

    const submit = (e) => {
        e.preventDefault();
        post(route("login"), {
            onFinish: () => reset("password"),
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
                    <div className="login-container">
                        <p className="login-subtitle">{t("login.subtitle")}</p>

                        {status && (
                            <div className="status-message">{status}</div>
                        )}
                        {errors.identifier && (
                            <div className="error-message">
                                {errors.identifier}
                            </div>
                        )}

                        <form onSubmit={submit} className="login-form">
                            <div className="relative">
                                <input
                                    placeholder={t(
                                        "login.identifierPlaceholder"
                                    )}
                                    id="identifier"
                                    type="text"
                                    name="identifier"
                                    value={data.identifier}
                                    className="login-input"
                                    required
                                    autoComplete="username"
                                    onChange={(e) =>
                                        setData("identifier", e.target.value)
                                    }
                                />
                                <label
                                    className="login-label"
                                    htmlFor="identifier"
                                >
                                    {t("login.identifierLabel")}
                                </label>
                            </div>

                            <div className="relative">
                                <input
                                    placeholder={t("login.passwordPlaceholder")}
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    value={data.password}
                                    className="login-input"
                                    required
                                    autoComplete="current-password"
                                    onChange={(e) =>
                                        setData("password", e.target.value)
                                    }
                                />
                                <label
                                    className="login-label"
                                    htmlFor="password"
                                >
                                    {t("login.passwordLabel")}
                                </label>

                                {/* Eye icon to toggle password visibility */}
                                <button
                                    type="button"
                                    className="toggle-password-btn"
                                    onClick={togglePasswordVisibility}
                                >
                                    {showPassword
                                        ? t("login.hide")
                                        : t("login.show")}
                                </button>
                            </div>

                            <div className="flex items-center justify-between">
                                <label className="checkbox-label">
                                    <input
                                        className="checkbox-input"
                                        type="checkbox"
                                        name="remember"
                                        checked={data.remember}
                                        onChange={(e) =>
                                            setData(
                                                "remember",
                                                e.target.checked
                                            )
                                        }
                                    />
                                    <span>{t("login.rememberMe")}</span>
                                </label>

                                {canResetPassword && (
                                    <Link
                                        href={route("password.request")}
                                        className="forgot-password"
                                    >
                                        {t("login.forgotPassword")}
                                    </Link>
                                )}
                            </div>

                            <button
                                className="login-button"
                                disabled={processing}
                            >
                                {t("login.loginButton")}
                            </button>
                        </form>

                        <div className="login-signup">
                            {t("login.noAccount")}{" "}
                            <Link
                                href={route("register")}
                                className="signup-link"
                            >
                                {t("login.signUp")}
                            </Link>
                        </div>
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
