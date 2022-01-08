import type { MouseEvent } from "react";

export const pulse = (
	e: MouseEvent<HTMLButtonElement>,
	timeOfAnimationInMilliseconds = 600,
) => {
	e.preventDefault();

	// @ts-ignore: this thing DOES exists
	e.target.animate(
		[
			{
				boxShadow: "0 0 0 0px rgba(211, 186, 250, 0.7)",
			},
			{
				boxShadow: "0 0 0 10px rgba(211, 186, 250, 0)",
			},
		],
		timeOfAnimationInMilliseconds,
	);
};
