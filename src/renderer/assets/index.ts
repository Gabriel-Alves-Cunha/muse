// This file is intended so Vite can bundle the assets
// when the renderer is built.

// these are not consumed anywhere, but it's needed to make the renderer bundle them:
export const font_1 = new URL(
	"./fonts/assistant-v16-latin-300.woff2",
	import.meta.url,
);
export const font_2 = new URL(
	"./fonts/assistant-v16-latin-500.woff2",
	import.meta.url,
);
export const font_3 = new URL(
	"./fonts/assistant-v16-latin-regular.woff2",
	import.meta.url,
);
export const font_4 = new URL(
	"./fonts/source-sans-pro-v21-latin-regular.woff2",
	import.meta.url,
);
