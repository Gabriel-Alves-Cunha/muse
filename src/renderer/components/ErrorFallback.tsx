import { Close, Content, Dialog, Title } from "@radix-ui/react-dialog";

import { resetAllAppData } from "@utils/app";
import { useTranslation } from "@i18n";
import { reloadWindow } from "@components/MediaListKind/helper";
import { BlurOverlay } from "./BlurOverlay";

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////
// Main function:

export function ErrorFallback({ description }: ErrorBoundaryProps) {
	const { t } = useTranslation();

	return (
		<Dialog modal open>
			<BlurOverlay />

			<Content className="relative flex flex-col justify-center items-center">
				<Title className="">{t("errors.mediaListKind.errorTitle")}</Title>

				<p className="text-alternative font-secondary tracking-wider font-medium overflow-ellipsis overflow-hidden">
					{description}
				</p>

				<Close
					className="bg-[#94a59b] my-2 mx-0 text-black hover:bg-opacity-70 focus:bg-opacity-70"
					onPointerUp={() => {
						resetAllAppData();
						reloadWindow();
					}}
				>
					{t("buttons.resetAllAppData")}
				</Close>

				<Close
					className="bg-[#94a59b] text-black hover:bg-opacity-70 focus:bg-opacity-70"
					onPointerUp={reloadWindow}
				>
					{t("buttons.reloadWindow")}
				</Close>
			</Content>
		</Dialog>
	);
}

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////
// Types:

type ErrorBoundaryProps = { description: string };
