import { resetAllAppData } from "@utils/app";
import { useTranslation } from "@i18n";
import { reloadWindow } from "./MediaListKind/helper";
import {
	CloseOpenedCenteredModal,
	OpenedCenteredModal,
} from "./OpenedCenteredModal";

// @ts-ignore => That's alright:
import warningSvg from "@assets/warning.svg";

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

				<img src={warningSvg} className="w-7 h-7 ml-3" alt="Warning sign" />
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
