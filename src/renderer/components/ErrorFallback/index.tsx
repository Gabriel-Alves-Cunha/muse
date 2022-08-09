import { Dialog } from "@radix-ui/react-dialog";

import { resetAllAppData } from "@utils/app";
import { reloadWindow } from "@components/MediaListKind/helper";
import { Translator } from "@components/I18n";

import { SubTitle } from "@components/MediaListKind/styles";
import { Center } from "./styles";
import {
	StyledDialogBlurOverlay,
	StyledDialogContent,
	CloseDialog,
	StyledTitle,
} from "../MediaListKind/MediaOptions/styles";

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////
// Main function:

export function ErrorFallback({ description }: ErrorBoundaryProps) {
	return (
		<Dialog modal open>
			<StyledDialogBlurOverlay />

			<StyledDialogContent>
				<Center>
					<StyledTitle>
						<Translator path="errors.mediaListKind.errorTitle" />
					</StyledTitle>
					<SubTitle>{description}</SubTitle>

					<CloseDialog
						onClick={() => {
							resetAllAppData();
							reloadWindow();
						}}
						id="reset-app-data"
					>
						<Translator path="buttons.resetAllAppData" />
					</CloseDialog>

					<CloseDialog id="reload-window" onClick={reloadWindow}>
						<Translator path="buttons.reloadWindow" />
					</CloseDialog>
				</Center>
			</StyledDialogContent>
		</Dialog>
	);
}

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////
// Types:

type ErrorBoundaryProps = Readonly<{ description: string; }>;
