// @ts-ignore => it actually works.
export const on: typeof document.addEventListener = (event, listenerFn) =>
	document.addEventListener(event, listenerFn);

// @ts-ignore => it actually works.
export const once: typeof document.addEventListener = (event, listenerFn) =>
	document.addEventListener(event, listenerFn, { once: true });

export const removeOn: typeof document.removeEventListener = (
	// @ts-ignore => it actually works.
	event,
	// @ts-ignore => it actually works.
	listenerFn,
) => document.removeEventListener(event, listenerFn);
