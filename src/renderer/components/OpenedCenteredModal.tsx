export const OpenedCenteredModal = ({
	className = "",
	htmlTargetName,
	...rest
}: Props) => (
	<>
		<input
			className="modal-state"
			id={htmlTargetName}
			type="checkbox"
			defaultChecked
		/>

		<div className="modal-content-wrapper visible">
			<div
				className={`modal-content ${className}`}
				// Doing this to trap focus inside modal!
				onTransitionEnd={(e) => {
					e.currentTarget.querySelector("label")?.focus();
				}}
				{...rest}
			/>
		</div>
	</>
);

export const CloseOpenedCenteredModal = ({
	className = "",
	htmlFor,
	...rest
}: CloseOpenedCenteredModalProps) => (
	<label className={className} htmlFor={htmlFor} tabIndex={0} {...rest} />
);

interface Props
	extends React.DetailedHTMLProps<
		React.HTMLAttributes<HTMLDivElement>,
		HTMLDivElement
	> {
	htmlTargetName: string;
}

interface CloseOpenedCenteredModalProps
	extends React.DetailedHTMLProps<
		React.LabelHTMLAttributes<HTMLLabelElement>,
		HTMLLabelElement
	> {
	htmlFor: string;
}
