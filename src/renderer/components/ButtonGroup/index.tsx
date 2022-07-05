import type { OneOf } from "@common/@types/generalTypes";

import { Reload } from "./Reload";
import { SortBy } from "./SortBy";
import { Clean } from "./Clean";

import { Wrapper } from "./styles";

export function ButtonGroup({ buttons }: Props) {
	const { clean, reload, sortBy } = buttons;

	function additionalClasses(button: OneOf<Buttons>) {
		const isOnlyOneButton = Object.keys(buttons).filter(Boolean).length === 1;

		if (isOnlyOneButton) return " single-button";

		function isFirstButton() {
			let isFirstButton = false;

			// On the order that is inside <Wrapper>,
			// the first one that is true, if equals
			// to the button received on params,
			// it is the first one:
			const firstButton: OneOf<Buttons> = reload ?
				"reload" :
				sortBy ?
				"sortBy" :
				"clean";

			if (button === firstButton) isFirstButton = true;

			return isFirstButton;
		}

		function isLastButton() {
			let isLastButton = false;

			// On the reverse order that is inside <Wrapper>,
			// the first one that is true, if equals to the
			// button received on params, it is the last one:
			const lastButton: OneOf<Buttons> = clean ?
				"clean" :
				sortBy ?
				"sortBy" :
				"reload";

			if (button === lastButton) isLastButton = true;

			return isLastButton;
		}

		if (isFirstButton()) return " first";
		if (isLastButton()) return " last";
		return "";
	}

	return (
		<Wrapper className="notransition">
			{/* Order matters here: */}
			{reload && <Reload className={additionalClasses("reload")} />}

			{sortBy && <SortBy className={additionalClasses("sortBy")} />}

			{clean && <Clean className={additionalClasses("clean")} />}
		</Wrapper>
	);
}

type Buttons = Readonly<
	{ reload?: boolean; sortBy?: boolean; clean?: boolean; }
>;

type Props = Readonly<{ buttons: Buttons; }>;
