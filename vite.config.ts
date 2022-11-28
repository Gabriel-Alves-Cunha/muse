/// <reference types="vitest" />
/// <reference types="vite/client" />

import { type UserConfig, defineConfig } from "vite";
import { configDefaults } from "vitest/config";
import { resolve } from "node:path";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
	const isDevelopment = mode === "development";
	const isTest = mode === "test";

	const config: UserConfig = {
		// @ts-ignore => I can't get this type to work :(
		test: {
			includeSource: ["src/**/*.{js,ts}"],
			environment: "happy-dom",
			logHeapUsage: true,
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
			? { isDev: isDevelopment }
			: {
					"process.env": process.env ?? "{}",
					"import.meta.vitest": "undefined",
					isDev: isDevelopment,
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
				{ find: "@renderer", replacement: resolve("src/renderer") },
				{ find: "@common", replacement: resolve("src/common") },
				{ find: "@main", replacement: resolve("src/main") },
				{ find: "@tests", replacement: resolve("tests") },
			],
		},
	};

	return config;
});
