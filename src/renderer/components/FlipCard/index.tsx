import type { ComponentProps } from "@stitches/react";

import { Wrapper } from "./styles";

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////
// Constants:

export const mediaPlayerCardId = "media-player-flip-card";

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////
// Main function:

export function FlipCard({ cardFront, cardBack }: Props) {
	return (
		<Wrapper id={mediaPlayerCardId} className="flip-card">
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
// Types:

interface Props extends ComponentProps<typeof Wrapper> {
	readonly cardFront: React.ReactNode;
	readonly cardBack: React.ReactNode;
}
