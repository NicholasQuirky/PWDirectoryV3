import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./locales/en.json";
import fil from "./locales/fil.json";

const storedLanguage = localStorage.getItem("language") || "en";

i18n.use(initReactI18next).init({
    resources: {
        en: {
            translation: en,
        },
        fil: {
            translation: fil,
        },
    },
    lng: "en", // default language
    fallbackLng: "en",
    interpolation: {
        escapeValue: false,
    },
});

export default i18n;
