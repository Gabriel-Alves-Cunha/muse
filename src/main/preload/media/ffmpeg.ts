import { path } from "@ffmpeg-installer/ffmpeg";
import fluent_ffmpeg from "fluent-ffmpeg";

// I read that this could prevent possible errors on electron:
const ffmpegPath = path.replace("app.asar", "app.asar.unpacked");
fluent_ffmpeg.setFfmpegPath(ffmpegPath);

export { fluent_ffmpeg };
