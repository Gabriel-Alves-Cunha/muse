import type { ValuesOf } from "@common/@types/utils";

import { RiDownloadFill as DownloadingIcon } from "react-icons/ri";
import { CgSearchLoading as LoadingIcon } from "react-icons/cg";
import { AiOutlineCheck as SuccessIcon } from "react-icons/ai";
import { TiCancel as CanceledIcon } from "react-icons/ti";
import { MdError as FailedIcon } from "react-icons/md";

import { ProgressStatus } from "@common/enums";

/////////////////////////////////////////
/////////////////////////////////////////
//////////////////////////////////////////
// Main function:

export const Progress = ({ percent_0_to_100, status }: ProgressProps) => (
	<progress
		className="appearance-none border-none transition-[width] duration-300 ease-linear w-48 h-1"
		value={status === ProgressStatus.SUCCESS ? 100 : percent_0_to_100}
		max={100}
	/>
);

/////////////////////////////////////////
/////////////////////////////////////////
//////////////////////////////////////////
// Helper function:

export const progressIcons: ReadonlyMap<
	ValuesOf<typeof ProgressStatus>,
	JSX.Element
> = new Map([
	[
		ProgressStatus.WAITING_FOR_CONFIRMATION_FROM_ELECTRON,
		<LoadingIcon
			className="fill-orange-400"
			title="Waiting"
			key="loading"
			size={15}
		/>,
	],
	[
		ProgressStatus.ACTIVE,
		<DownloadingIcon
			className="fill-teal-600"
			title="Downloading"
			key="active"
			size={15}
		/>,
	],
	[
		ProgressStatus.CANCEL,
		<CanceledIcon
			className="fill-yellow-600"
			title="Canceled"
			key="canceled"
			size={17}
		/>,
	],
	[
		ProgressStatus.SUCCESS,
		<SuccessIcon
			className="fill-green-500"
			title="Success"
			key="success"
			size={15}
		/>,
	],
	[
		ProgressStatus.FAILED,
		<FailedIcon
			className="fill-red-500"
			title="Failed"
			key="failed"
			size={16}
		/>,
	],
]);

/////////////////////////////////////////
/////////////////////////////////////////
//////////////////////////////////////////
// Types:

export type ProgressProps = {
	status: ValuesOf<typeof ProgressStatus>;
	percent_0_to_100: number;
};
