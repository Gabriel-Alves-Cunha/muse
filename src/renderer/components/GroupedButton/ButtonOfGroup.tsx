export const ButtonOfGroup = (props: Props): JSX.Element => (
	<button data-grouped-button {...props} type="button" />
);

type Props = React.ButtonHTMLAttributes<HTMLButtonElement>;
