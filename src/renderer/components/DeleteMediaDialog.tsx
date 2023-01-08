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
			<h1>
				{t("dialogs.deleteMedia.subtitle")}

				<WarningSign />
			</h1>

			<FlexRow>
				<CloseCenteredModal
					onPointerUp={handleMediaDeletion}
					htmlFor={idOfModalToBeClosed}
					className="remove-media"
				>
					{t("buttons.confirm")}
				</CloseCenteredModal>

				<CloseCenteredModal
					className="save-media-options-modal bg-transparent"
					htmlFor={idOfModalToBeClosed}
					// @ts-ignore => it's okay, React polyfills the behavior
					autoFocus
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
