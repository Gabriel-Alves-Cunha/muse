import { selectAllMedias } from "@contexts/useAllSelectedMedias";
import { useTranslation } from "@i18n";
import { RightSlot } from "../RightSlot";
import { MenuItem } from "../MenuItem";

export function MainCtxMenu() {
	const { t } = useTranslation();

	return (
		<>
			<MenuItem onPointerUp={selectAllMedias}>
				{t("ctxMenus.selectAllMedias")}

				<RightSlot>Ctrl+A</RightSlot>
			</MenuItem>
		</>
	);
}
