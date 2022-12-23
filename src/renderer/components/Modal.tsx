export const ModalTrigger = ({
	labelClassName = "",
	inputClassName = "",
	htmlTargetName,
	labelProps,
	inputProps,
	children,
}: TriggerProps) => (
	<>
		<label className={labelClassName} htmlFor={htmlTargetName} {...labelProps}>
			{children}
		</label>

		<input
			className={`modal-state ${inputClassName}`}
			id={htmlTargetName}
			type="checkbox"
			{...inputProps}
		/>
	</>
);

/////////////////////////////////////////////

export const ModalContent = ({
	closeOnClickOutside,
	className = "",
	htmlFor,
	blur,
	...rest
}: ContentProps) => (
	<div className={`modal-content-wrapper ${className}`}>
		<label
			className="modal-outside"
			htmlFor={closeOnClickOutside ? htmlFor : undefined}
		/>

		<div className={`modal-content ${className}`} {...rest} />
	</div>
);

/////////////////////////////////////////////

export const CloseModal = ({
	className = "",
	htmlFor,
	...rest
}: CloseProps) => (
	<label className={`modal-close ${className}`} htmlFor={htmlFor} {...rest} />
);

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////
// Types:

interface TriggerProps {
	labelProps?: React.DetailedHTMLProps<
		React.LabelHTMLAttributes<HTMLLabelElement>,
		HTMLLabelElement
	>;
	inputProps?: React.DetailedHTMLProps<
		React.InputHTMLAttributes<HTMLInputElement>,
		HTMLInputElement
	>;
	children: React.ReactNode;
	labelClassName?: string;
	inputClassName?: string;
	htmlTargetName: string;
}

/////////////////////////////////////////////

interface ContentProps
	extends React.DetailedHTMLProps<
		React.LabelHTMLAttributes<HTMLDivElement>,
		HTMLDivElement
	> {
	closeOnClickOutside?: boolean;
	htmlFor: string;
	blur?: boolean;
}

/////////////////////////////////////////////

interface CloseProps
	extends React.DetailedHTMLProps<
		React.LabelHTMLAttributes<HTMLLabelElement>,
		HTMLLabelElement
	> {
	htmlFor: string;
}
