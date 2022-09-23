import {
	DOWN_DECORATIONS_HEIGHT,
	TOP_DECORATIONS_HEIGHT,
} from "@components/Decorations/styles";

export function ContentWrapper() {
	return (
		<div
			className={`
			grid
			grid-template-for-content-wrapper
			w-screen

			h-[calc(100vh_-_(${TOP_DECORATIONS_HEIGHT}_+_${DOWN_DECORATIONS_HEIGHT}))]

			mt-[${TOP_DECORATIONS_HEIGHT}]

			`}
		/>
	);
}
