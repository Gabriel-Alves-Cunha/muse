import { makeUseTranslation } from "./useTranslation";
import { pt_BR_Translations } from "./pt-BR";
import { en_US_Translations } from "./en-US";

export const useTranslation = makeUseTranslation(
	{
		"pt-BR": pt_BR_Translations,
		"en-US": en_US_Translations,
	},
	"en-US",
);
