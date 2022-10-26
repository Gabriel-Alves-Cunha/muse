import { cancelConversionAndOrRemoveItFromList } from "../Converting/helper";
import { cancelDownloadAndOrRemoveItFromList } from "./helper";

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////

const fallAwayAnimationDuration = 600;
const moveUpDelay = 200;
const moveUpAnimationDuration = fallAwayAnimationDuration - moveUpDelay;

// export const ItemWrapper = styled("div", {
// 	pos: "relative",
// 	d: "flex",
// 	fd: "column",
// 	w: 236,
// 	h: 63,
//
// 	b: "1px solid $icon-button-hovered",
// 	br: 5,
// 	p: 10,
//
// 	animation: "none",
//
// 	"&.delete": {
// 		animationDuration: `${fallAwayAnimationDuration}ms`,
// 		animationTimingFunction: "ease-out",
// 		animationFillMode: "forwards",
// 		animationName: `${fallAway}`,
// 		animationDelay: "0s",
// 	},
//
// 	"&.move-up": {
// 		animationDuration: `${moveUpAnimationDuration}ms`,
// 		animationDelay: `${moveUpDelay}ms`,
// 		animationTimingFunction: "ease",
// 		animationFillMode: "forwards",
// 		animationName: `${moveUp}`,
// 	},
// });
//
// const ItemWrapperClass = `.${ItemWrapper.className}`;

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////

export function handleSingleItemDeleteAnimation(
	e: Readonly<React.PointerEvent<HTMLButtonElement>>,
	downloadingOrConvertionIndex: Readonly<number>,
	isDownloadList: Readonly<boolean>,
	url: Readonly<string>,
): void {
	const items = document.querySelectorAll(".ItemWrapperClass") as NodeListOf<
		HTMLDivElement
	>;

	//////////////////////////////////////////

	// Only add the animation to the ones below the one that was clicked:
	for (const [index, item] of items.entries()) {
		if (index <= downloadingOrConvertionIndex) continue;

		item.classList.add("move-up");
		item.addEventListener(
			"animationend",
			() => item.classList.remove("move-up"),
			{ once: true },
		);
	}

	//////////////////////////////////////////

	const itemClicked = (e.target as HTMLElement).closest(
		".ItemWrapperClass",
	) as HTMLDivElement;

	itemClicked.classList.add("delete");

	// Add event listener to the itemClicked to remove the animation:
	itemClicked.addEventListener("animationend", () => {
		isDownloadList ?
			cancelDownloadAndOrRemoveItFromList(url) :
			cancelConversionAndOrRemoveItFromList(url);
	});
	itemClicked.addEventListener("animationcancel", () => {
		// This is so users can just click the cancel
		// button and imediately leave the popup, wich
		// cancels the animation!

		isDownloadList ?
			cancelDownloadAndOrRemoveItFromList(url) :
			cancelConversionAndOrRemoveItFromList(url);
	});
}
