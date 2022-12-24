import { CloseCenteredModal } from "./CenteredModal";
import { useTranslation } from "@i18n";
import { WarningSign } from "./WarningSign";
import { FlexRow } from "@components/FlexRow";

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////
// Main function:

export default function DeleteMediaDialogContent({
	handleMediaDeletion,
	idOfModalToBeClosed,
}: Props) {
	const { t } = useTranslation();

	return (
		<>
			<h1 className="title">
				{t("dialogs.deleteMedia.subtitle")}

				<WarningSign />
			</h1>

			<FlexRow>
				<CloseCenteredModal
					className="bg-red-600 text-white hover:bg-opacity-70 focus:bg-opacity-70"
					onPointerUp={handleMediaDeletion}
					htmlFor={idOfModalToBeClosed}
				>
					{t("buttons.confirm")}
				</CloseCenteredModal>

				<CloseCenteredModal
					className="bg-transparent text-green-400 hover:bg-opacity-70 focus:bg-opacity-70"
					htmlFor={idOfModalToBeClosed}
				>
					{t("buttons.cancel")}
				</CloseCenteredModal>
			</FlexRow>
		</>
	);
}

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////
// Types:

type Props = { handleMediaDeletion(): void; idOfModalToBeClosed: string };
