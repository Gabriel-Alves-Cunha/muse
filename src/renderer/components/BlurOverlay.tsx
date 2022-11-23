import type { DialogOverlayProps } from "@radix-ui/react-dialog";

import { Overlay } from "@radix-ui/react-dialog";

export const BlurOverlay = ({ className = "", ...props }: Props) => (
	<Overlay
		className={`fixed bottom-0 right-0 left-0 top-0 blur-sm bg-opacity-10 z-20 animation-overlay-show duration-100 ${className}`}
		{...props}
	/>
);

type Props = DialogOverlayProps;
