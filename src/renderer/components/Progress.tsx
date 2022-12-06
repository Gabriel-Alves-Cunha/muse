import type { Component, JSX } from "solid-js";
import type { ValuesOf } from "@common/@types/utils";

import { CheckMarkIcon } from "@icons/CheckMarkIcon";
import { DownloadIcon } from "@icons/DownloadIcon";
import { SearchIcon } from "@icons/SearchIcon";
import { CloseIcon } from "@icons/CloseIcon";
import { ErrorIcon } from "@icons/ErrorIcon";

import { progressStatus } from "@common/enums";

/////////////////////////////////////////
/////////////////////////////////////////
//////////////////////////////////////////
// Main function:

export const Progress: Component<ProgressProps> = (props) => (
	<progress
		class="appearance-none border-none transition-width duration-300 ease-linear w-48 h-1"
		value={
			props.status === progressStatus.SUCCESS ? 100 : props.percent_0_to_100
		}
		max={100}
	/>
);

/////////////////////////////////////////
/////////////////////////////////////////
//////////////////////////////////////////
// Helper function:

export const progressIcons: ReadonlyMap<
	ValuesOf<typeof progressStatus>,
	JSX.Element
> = new Map([
	[
		progressStatus.WAITING_FOR_CONFIRMATION_FROM_ELECTRON,
		<SearchIcon class="fill-orange-400 w-4 h-4" aria-labelledby="Waiting" />,
	],
	[
		progressStatus.ACTIVE,
		<DownloadIcon
			class="fill-teal-600 w-4 h-4"
			aria-labelledby="Downloading"
		/>,
	],
	[
		progressStatus.CANCEL,
		<CloseIcon class="fill-yellow-600 w-4 h-4" aria-labelledby="Canceled" />,
	],
	[
		progressStatus.SUCCESS,
		<CheckMarkIcon class="fill-green-500 w-4 h-4" aria-labelledby="Success" />,
	],
	[
		progressStatus.FAILED,
		<ErrorIcon class="fill-red-500 w-4 h-4" aria-labelledby="Failed" />,
	],
]);

/////////////////////////////////////////
/////////////////////////////////////////
//////////////////////////////////////////
// Types:

export type ProgressProps = {
	status: ValuesOf<typeof progressStatus>;
	percent_0_to_100: number;
};
