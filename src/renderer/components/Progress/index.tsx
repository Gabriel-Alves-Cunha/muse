import {
	MdOutlineFileDownloadDone as Success,
	MdDownloading as Downloading,
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
			max={100}
		/>

		{showStatus && icon(status)}
	</Component>
);

Progress.whyDidYouRender = {
	logOnDifferentValues: false,
	customName: "Progress",
};

const iconObj: Record<ProgressStatus, JSX.Element> = Object.freeze({
	[ProgressStatus.SUCCESS]: <Success size={12} color="green" />,
	[ProgressStatus.CANCEL]: <Cancel size={12} color="blue" />,
	[ProgressStatus.FAIL]: <Fail size={12} color="red" />,
	[ProgressStatus.ACTIVE]: <Downloading size={12} />,
	[ProgressStatus.CONVERT]: <Convert size={12} />,
});

export const icon = (status: ProgressStatus) => iconObj[status];

export type ProgressProps = {
	readonly showStatus: boolean;
	percent_0_to_100: number;
	status: ProgressStatus;
};
