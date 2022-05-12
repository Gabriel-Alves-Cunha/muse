export const keyPrefix = "@muse:";

export const pages = Object.freeze([
	"Home",
	"Favorites",
	"History",
	"Download",
	"Convert",
] as const);

export function resetAllAppData() {
	localStorage.clear();
}
