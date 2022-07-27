import { IoIosArrowForward as RightArrow } from "react-icons/io";
import { Root, RadioGroup } from "@radix-ui/react-context-menu";
import { MdCheck as Check } from "react-icons/md";
import { BsDot as Dot } from "react-icons/bs";
import { useState } from "react";

import {
	ItemIndicator,
	CheckboxItem,
	TriggerItem,
	RadioItem,
	RightSlot,
	Separator,
	Content,
	Label,
	Item,
} from "./styles";

export function FullExampleCtxMenu() {
	const [bookmarksChecked, setBookmarksChecked] = useState(true);
	const [urlsChecked, setUrlsChecked] = useState(false);
	const [person, setPerson] = useState("pedro");

	return (
		<>
			<Item>
				Back <RightSlot>{"⌘+["}</RightSlot>
			</Item>

			<Item disabled>
				Foward <RightSlot>{"⌘+]"}</RightSlot>
			</Item>

			<Root>
				<TriggerItem>
					More Tools
					<RightSlot>
						<RightArrow size={15} />
					</RightSlot>
				</TriggerItem>

				<Content alignOffset={-5}>
					<Item>
						Save Page As… <RightSlot>⌘+S</RightSlot>
					</Item>

					<Item>Create Shortcut…</Item>
					<Item>Name Window…</Item>

					<Separator />

					<Item>Developer Tools</Item>
				</Content>
			</Root>

			<Separator />

			<CheckboxItem
				onCheckedChange={setBookmarksChecked}
				checked={bookmarksChecked}
			>
				<ItemIndicator>
					<Check size={15} />
				</ItemIndicator>
				Show Bookmarks <RightSlot>⌘+B</RightSlot>
			</CheckboxItem>

			<CheckboxItem checked={urlsChecked} onCheckedChange={setUrlsChecked}>
				<ItemIndicator>
					<Check size={15} />
				</ItemIndicator>
				Show Full URLs
			</CheckboxItem>

			<Separator />

			<Label>People</Label>

			<RadioGroup value={person} onValueChange={setPerson}>
				<RadioItem value="pedro">
					<ItemIndicator>
						<Dot />
					</ItemIndicator>
					Pedro Duarte
				</RadioItem>

				<RadioItem value="colm">
					<ItemIndicator>
						<Dot />
					</ItemIndicator>
					Colm Tuite
				</RadioItem>
			</RadioGroup>
		</>
	);
}
