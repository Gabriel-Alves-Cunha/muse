import type { OneOf } from "@common/@types/generalTypes";

import { Reload } from "./Reload";
import { SortBy } from "./SortBy";
import { Clean } from "./Clean";

import { Wrapper } from "./styles";

export function ButtonGroup({ buttons }: Props) {
	const { clean, reload, sortBy } = buttons;

	const additionalClasses = (button: OneOf<Buttons>) => {
		const isOnlyOneButton = Object.keys(buttons).filter(Boolean).length === 1;

		if (isOnlyOneButton) return " single-button";

		const isFirstButton = () => {
			let isFirst = false;

			// On the order that is inside <Wrapper>, the first one that is true, if equals to the button received on params, it is the first one:
			const first: OneOf<Buttons> = reload
				? "reload"
				: sortBy
				? "sortBy"
				: "clean";

			if (button === first) isFirst = true;

			return isFirst;
		};

		const isLastButton = () => {
			let isLast = false;

			// On the reverse order that is inside <Wrapper>, the first one that is true, if equals to the button received on params, it is the last one:
			const last: OneOf<Buttons> = clean
				? "clean"
				: sortBy
				? "sortBy"
				: "reload";

			if (button === last) isLast = true;

			return isLast;
		};

		if (isFirstButton()) return " first";
		else if (isLastButton()) return " last";
		return "";
	};

	return (
		<Wrapper>
			{/* Order matters here: */}
			{reload && <Reload className={additionalClasses("reload")} />}

			{sortBy && <SortBy className={additionalClasses("sortBy")} />}

			{clean && <Clean className={additionalClasses("clean")} />}
		</Wrapper>
	);
}

type Buttons = {
	reload?: boolean;
	sortBy?: boolean;
	clean?: boolean;
};

type Props = {
	buttons: Buttons;
};
