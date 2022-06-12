import { RiDownloadFill as Downloading } from "react-icons/ri";
import { AiOutlineCheck as Success } from "react-icons/ai";
import { TiCancel as Canceled } from "react-icons/ti";
import { MdError as Failed } from "react-icons/md";

import { ProgressStatus } from "@common/enums";

import { Bar, Component } from "./styles";

export const Progress = (
	{ percent_0_to_100, showStatus, status }: ProgressProps,
) => (
	<Component>
		<Bar
			value={status === ProgressStatus.SUCCESS ? 100 : percent_0_to_100}
			max="100"
		/>

		{showStatus && iconObj.get(status)}
	</Component>
);

const iconObj: ReadonlyMap<ProgressStatus, JSX.Element> = Object.freeze(
	new Map([
		[ProgressStatus.ACTIVE, <Downloading size={15} key="active" />],
		[ProgressStatus.CANCEL, <Canceled size={15} key="canceled" />],
		[ProgressStatus.SUCCESS, <Success size={15} key="success" />],
		[ProgressStatus.FAILED, <Failed size={15} key="failed" />],
	]),
);

export type ProgressProps = {
	readonly showStatus: boolean;
	percent_0_to_100: number;
	status: ProgressStatus;
};
