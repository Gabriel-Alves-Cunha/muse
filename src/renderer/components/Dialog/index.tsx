import { Trigger } from "@radix-ui/react-dialog";

import { styled } from "@styles/global";

export const DialogTrigger = ({ children, className, tooltip }: Props) => (
	<StyledTrigger className={className} data-tip={tooltip} data-place="bottom">
		{children}
	</StyledTrigger>
);

const StyledTrigger = styled(Trigger, {
	m: "unset",

	position: "relative",
	dflex: "center",
	size: 29,

	c: "$deactivated-icon",
	cursor: "pointer",
	bg: "none",
	br: "50%",
	b: "none",

	transition: "$bgc",

	"&:hover": { transition: "$bgc", bg: "$icon-button-hovered" },

	"&.unset-margin": { m: "unset" },

	"&.on-media-player": {
		c: "$media-player-icons",

		"&:hover": { transition: "$bgc", bg: "$media-player-icon-button-hovered" },
	},
});

type Props = {
	children: React.ReactNode;
	className?: string;
	tooltip: string;
};
