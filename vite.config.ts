import { defineConfig } from "vite";
import { resolve } from "path";
import react from "@vitejs/plugin-react";

const outDirRenderer = resolve(__dirname, "./renderer-build");
const rendererPath = resolve(__dirname, "./src/renderer");

export default defineConfig({
	plugins: [react()],
	base: "./",
	root: rendererPath,
	build: {
		outDir: outDirRenderer,
		emptyOutDir: true,
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
				find: "@pages",
				replacement: resolve(__dirname, "src/renderer/pages"),
			},
			{
				find: "@utils",
				replacement: resolve(__dirname, "src/renderer/utils"),
			},
			{
				find: "@hooks",
				replacement: resolve(__dirname, "src/renderer/hooks"),
			},
		],
	},
});
