import { Head, Link, useForm } from "@inertiajs/react";
import Header from "../../Components/AuthHeader"; // Adjust path as necessary
import "css/ForgotPassword.css";
import LanguageToggler from "./LanguageToggler";
import { useTranslation } from "react-i18next";

export default function ForgotPassword({ status }) {
    const { t } = useTranslation();
    const { data, setData, post, processing, errors } = useForm({
        email: "",
    });

    const submit = (e) => {
        e.preventDefault();
        post(route("password.email"));
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
                    <div className="forgot-password-container">
                        <h1 className="forgot-password-subtitle">
                            {t("forgotPassword.reset_password")}
                        </h1>

                        {status && (
                            <div className="status-message">{status}</div>
                        )}
                        {errors.email && (
                            <div className="error-message">{errors.email}</div>
                        )}

                        <form
                            onSubmit={submit}
                            className="forgot-password-form"
                        >
                            <div className="relative">
                                <input
                                    placeholder={t(
                                        "forgotPassword.placeholder_email"
                                    )}
                                    id="email"
                                    type="email"
                                    name="email"
                                    value={data.email}
                                    className="forgot-password-input"
                                    required
                                    onChange={(e) =>
                                        setData("email", e.target.value)
                                    }
                                />
                                <label
                                    className="forgot-password-label"
                                    htmlFor="email"
                                >
                                    {t("forgotPassword.email")}
                                </label>
                            </div>

                            <button
                                className="forgot-password-button"
                                disabled={processing}
                            >
                                {t("forgotPassword.send_verification")}
                            </button>
                        </form>

                        <div className="forgot-password-login">
                            {t("forgotPassword.remembered_password")}{" "}
                            <Link href={route("login")} className="login-link">
                                {t("forgotPassword.login")}
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
