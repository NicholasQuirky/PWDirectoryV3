import React, { useState } from "react";
import { Head, Link } from "@inertiajs/react";
import Header from "../../Components/AuthHeader"; // Adjust path as necessary
import { useTranslation } from "react-i18next"; // Import useTranslation for translations
import "css/TermsAndConditions.css"; // Update the CSS file for styling
import LanguageToggler from "./LanguageToggler";
import { FaChevronDown, FaChevronUp } from "react-icons/fa"; // Importing icons

export default function TermsAndConditions() {
    const { t } = useTranslation(); // Initialize translation hook
    const [activeSections, setActiveSections] = useState({
        userAgreement: false,
        prohibitedActions: false,
        intellectualProperty: false,
        liabilityLimitations: false,
        governingLaw: false,
        modifications: false,
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
                            {t("termsConditions.title")}
                        </h1>

                        <h2>{t("termsConditions.introduction")}</h2>
                        <p>{t("termsConditions.introductionDetails")}</p>

                        {/* User Agreement Section */}
                        <div
                            className={`collapsible ${
                                activeSections.userAgreement ? "active" : ""
                            }`}
                            onClick={() => toggleSection("userAgreement")}
                        >
                            <div className="collapsible-header">
                                <h3>{t("termsConditions.userAgreement")}</h3>
                                <div className="collapsible-icon">
                                    {activeSections.userAgreement ? (
                                        <FaChevronUp />
                                    ) : (
                                        <FaChevronDown />
                                    )}
                                </div>
                            </div>

                            <div className="collapsible-content">
                                <p>
                                    {t("termsConditions.userAgreementDetails")}
                                </p>
                            </div>
                        </div>

                        {/* Prohibited Actions Section */}
                        <div
                            className={`collapsible ${
                                activeSections.prohibitedActions ? "active" : ""
                            }`}
                            onClick={() => toggleSection("prohibitedActions")}
                        >
                            <div className="collapsible-header">
                                <h3>
                                    {t("termsConditions.prohibitedActions")}
                                </h3>
                                <div className="collapsible-icon">
                                    {activeSections.prohibitedActions ? (
                                        <FaChevronUp />
                                    ) : (
                                        <FaChevronDown />
                                    )}
                                </div>
                            </div>
                            <div className="collapsible-content">
                                <p>
                                    {t(
                                        "termsConditions.prohibitedActionsDetails"
                                    )}
                                </p>
                            </div>
                        </div>

                        {/* Intellectual Property Section */}
                        <div
                            className={`collapsible ${
                                activeSections.intellectualProperty
                                    ? "active"
                                    : ""
                            }`}
                            onClick={() =>
                                toggleSection("intellectualProperty")
                            }
                        >
                            <div className="collapsible-header">
                                <h3>
                                    {t("termsConditions.intellectualProperty")}
                                </h3>
                                <div className="collapsible-icon">
                                    {activeSections.intellectualProperty ? (
                                        <FaChevronUp />
                                    ) : (
                                        <FaChevronDown />
                                    )}
                                </div>
                            </div>
                            <div className="collapsible-content">
                                <p>
                                    {t(
                                        "termsConditions.intellectualPropertyDetails"
                                    )}
                                </p>
                            </div>
                        </div>

                        {/* Liability Limitations Section */}
                        <div
                            className={`collapsible ${
                                activeSections.liabilityLimitations
                                    ? "active"
                                    : ""
                            }`}
                            onClick={() =>
                                toggleSection("liabilityLimitations")
                            }
                        >
                            <div className="collapsible-header">
                                <h3>
                                    {t("termsConditions.liabilityLimitations")}
                                </h3>
                                <div className="collapsible-icon">
                                    {activeSections.liabilityLimitations ? (
                                        <FaChevronUp />
                                    ) : (
                                        <FaChevronDown />
                                    )}
                                </div>
                            </div>
                            <div className="collapsible-content">
                                <p>
                                    {t(
                                        "termsConditions.liabilityLimitationsDetails"
                                    )}
                                </p>
                            </div>
                        </div>

                        {/* Governing Law Section */}
                        <div
                            className={`collapsible ${
                                activeSections.governingLaw ? "active" : ""
                            }`}
                            onClick={() => toggleSection("governingLaw")}
                        >
                            <div className="collapsible-header">
                                <h3>{t("termsConditions.governingLaw")}</h3>
                                <div className="collapsible-icon">
                                    {activeSections.governingLaw ? (
                                        <FaChevronUp />
                                    ) : (
                                        <FaChevronDown />
                                    )}
                                </div>
                            </div>
                            <div className="collapsible-content">
                                <p>
                                    {t("termsConditions.governingLawDetails")}
                                </p>
                            </div>
                        </div>

                        {/* Modifications Section */}
                        <div
                            className={`collapsible ${
                                activeSections.modifications ? "active" : ""
                            }`}
                            onClick={() => toggleSection("modifications")}
                        >
                            <div className="collapsible-header">
                                <h3>{t("termsConditions.modifications")}</h3>
                                <div className="collapsible-icon">
                                    {activeSections.modifications ? (
                                        <FaChevronUp />
                                    ) : (
                                        <FaChevronDown />
                                    )}
                                </div>
                            </div>
                            <div className="collapsible-content">
                                <p>
                                    {t("termsConditions.modificationsDetails")}
                                </p>
                            </div>
                        </div>

                        <div className="footer">
                            <Link
                                href={route("register")}
                                className="signup-link"
                            >
                                {t("termsConditions.register")}
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
