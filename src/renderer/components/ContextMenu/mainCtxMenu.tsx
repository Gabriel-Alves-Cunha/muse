import { Item, Separator } from "@radix-ui/react-context-menu";

import { electronIpcMainProcessNotification } from "@common/enums";
import { selectAllMedias } from "@contexts/useAllSelectedMedias";
import { Translator } from "@components/I18n";
import { Right } from "./Right";

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

			<Right>Ctrl+A</Right>
		</Item>

		<Separator />

		<Item onSelect={toggleDeveloperTools}>
			<Translator path="ctxMenus.toggleDevTools" />

			<Right>f12</Right>
		</Item>
	</>
);
