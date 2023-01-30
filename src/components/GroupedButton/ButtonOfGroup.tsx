export const ButtonOfGroup = (props: Props) => (
	<button data-grouped-button {...props} />
);

type Props = React.ButtonHTMLAttributes<HTMLButtonElement>;
