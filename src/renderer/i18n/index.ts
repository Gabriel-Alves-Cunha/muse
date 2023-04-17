import { pt_BR_Translations } from "./pt-BR";
import { en_US_Translations } from "./en-US";
import { makeUseTranslator } from "./translation";

export const useTranslator = makeUseTranslator(
	{
		"pt-BR": pt_BR_Translations,
		"en-US": en_US_Translations,
	},
	"en-US",
);

export const t: T = (key) => useTranslator.getState().t(key);

export const selectT = ({ t }: UseTranslator): UseTranslator["t"] => t;

////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////
// Types:

export type UserAvailableLanguages = keyof UseTranslator["translations"];

type UseTranslator = ReturnType<typeof useTranslator["getState"]>;

type T = UseTranslator["t"];
