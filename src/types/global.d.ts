declare global {
	var runtimeGlobalsChecker: { getRuntimeGlobals: () => string[] };
	var isDev: boolean;
}

/*~ If your module exports nothing, you'll need this line. Otherwise, delete it */
export {};
