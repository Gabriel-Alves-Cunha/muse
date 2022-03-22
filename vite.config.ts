import { type UserConfig as UserConfigFromVitest } from "vitest";

import { type UserConfig as UserConfigFromVite, defineConfig } from "vite";
import { configDefaults } from "vitest/config";
import { resolve } from "path";
import react from "@vitejs/plugin-react";

const outDirRenderer = resolve(__dirname, "./app/vite-renderer-build");
const rendererPath = resolve(__dirname, "./src/renderer");

export default defineConfig({
	plugins: [react()],
	root: rendererPath,
	base: "./",
	define: {
		"process.env.FLUENTFFMPEG_COV": false,
		// ^ This because, when transitioning to Tauri, this is an error that appeared...
	},
	test: {
		coverage: {
			// reporter: ["html", "text"],
			reporter: ["text"],
			all: true,
		},
		exclude: [
			...(configDefaults.exclude as string[]),
			"**/seeLeakedVariables.ts",
			"**/.eslintrc.{js,cjs}",
			"**/animation.ts",
			"**/styles.ts",
			"**/global.ts",
			"**/theme.ts",
			"coverage/**",
			"**/*.d.ts",
		],
	},
	build: {
		outDir: outDirRenderer,
		emptyOutDir: true,
		sourcemap: false,
		rollupOptions: {
			output: {
				assetFileNames: "assets/[name].[ext]",
				entryFileNames: "[name].js",
				chunkFileNames: "[name].js",
			},
		},
	},
	resolve: {
		alias: [
			{
				find: "@components",
				replacement: resolve(__dirname, "src/renderer/components"),
			},
			{
				find: "@contexts",
				replacement: resolve(__dirname, "src/renderer/contexts"),
			},
			{
				find: "@modules",
				replacement: resolve(__dirname, "src/renderer/modules"),
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
		],
	},
} as UserConfigFromVitest & UserConfigFromVite);
