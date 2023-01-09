export const ButtonOfGroup = (props: ButtonOfGroupProps) => (
	<button data-grouped-button {...props} />
);

type ButtonOfGroupProps = React.ButtonHTMLAttributes<HTMLButtonElement>;
