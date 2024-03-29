import { log } from "@common/log";

// The order here is the order on the navbar:
export const pages = [
	"Home",
	"Favorites",
	"History",
	"Download",
	"Convert",
] as const;

////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////

export function resetAllAppData(): void {
	log("Resetting all app data...");

	localStorage.clear();
}
