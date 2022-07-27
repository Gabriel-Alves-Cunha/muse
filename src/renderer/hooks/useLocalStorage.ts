import { useState } from "react";

import { stringifyJson } from "@common/utils";

export function useLocalStorage<T>(
	key: string,
	initialValue: Readonly<NonNullable<T>>,
) {
	// State to store our value
	// Pass initial state function to useState so logic is only executed once
	const [storedValue, setStoredValue] = useState<T>(() => {
		try {
			const item = window.localStorage.getItem(key);

			return item ? (JSON.parse(item) as T) : initialValue;
		} catch (error) {
			console.error(`Error reading localStorage key: "${key}":`, error);
			return initialValue;
		}
	});

	// Return a wrapped version of useState's setter function that
	// persists the new value to localStorage.
	const setValue = (value: T | ((val: T) => T)) => {
		setTimeout(() => {
			try {
				// Allow value to be a function so we have same API as useState
				const valueToStore = value instanceof Function ?
					value(storedValue) :
					value;

				// Save state
				setStoredValue(valueToStore);

				// Save to local storage
				window.localStorage.setItem(key, stringifyJson(valueToStore));
			} catch (error) {
				console.error(error);
			}
		});
	};

	return [storedValue, setValue] as const;
}
