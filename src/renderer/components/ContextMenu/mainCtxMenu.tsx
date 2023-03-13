import { useSnapshot } from "valtio";

import { ElectronIpcMainProcessNotificationEnum } from "@common/enums";
import { selectAllMedias } from "@contexts/allSelectedMedias";
import { translation } from "@i18n";
import { Separator } from "../Separator";
import { RightSlot } from "../RightSlot";
import { MenuItem } from "../MenuItem";

const notify =
	electronApi.notificationApi.sendNotificationToElectronIpcMainProcess;

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////
// Helper functions:

const toggleDeveloperTools = () =>
	notify(ElectronIpcMainProcessNotificationEnum.TOGGLE_DEVELOPER_TOOLS);

/////////////////////////////////////////////

export function MainCtxMenu() {
	const t = useSnapshot(translation).t;

	return (
		<>
			<MenuItem onPointerUp={selectAllMedias}>
				{t("ctxMenus.selectAllMedias")}

				<RightSlot>Ctrl+A</RightSlot>
			</MenuItem>

			<Separator />

			<MenuItem onPointerUp={toggleDeveloperTools}>
				{t("ctxMenus.toggleDevTools")}

				<RightSlot>f12</RightSlot>
			</MenuItem>
		</>
	);
}
