import { configDefaults } from "vitest/config";
import { defineConfig } from "vite";
import { resolve } from "node:path";
import react from "@vitejs/plugin-react-swc";

export default defineConfig(({ mode }) => {
	const isDev = mode === "development";
	const isTest = mode === "test";
	const minify = !(isDev || isTest);

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

		build: {
			rollupOptions: {
				// make sure to externalize deps that shouldn't be bundled
				// into your library
				// external: ["esbuild", "electron", "vite"],
				preserveEntrySignatures: "strict",
				strictDeprecations: true,

				// https://rollupjs.org/guide/en/#big-list-of-options
				output: {
					generatedCode: {
						objectShorthand: true,
						constBindings: true,
						preset: "es2015",
					},

					assetFileNames: "assets/[name].[ext]",
					minifyInternalExports: minify,
					// entryFileNames: "[name].mjs", // This cannot be set! It overrides the entry name.
					chunkFileNames: "[name].mjs",
					dir: "./build/web",
					sourcemap: false,
					format: "esm",
				},
			},

			// Tauri uses Chromium on Windows and WebKit on macOS and Linux
			target:
				process.env.TAURI_PLATFORM === "windows" ? "chrome105" : "safari13",
			lib: { entry: "src/main.ts", formats: ["es"] },
			modulePreload: { polyfill: true },
			chunkSizeWarningLimit: 1_000,
			reportCompressedSize: false,
			emptyOutDir: false,
			sourcemap: true,
			minify,
		},

		esbuild: {
			minifyIdentifiers: minify,
			minifyWhitespace: minify,
			minifySyntax: minify,
			treeShaking: true,
			sourcemap: false,
			target: "esnext",
			platform: "node",
			logLevel: "info",
			charset: "utf8",
			format: "esm",
			logLimit: 10,
			color: true,
		},

		define: isTest
			? { isDev }
			: ({
					"process.env": process.env ?? "{}",
					"process.__esModule": "undefined",
					isDev,
			  } as const),
		// This dep is not available and Vite tries to preload it anyway, so, ignoring it:
		optimizeDeps: { exclude: ["./lib-cov/fluent-ffmpeg"] },
		// Tauri expects a fixed port, fail if that port is not available:
		server: { port: 3_000, strictPort: true },
		clearScreen: false, // Prevent vite from obscuring rust errors.
		plugins: [react()],
		root: "./src",
		base: "./",

		// to make use of `TAURI_PLATFORM`, `TAURI_ARCH`, `TAURI_FAMILY`,
		// `TAURI_PLATFORM_VERSION`, `TAURI_PLATFORM_TYPE` and `TAURI_DEBUG`
		// env variables:
		envPrefix: ["VITE_", "TAURI_"],

		resolve: {
			alias: [
				{
					find: "@components",
					replacement: resolve("src/components"),
				},
				// This dep is not available but for some reason it's called in the lib
				// anyway, but this workaround works:
				{ find: "./lib-cov/fluent-ffmpeg", replacement: "./lib/fluent-ffmpeg" },
				{ find: "@contexts", replacement: resolve("src/contexts") },
				{ find: "@modules", replacement: resolve("src/modules") },
				{ find: "@assets", replacement: resolve("src/assets") },
				{ find: "@styles", replacement: resolve("src/styles") },
				{ find: "@routes", replacement: resolve("src/routes") },
				{ find: "@utils", replacement: resolve("src/utils") },
				{ find: "@hooks", replacement: resolve("src/hooks") },
				{ find: "@i18n", replacement: resolve("src/i18n") },
				{ find: "@tests", replacement: resolve("tests") },
			],
		},
	} satisfies ReturnType<typeof defineConfig>;
});
