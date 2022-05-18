import { type RefObject, useEffect } from "react";

type Handler = (event: MouseEvent | TouchEvent) => void;

/**
 * It's worth noting that because passed in `handler` is a new
 * function on every render, that will cause this effect
 * callback/cleanup to run every render. It's not a big deal
 * but to optimize you can wrap `handler` in `useCallback` before
 * passing it into this hook.
 */
export function useOnClickOutside<T extends HTMLElement = HTMLElement>(
	ref: RefObject<T>,
	handler: Handler
) {
	useEffect(() => {
		const listener = (event: MouseEvent | TouchEvent) => {
			const el = ref.current;

			// Do nothing if clicking ref's element or descendent elements
			if (!el || el.contains(event.target as Node)) return;

			handler(event);
		};

		document.addEventListener("mousedown", listener);
		document.addEventListener("touchstart", listener);

		return () => {
			document.removeEventListener("mousedown", listener);
			document.removeEventListener("touchstart", listener);
		};
	}, [ref, handler]);
}

// Usage

// function App() {
// 	// Create a ref that we add to the element for which we want to detect outside clicks
// 	const ref = useRef();

// 	// State for our modal
// 	const [isModalOpen, setModalOpen] = useState(false);

// 	// Call hook passing in the ref and a function to call on outside click
// 	useOnClickOutside(ref, () => setModalOpen(false));

// 	return (
// 		<div>
// 			{isModalOpen ? (
// 				<div ref={ref}>
// 					👋 Hey, I'm a modal. Click anywhere outside of me to close.
// 				</div>
// 			) : (
// 				<button onClick={() => setModalOpen(true)}>Open Modal</button>
// 			)}
// 		</div>
// 	);
// }
