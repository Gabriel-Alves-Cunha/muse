import { Close, Content, Title } from "@radix-ui/react-dialog";
import { Root as Portal } from "@radix-ui/react-portal";

import { BlurOverlay } from "./BlurOverlay";
import { Translator } from "@components/I18n";
import { FlexRow } from "@components/FlexRow";

import warningSvg from "@assets/warning.svg";

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////
// Main function:

export function DeleteMediaDialogContent({ handleMediaDeletion }: Props) {
	return (
		<Portal>
			<BlurOverlay />

			<Content className="">
				<Title className="text-lg first-letter:text-3xl first-letter:font-normal">
					<Translator path="dialogs.deleteMedia.subtitle" />
				</Title>

				<FlexRow>
					<img className="" src={warningSvg} alt="Warning sign." />

					<Close
						className="bg-red-600 text-white hover:bg-opacity-70 focus:bg-opacity-70"
						onPointerUp={handleMediaDeletion}
					>
						<Translator path="buttons.confirm" />
					</Close>

					<Close className="bg-transparent text-green-400 hover:bg-opacity-70 focus:bg-opacity-70">
						<Translator path="buttons.cancel" />
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
