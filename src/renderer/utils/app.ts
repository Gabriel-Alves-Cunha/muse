export const keyPrefix = "@muse:";

export const pages = Object.freeze(<const>[
	"Home",
	"Favorites",
	"History",
	"Download",
	"Convert",
	"Settings",
]);
export type Page = typeof pages[number];
