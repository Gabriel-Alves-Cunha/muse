import { Trigger } from "@radix-ui/react-popover";

import { cancelConversionAndOrRemoveItFromList } from "../Converting/helper";
import { cancelDownloadAndOrRemoveItFromList } from "./helper";
import { keyframes, styled } from "@styles/global";

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////

export const StyledPopoverTrigger = styled(Trigger, {
	pos: "relative",
	dflex: "center",
	size: 40,

	cursor: "pointer",
	bg: "none",
	b: "none",

	c: "$deactivated-icon",
	fs: "1rem",

	"&:hover, &:focus": { c: "$active-icon" },

	"&.has-items span": {
		pos: "absolute",
		size: 18,
		r: -8,
		t: 0,

		bg: "#007200",
		br: "50%",

		"&::before": {
			// This shit was hard to center properly
			content: "attr(data-length)",
			pos: "relative",
			justifyContent: "center",
			alignItems: "center",
			dflex: "center",
			size: "100%",
			r: -1,

			fontStyle: "normal",
			ff: "$secondary",
			ls: "0.03rem",
			c: "white",
			fw: 500,
			fs: 11,
		},
	},
});

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////

const fallAway = keyframes({
	"0%": { transform: "rotateZ(0deg)", opacity: 1, top: 0 },

	"25%": { transform: "rotateZ(-15deg)" },

	"100%": { transform: "rotateZ(-5deg)", opacity: 0, top: 200 },
});

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////

const moveUp = keyframes({
	"0%": { transform: "translateY(0px)" },

	"100%": {
		// -73 is the (height + 1 * gap):
		transform: "translateY(-73px)",
	},
});

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////

const fallAwayAnimationDuration = 600;
const moveUpDelay = 200;
const moveUpAnimationDuration = fallAwayAnimationDuration - moveUpDelay;

export const ItemWrapper = styled("div", {
	pos: "relative",
	d: "flex",
	fd: "column",
	w: 236,
	h: 63,

	b: "1px solid $icon-button-hovered",
	br: 5,
	p: 10,

	animation: "none",

	"&.delete": {
		animationDuration: `${fallAwayAnimationDuration}ms`,
		animationTimingFunction: "ease-out",
		animationFillMode: "forwards",
		animationName: `${fallAway}`,
		animationDelay: "0s",
	},

	"&.move-up": {
		animationDuration: `${moveUpAnimationDuration}ms`,
		animationDelay: `${moveUpDelay}ms`,
		animationTimingFunction: "ease",
		animationFillMode: "forwards",
		animationName: `${moveUp}`,
	},
});

const ItemWrapperClass = `.${ItemWrapper.className}`;

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////

export const TitleAndCancelWrapper = styled("div", {
	pos: "relative",
	d: "flex", // row
	justifyContent: "flex-start",
	alignItems: "center",
	w: "90%",
	h: 16,

	mb: 10,

	"& p": {
		c: "$alternative-text",
		whiteSpace: "nowrap", // keep it one line
		ff: "$primary",
		fs: "0.9rem",
		ta: "left",

		ov: "hidden",
		w: "90%",
	},
});

//////////////////////////////////////////
//////////////////////////////////////////
//////////////////////////////////////////

export function handleSingleItemDeleteAnimation(
	e: Readonly<React.MouseEvent<HTMLButtonElement, MouseEvent>>,
	downloadingOrConvertionIndex: Readonly<number>,
	isDownloadList: Readonly<boolean>,
	url: Readonly<string>,
): void {
	const items = document.querySelectorAll(ItemWrapperClass) as NodeListOf<
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
		ItemWrapperClass,
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
