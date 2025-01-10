import { Link, Head } from "@inertiajs/react";
import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGlobe } from "@fortawesome/free-solid-svg-icons";
import i18n from "../i18n";
import { useTranslation } from "react-i18next";

export default function Welcome({ auth }) {
    const { t } = useTranslation();
    const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);

    useEffect(() => {
        const savedLanguage = localStorage.getItem("language");
        if (savedLanguage) {
            i18n.changeLanguage(savedLanguage);
        }
    }, []);

    const toggleLanguage = (locale) => {
        i18n.changeLanguage(locale);
        localStorage.setItem("language", locale);
        setShowLanguageDropdown(false);
    };

    const buttonStyles = {
        width: "120px",
        padding: "10px 0",
        fontSize: "1rem",
        fontWeight: "bold",
        backgroundColor: "white",
        color: "black",
        border: "none",
        borderRadius: "5px",
        cursor: "pointer",
        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
        transition:
            "background-color 0.3s ease, transform 0.2s ease, box-shadow 0.2s ease",
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
        maxWidth: "100%",
        textAlign: "center",
    };

    return (
        <>
            <Head title="Welcome" />
            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    textAlign: "center",
                    minHeight: "100vh",
                    minWidth: "100vw",
                    position: "relative",
                    margin: 0,
                    padding: 0,
                }}
            >
                {/* Background Image */}
                <div
                    style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundImage: "url('/images/image2.png')",
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        backgroundRepeat: "no-repeat",
                        zIndex: -1,
                        minHeight: "100%",
                        minWidth: "100%",
                    }}
                />

                {/* Language Icon */}
                <div
                    style={{ position: "absolute", top: "20px", right: "20px" }}
                >
                    <button
                        onClick={() =>
                            setShowLanguageDropdown(!showLanguageDropdown)
                        }
                        style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                        }}
                    >
                        <FontAwesomeIcon
                            icon={faGlobe}
                            size="lg"
                            style={{ color: "white" }}
                        />
                    </button>
                    {showLanguageDropdown && (
                        <div
                            style={{
                                position: "absolute",
                                top: "100%",
                                right: 0,
                                backgroundColor: "white",
                                borderRadius: "5px",
                                boxShadow: "0 4px 8px rgba(0, 0, 0, 0.15)",
                                zIndex: 10,
                            }}
                        >
                            <button
                                onClick={() => toggleLanguage("en")}
                                style={{
                                    padding: "10px 20px",
                                    width: "100%",
                                    textAlign: "left",
                                    border: "none",
                                    background: "none",
                                    cursor: "pointer",
                                }}
                            >
                                English
                            </button>
                            <button
                                onClick={() => toggleLanguage("fil")}
                                style={{
                                    padding: "10px 20px",
                                    width: "100%",
                                    textAlign: "left",
                                    border: "none",
                                    background: "none",
                                    cursor: "pointer",
                                }}
                            >
                                Filipino
                            </button>
                        </div>
                    )}
                </div>

                {/* Logo and Header */}
                <div
                    style={{
                        textAlign: "center",
                        position: "relative",
                        zIndex: 1,
                    }}
                >
                    <img
                        src="/images/image.png"
                        alt="Wheelchair Logo"
                        style={{
                            width: "150px",
                            height: "auto",
                            maxWidth: "100%",
                            display: "block",
                            margin: "0 auto 58px",
                        }}
                    />
                    <h1
                        style={{
                            fontSize: "4rem",
                            fontWeight: "bold",
                            color: "white",
                            margin: "0",
                            marginTop: "-90px",
                            textShadow: "2px 2px 8px rgba(0, 0, 0, 0.7)",
                        }}
                    >
                        PWDirectory v3 - Ramp IT Up!
                    </h1>
                    <p
                        style={{
                            fontWeight: "bold",
                            fontSize: "1.25rem",
                            color: "white",
                            margin: "5px 0 0",
                            textShadow: "1px 1px 4px rgba(0, 0, 0, 0.5)",
                        }}
                    >
                        {t("welcome.your_directory")}
                    </p>
                </div>

                {/* Buttons */}
                <div className="button-container">
                    {auth.user ? (
                        <Link href={route("dashboard")}>
                            <button
                                style={buttonStyles}
                                onMouseEnter={(e) =>
                                    (e.target.style.backgroundColor = "#f0f0f0")
                                }
                                onMouseLeave={(e) =>
                                    (e.target.style.backgroundColor = "white")
                                }
                            >
                                Dashboard
                            </button>
                        </Link>
                    ) : (
                        <>
                            <Link href={route("login")}>
                                <button
                                    style={buttonStyles}
                                    onMouseEnter={(e) =>
                                        (e.target.style.backgroundColor =
                                            "#f0f0f0")
                                    }
                                    onMouseLeave={(e) =>
                                        (e.target.style.backgroundColor =
                                            "white")
                                    }
                                >
                                    {t("welcome.login")}
                                </button>
                            </Link>
                            <Link href={route("register")}>
                                <button
                                    style={buttonStyles}
                                    onMouseEnter={(e) =>
                                        (e.target.style.backgroundColor =
                                            "#f0f0f0")
                                    }
                                    onMouseLeave={(e) =>
                                        (e.target.style.backgroundColor =
                                            "white")
                                    }
                                >
                                    {t("welcome.register")}
                                </button>
                            </Link>
                        </>
                    )}
                </div>
            </div>

            <style>
                {`
                .button-container {
                    display: flex;
                    justify-content: center;
                    gap: 50px;
                    margin-top: 40px;
                    position: relative;
                    z-index: 1;
                    flex-wrap: wrap;
                }

                /* Media queries */
                @media (min-width: 600px) and (max-width: 900px) {
                    .button-container {
                        gap: 20px;
                    }

                    h1 {
                        font-size: 2rem !important;
                    }

                    p {
                        font-size: 1rem !important;
                    }

                    img {
                        width: 120px !important;
                        margin-bottom: 70px !important;
                    }
                }

                @media (min-width: 320px) and (max-width: 599px) {
                    .button-container {
                        flex-direction: column;
                        gap: 20px;
                    }
                    h1 {
                        font-size: 1.5rem !important;
                    }

                    p {
                        font-size: 0.845rem !important;
                    }

                    img {
                        width: 100px !important;
                        margin-bottom: 75px !important;
                    }

                    .button-container {
                        gap: 10px;
                    }
                    .button-container button {
                        padding: 6px 0 !important;
                    }
                }
                `}
            </style>
        </>
    );
}
