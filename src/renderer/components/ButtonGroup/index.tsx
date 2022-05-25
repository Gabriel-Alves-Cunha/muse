import { Wrapper, Button } from "./styles";

export function ButtonGroup({ buttons }: Props) {
	const isOnlyOneButton = buttons.length === 1;
	const isFirstButton = (index: number) => index === 0;
	const isLastButton = (index: number) => index === buttons.length - 1;

	const additionalClasses = (index: number) => {
		if (isOnlyOneButton) return " single-button";
		else if (isFirstButton(index)) return " first";
		else if (isLastButton(index)) return " last";
		return "";
	};

	return (
		<Wrapper>
			{buttons.map(
				(
					{
						onClick = () => undefined,
						className = "",
						tooltip = "",
						title = "",
						icon,
					},
					index
				) => (
					<Button
						className={className + additionalClasses(index)}
						onMouseMove={waitForTooltip}
						data-tooltip={tooltip}
						onClick={onClick}
						key={title}
					>
						<span />
						{title}
						{icon}
					</Button>
				)
			)}
		</Wrapper>
	);
}

async function waitForTooltip(e: React.MouseEvent<HTMLButtonElement>) {
	const target = e.target as HTMLButtonElement;
	const tooltip = target.dataset["tooltip"];

	if (!tooltip) return;

	setTimeout(() => {
		// display tooltip
		target.setAttribute("title", tooltip);
	}, 300);
}

type Props = {
	buttons: GroupButtonProps[];
};

export type GroupButtonProps = {
	icon?: React.ReactNode;
	onClick?: () => void;
	className?: string;
	tooltip?: string;
	title?: string;
};
