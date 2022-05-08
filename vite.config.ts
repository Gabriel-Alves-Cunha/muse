import { type UserConfig as VitestUserConfig } from "vitest";

import { type UserConfig as ViteUserConfig, defineConfig } from "vite";
import { configDefaults } from "vitest/config";
import { resolve } from "path";
import react from "@vitejs/plugin-react";

const outDirRenderer = resolve(__dirname, "./app/vite-renderer-build");
const rendererPath = resolve(__dirname, "./src/renderer");

// For some reason import.meta.env is not working...

// // @ts-ignore This has to be this way, otherwise it just does not work...
// const isDevelopment = String(process.env.NODE_ENV === "development");
// // @ts-ignore This has to be this way, otherwise it just does not work...
// const isTesting = String(process.env.VITEST ? true : false);
// console.log({ isDevelopment, isTesting });

type UserConfig = ViteUserConfig & VitestUserConfig;

const config: UserConfig = {
	test: {
		dir: "../__tests__",
		coverage: {
			// reporter: ["html", "text"],
			// reporter: ["text"],
			all: true,
		},
		exclude: [
			...(configDefaults.exclude as string[]),
			"**/seeLeakedVariables.ts",
			"**/.eslintrc.{js,cjs}",
			"**/forge.config.js",
			"**/animation.ts",
			"**/styles.ts",
			"**/global.ts",
			"coverage/**",
			"**/*.d.ts",
		],
	},
	plugins: [react()],
	root: rendererPath,
	base: "./",
	// define: {
	// 	VITE_IS_DEVELOPMENT: JSON.stringify(isDevelopment),
	// 	VITE_IS_TESTING: JSON.stringify(isTesting),
	// },
	build: {
		outDir: outDirRenderer,
		emptyOutDir: true,
		sourcemap: false,
		rollupOptions: {
			output: {
				entryFileNames: "[name].js",
				chunkFileNames: "[name].js",
				assetFileNames: "assets/[name].[ext]",
			},
		},
	},
	resolve: {
		alias: [
			{
				find: "@renderer",
				replacement: resolve(__dirname, "src/renderer"),
			},
			{
				find: "@common",
				replacement: resolve(__dirname, "src/common"),
			},
			{
				find: "@main",
				replacement: resolve(__dirname, "src/main"),
			},
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

export default defineConfig(config);
