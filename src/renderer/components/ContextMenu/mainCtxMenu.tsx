import { ElectronIpcMainProcessNotificationEnum } from "@common/enums";
import { selectT, useTranslator } from "@i18n";
import { selectAllMedias } from "@contexts/allSelectedMedias";
import { Separator } from "../Separator";
import { RightSlot } from "../RightSlot";
import { MenuItem } from "../MenuItem";

const notify =
	electronApi.notificationApi.sendNotificationToElectronIpcMainProcess;

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////
// Helper functions:

const toggleDeveloperTools = (): void =>
	notify(ElectronIpcMainProcessNotificationEnum.TOGGLE_DEVELOPER_TOOLS);

/////////////////////////////////////////////

export function MainCtxMenu(): JSX.Element {
	const t = useTranslator(selectT);

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
