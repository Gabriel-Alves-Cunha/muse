import { type DialogTriggerProps, Trigger } from "@radix-ui/react-dialog";

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////
// Main function:

export const DialogTrigger = ({ children, className = "", tooltip }: Props) => (
	<Trigger
		className={"unset-all relative flex justify-center items-center w-7 h-7 text-icon-deactivated cursor-pointer bg-none rounded-full border-none hover:bg-icon-button-hovered [&_svg]:hover:text-normal focus:bg-icon-button-hovered [&_svg]:focus:text-normal transition-none " +
			className}
		title={tooltip}
	>
		{children}
	</Trigger>
);

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////
// Styles:

interface Props extends DialogTriggerProps {
	readonly children: React.ReactNode;
	readonly tooltip: string;
}
