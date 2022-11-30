import i18n, { type InitOptions } from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import { translations } from "./locales";
import { error } from "@utils/log";


const i18nConfig: InitOptions = {
	defaultNS: "translations", // Default namespace, we can use 'translations'.
	resources: translations, // Our translations.
	fallbackLng: "en-US", // Default lang if not detected.
	// @ts-ignore => isDev is a globally defined boolean.
	debug: isDev,
	// lng: "en-US", // To force a language in dev!

	interpolation: {
		escapeValue: false, // not needed for react as it escapes by default
	},
};

i18n
	.use(LanguageDetector) // Uses the lang detector of your browser.
	.use(initReactI18next) // Uses i18n's specific pkg for React.
	.init(i18nConfig, (err) => {
		if (err) error("Something went wrong loading translations!", err);
	}); // Uses our configuration.

export default i18n;
