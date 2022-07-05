import { Trigger } from "@radix-ui/react-dialog";

import { styled } from "@styles/global";

export const DialogTrigger = ({ children, className, tooltip }: Props) => (
	<StyledDialogTrigger
		className={className + " notransition"}
		data-place="bottom"
		data-tip={tooltip}
	>
		{children}
	</StyledDialogTrigger>
);

const StyledDialogTrigger = styled(Trigger, {
	m: "unset",

	position: "relative",
	dflex: "center",
	size: 29,

	c: "$deactivated-icon",
	cursor: "pointer",
	bg: "none",
	br: "50%",
	b: "none",

	"&:hover, &:focus": { bg: "$icon-button-hovered", "& svg": { c: "$text" } },

	"&.on-media-player": {
		c: "$media-player-icons",

		"&:hover, &:focus": {
			bg: "$media-player-icon-button-hovered",

			"& svg": { c: "inherit" }, // keep same color
		},
	},
});

type Props = {
	children: React.ReactNode;
	className?: string;
	tooltip: string;
};
