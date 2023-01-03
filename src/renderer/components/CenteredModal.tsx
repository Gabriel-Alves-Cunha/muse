import { forwardRef } from "react";

export const CenteredModalTrigger = ({
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

export const CenteredModalContent = ({
	closeOnClickOutside,
	className = "",
	htmlFor,
	...rest
}: ContentProps) => (
	<div className={`modal-content-wrapper ${className}`}>
		<label
			className="modal-outside"
			htmlFor={closeOnClickOutside ? htmlFor : undefined}
		/>

		<div
			className={`modal-content ${className}`}
			onTransitionEnd={(e) => {
				// Doing this to trap focus inside modal!
				(e.target as HTMLElement).querySelector("label")?.focus();
			}}
			{...rest}
		/>
	</div>
);

/////////////////////////////////////////////

export const CloseCenteredModal = forwardRef(
	(
		{ className = "", htmlFor, ...rest }: CloseProps,
		forwardedRef: React.ForwardedRef<HTMLLabelElement>,
	) => (
		<label
			className={`modal-close ${className}`}
			ref={forwardedRef}
			htmlFor={htmlFor}
			tabIndex={0}
			{...rest}
		/>
	),
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
}

/////////////////////////////////////////////

interface CloseProps
	extends React.DetailedHTMLProps<
		React.LabelHTMLAttributes<HTMLLabelElement>,
		HTMLLabelElement
	> {
	htmlFor: string;
}
