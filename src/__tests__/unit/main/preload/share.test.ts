import { expect, test } from "vitest";

import { anotherMediaPath, mediaPath, mediaPicture } from "./utils";
import { makeItOnlyOneFile } from "@main/preload/share";

test("Testing if 'makeItOnlyOneFile' works", async () => {
	const filepaths = new Set([mediaPath, mediaPicture, anotherMediaPath]);

	const oneFilePath = await makeItOnlyOneFile(filepaths);

	expect(oneFilePath).toBeTruthy();
}, 2_000);
