import {
	ItemIndicator as CtxItemIndicator,
	CheckboxItem as CtxCheckboxItem,
	RadioItem as CtxRadioItem,
	Separator as CtxSeparator,
	Trigger as CtxTrigger,
	Label as CtxLabel,
	Item as CtxItem,
} from "@radix-ui/react-context-menu";

// DONE
export const RightSlot = styled("div", {
	ml: "auto",
	pl: 20,

	c: "$ctx-menu-text",
	ff: "$secondary",
	ls: "0.03rem",
	fs: 15,
	lh: 1,

	":focus > &": { c: "$ctx-menu-item-text-focus" },

	"[data-disabled] &": { c: "$ctx-menu-item-text-disabled" },

	"&#search": { pr: 10, pl: 0, c: "$input-placeholder" },
});

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////

export const Item = styled(CtxItem, { ...itemStyles });

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////

export const CheckboxItem = styled(CtxCheckboxItem, { ...itemStyles });

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////

export const RadioItem = styled(CtxRadioItem, { ...itemStyles });

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////

export const TriggerItem = styled(CtxTrigger, {
	"&[data-state='open']": { c: "$ctx-menu-item-text", bg: "white" },

	...itemStyles,
});

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////

export const Label = styled(CtxLabel, {
	pl: 25,

	c: "$ctx-menu-text",
	ff: "$secondary",
	lh: "25px",
	fs: 12,
});

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////

export const Separator = styled(CtxSeparator, {
	bg: "$ctx-menu-separator",
	h: 1,
	m: 5,
});

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////

export const ItemIndicator = styled(CtxItemIndicator, {
	pos: "absolute",
	d: "inline-flex",
	justifyContent: "center",
	alignItems: "center",
	left: 0,
	w: 25,
});
