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

import { CtxMenuItemRightSlot } from "./CtxMenuItemRightSlot";
import { CtxMenuItem } from "./CtxMenuItem";

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
			<CtxMenuItem>
				Back <CtxMenuItemRightSlot>{"⌘+["}</CtxMenuItemRightSlot>
			</CtxMenuItem>

			<CtxMenuItem disabled>
				Foward <CtxMenuItemRightSlot>{"⌘+]"}</CtxMenuItemRightSlot>
			</CtxMenuItem>

			<Root>
				<Trigger>
					More Tools

					<CtxMenuItemRightSlot>
						<RightArrow size={15} />
					</CtxMenuItemRightSlot>
				</Trigger>

				<Content alignOffset={-5}>
					<CtxMenuItem>
						Save Page As… <CtxMenuItemRightSlot>⌘+S</CtxMenuItemRightSlot>
					</CtxMenuItem>

					<CtxMenuItem>Create Shortcut…</CtxMenuItem>
					<CtxMenuItem>Name Window…</CtxMenuItem>

					<Separator />

					<CtxMenuItem>Developer Tools</CtxMenuItem>
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
				Show Bookmarks <CtxMenuItemRightSlot>⌘+B</CtxMenuItemRightSlot>
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
