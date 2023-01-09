export const Button = ({ variant, ...props }: Props) => (
	<button data-variant={variant} data-button {...props} />
);

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////
// Types:

interface Props
	extends React.DetailedHTMLProps<
		React.ButtonHTMLAttributes<HTMLButtonElement>,
		HTMLButtonElement
	> {
	readonly variant: "large" | "medium" | "input" | "circle";
}
