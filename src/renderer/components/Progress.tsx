import type { ValuesOf } from "@common/@types/utils";

import { RiDownloadFill as Downloading } from "react-icons/ri";
import { CgSearchLoading as Loading } from "react-icons/cg";
import { AiOutlineCheck as Success } from "react-icons/ai";
import { TiCancel as Canceled } from "react-icons/ti";
import { MdError as Failed } from "react-icons/md";

import { progressStatus } from "@common/enums";

/////////////////////////////////////////
/////////////////////////////////////////
//////////////////////////////////////////
// Main function:

export const Progress = ({
	percent_0_to_100,
	showStatus,
	status,
}: ProgressProps) => (
	<div className="flex items-center w-[98%] h-4 [&_svg]:ml-2 [&_svg]:fill-black">
		<progress
			className="appearance-none border-none transition-width duration-300 ease-linear w-48 h-1 value"
			value={status === progressStatus.SUCCESS ? 100 : percent_0_to_100}
			max={100}
		/>

		{showStatus && progressIcons.get(status)}
	</div>
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
		<Loading size={15} key="loading" />,
	],
	[progressStatus.ACTIVE, <Downloading size={15} key="active" />],
	[progressStatus.CANCEL, <Canceled size={15} key="canceled" />],
	[progressStatus.SUCCESS, <Success size={15} key="success" />],
	[progressStatus.FAILED, <Failed size={15} key="failed" />],
]);

/////////////////////////////////////////
/////////////////////////////////////////
//////////////////////////////////////////
// Types:

export type ProgressProps = Readonly<{
	status: ValuesOf<typeof progressStatus>;
	percent_0_to_100: number;
	showStatus: boolean;
}>;
