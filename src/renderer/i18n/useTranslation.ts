import type { DotNestedKeys } from "@common/@types/dotNestedKeys";
import type { OneOf } from "@common/@types/utils";

import create from "zustand";

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
export const makeUseTranslation = <TranslationData extends RecursiveObject>(
	translations: TranslationData,
	locale: OneOf<TranslationData>,
) =>
	create<UseTranslation<TranslationData>>((_set, get) => ({
		translations,
		locale,
		formatArgument: (value) =>
			typeof value === "number"
				? new Intl.NumberFormat(get().locale as string).format(value)
				: value,
		t: (
			key: DotNestedKeys<TranslationData[typeof locale]>,
			// args: TranslationArguments = {},
		) => {
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
				throw new Error(`Missing translation: "${key}"!`);

			const translation = targetObject[lastPart];

			if (typeof translation !== "string")
				throw new Error(`Missing translation: "${key}"!`);

			// 			// Replace placeholders like `{{count}}` with values from `args`
			// 			const processed = Object.entries(args).reduce(
			// 				(prev, [name, value]) =>
			// 					prev.replace(
			// 						new RegExp(`{{\\s*${name}\\s*}}`, "g"),
			// 						get().formatArgument(value),
			// 					),
			// 				translation,
			// 			);
			//
			// 			return processed;

			return translation;
		},
	}));

type RecursiveObject = {
	[key: string]: RecursiveObject | string;
};

type TranslationArguments = {
	[name: string]: string | number;
};

type UseTranslation<TranslationData extends RecursiveObject> = {
	formatArgument: (value: string | number) => string;
	locale: OneOf<TranslationData>;
	translations: TranslationData;
	t: (
		key: DotNestedKeys<TranslationData[OneOf<TranslationData>]>,
		args?: TranslationArguments,
	) => string;
};
