import type { ComponentProps } from "@stitches/react";

import { Wrapper } from "./styles";

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////
// Constants:

const mediaPlayerCard = "media-player-flip-card";

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////
// Main function:

export function FlipCard({ cardFront, cardBack }: Props) {
	return (
		<Wrapper id={mediaPlayerCard} className="flip-card">
			<div className="flip-card-inner">
				<div className="flip-card-front">{cardFront}</div>
				<div className="flip-card-back">{cardBack}</div>
			</div>
		</Wrapper>
	);
}

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////
// Helper functions:

export function flipMediaPlayerCard(): void {
	(document.getElementById(mediaPlayerCard) as HTMLDivElement).classList.toggle(
		"active",
	);
}

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////
// Types:

type Props = Readonly<
	ComponentProps<typeof Wrapper> & {
		cardFront: React.ReactNode;
		cardBack: React.ReactNode;
	}
>;
