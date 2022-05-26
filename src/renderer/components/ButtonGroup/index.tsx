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
					index,
				) => (
					<Button
						className={className + additionalClasses(index)}
						data-tooltip={tooltip}
						onClick={e => {
							hideTooltip(e);
							onClick(e);
						}}
						key={title}
					>
						{title}
						{icon}
					</Button>
				),
			)}
		</Wrapper>
	);
}

async function hideTooltip(e: React.MouseEvent<HTMLButtonElement>) {
	const target = e.target as HTMLElement;

	target.classList.remove("tooltip-able");

	setTimeout(() => target.classList.add("tooltip-able"), 0);
}

type Props = {
	buttons: GroupButtonProps[];
};

export type GroupButtonProps = {
	onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
	icon?: React.ReactNode;
	className?: string;
	tooltip?: string;
	title?: string;
};
