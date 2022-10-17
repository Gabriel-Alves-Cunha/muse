const logPlaylists = process.env.DEBUG?.includes("muse:playlists") ?? false;
const logGeneralDebug = process.env.DEBUG?.includes("muse") ?? false;
const logTests = process.env.DEBUG?.includes("muse:tests") ?? false;

export function dbg(...args: unknown[]): void {
	logGeneralDebug && console.log(...args);
}

export function dbgPlaylists(...args: unknown[]): void {
	logPlaylists && console.log(...args);
}

export function dbgTests(...args: unknown[]): void {
	logTests && console.log(...args);
}

dbg("\uD834\uDD60 Hello from the debug side! \uD834\uDD60");
