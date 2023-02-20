import { useSnapshot } from "valtio";

import { WarningSign } from "./WarningSign";
import { translation } from "@i18n";

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////
// Main function:

export function DeleteMediaDialogContent({
	handleDeleteMedia,
	closeDialog,
}: Props) {
	const translationAccessor = useSnapshot(translation);
	const t = translationAccessor.t;

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

				<button
					className="save-media-options-modal bg-transparent"
					onPointerUp={closeDialog}
				>
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
