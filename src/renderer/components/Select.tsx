export const SelectTrigger = ({
	labelClassName = "",
	inputClassName = "",
	htmlTargetName,
	labelProps,
	inputProps,
	children,
}: SelectTriggerProps) => (
	<>
		<label className={labelClassName} htmlFor={htmlTargetName} {...labelProps}>
			{children}
		</label>

		<input
			className={`select-state ${inputClassName}`}
			id={htmlTargetName}
			type="checkbox"
			{...inputProps}
		/>
	</>
);

/////////////////////////////////////////

export const SelectContent = ({
	className = "",
	side = "",
	htmlFor,
	...rest
}: SelectContentProps) => (
	<div
		className="select-content-wrapper"
		onTransitionEnd={(e) => {
			// Doing this to trap focus inside modal!
			e.currentTarget.querySelector("button")?.focus();
		}}
	>
		<label className="outside-select" htmlFor={htmlFor} />

		<div
			className={`select-content ${className} ${side}`}
			role="dialog"
			{...rest}
		/>
	</div>
);

/////////////////////////////////////////

export const SelectItem = ({ className = "", ...props }: SelectItemProps) => (
	<button className={`select-item ${className}`} role="menuitem" {...props} />
);

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////
// Types:

interface SelectTriggerProps
	extends React.DetailedHTMLProps<
		React.HTMLAttributes<HTMLLabelElement>,
		HTMLLabelElement
	> {
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

/////////////////////////////////////////

interface SelectContentProps
	extends React.DetailedHTMLProps<
		React.HTMLAttributes<HTMLDivElement>,
		HTMLDivElement
	> {
	side?: "right" | "left" | "bottom" | "top" | "";
	htmlFor: string;
}

/////////////////////////////////////////

interface SelectItemProps
	extends React.DetailedHTMLProps<
		React.ButtonHTMLAttributes<HTMLButtonElement>,
		HTMLButtonElement
	> {}
