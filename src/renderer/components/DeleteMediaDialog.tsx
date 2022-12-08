import { Close, Content, Title } from "@radix-ui/react-dialog";
import { Root as Portal } from "@radix-ui/react-portal";

import { useTranslation } from "@i18n";
import { BlurOverlay } from "./BlurOverlay";
import { FlexRow } from "@components/FlexRow";

import warningSvg from "@assets/warning.svg";

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////
// Main function:

export function DeleteMediaDialogContent({ handleMediaDeletion }: Props) {
	const { t } = useTranslation();

	return (
		<Portal>
			<BlurOverlay />

			<Content className="">
				<Title className="text-lg first-letter:text-3xl first-letter:font-normal">
					{t("dialogs.deleteMedia.subtitle")}
				</Title>

				<FlexRow>
					<img className="" src={warningSvg} alt="Warning sign." />

					<Close
						className="bg-red-600 text-white hover:bg-opacity-70 focus:bg-opacity-70"
						onPointerUp={handleMediaDeletion}
					>
						{t("buttons.confirm")}
					</Close>

					<Close className="bg-transparent text-green-400 hover:bg-opacity-70 focus:bg-opacity-70">
						{t("buttons.cancel")}
					</Close>
				</FlexRow>
			</Content>
		</Portal>
	);
}

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////
// Types:

type Props = Readonly<{ handleMediaDeletion: () => void }>;
