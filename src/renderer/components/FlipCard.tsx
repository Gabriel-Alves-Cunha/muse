import type { Component, JSX } from "solid-js";

export const mediaPlayerCardId = "media-player-flip-card";

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////
// Main function:

export const FlipCard: Component<{
	cardFront: JSX.Element;
	cardBack: JSX.Element;
}> = (props) => (
	<div
		class="w-full h-full bg-transparent perspective-10"
		id={mediaPlayerCardId}
	>
		{/* This container is needed to position the front and back side */}
		<div class="relative w-full h-full transform-preserve-3d transition-transform duration-700 rotate-y-180">
			<div class="absolute w-full h-full backface-visibility-hidden bg-transparent z-10">
				{props.cardFront}
			</div>

			<div class="absolute w-full h-full rotate-y-180 backface-visibility-hidden bg-transparent z-20">
				{props.cardBack}
			</div>
		</div>
	</div>
);
