import { useTranslation } from "@i18n";
import { WarningSign } from "./WarningSign";

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////
// Main function:

export function DeleteMediaDialogContent({
	handleDeleteMedia,
	closeDialog,
}: Props) {
	const { t } = useTranslation();

	return (
		<>
			<h1>
				{t("dialogs.deleteMedia.subtitle")}

				<WarningSign />
			</h1>

			<div data-flex-row>
				<button onPointerUp={handleDeleteMedia} data-remove-media>
					{t("buttons.confirm")}
				</button>

				<button className="save-media-options-modal bg-transparent" onPointerUp={closeDialog}>
					{t("buttons.cancel")}
				</button>
			</div>
		</>
	);
}

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////
// Types:

type Props = {
	handleDeleteMedia(): void;
	closeDialog(): void;
};
