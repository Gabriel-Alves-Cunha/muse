import { Dialog } from "@radix-ui/react-dialog";

import { resetAllAppData } from "@utils/app";
import { reloadWindow } from "@components/MediaListKind/helper";

import { SubTitle } from "@components/MediaListKind/styles";
import { Center } from "./styles";
import {
	StyledContent,
	StyledOverlay,
	CloseDialog,
	StyledTitle,
} from "../MediaListKind/MediaOptions/styles";

export function ErrorFallback({ description }: ErrorBoundaryProps) {
	return (
		<Dialog modal open>
			<StyledOverlay />

			<StyledContent>
				<Center>
					<StyledTitle>Something went wrong</StyledTitle>
					<SubTitle>{description}</SubTitle>

					{/* <ErrorMsg>{error.message}</ErrorMsg> */}

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
			</StyledContent>
		</Dialog>
	);
}

type ErrorBoundaryProps = Readonly<{
	description: string;
	// error: Error;
}>;
