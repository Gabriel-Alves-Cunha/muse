export const mediaPlayerFlipCardId = "media-player-flip-card";

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////
// Main function:

export const FlipCard = ({ frontCard, backCard }: Props): JSX.Element => (
	<div data-flip-card id={mediaPlayerFlipCardId}>
		{/* This container is needed to position the front and back side: */}
		<div>
			<div className="z-20">{frontCard}</div>

			<div className="z-10">{backCard}</div>
		</div>
	</div>
);

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////
// Types:

type Props = Readonly<{
	frontCard: React.ReactNode;
	backCard: React.ReactNode;
}>;
