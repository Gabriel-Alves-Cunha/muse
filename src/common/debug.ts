import { log } from "@common/log";

const debug = process.env.DEBUG?.split(",");

const logPlaylists = debug?.includes("muse:playlists");
const logGeneralDebug = debug?.includes("muse");
const logTests = debug?.includes("muse:tests");

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
