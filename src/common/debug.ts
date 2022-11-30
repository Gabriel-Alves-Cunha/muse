import { log } from "@utils/log";

const logPlaylists = process.env.DEBUG?.includes("muse:playlists");
const logGeneralDebug = process.env.DEBUG?.includes("muse");
const logTests = process.env.DEBUG?.includes("muse:tests");

export function dbg(...args: unknown[]): void {
	logGeneralDebug && log(...args);
}

export function dbgPlaylists(...args: unknown[]): void {
	logPlaylists && log(...args);
}

export function dbgTests(...args: unknown[]): void {
	logTests && log(...args);
}

dbg("\uD834\uDD60 Hello from the debug side! \uD834\uDD60");
