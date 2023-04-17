export const ButtonOfGroup = (props: Props): JSX.Element => (
	<button data-grouped-button {...props} />
);

type Props = React.ButtonHTMLAttributes<HTMLButtonElement>;
