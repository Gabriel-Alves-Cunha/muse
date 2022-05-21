export const keyPrefix = "@muse:";

export const pages = Object.freeze([
	"Home",
	"Favorites",
	"History",
	"Download",
	"Convert",
] as const);

export const resetAllAppData = () => {
	console.log("Resetting all app data...");

	localStorage.clear();
};
