import i18n, { type InitOptions } from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import { isDev } from "@common/utils";
import { translations } from "./locales";

const i18nConfig: InitOptions = {
	defaultNS: "translations", // Default namespace, we can use 'translations'.
	resources: translations, // Our translations.
	fallbackLng: "en-US", // Default lang if not detected.
	debug: isDev,
	// lng: "en-US", // To force a language in dev!

	interpolation: {
		escapeValue: false, // not needed for react as it escapes by default
	},
};

i18n
	.use(LanguageDetector) // Uses the lang detector of your browser.
	.use(initReactI18next) // Uses i18n's specific pkg for React.
	.init(i18nConfig, err => {
		if (err)
			console.error("Something went wrong loading translations!", err);
	}); // Uses our configuration.

export default i18n;
