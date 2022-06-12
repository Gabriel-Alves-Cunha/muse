/// <reference types="vitest" />

import { configDefaults } from "vitest/config";
import { defineConfig } from "vite";
import { resolve } from "node:path";
import react from "@vitejs/plugin-react";

const outDirRenderer = resolve(__dirname, "./app/vite-renderer-build");
const rendererPath = resolve(__dirname, "./src/renderer");

export default defineConfig({
	test: {
		dir: "../__tests__",
		coverage: {
			// reporter: ["html", "text"],
			// reporter: ["text"],
			all: true,
		},
		exclude: [
			...configDefaults.exclude,
			"**/seeLeakedVariables.ts",
			"**/.eslintrc.{js,cjs}",
			"**/styles.ts",
			"**/global.ts",
			"coverage/**",
			"**/*.d.ts",
		],
		logHeapUsage: true,
	},

	plugins: [react()],
	root: rendererPath,
	base: "./",
	build: {
		outDir: outDirRenderer,
		emptyOutDir: true,
		minify: "esbuild",
		target: "esnext",
		sourcemap: false,
		rollupOptions: {
			output: {
				format: "esm",
				entryFileNames: "[name].js",
				chunkFileNames: "[name].js",
				assetFileNames: "assets/[name].[ext]",
			},
		},
	},
	esbuild: {
		sourcemap: "external",
		treeShaking: true,
		target: "esnext",
		format: "esm",
		minify: true,
	},
	css: {
		devSourcemap: true,
	},
	assetsInclude: ["**/*.woff2"],
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
});

