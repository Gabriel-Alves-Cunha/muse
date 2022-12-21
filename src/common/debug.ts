import { log } from "@common/log";

const debug = process.env.DEBUG?.split(",");

const logPlaylists = debug?.includes("muse:playlists");
const logGeneralDebug = debug?.includes("muse");
const logTests = debug?.includes("muse:tests");

export const dbg = (...args: unknown[]): void =>
	(logGeneralDebug && log(...args)) as void;

export const dbgPlaylists = (...args: unknown[]): void =>
	(logPlaylists && log(...args)) as void;

export const dbgTests = (...args: unknown[]): void =>
	(logTests && log(...args)) as void;

dbg("\uD834\uDD60 Hello from the debug side! \uD834\uDD60");
