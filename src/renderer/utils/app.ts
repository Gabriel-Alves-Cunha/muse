// The order here is the order on the navbar:
export const pages = Object.freeze(
	["Home", "Favorites", "History", "Download", "Convert", "Share"] as const,
);

export function resetAllAppData() {
	console.log("Resetting all app data...");

	localStorage.clear();
}
