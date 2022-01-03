export const isDevelopment = process.env.NODE_ENV === "development";
console.log("Electron isDevelopment =", isDevelopment);

export const allowedMedias = [
	"vorbis",
	"webm",
	"flac",
	"opus",
	"mp3",
	"pcm",
	"pcm",
	"aac",
	"m4a",
	"m4p",
	"m4b",
	"m4r",
	"m4v",
] as const;

export const getBasename = (filename: string) =>
	filename.split("\\").pop()?.split("/").pop()?.split(".")[0] ?? "";

export const getPathWithoutExtension = (filename: string) =>
	filename.slice(0, filename.lastIndexOf("."));

export function formatTime(time: number | undefined) {
	if (time === undefined) return "";
	time = Math.trunc(time);

	const days = Math.floor(time / 86_400),
		hour = ("0" + (Math.floor(time / 3_600) % 24)).slice(-2),
		minutes = ("0" + (Math.floor(time / 60) % 60)).slice(-2),
		seconds = ("0" + (time % 60)).slice(-2);

	return (
		(days > 0 ? days + "d " : "") +
		(+hour > 0 ? hour + ":" : "") +
		(minutes + ":" + seconds)
	);
}
