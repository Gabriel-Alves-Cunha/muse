import type { ValuesOf } from "@common/@types/Utils";

import { RiDownloadFill as DownloadingIcon } from "react-icons/ri";
import { CgSearchLoading as LoadingIcon } from "react-icons/cg";
import { AiOutlineCheck as SuccessIcon } from "react-icons/ai";
import { TiCancel as CanceledIcon } from "react-icons/ti";
import { MdError as FailedIcon } from "react-icons/md";

import { ProgressStatusEnum } from "@common/enums";

/////////////////////////////////////////
/////////////////////////////////////////
//////////////////////////////////////////
// Main function:

export const Progress = ({
	percent_0_to_100,
	status,
}: ProgressProps): JSX.Element => (
	<progress
		value={status === ProgressStatusEnum.SUCCESS ? 100 : percent_0_to_100}
		data-progress
		max="100"
	/>
);

/////////////////////////////////////////
/////////////////////////////////////////
//////////////////////////////////////////
// Helper function:

export const progressIcons: ReadonlyMap<
	ValuesOf<typeof ProgressStatusEnum>,
	JSX.Element
> = new Map([
	[
		ProgressStatusEnum.WAITING_FOR_CONFIRMATION_FROM_ELECTRON,
		<LoadingIcon
			className="fill-orange-400"
			title="Waiting"
			key="loading"
			size={15}
		/>,
	],
	[
		ProgressStatusEnum.ACTIVE,
		<DownloadingIcon
			className="fill-teal-600"
			title="Downloading"
			key="active"
			size={15}
		/>,
	],
	[
		ProgressStatusEnum.CANCEL,
		<CanceledIcon
			className="fill-yellow-600"
			title="Canceled"
			key="canceled"
			size={17}
		/>,
	],
	[
		ProgressStatusEnum.SUCCESS,
		<SuccessIcon
			className="fill-green-500"
			title="Success"
			key="success"
			size={15}
		/>,
	],
	[
		ProgressStatusEnum.FAILED,
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
	status: ValuesOf<typeof ProgressStatusEnum>;
	percent_0_to_100: number;
};
