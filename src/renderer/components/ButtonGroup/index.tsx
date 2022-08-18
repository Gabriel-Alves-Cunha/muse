import type { OneOf } from "@common/@types/utils";

import { Reload } from "./Reload";
import { SortBy } from "./SortBy";
import { Clean } from "./Clean";

import { Wrapper } from "./styles";

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

			{buttons.clean && <Clean
				className={additionalClasses(clean_, buttons)}
			/>}
		</Wrapper>
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
// Types:

type Buttons = Readonly<
	{ reload?: boolean; sortBy?: boolean; clean?: boolean; }
>;
