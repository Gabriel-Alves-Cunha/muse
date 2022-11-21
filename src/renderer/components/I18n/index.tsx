import type { DotNestedKeys } from "@common/@types/dotNestedKeys";
import type { Translations } from "@renderer/i18n/locales";

import { t as i18nTranslator } from "i18next";
import { useTranslation } from "react-i18next";

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////
// Main functions:

/**
 * @param {string} path - the object path where lies the translation, e.g: "home.message"
 * Returns the translated string
 */
export function Translator({ path }: Props) {
	const { t } = useTranslation(); // Função que traduz

	return <>{t(path)}</>;
}

/////////////////////////////////////////////

export const t = (path: TranslationPath) => i18nTranslator(path);

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////
// Types:

type TranslationPath = DotNestedKeys<Translations["translations"]>;

/////////////////////////////////////////////

type Props = Readonly<{ path: TranslationPath }>;
