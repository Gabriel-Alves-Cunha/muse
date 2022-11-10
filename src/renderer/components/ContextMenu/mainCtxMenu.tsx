import { Item, Separator } from "@radix-ui/react-context-menu";

import { electronIpcMainProcessNotification } from "@common/enums";
import { selectAllMedias } from "@contexts/useAllSelectedMedias";
import { Translator } from "@components/I18n";
import { CtxMenuItemRightSlot } from "./CtxMenuItemRightSlot";

const notify =
	electron.notificationApi.sendNotificationToElectronIpcMainProcess;

/////////////////////////////////////////////
// Helper functions:

const toggleDeveloperTools = () =>
	notify(electronIpcMainProcessNotification.TOGGLE_DEVELOPER_TOOLS);

/////////////////////////////////////////////

export const MainCtxMenu = () => (
	<>
		<Item onSelect={selectAllMedias}>
			<Translator path="ctxMenus.selectAllMedias" />

			<CtxMenuItemRightSlot>Ctrl+A</CtxMenuItemRightSlot>
		</Item>

		<Separator />

		<Item onSelect={toggleDeveloperTools}>
			<Translator path="ctxMenus.toggleDevTools" />

			<CtxMenuItemRightSlot>f12</CtxMenuItemRightSlot>
		</Item>
	</>
);
