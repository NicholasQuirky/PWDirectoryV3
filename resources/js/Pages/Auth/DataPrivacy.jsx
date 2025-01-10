import React, { useState } from "react";
import { Head, Link } from "@inertiajs/react";
import Header from "../../Components/AuthHeader"; // Adjust path as necessary
import { useTranslation } from "react-i18next"; // Import useTranslation for translations
import "css/DataPrivacy.css";
import LanguageToggler from "./LanguageToggler";
import { FaChevronDown, FaChevronUp } from "react-icons/fa"; // Importing icons

export default function DataPrivacy() {
    const { t } = useTranslation(); // Initialize translation hook
    const [activeSections, setActiveSections] = useState({
        dataCollection: false,
        dataUsage: false,
        dataProtection: false,
        pwdInclusion: false,
        rightsAndAccess: false,
        consent: false,
    });

    const toggleSection = (section) => {
        setActiveSections((prev) => ({
            ...prev,
            [section]: !prev[section],
        }));
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
                    <div className="data-privacy-container">
                        <h1 className="data-privacy-title">
                            {t("dataPrivacy.title")}
                        </h1>

                        <h2>{t("dataPrivacy.introduction")}</h2>
                        <p>{t("dataPrivacy.introductionDetails")}</p>

                        {/* Data Collection Section */}
                        <div
                            className={`collapsible ${
                                activeSections.dataCollection ? "active" : ""
                            }`}
                            onClick={() => toggleSection("dataCollection")}
                        >
                            <div className="collapsible-header">
                                <h3>{t("dataPrivacy.dataCollection")}</h3>
                                <div className="collapsible-icon">
                                    {activeSections.dataCollection ? (
                                        <FaChevronUp />
                                    ) : (
                                        <FaChevronDown />
                                    )}
                                </div>
                            </div>

                            <div className="collapsible-content">
                                <p>{t("dataPrivacy.dataCollectionDetails")}</p>
                            </div>
                        </div>

                        {/* Data Usage Section */}
                        <div
                            className={`collapsible ${
                                activeSections.dataUsage ? "active" : ""
                            }`}
                            onClick={() => toggleSection("dataUsage")}
                        >
                            <div className="collapsible-header">
                                <h3>{t("dataPrivacy.dataUsage")}</h3>
                                <div className="collapsible-icon">
                                    {activeSections.dataUsage ? (
                                        <FaChevronUp />
                                    ) : (
                                        <FaChevronDown />
                                    )}
                                </div>
                            </div>
                            <div className="collapsible-content">
                                <p>{t("dataPrivacy.dataUsageDetails")}</p>
                            </div>
                        </div>

                        {/* Data Protection Section */}
                        <div
                            className={`collapsible ${
                                activeSections.dataProtection ? "active" : ""
                            }`}
                            onClick={() => toggleSection("dataProtection")}
                        >
                            <div className="collapsible-header">
                                <h3>{t("dataPrivacy.dataProtection")}</h3>
                                <div className="collapsible-icon">
                                    {activeSections.dataProtection ? (
                                        <FaChevronUp />
                                    ) : (
                                        <FaChevronDown />
                                    )}
                                </div>
                            </div>
                            <div className="collapsible-content">
                                <p>{t("dataPrivacy.dataProtectionDetails")}</p>
                            </div>
                        </div>

                        {/* PWD Inclusion Section */}
                        <div
                            className={`collapsible ${
                                activeSections.pwdInclusion ? "active" : ""
                            }`}
                            onClick={() => toggleSection("pwdInclusion")}
                        >
                            <div className="collapsible-header">
                                <h3>{t("dataPrivacy.pwdInclusion")}</h3>
                                <div className="collapsible-icon">
                                    {activeSections.pwdInclusion ? (
                                        <FaChevronUp />
                                    ) : (
                                        <FaChevronDown />
                                    )}
                                </div>
                            </div>
                            <div className="collapsible-content">
                                <p>{t("dataPrivacy.pwdInclusionDetails")}</p>
                            </div>
                        </div>

                        {/* Rights and Access Section */}
                        <div
                            className={`collapsible ${
                                activeSections.rightsAndAccess ? "active" : ""
                            }`}
                            onClick={() => toggleSection("rightsAndAccess")}
                        >
                            <div className="collapsible-header">
                                <h3>{t("dataPrivacy.rightsAndAccess")}</h3>
                                <div className="collapsible-icon">
                                    {activeSections.rightsAndAccess ? (
                                        <FaChevronUp />
                                    ) : (
                                        <FaChevronDown />
                                    )}
                                </div>
                            </div>
                            <div className="collapsible-content">
                                <p>{t("dataPrivacy.rightsAndAccessDetails")}</p>
                            </div>
                        </div>

                        {/* Consent Section */}
                        <div
                            className={`collapsible ${
                                activeSections.consent ? "active" : ""
                            }`}
                            onClick={() => toggleSection("consent")}
                        >
                            <div className="collapsible-header">
                                <h3>{t("dataPrivacy.consent")}</h3>
                                <div className="collapsible-icon">
                                    {activeSections.consent ? (
                                        <FaChevronUp />
                                    ) : (
                                        <FaChevronDown />
                                    )}
                                </div>
                            </div>
                            <div className="collapsible-content">
                                <p>{t("dataPrivacy.consentDetails")}</p>
                            </div>
                        </div>

                        <div className="footer">
                            <Link
                                href={route("register")}
                                className="signup-link"
                            >
                                {t("dataPrivacy.register")}
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
