import { ElectronIpcMainProcessNotificationEnum } from "@common/@types/electron-window";

import { RightSlot, Separator, Item } from "./styles";

const notify =
	electron.notificationApi.sendNotificationToElectronIpcMainProcess;

const toggleDeveloperTools = () =>
	notify({ type: ElectronIpcMainProcessNotificationEnum.TOGGLE_DEVELOPER_TOOLS });

export const MainCtxMenu = () => {
	return (
		<>
			<Separator />

			<Item onClick={toggleDeveloperTools}>
				Toggle Developer Tools <RightSlot>Ctrl+Shift+i</RightSlot>
			</Item>
		</>
	);
};
