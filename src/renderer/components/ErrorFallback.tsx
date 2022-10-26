import { Close, Content, Dialog, Overlay, Title } from "@radix-ui/react-dialog";

import { resetAllAppData } from "@utils/app";
import { reloadWindow } from "@components/MediaListKind/helper";
import { Translator } from "@components/I18n";

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////
// Main function:

export function ErrorFallback({ description }: ErrorBoundaryProps) {
	return (
		<Dialog modal open>
			<Overlay className="fixed grid place-items-center bottom-0 right-0 left-0 top-0 blur-sm bg-opacity-10 overflow-y-auto z-20 animation-overlay-show" />

			<Content>
				<div className="relative flex flex-col justify-center items-center">
					<Title className="">
						<Translator path="errors.mediaListKind.errorTitle" />
					</Title>

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
						<Translator path="buttons.resetAllAppData" />
					</Close>

					<Close
						className="bg-[#94a59b] text-black hover:bg-opacity-70 focus:bg-opacity-70"
						onPointerUp={reloadWindow}
					>
						<Translator path="buttons.reloadWindow" />
					</Close>
				</div>
			</Content>
		</Dialog>
	);
}

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////
// Types:

type ErrorBoundaryProps = Readonly<{ description: string; }>;
