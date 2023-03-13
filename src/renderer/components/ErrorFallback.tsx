import { useSnapshot } from "valtio";

import { resetAllAppData } from "@utils/app";
import { CenteredModal } from "./CenteredModal";
import { reloadWindow } from "./MediaListKind/helper";
import { WarningSign } from "./WarningSign";
import { translation } from "@i18n";

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////
// Main function:

export function ErrorFallback({ description }: ErrorBoundaryProps) {
	const t = useSnapshot(translation).t;

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
				data-modal-close-reset
				onPointerUp={() => {
					resetAllAppData();
					reloadWindow();
				}}
			>
				{t("buttons.resetAllAppData")}
			</button>

			<button data-modal-close-reset onPointerUp={reloadWindow}>
				{t("buttons.reloadWindow")}
			</button>
		</CenteredModal>
	);
}

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////
// Types:

type ErrorBoundaryProps = { description: string };
