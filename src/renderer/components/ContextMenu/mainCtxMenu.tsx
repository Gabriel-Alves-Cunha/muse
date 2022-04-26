import { IoIosArrowForward as RightArrow } from "react-icons/io";
import { Root, RadioGroup } from "@radix-ui/react-context-menu";
import { MdCheck as Check } from "react-icons/md";
import { BsDot as Dot } from "react-icons/bs";
import { useState } from "react";

import {
	StyledItemIndicator,
	StyledCheckboxItem,
	StyledTriggerItem,
	StyledRadioItem,
	StyledSeparator,
	StyledContent,
	StyledLabel,
	StyledItem,
	RightSlot,
} from "./styles";

export const MainCtxMenu = () => {
	const [bookmarksChecked, setBookmarksChecked] = useState(true);
	const [urlsChecked, setUrlsChecked] = useState(false);
	const [person, setPerson] = useState("pedro");

	return (
		<>
			<StyledItem>
				Back <RightSlot>{"⌘+["}</RightSlot>
			</StyledItem>

			<StyledItem disabled>
				Foward <RightSlot>{"⌘+]"}</RightSlot>
			</StyledItem>

			<Root>
				<StyledTriggerItem>
					More Tools
					<RightSlot>
						<RightArrow size={15} />
					</RightSlot>
				</StyledTriggerItem>

				<StyledContent sideOffset={2} alignOffset={-5}>
					<StyledItem>
						Save Page As… <RightSlot>⌘+S</RightSlot>
					</StyledItem>

					<StyledItem>Create Shortcut…</StyledItem>
					<StyledItem>Name Window…</StyledItem>

					<StyledSeparator />

					<StyledItem>Developer Tools</StyledItem>
				</StyledContent>
			</Root>

			<StyledSeparator />

			<StyledCheckboxItem
				onCheckedChange={setBookmarksChecked}
				checked={bookmarksChecked}
			>
				<StyledItemIndicator>
					<Check size={15} />
				</StyledItemIndicator>
				Show Bookmarks <RightSlot>⌘+B</RightSlot>
			</StyledCheckboxItem>

			<StyledCheckboxItem
				checked={urlsChecked}
				onCheckedChange={setUrlsChecked}
			>
				<StyledItemIndicator>
					<Check size={15} />
				</StyledItemIndicator>
				Show Full URLs
			</StyledCheckboxItem>

			<StyledSeparator />

			<StyledLabel>People</StyledLabel>

			<RadioGroup value={person} onValueChange={setPerson}>
				<StyledRadioItem value="pedro">
					<StyledItemIndicator>
						<Dot />
					</StyledItemIndicator>
					Pedro Duarte
				</StyledRadioItem>

				<StyledRadioItem value="colm">
					<StyledItemIndicator>
						<Dot />
					</StyledItemIndicator>
					Colm Tuite
				</StyledRadioItem>
			</RadioGroup>
		</>
	);
};
