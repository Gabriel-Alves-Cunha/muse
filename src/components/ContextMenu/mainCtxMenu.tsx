import { ElectronIpcMainProcessNotification } from "@renderer/common/enums";
import { selectAllMedias } from "@contexts/useAllSelectedMedias";
import { useTranslation } from "@i18n";
import { Separator } from "../Separator";
import { RightSlot } from "../RightSlot";
import { MenuItem } from "../MenuItem";

const notify = () => {};
	// electron.notificationApi.sendNotificationToElectronIpcMainProcess;

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////
// Helper functions:

const toggleDeveloperTools = () =>
	notify(ElectronIpcMainProcessNotification.TOGGLE_DEVELOPER_TOOLS);

/////////////////////////////////////////////

export default function MainCtxMenu() {
	const { t } = useTranslation();

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
