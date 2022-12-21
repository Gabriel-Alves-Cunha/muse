import { networkInterfaces } from "node:os";

import { throwErr } from "@common/log";

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////

export const unableToShareMediasError =
	"Unable to get your ip address. Sharing medias is not possible!";

export const myIp = getMyIpAddress();

/////////////////////////////////////////////
/////////////////////////////////////////////

function getMyIpAddress(): string {
	// Got this from StackOverflow, if this ever fails, replace it.
	const myIp =
		Object.values(networkInterfaces())
			.flat()
			.filter((item) => !item?.internal && item?.family === "IPv4")
			.find(Boolean)?.address ?? "";

	if (!myIp) throwErr(unableToShareMediasError);

	return myIp;
}
