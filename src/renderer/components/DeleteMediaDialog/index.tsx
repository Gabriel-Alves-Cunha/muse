import {
	StyledDialogContent,
	StyledTitle,
	CloseDialog,
	FlexRow,
} from "@components/MediaListKind/MediaOptions/styles";

const warningSvg = new URL(
	"../../../assets/icons/warning.svg",
	import.meta.url,
);

export function DeleteMediaDialogContent({ handleMediaDeletion }: Props) {
	return (
		<StyledDialogContent className="delete-media">
			<StyledTitle className="subtitle">
				Are you sure you want to delete this media from your computer?
			</StyledTitle>

			<FlexRow>
				<img src={warningSvg.href} alt="Warning sign." id="warning" />

				<CloseDialog onClick={handleMediaDeletion} className="delete-media">
					Confirm
				</CloseDialog>

				<CloseDialog id="cancel">Cancel</CloseDialog>
			</FlexRow>
		</StyledDialogContent>
	);
}

type Props = Readonly<{ handleMediaDeletion: () => void; }>;
