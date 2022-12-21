import { Item, Separator } from "@radix-ui/react-context-menu";

import { ElectronIpcMainProcessNotification } from "@common/enums";
import { selectAllMedias } from "@contexts/useAllSelectedMedias";
import { useTranslation } from "@i18n";
import { RightSlot } from "./RightSlot";

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
	const { t } = useTranslation();

	return (
		<>
			<Item onSelect={selectAllMedias}>
				{t("ctxMenus.selectAllMedias")}

				<RightSlot>Ctrl+A</RightSlot>
			</Item>

			<Separator />

			<Item onSelect={toggleDeveloperTools}>
				{t("ctxMenus.toggleDevTools")}

				<RightSlot>f12</RightSlot>
			</Item>
		</>
	);
}
