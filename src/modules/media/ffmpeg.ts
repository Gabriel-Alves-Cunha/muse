import fluent_ffmpeg, { setFfmpegPath } from "fluent-ffmpeg";
import { path } from "@ffmpeg-installer/ffmpeg";

// I read that this could prevent possible errors on electron:
setFfmpegPath(path.replace("app.asar", "app.asar.unpacked"));

export { fluent_ffmpeg };
