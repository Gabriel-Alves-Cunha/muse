import { RiDownloadFill as Downloading } from "react-icons/ri";
import {
	MdOutlineFileDownloadDone as Success,
	MdOutlineClose as Cancel,
	MdOutlineClose as Fail,
} from "react-icons/md";

import { ProgressStatus } from "@common/enums";

import { Bar, Component } from "./styles";

export const Progress = ({
	percent_0_to_100,
	showStatus,
	status,
}: ProgressProps) => (
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
		[ProgressStatus.SUCCESS, <Success size={12} color="green" key="success" />],
		[ProgressStatus.CANCEL, <Cancel size={12} color="blue" key="cancel" />],
		[ProgressStatus.FAILED, <Fail size={12} color="red" key="failed" />],
		[ProgressStatus.ACTIVE, <Downloading size={12} key="active" />],
	])
);

export type ProgressProps = {
	readonly showStatus: boolean;
	percent_0_to_100: number;
	status: ProgressStatus;
};
