import { Dialog } from "@radix-ui/react-dialog";

import { resetAllAppData } from "@utils/app";
import { reloadWindow } from "@components/MediaListKind/helper";

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
					<StyledTitle>Something went wrong</StyledTitle>
					<SubTitle>{description}</SubTitle>

					<CloseDialog
						onClick={() => {
							resetAllAppData();
							reloadWindow();
						}}
						id="reset-app-data"
					>
						Reset all app data
					</CloseDialog>

					<CloseDialog id="reload-window" onClick={reloadWindow}>
						Reload window
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
