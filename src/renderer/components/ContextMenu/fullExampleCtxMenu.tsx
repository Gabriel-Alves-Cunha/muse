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

import { Right } from "@components/Decorations/RightSlot";
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
				Back <Right>{"⌘+["}</Right>
			</Item>

			<Item disabled>
				Foward <Right>{"⌘+]"}</Right>
			</Item>

			<Root>
				<Trigger>
					More Tools

					<Right>
						<RightArrow size={15} />
					</Right>
				</Trigger>

				<Content alignOffset={-5}>
					<Item>
						Save Page As… <Right>⌘+S</Right>
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
				Show Bookmarks <Right>⌘+B</Right>
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
