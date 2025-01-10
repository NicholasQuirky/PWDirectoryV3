import { Head, Link, useForm } from "@inertiajs/react";
import Header from "../../Components/AuthHeader"; // Adjust path as necessary
import PrimaryButton from "@/Components/PrimaryButton";
import "css/VerifyEmail.css";
import LanguageToggler from "./LanguageToggler";
import { useTranslation } from "react-i18next";

export default function VerifyEmail({ status, userEmail }) {
    const { t } = useTranslation();
    const { post, processing } = useForm({});

    const submit = (e) => {
        e.preventDefault();
        post(route("verification.send"));
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
                    <div className="verify-email-container">
                        <h1 className="verify-email-subtitle">
                            {t("verifyEmail.verify_email_address")}
                        </h1>

                        <div className="verify-email-message">
                            {t("verifyEmail.verification_message", {
                                userEmail: userEmail,
                            })}
                        </div>

                        {status === "verification-link-sent" && (
                            <div className="verification-link-sent">
                                {t("verifyEmail.link_sent")}
                            </div>
                        )}

                        <div className="button-container">
                            <form
                                onSubmit={submit}
                                className="verify-email-form"
                            >
                            <PrimaryButton
                                className="resend-button"
                                disabled={processing}
                            >
                                {t("verifyEmail.resend_button")}
                            </PrimaryButton>
                            </form>

                            <Link
                                className="return-home-button"
                                href="/"
                            >
                                {t("verifyEmail.return_home")}
                            </Link>
                        </div>

                        <div className="verify-email-logout">
                            <Link
                                href={route("logout")}
                                method="post"
                                as="button"
                                className="logout-link"
                            >
                                {t("verifyEmail.logout")}
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
