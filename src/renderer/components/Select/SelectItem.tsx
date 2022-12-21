import { BsCheck2 as CheckIcon } from "react-icons/bs";
import { forwardRef } from "react";
import {
	type SelectItemProps,
	ItemIndicator,
	ItemText,
	Item,
} from "@radix-ui/react-select";

export const SelectItem = forwardRef(
	(
		{ title, className = "", ...props }: Props,
		forwardedRef: React.Ref<HTMLDivElement>,
	) => (
		<Item className={`select-item ${className}`} ref={forwardedRef} {...props}>
			<ItemText>{title}</ItemText>

			<ItemIndicator className="absolute inline-flex justify-center items-center w-6 left-0">
				<CheckIcon className="bg-transparent" />
			</ItemIndicator>
		</Item>
	),
);

interface Props extends SelectItemProps {
	readonly title: string;
}
