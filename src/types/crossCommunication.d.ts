import type { DownloadInfo, Path } from "./generalTypes";

import { MessageToFrontend, MessageToBackend } from "@utils/enums";

/////////////////////////////////////////////

export type MsgObjectToBackend = Readonly<
	| { type: typeof MessageToBackend.ERROR; payload: { error: Error } }
	| { type: typeof MessageToBackend.CREATE_A_NEW_DOWNLOAD }
	| { type: typeof MessageToBackend.CONVERT_MEDIA }
	| {
			type: typeof MessageToBackend.WRITE_TAG;
			thingsToChange: MetadataToChange;
			mediaPath: Path;
	  }
>;

/////////////////////////////////////////////

export type MsgObjectToFrontend = Readonly<
	| { [typeof MessageToFrontend.RESCAN_ONE_MEDIA]: { mediaPath: Path } }
	| { [typeof MessageToFrontend.REMOVE_ONE_MEDIA]: { mediaPath: Path } }
	| { [typeof MessageToFrontend.ADD_ONE_MEDIA]: { mediaPath: Path } }
	| { [typeof MessageToFrontend.RESCAN_ALL_MEDIA]: undefined }
	| { [typeof MessageToFrontend.ERROR]: { error: Error } }
	| {
			[typeof MessageToFrontend.DELETE_ONE_MEDIA_FROM_COMPUTER]: {
				mediaPath: Path;
			};
	  }
	| {
			[typeof MessageToFrontend.CREATE_A_NEW_DOWNLOAD]: {
				downloadInfo: DownloadInfo;
			};
	  }
>;
