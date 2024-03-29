type DeepReadonly<T> = keyof T extends never
	? T
	: {
			readonly [k in keyof T]: DeepReadonly<T[k]>;
	  };

////////////////////////////////////////////

export type PartialKeys<T, K extends PropertyKey = PropertyKey> = Partial<
	Pick<T, Extract<keyof T, K>>
> &
	Omit<T, K> extends infer O
	? {
			[P in keyof O]: O[P];
	  }
	: never;

////////////////////////////////////////////

export type Mutable<T> = {
	-readonly [P in keyof T]: T[P] extends ReadonlyArray<infer U> ? U[] : T[P];
};

////////////////////////////////////////////

export type TypeOfMap<T> = T extends ReadonlyMap<infer K, infer V>
	? [K, V][]
	: never;

////////////////////////////////////////////

export type TypeOfMapValue<T> = T extends Map<unknown, infer V> ? V : never;

////////////////////////////////////////////

export type ValuesOf<Obj> = Obj[keyof Obj];

////////////////////////////////////////////

export type OneOf<T> = keyof T;

////////////////////////////////////////////

export type Json =
	| string
	| number
	| boolean
	| null
	| Json[]
	| { [key: string]: Json };

////////////////////////////////////////////

export type Widen<T> = T extends string
	? string
	: T extends number
	? number
	: T extends boolean
	? boolean
	: T extends (...args: unknown[]) => unknown
	? (...args: Parameters<T>) => ReturnType<T>
	: T extends (infer E)[]
	? Widen<E>
	: T extends object
	? {
			[K in keyof T]: Widen<T[K]>;
	  }
	: T;
