export const RingLoader = ({ className = "", ...rest }: Props) => (
	<span className={`ring-loader ${className}`} {...rest}>
		<span className="right-ring-loader" />
		<span className="left-ring-loader" />
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
