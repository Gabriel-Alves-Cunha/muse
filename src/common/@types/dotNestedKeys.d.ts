type DotPrefix<T extends string> = T extends "" ? "" : `.${T}`;

export type DotNestedKeys<T> = (
	T extends object
		? {
				[K in Exclude<keyof T, symbol>]: `${K}${DotPrefix<
					DotNestedKeys<T[K]>
				>}`;
		  }[Exclude<keyof T, symbol>]
		: ""
) extends infer D
	? Extract<D, string>
	: never;

export type Recursion<T> = keyof {
	[Property in
		keyof T as T[Property] extends string | number | boolean | null
			? Property
			: `${string & Property}.${string & Recursion<T[Property]>}`]: true;
};
