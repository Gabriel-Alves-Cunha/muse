/* eslint-disable */

import {
	handleCreateOrCancelDownload,
	handleCreateOrCancelConvert,
	receiveMsgFromElectron,
	transformPathsToMedias,
	convertToAudio,
	makeStream,
	writeTags,
} from "../../../main/preload";

// it("should send a message to electron main side", () => {
// 	const obj = { type: "maximize", msg: undefined };

// 	const fn = spyOn(sendNotificationToElectron, "arguments");

// 	expect(fn).toBeCalledWith({ type: "maximize", msg: undefined });
// });
