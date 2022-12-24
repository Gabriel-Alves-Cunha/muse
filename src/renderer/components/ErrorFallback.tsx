import { resetAllAppData } from "@utils/app";
import { useTranslation } from "@i18n";
import { reloadWindow } from "./MediaListKind/helper";
import { WarningSign } from "./WarningSign";
import {
	CloseOpenedCenteredModal,
	OpenedCenteredModal,
} from "./OpenedCenteredModal";

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////
// Main function:

const errorFallbackModalHtmlId = "error-fallback-modal";

export function ErrorFallback({ description }: ErrorBoundaryProps) {
	const { t } = useTranslation();

	return (
		<OpenedCenteredModal
			className="relative flex flex-col items-center"
			htmlTargetName={errorFallbackModalHtmlId}
		>
			<h1 className="flex items-center title">
				{t("errors.mediaListKind.errorTitle")}

				<WarningSign />
			</h1>

			<p className="my-5 text-muted font-secondary text-center tracking-wide">
				{description}
			</p>

			<CloseOpenedCenteredModal
				onPointerUp={() => {
					resetAllAppData();
					reloadWindow();
				}}
				htmlFor={errorFallbackModalHtmlId}
				className="modal-close-reset"
			>
				{t("buttons.resetAllAppData")}
			</CloseOpenedCenteredModal>

			<CloseOpenedCenteredModal
				htmlFor={errorFallbackModalHtmlId}
				className="modal-close-reset"
				onPointerUp={reloadWindow}
			>
				{t("buttons.reloadWindow")}
			</CloseOpenedCenteredModal>
		</OpenedCenteredModal>
	);
}

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////
// Types:

type ErrorBoundaryProps = { description: string };
