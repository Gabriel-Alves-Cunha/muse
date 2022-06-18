import { ElectronIpcMainProcessNotificationEnum } from "@common/@types/electron-window";

import { RightSlot, Separator, Item } from "./styles";

const notify =
	electron.notificationApi.sendNotificationToElectronIpcMainProcess;

const toggleDeveloperTools = () =>
	notify(ElectronIpcMainProcessNotificationEnum.TOGGLE_DEVELOPER_TOOLS);

export const MainCtxMenu = () => (
	<>
		<Separator />

		<Item onClick={toggleDeveloperTools} className="notransition">
			Toggle Developer Tools <RightSlot>Ctrl+Shift+i</RightSlot>
		</Item>
	</>
);
