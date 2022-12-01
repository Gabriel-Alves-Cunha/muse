import { createI18nContext } from "@solid-primitives/i18n";

import { translations } from "./locales";

export const lang = createI18nContext(translations, "en-US");
