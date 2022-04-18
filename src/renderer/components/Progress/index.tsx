import { RiDownloadFill as Downloading } from "react-icons/ri";
import {
	MdOutlineFileDownloadDone as Success,
	MdCompareArrows as Convert,
	MdOutlineClose as Cancel,
	MdOutlineClose as Fail,
} from "react-icons/md";

import { ProgressStatus } from "@common/@types/typesAndEnums";

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

		{showStatus && icon(status)}
	</Component>
);

const iconObj: Map<ProgressStatus, JSX.Element> = new Map();
iconObj.set(ProgressStatus.SUCCESS, <Success size={12} color="green" />);
iconObj.set(ProgressStatus.CANCEL, <Cancel size={12} color="blue" />);
iconObj.set(ProgressStatus.FAIL, <Fail size={12} color="red" />);
iconObj.set(ProgressStatus.ACTIVE, <Downloading size={12} />);
iconObj.set(ProgressStatus.CONVERT, <Convert size={12} />);
Object.freeze(iconObj);

export const icon = (status: ProgressStatus) => iconObj.get(status);

export type ProgressProps = {
	readonly showStatus: boolean;
	percent_0_to_100: number;
	status: ProgressStatus;
};
