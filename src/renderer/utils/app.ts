import { debug, enable } from "debug";

export const capitalizedAppName = "Muse" as const;
export const lowercaseAppName = "muse" as const;

export const dbg = debug(lowercaseAppName);
enable(lowercaseAppName);
dbg("\uD834\uDD60 Hello from the debug side! \uD834\uDD60");

export const keyPrefix = "@muse:";

export const folders = [
	"Home",
	"Favorites",
	"History",
	"Download",
	"Convert",
	"Settings",
] as const;
