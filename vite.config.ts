import type { UserConfig as VitestUserConfig } from "vitest/config";
import type { UserConfig as ViteUserConfig } from "vite";

import { configDefaults } from "vitest/config";
import { defineConfig } from "vite";
import { resolve } from "node:path";
import react from "@vitejs/plugin-react";

const outputRendererBuildDirectory = resolve(__dirname, "./build/renderer");
const rendererPath = resolve(__dirname, "./src/renderer");

export default defineConfig(({ mode }) => {
	const isDev = mode === "development";
	const isTest = mode === "test";
	const isProd = !isTest && !isDev;

	const config: ViteUserConfig & VitestUserConfig = {
		test: {
			includeSource: ["src/**/*.{js,ts}"],
			environment: "happy-dom",
			dir: "./tests",
			logHeapUsage: true,
			// coverage: {
			// 	// reporter: ["html", "text"],
			// 	reporter: ["text"],
			// 	// all: true,
			// },
			exclude: [
				...configDefaults.exclude,
				"**/seeLeakedVariables.ts",
				"**/.eslintrc.{js,cjs}",
				"**/styles.ts",
				"**/global.ts",
				"coverage/**",
				"**/*.d.ts",
			],
		},

		define: isTest ? {} : { "import.meta.vitest": "undefined" },
		// @ts-ignore => This gives an error cause of VitestUserConfig type, but it works.
		plugins: [react()],
		root: rendererPath,
		envDir: "./",
		base: "./",

		build: {
			outDir: outputRendererBuildDirectory,
			chunkSizeWarningLimit: 1_000,
			reportCompressedSize: false,
			emptyOutDir: true,
			minify: "esbuild",
			target: "esnext",
			sourcemap: true,
			rollupOptions: {
				output: {
					assetFileNames: "assets/[name].[ext]",
					entryFileNames: "[name].js",
					chunkFileNames: "[name].js",
					minifyInternalExports: true,
					sourcemap: true,
					compact: isProd,
					format: "esm",
				},
			},
		},

		esbuild: {
			treeShaking: true,
			target: "esnext",
			sourcemap: true,
			format: "esm",
		},

		css: { devSourcemap: true },

		resolve: {
			alias: [
				{ find: "@renderer", replacement: resolve(__dirname, "src/renderer") },
				{ find: "@common", replacement: resolve(__dirname, "src/common") },
				{ find: "@main", replacement: resolve(__dirname, "src/main") },
				{ find: "@tests", replacement: resolve(__dirname, "tests") },
				{
					find: "@contexts",
					replacement: resolve(__dirname, "src/renderer/contexts"),
				},
				{
					find: "@components",
					replacement: resolve(__dirname, "src/renderer/components"),
				},
				{
					find: "@styles",
					replacement: resolve(__dirname, "src/renderer/styles"),
				},
				{
					find: "@routes",
					replacement: resolve(__dirname, "src/renderer/routes"),
				},
				{
					find: "@utils",
					replacement: resolve(__dirname, "src/renderer/utils"),
				},
				{
					find: "@hooks",
					replacement: resolve(__dirname, "src/renderer/hooks"),
				},
				{
					find: "@modules",
					replacement: resolve(__dirname, "src/renderer/modules"),
				},
			],
		},
	};

	// console.dir(
	// 	{ isTest, isDev, config },
	// 	{
	// 		maxStringLength: 1_000,
	// 		maxArrayLength: 40,
	// 		compact: false,
	// 		sorted: false,
	// 		colors: true,
	// 		depth: 10,
	// 	}
	// );

	return config;
});
