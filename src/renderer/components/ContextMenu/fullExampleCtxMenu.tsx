import { IoIosArrowForward as RightArrow } from "react-icons/io";
import { MdCheck as Check } from "react-icons/md";
import { BsDot as Dot } from "react-icons/bs";
import { useState } from "react";
import {
	ItemIndicator,
	CheckboxItem,
	RadioGroup,
	Separator,
	RadioItem,
	Content,
	Trigger,
	Label,
	Root,
} from "@radix-ui/react-context-menu";

import { RightSlot } from "./RightSlot";
import { Item } from "./Item";

export function FullExampleCtxMenu() {
	const [bookmarksChecked, setBookmarksChecked] = useState<
		boolean | "indeterminate"
	>(true);
	const [urlsChecked, setUrlsChecked] = useState<boolean | "indeterminate">(
		false,
	);
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
				<Trigger>
					More Tools
					<RightSlot>
						<RightArrow size={15} />
					</RightSlot>
				</Trigger>

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
