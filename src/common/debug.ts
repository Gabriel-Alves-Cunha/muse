// @ts-ignore => This has to be by dot notation:
const logPlaylists = process.env.DEBUG?.includes("muse:playlists") ?? false;
// @ts-ignore => This has to be by dot notation:
const logGeneralDebug = process.env.DEBUG?.includes("muse") ?? false;
// @ts-ignore => This has to be by dot notation:
const logTests = process.env.DEBUG?.includes("muse:tests") ?? false;

export function dbg(...args: unknown[]): void {
	if (logGeneralDebug === true) console.log(...args);
}

export function dbgPlaylists(...args: unknown[]): void {
	if (logPlaylists === true) console.log(...args);
}

export function dbgTests(...args: unknown[]): void {
	if (logTests === true) console.log(...args);
}

dbg("\uD834\uDD60 Hello from the debug side! \uD834\uDD60");
