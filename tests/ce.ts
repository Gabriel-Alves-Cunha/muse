import { makeRandomString } from "@common/utils";
import { getRandomInt } from "@utils/utils";

export const list = new Set(
	Array.from({ length: 100 }, (_value, index) => makeRandomString() + index),
);
export const randomIndex = getRandomInt(0, list.size);
export const ids = list.keys();
