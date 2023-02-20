import { configDefaults } from "vitest/config";
import { defineConfig } from "vite";
import { resolve } from "node:path";
import react from "@vitejs/plugin-react-swc";

export default defineConfig(({ mode }) => {
	const isDev = mode === "development";
	const isTest = mode === "test";

	return {
		// @ts-ignore => I can't get this type to work :(
		test: {
			includeSource: ["src/**/*.{js,ts}"],
			environment: "happy-dom",
			logHeapUsage: true,
			dir: "tests",
			// coverage: {
			// 	// reporter: ["html", "text"],
			// 	reporter: ["text"],
			// 	// all: true,
			// },
			exclude: [
				...configDefaults.exclude,
				"**/seeLeakedVariables.ts",
				"**/styles.ts",
				"**/global.ts",
				"coverage/**",
				"**/*.d.ts",
			],
		},

		define: isTest
			? { isDev }
			: {
					"process.env": process.env ?? "{}",
					isDev,
			  },
		server: { port: 3_000 },
		root: "./src/renderer",
		plugins: [react()],
		base: "./",

		resolve: {
			alias: [
				{
					find: "@components",
					replacement: resolve("src/renderer/components"),
				},
				{ find: "@contexts", replacement: resolve("src/renderer/contexts") },
				{ find: "@modules", replacement: resolve("src/renderer/modules") },
				{ find: "@assets", replacement: resolve("src/renderer/assets") },
				{ find: "@styles", replacement: resolve("src/renderer/styles") },
				{ find: "@routes", replacement: resolve("src/renderer/routes") },
				{ find: "@utils", replacement: resolve("src/renderer/utils") },
				{ find: "@hooks", replacement: resolve("src/renderer/hooks") },
				{ find: "@i18n", replacement: resolve("src/renderer/i18n") },
				{ find: "@renderer", replacement: resolve("src/renderer") },
				{ find: "@common", replacement: resolve("src/common") },
				{ find: "@main", replacement: resolve("src/main") },
				{ find: "@tests", replacement: resolve("tests") },
			],
		},
	} satisfies ReturnType<typeof defineConfig>;
});
