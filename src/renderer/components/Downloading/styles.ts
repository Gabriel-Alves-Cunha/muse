import { cancelConversionAndOrRemoveItFromList } from "../Converting/helper";
import { cancelDownloadAndOrRemoveItFromList } from "./helper";

const fallAway = "animation-fall-away";
const moveUp = "animation-move-up";
const boxClass = ".box";

export function handleSingleItemDeleteAnimation(
	e: React.PointerEvent<HTMLButtonElement>,
	downloadingOrConvertionIndex: number,
	isDownloadList: boolean,
	url: string
): void {
	const items = document.querySelectorAll(
		boxClass
	) as NodeListOf<HTMLDivElement>;
	const itemClicked = (e.target as HTMLElement).closest(
		boxClass
	) as HTMLDivElement;

	//////////////////////////////////////////

	for (const [index, item] of items.entries()) {
		// Only add the animation to the ones below the one that was clicked:
		if (index < downloadingOrConvertionIndex) continue;
		if (item === itemClicked) {
			itemClicked.classList.add(fallAway);
			continue;
		}

		item.classList.add(moveUp);
		item.addEventListener("animationend", () => item.classList.remove(moveUp), {
			once: true,
		});
	}

	//////////////////////////////////////////

	// Add event listener to the itemClicked to remove the animation:
	itemClicked.addEventListener("animationend", () => {
		isDownloadList
			? cancelDownloadAndOrRemoveItFromList(url)
			: cancelConversionAndOrRemoveItFromList(url);
	});
	itemClicked.addEventListener("animationcancel", () => {
		// This is so users can just click the cancel
		// button and imediately leave the popup, wich
		// would cancel the animation!

		isDownloadList
			? cancelDownloadAndOrRemoveItFromList(url)
			: cancelConversionAndOrRemoveItFromList(url);
	});
}
