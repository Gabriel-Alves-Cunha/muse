import { selectT, useTranslator } from "@i18n";
import { resetAllAppData } from "@utils/app";
import { CenteredModal } from "./CenteredModal";
import { reloadWindow } from "./MediaListKind/helper";
import { WarningSign } from "./WarningSign";

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////
// Main function:

export function ErrorFallback({
	description,
}: ErrorBoundaryProps): JSX.Element {
	const t = useTranslator(selectT);

	return (
		<CenteredModal className="relative flex flex-col items-center" isOpen>
			<h1 className="flex items-center title">
				{t("errors.mediaListKind.errorTitle")}

				<WarningSign />
			</h1>

			<p className="my-5 text-muted font-secondary text-center tracking-wide">
				{description}
			</p>

			<button
				onPointerUp={resetAllAppDataAndReloadWindow}
				data-modal-close-reset
				type="button"
			>
				{t("buttons.resetAllAppData")}
			</button>

			<button data-modal-close-reset onPointerUp={reloadWindow} type="button">
				{t("buttons.reloadWindow")}
			</button>
		</CenteredModal>
	);
}

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////
// Helper function:

function resetAllAppDataAndReloadWindow(): void {
	resetAllAppData();
	reloadWindow();
}

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////
// Types:

type ErrorBoundaryProps = { description: string };
