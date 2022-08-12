import { Root } from "@radix-ui/react-portal";

import { Translator } from "@components/I18n";

import {
	StyledDialogBlurOverlay,
	StyledDialogContent,
	StyledTitle,
	CloseDialog,
	FlexRow,
} from "@components/MediaListKind/MediaOptions/styles";

const warningSvg = new URL(
	"../../../assets/icons/warning.svg",
	import.meta.url,
);

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////
// Main function:

export function DeleteMediaDialogContent({ handleMediaDeletion }: Props) {
	return (
		<Root>
			<StyledDialogBlurOverlay />

			<StyledDialogContent className="delete-media">
				<StyledTitle className="subtitle">
					<Translator path="dialogs.deleteMedia.subtitle" />
				</StyledTitle>

				<FlexRow>
					<img src={warningSvg.href} alt="Warning sign." id="warning" />

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
			</StyledDialogContent>
		</Root>
	);
}

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////
// Types:

type Props = Readonly<{ handleMediaDeletion: () => void; }>;
