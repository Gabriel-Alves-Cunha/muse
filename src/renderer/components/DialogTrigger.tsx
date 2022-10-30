import { type DialogTriggerProps, Trigger } from "@radix-ui/react-dialog";

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////
// Main function:

export const DialogTrigger = (
	{ className = "", tooltip, ...props }: Props,
) => (
	<Trigger
		className={"dialog-trigger " + className}
		title={tooltip}
		{...props}
	/>
);

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////
// Styles:

interface Props extends DialogTriggerProps {
	readonly tooltip: string;
}
