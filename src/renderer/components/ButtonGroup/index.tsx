import type { OneOf } from "@common/@types/utils";

import { Reload } from "./Reload";
import { SortBy } from "./SortBy";
import { Clean } from "./Clean";

import { Wrapper } from "./styles";
import { ComponentProps } from "react";

const reload_ = "reload";
const sortBy_ = "sortBy";
const clean_ = "clean";

export function ButtonGroup(buttons: Buttons) {
	return (
		<Wrapper className="notransition">
			{/* Order matters here: */}
			{buttons.reload && (
				<Reload className={additionalClasses(reload_, buttons)} />
			)}

			{buttons.sortBy && (
				<SortBy className={additionalClasses(sortBy_, buttons)} />
			)}

			{buttons.clean && (
				<Clean
					className={additionalClasses(clean_, buttons)}
				/>
			)}
		</Wrapper>
	);
}

export function GroupedButton(buttons: Buttons) {
	return (
		<div className="relative flex justify-center items-center bg-none no-transition hover:bg-button-hover [&_svg]:hover:text-white [&_.reload_svg]:animate-spin first:rounded-l-xl last:rounded-r-xl">
			{/* Order matters here: */}
			{buttons.reload && (
				<Reload
					className={additionalClasses(reload_, buttons)}
				/>
			)}

			{buttons.sortBy && (
				<SortBy className={additionalClasses(sortBy_, buttons)} />
			)}

			{buttons.clean && (
				<Clean
					className={additionalClasses(clean_, buttons)}
				/>
			)}
		</div>
	);
}

export function ButtonOfGroup({ children, ...props }: ButtonOfGroupProps) {
	return (
		<button
			className="relative flex justify-center items-center bg-button border-none px-5 h-10 transition-colors ease-in-out duration-200 cursor-pointer active:scale-95"
			{...props}
		>
			{children}
		</button>
	);
}

/////////////////////////////////////////////
// Helper functions:

function additionalClasses(button: OneOf<Buttons>, buttons: Buttons) {
	// Is only one button:
	if (Object.keys(buttons).filter(Boolean).length === 1)
		return " single-button";

	/////////////////////////////////////////////

	const { clean = false, reload = false, sortBy = false } = buttons;

	/////////////////////////////////////////////

	function isFirstButton() {
		let isFirstButton = false;

		// On the order that is inside <Wrapper>,
		// the first one that is true, if equals
		// to the button received on params,
		// it is the first one:
		const firstButton: OneOf<Buttons> = reload === true ?
			reload_ :
			sortBy === true ?
			sortBy_ :
			clean_;

		if (button === firstButton) isFirstButton = true;

		return isFirstButton;
	}

	/////////////////////////////////////////////

	function isLastButton() {
		let isLastButton = false;

		// On the reverse order that is inside <Wrapper>,
		// the first one that is true, if equals to the
		// button received on params, it is the last one:
		const lastButton: OneOf<Buttons> = clean === true ?
			clean_ :
			sortBy === true ?
			sortBy_ :
			reload_;

		if (button === lastButton) isLastButton = true;

		return isLastButton;
	}

	/////////////////////////////////////////////

	if (isFirstButton() === true) return " first";
	if (isLastButton() === true) return " last";
	return "";
}

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////
// Types:

type Buttons = Readonly<
	{ reload?: boolean; sortBy?: boolean; clean?: boolean; }
>;

/////////////////////////////////////////////

type ButtonOfGroupProps = React.ButtonHTMLAttributes<HTMLButtonElement>;
