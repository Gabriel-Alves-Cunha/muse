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

const iconObj: Map<ProgressStatus, JSX.Element> = new Map();
iconObj.set(ProgressStatus.SUCCESS, <Success size={12} color="green" />);
iconObj.set(ProgressStatus.CANCEL, <Cancel size={12} color="blue" />);
iconObj.set(ProgressStatus.FAILED, <Fail size={12} color="red" />);
iconObj.set(ProgressStatus.ACTIVE, <Downloading size={12} />);
Object.freeze(iconObj);

export type ProgressProps = {
	readonly showStatus: boolean;
	percent_0_to_100: number;
	status: ProgressStatus;
};
