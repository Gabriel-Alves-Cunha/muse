import { useEffect, useRef } from "react";

import { setDefaultSearch, setSearchTerm, useSearcher } from "./state";
import { isAModifierKeyPressed } from "@utils/keyboard";
import { useTranslation } from "@i18n";
import { BaseInput } from "../BaseInput";
import { RightSlot } from "../ContextMenu/RightSlot";

const searchTermSelector = ({
	searchTerm,
}: ReturnType<typeof useSearcher.getState>) => searchTerm;

let isInputOnFocus = false;

export function Input() {
	const searchTerm = useSearcher(searchTermSelector);
	const inputRef = useRef<HTMLInputElement>(null);
	const { t } = useTranslation();

	/////////////////////////////////////////
	useEffect(() => {
		const input = inputRef.current;
		if (!input) return;

		input.addEventListener("focus", () => (isInputOnFocus = true));
		input.addEventListener("blur", () => (isInputOnFocus = false));
		input.addEventListener("keyup", (e) => {
			// Close SearchMediaPopover on "Escape"
			if (e.key === "Escape" && !isAModifierKeyPressed(e)) {
				inputRef.current?.blur();
				setDefaultSearch();
			} else if (e.ctrlKey && e.key === "a") {
				input.select();
			}
		});
	}, []);

	/////////////////////////////////////////

	return (
		<BaseInput
			RightSlot={
				isInputOnFocus ? null : <RightSlot id="search">Alt+s</RightSlot>
			}
			label={t("labels.searchForSongs")}
			onChange={setSearchTerm}
			value={searchTerm}
			spellCheck="false"
			id="search-songs"
			autoCorrect="off"
			ref={inputRef}
			accessKey="s"
		/>
	);
}
