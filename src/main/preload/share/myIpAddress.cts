import { networkInterfaces } from "node:os";

import { dbg } from "@common/debug";

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////

export const unableToShareMediasError = new Error(
	"Unable to get your ip address. Sharing medias is not possible!",
);

export const myIp = getMyIpAddress();
dbg(`My ip address = ${myIp}`);

/////////////////////////////////////////////
/////////////////////////////////////////////

function getMyIpAddress(): Readonly<string> {
	// Got this from StackOverflow, if this ever fails, replace it.
	const myIp = Object
		.values(networkInterfaces())
		.flat()
		.filter(item => !item?.internal && item?.family === "IPv4")
		.find(Boolean)
		?.address ?? "";

	if (myIp.length === 0)
		throw unableToShareMediasError;

	return myIp;
}
