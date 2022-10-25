import { Root } from "@radix-ui/react-portal";

import { Translator } from "@components/I18n";
import { Content, Title } from "@radix-ui/react-dialog";

import {
	StyledDialogBlurOverlay,
	CloseDialog,
} from "@components/MediaListKind/MediaOptions/styles";

import warningSvg from "@assets/warning.svg";
import { FlexRow } from "@components/FlexRow";

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////
// Main function:

export function DeleteMediaDialogContent({ handleMediaDeletion }: Props) {
	return (
		<Root>
			<StyledDialogBlurOverlay />

			<Content className="fixed grid place-items-center bottom-0 right-0 left-0 top-0 blur-sm bg-opacity-10 overflow-y-auto z-20 animation-overlay-show delete-media-overlay">
				<Title className="text-lg first-letter:text-3xl first-letter:font-normal">
					<Translator path="dialogs.deleteMedia.subtitle" />
				</Title>

				<FlexRow>
					<img src={warningSvg} alt="Warning sign." id="warning" />

					<CloseDialog
						onPointerUp={handleMediaDeletion}
						className="delete-media"
					>
						<Translator path="buttons.confirm" />
					</CloseDialog>

					<CloseDialog id="cancel">
						<Translator path="buttons.cancel" />
					</CloseDialog>
				</FlexRow>
			</Content>
		</Root>
	);
}

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////
// Types:

type Props = Readonly<{ handleMediaDeletion: () => void; }>;
