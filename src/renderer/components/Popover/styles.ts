import { Content } from "@radix-ui/react-popover";

import { styled } from "@styles/global";

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////

export const StyledContent = styled(Content, {
	d: "flex",
	fd: "column",
	gap: 10,

	bg: "$bg-popover",
	ox: "hidden",
	br: 10,
	p: 10,

	boxShadow: "$popover",
	zIndex: 100,
	scroll: 2,

	/////////////////////////////////////////

	"& > p": {
		pos: "relative",

		c: "$deactivated-icon",
		ff: "$secondary",
		ls: "0.03rem",
		fs: "1.05rem",
		ta: "center",
		fw: 500,
	},

	/////////////////////////////////////////

	"&:focus": { boxShadow: "$popover", outline: "none" },

	/////////////////////////////////////////

	variants: {
		size: {
			"nothing-found-for-convertions-or-downloads": {
				h: 100,
				w: 260,

				ov: "hidden",
			},
			"nothing-found-for-search-media": {
				maxHeight: 100,
				minHeight: 50,
				w: 300,
			},
			"convertions-or-downloads": { h: 300, w: 260 },
			"search-media-results": {
				pos: "absolute",
				l: "calc(64px + 3.5vw)",
				h: 250,
				w: 300,
				t: 90,
			},
		},
	},
});
