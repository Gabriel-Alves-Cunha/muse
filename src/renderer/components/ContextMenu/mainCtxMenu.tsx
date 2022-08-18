import { ElectronIpcMainProcessNotificationEnum } from "@common/enums";
import { selectAllMedias } from "@contexts/useAllSelectedMedias";
import { Translator } from "@components/I18n";

import { RightSlot, Separator, Item } from "./styles";

const notify =
	electron.notificationApi.sendNotificationToElectronIpcMainProcess;

/////////////////////////////////////////////
// Helper functions:

const toggleDeveloperTools = () =>
	notify(ElectronIpcMainProcessNotificationEnum.TOGGLE_DEVELOPER_TOOLS);

/////////////////////////////////////////////

export const MainCtxMenu = () => (
	<>
		<Item onSelect={selectAllMedias}>
			<Translator path="ctxMenus.selectAllMedias" />

			<RightSlot>Ctrl+A</RightSlot>
		</Item>

		<Separator />

		<Item onSelect={toggleDeveloperTools}>
			<Translator path="ctxMenus.toggleDevTools" />

			<RightSlot>Ctrl+Shift+i</RightSlot>
		</Item>
	</>
);
