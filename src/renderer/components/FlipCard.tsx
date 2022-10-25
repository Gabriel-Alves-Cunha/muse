export const mediaPlayerCardId = "media-player-flip-card";

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////
// Main function:

export function FlipCard({ cardFront, cardBack }: Props) {
	return (
		// TODO: Ver se esse div é necessário:
		<div
			className="w-full h-full bg-transparent perspective-10"
			id={mediaPlayerCardId}
		>
			<div className="relative w-full h-full transform-preserve-3d transition-transform duration-700 ">
				<div className="absolute w-full h-full backface-visibility-hidden bg-transparent z-10">
					{cardFront}
				</div>
				<div className="absolute w-full h-full rotate-y-180 backface-visibility-hidden bg-transparent z-20">
					{cardBack}
				</div>
			</div>
		</div>
	);
}
// export function FlipCard({ cardFront, cardBack }: Props) {
// 	return (
// 		<Wrapper id={mediaPlayerCardId} className="flip-card">
// 			<div className="flip-card-inner">
// 				<div className="flip-card-front">{cardFront}</div>
// 				<div className="flip-card-back">{cardBack}</div>
// 			</div>
// 		</Wrapper>
// 	);
// }

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////
// Types:

type Props = Readonly<{
	cardFront: React.ReactNode;
	cardBack: React.ReactNode;
}>;
