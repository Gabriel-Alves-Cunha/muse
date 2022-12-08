import type { DotNestedKeys } from "@common/@types/dotNestedKeys";
import type { OneOf } from "@common/@types/utils";

import create from "zustand";

export const makeUseTranslation = <TranslationData extends TranslationData_>(
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
			args: TranslationArguments = {},
		) => {
			const parts = (key as string).split(".");
			const lastPart = parts.at(-1) as string;
			const root = parts
				.slice(0, -1)
				.reduce(
					(root, part) => root?.[part] as TranslationData,
					get().translations,
				);

			if (typeof root !== "object")
				throw new Error(`Missing translation: "${key}"!`);

			const translation = root[lastPart];

			if (typeof translation !== "string")
				throw new Error(`Missing translation: "${key}"!`);

			// Replace placeholders like `{{count}}` with values from `args`
			const processed = Object.entries(args).reduce(
				(v, [name, value]) =>
					v.replace(
						new RegExp(`{{\\s*${name}\\s*}}`, "g"),
						get().formatArgument(value),
					),
				translation,
			);

			return processed;
		},
	}));

/**
 * Like:
 * ```ts
 * const translations = {
 * 	"en-US": { ... },
 * 	"pt-BR": { ... },
 * }
 * ```
 */
interface TranslationData_ {
	readonly [key: string]: string | TranslationData_;
}

type TranslationArguments = {
	[name: string]: string | number;
};

type UseTranslation<TranslationData extends TranslationData_> = {
	formatArgument: (value: string | number) => string;
	locale: OneOf<TranslationData>;
	translations: TranslationData;
	t: (
		key: DotNestedKeys<TranslationData[OneOf<TranslationData>]>,
		args?: TranslationArguments,
	) => string;
};
