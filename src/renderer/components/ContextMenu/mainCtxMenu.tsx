import { ElectronIpcMainProcessNotificationEnum } from "@common/@types/electron-window";
import { selectAllMedias } from "@contexts/mediaHandler/usePlaylists";

import { RightSlot, Separator, Item } from "./styles";

const notify =
	electron.notificationApi.sendNotificationToElectronIpcMainProcess;

const toggleDeveloperTools = () =>
	notify(ElectronIpcMainProcessNotificationEnum.TOGGLE_DEVELOPER_TOOLS);

export const MainCtxMenu = () => (
	<>
		<Item onClick={selectAllMedias} className="notransition">
			Select all medias
			<RightSlot>Ctrl+A</RightSlot>
		</Item>

		<Separator />

		<Item onClick={toggleDeveloperTools} className="notransition">
			Toggle Developer Tools <RightSlot>Ctrl+Shift+i</RightSlot>
		</Item>
	</>
);
