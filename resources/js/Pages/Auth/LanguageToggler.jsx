import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGlobe } from "@fortawesome/free-solid-svg-icons";
import i18n from "../../i18n";
import { useTranslation } from "react-i18next";

export default function LanguageToggler() {
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

    return (
        <div style={{ position: "relative" }}>
            <button
                onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
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
    );
}
