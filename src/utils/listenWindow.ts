import { isAModifierKeyPressed } from "./keyboard";
import { togglePlayPause } from "@contexts/useCurrentPlaying";
import { getMediaFiles } from "@contexts/usePlaylistsHelper";
import { error } from "./log";
import { on } from "./window";

//////////////////////////////////////////
//////////////////////////////////////////
//////////////////////////////////////////
// Listen for files drop:

export function listenWindow() {
	function listenToDragoverEvent(event: DragEvent): void {
		event.stopPropagation();
		event.preventDefault();

		if (!event.dataTransfer) return;

		event.dataTransfer.dropEffect = "link";
		// ^ Style the drag-and-drop as a "link file" operation.
	}

	//////////////////////////////////////////

	function listenToDropEvent(event: DragEvent): void {
		event.stopPropagation();
		event.preventDefault();

		if (!event.dataTransfer) return;

		const fileList = event.dataTransfer.files;
		const files = getMediaFiles(fileList);

		if (files.length === 0) return;

		error("@TODO: handle these files droped!", { fileList, files });
	}

	//////////////////////////////////////////

	on("dragover", listenToDragoverEvent);
	on("drop", listenToDropEvent);

	//////////////////////////////////////////

	function playOrPauseOnSpaceKey(e: KeyboardEvent): void {
		if (e.key === " " && !isAModifierKeyPressed(e)) togglePlayPause();
	}

	on("keyup", playOrPauseOnSpaceKey);
}
