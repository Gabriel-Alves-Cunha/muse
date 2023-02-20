import type { DotNestedKeys } from "@common/@types/dotNestedKeys";
import type { OneOf } from "@common/@types/utils";

import { proxy } from "valtio";

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
export function makeTranslation<Data extends RecursiveObject>(
	translations: Data,
	locale: OneOf<Data>,
): Translation<Data> {
	const state = proxy({
		translations,
		locale,
		formatArgument: (value: string | number) =>
			typeof value === "number"
				? new Intl.NumberFormat(state.locale as string).format(value)
				: value,
		t(
			key: DotNestedKeys<Data[typeof locale]>,
			// args: TranslationArguments = {},
		) {
			const startObject = state.translations[state.locale];
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

			const translation = targetObject![lastPart];

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
	});

	return state;
}

type RecursiveObject = { [key: string]: RecursiveObject | string };

type TranslationArguments = {
	[name: string]: string | number;
};

type Translation<Data extends RecursiveObject> = {
	t(key: DotNestedKeys<Data[OneOf<Data>]>, args?: TranslationArguments): string;
	formatArgument(value: string | number): string;
	locale: OneOf<Data>;
	translations: Data;
};
