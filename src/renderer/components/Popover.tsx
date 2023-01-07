export const PopoverTrigger = ({
	labelClassName = "",
	inputClassName = "",
	htmlTargetName,
	labelProps,
	inputProps,
	children,
}: PopoverTriggerProps) => (
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

export const PopoverContent = ({
	onPointerDownOutside,
	className = "",
	htmlFor,
	size,
	...rest
}: PopoverContentProps) => (
	<div className="select-content-wrapper">
		<label
			onPointerDown={onPointerDownOutside}
			className="outside-dialog"
			htmlFor={htmlFor}
		/>

		<div
			className={`popover-content ${className} ${size}`}
			role="dialog"
			{...rest}
		/>
	</div>
);

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////
// Types:

type PopoverTriggerProps = {
	labelProps?: Omit<
		React.DetailedHTMLProps<
			React.LabelHTMLAttributes<HTMLLabelElement>,
			HTMLLabelElement
		>,
		"className"
	>;
	inputProps?: Omit<
		React.DetailedHTMLProps<
			React.InputHTMLAttributes<HTMLInputElement>,
			HTMLInputElement
		>,
		"className"
	>;
	children: React.ReactNode;
	labelClassName?: string;
	inputClassName?: string;
	htmlTargetName: string;
};

/////////////////////////////////////////

interface PopoverContentProps
	extends React.DetailedHTMLProps<
		React.HTMLAttributes<HTMLDivElement>,
		HTMLDivElement
	> {
	onPointerDownOutside?: React.PointerEventHandler<HTMLLabelElement>;
	size:
		| "nothing-found-for-convertions-or-downloads"
		| "nothing-found-for-search-media"
		| "convertions-or-downloads"
		| "search-media-results";
	htmlFor: string;
}
