import { DownloadValues, sendMsg, Type } from "./helpers";
import { TypeOfMsgObject } from "@common/@types/typesAndEnums";
import { dbg } from "@common/utils";

const {
	notificationApi: { receiveMsgFromElectron },
} = electron;

const handleDownloadMedia = (value: DownloadValues) =>
	sendMsg({ type: Type.START_DOWNLOAD, value });

receiveMsgFromElectron(object => {
	dbg("Received 'async-msg' from Electron on React side.\nobject =", object);

	switch (object.type) {
		case TypeOfMsgObject.DOWNLOAD_MEDIA: {
			handleDownloadMedia(object.params);
			break;
		}

		default: {
			console.error(
				"This 'async-msg' event has no receiver function!\nobject =",
				object,
			);
			break;
		}
	}
});
