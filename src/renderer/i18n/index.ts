import { pt_BR_Translations } from "./pt-BR";
import { en_US_Translations } from "./en-US";
import { makeTranslation } from "./translation";

export const translation = makeTranslation(
	{
		"pt-BR": pt_BR_Translations,
		"en-US": en_US_Translations,
	},
	"en-US",
);

export type UserAvailableLanguages = keyof Pick<
	typeof translation,
	"translations"
>["translations"];
