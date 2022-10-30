export const mediaPlayerCardId = "media-player-flip-card";

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////
// Main function:

export const FlipCard = ({ cardFront, cardBack }: Props) => (
	<div
		className="w-full h-full bg-transparent perspective-10"
		id={mediaPlayerCardId}
	>
		{/* This container is needed to position the front and back side */}
		<div className="relative w-full h-full transform-preserve-3d transition-transform duration-700 rotate-y-180">
			<div className="absolute w-full h-full backface-visibility-hidden bg-transparent z-10">
				{cardFront}
			</div>

			<div className="absolute w-full h-full rotate-y-180 backface-visibility-hidden bg-transparent z-20">
				{cardBack}
			</div>
		</div>
	</div>
);

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////
// Types:

type Props = Readonly<{
	cardFront: React.ReactNode;
	cardBack: React.ReactNode;
}>;
