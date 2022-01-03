import { homedir } from "os";
import { join } from "path";

// This path has to be like this cause of the transpiling of
// Typescript -> Javascript output dir is different for 'main'
// compared to 'electron' (confirm with the log):
export const logoPath = join(
	__dirname,
	"..",
	"..",
	"..",
	"src",
	"electron",
	"assets",
	"icons",
	"logo.png"
);
// console.log("logoPath =", logoPath);

export const homeDir = homedir();
export const dirs = Object.freeze({
	documents: join(homeDir, "Documents"),
	downloads: join(homeDir, "Downloads"),
	music: join(homeDir, "Music"),
});
