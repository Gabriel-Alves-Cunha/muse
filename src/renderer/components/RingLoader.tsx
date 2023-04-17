export const RingLoader = (props: Props): JSX.Element => (
	<span data-ring-loader {...props}>
		<span />
		<span />
	</span>
);

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////
// Types:

type Props = React.DetailedHTMLProps<
	React.HTMLAttributes<HTMLSpanElement>,
	HTMLSpanElement
>;
