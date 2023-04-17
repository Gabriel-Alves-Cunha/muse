import type { DotNestedKeys } from "@common/@types/DotNestedKeys";
import type { OneOf } from "@common/@types/Utils";

import { type StoreApi, type UseBoundStore, create } from "zustand";

import { throwErr } from "@common/log";

/**
 * @param translations
 * ```ts
 * const translations = {
 * 	"en-US": { ... },
 * 	"pt-BR": { ... },
 * 	// ...
 * };
 * ```
 * @param locale
 * ```ts
 * const locale = "en-US";
 * ```
 */
export const makeUseTranslator = <Data extends RecursiveObject>(
	translations: Data,
	locale: OneOf<Data>,
): UseBoundStore<StoreApi<Translator<Data>>> =>
	create<Translator<Data>>((_set, get) => ({
		translations,

		locale,

		formatArgument: (value: string | number) =>
			typeof value === "number"
				? new Intl.NumberFormat(get().locale as string).format(value)
				: value,

		t(
			key: DotNestedKeys<Data[typeof locale]>,
			// args: TranslationArguments = {},
		) {
			const startObject = get().translations[get().locale];
			const keys = (key as string).split(".");
			const lastPart = keys.at(-1) as string;
			const targetObject = keys
				.slice(0, -1)
				.reduce(
					(object, key) => object?.[key] as RecursiveObject,
					startObject as RecursiveObject,
				);

			if (typeof targetObject !== "object")
				throwErr(`Missing translation: "${key}"!`);

			const translation = targetObject?.[lastPart];

			if (typeof translation !== "string")
				throwErr(`Missing translation: "${key}"!`);

			// 			// Replace placeholders like `{{count}}` with values from `args`
			// 			const processed = Object.entries(args).reduce(
			// 				(prev, [name, value]) =>
			// 					prev.replace(
			// 						new RegExp(`{{\\s*${name}\\s*}}`, "g"),
			// 						state.formatArgument(value),
			// 					),
			// 				translation,
			// 			);
			//
			// 			return processed;

			return translation as string;
		},
	}));

///////////////////////////////////////
///////////////////////////////////////
///////////////////////////////////////
// Types:

type RecursiveObject = { [key: string]: RecursiveObject | string };

type TranslatorArguments = {
	[name: string]: string | number;
};

type Translator<Translations extends RecursiveObject> = {
	t(
		key: DotNestedKeys<Translations[OneOf<Translations>]>,
		args?: TranslatorArguments,
	): string;
	formatArgument(value: string | number): string;
	locale: OneOf<Translations>;
	translations: Translations;
};
