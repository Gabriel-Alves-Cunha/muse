import { useState } from "react";

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
		try {
			// Allow value to be a function so we have same API as useState
			const valueToStore =
				value instanceof Function ? value(storedValue) : value;

			// Save state
			setStoredValue(valueToStore);

			// Save to local storage
			window.localStorage.setItem(key, JSON.stringify(valueToStore));
		} catch (error) {
			console.error(error);
		}
	};

	return [storedValue, setValue] as const;
}

// function isElement(element: any) {
// 	return (
// 		element instanceof Element ||
// 		element instanceof HTMLDocument ||
// 		element instanceof HTMLElement
// 	);
// }

// Usage
// function App() {
// 	// Similar to useState but first arg is key to the value in local storage.
// 	const [name, setName] = useLocalStorage<string>("@key_:name", "Bob");
// 	return (
// 		<div>
// 			<input
// 				type="text"
// 				placeholder="Enter your name"
// 				value={name}
// 				onChange={e => setName(e.target.value)}
// 			/>
// 		</div>
// 	);
// }
