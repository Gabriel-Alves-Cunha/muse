import { useSnapshot } from "valtio";

import { ElectronIpcMainProcessNotification } from "@common/enums";
import { selectAllMedias } from "@contexts/allSelectedMedias";
import { translation } from "@i18n";
import { Separator } from "../Separator";
import { RightSlot } from "../RightSlot";
import { MenuItem } from "../MenuItem";

const notify =
	electron.notificationApi.sendNotificationToElectronIpcMainProcess;

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////
// Helper functions:

const toggleDeveloperTools = () =>
	notify(ElectronIpcMainProcessNotification.TOGGLE_DEVELOPER_TOOLS);

/////////////////////////////////////////////

export default function MainCtxMenu() {
	const translationAccessor = useSnapshot(translation);
	const t = translationAccessor.t;

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
