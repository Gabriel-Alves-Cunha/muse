// @ts-ignore => it actually works.
export const on: typeof document.addEventListener = (event, listenerFn) =>
	document.addEventListener(event, listenerFn);

// @ts-ignore => it actually works.
export const once: typeof document.addEventListener = (event, listenerFn) =>
	document.addEventListener(event, listenerFn, { once: true });

// @ts-ignore => it actually works.
export const removeOn: typeof document.removeEventListener = (event, listenerFn) =>
	document.removeEventListener(event, listenerFn);
