import { Dialog, Overlay, Title } from "@radix-ui/react-dialog";

import { resetAllAppData } from "@utils/app";
import { reloadWindow } from "@components/MediaListKind/helper";
import { Translator } from "@components/I18n";

import { Center } from "./styles";
import {
	StyledDialogContent,
	CloseDialog,
} from "../MediaListKind/MediaOptions/styles";

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////
// Main function:

export function ErrorFallback({ description }: ErrorBoundaryProps) {
	return (
		<Dialog modal open>
			<Overlay className="fixed grid place-items-center bottom-0 right-0 left-0 top-0 blur-sm bg-opacity-10 overflow-y-auto z-20 animation-overlay-show" />

			<StyledDialogContent>
				<Center>
					<Title className="">
						<Translator path="errors.mediaListKind.errorTitle" />
					</Title>

					<p className="text-alternative font-secondary tracking-wider font-medium overflow-ellipsis overflow-hidden">
						{description}
					</p>

					<CloseDialog
						onPointerUp={() => {
							resetAllAppData();
							reloadWindow();
						}}
						id="reset-app-data"
					>
						<Translator path="buttons.resetAllAppData" />
					</CloseDialog>

					<CloseDialog id="reload-window" onPointerUp={reloadWindow}>
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
