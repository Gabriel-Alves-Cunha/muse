import { ElectronIpcMainProcessNotificationEnum } from "@common/@types/electron-window";
import { selectAllMedias } from "@contexts/mediaHandler/useAllSelectedMedias";

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
		<Item
			onClick={() => {
				// TODO: close ctx menu!
				selectAllMedias();
			}}
		>
			Select all medias
			<RightSlot>Ctrl+A</RightSlot>
		</Item>

		<Separator />

		<Item
			onClick={() => {
				// TODO: close ctx menu!
				toggleDeveloperTools();
			}}
		>
			Toggle Developer Tools <RightSlot>Ctrl+Shift+i</RightSlot>
		</Item>
	</>
);
