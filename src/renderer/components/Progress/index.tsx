import { BsQuestionLg as QuestionMark } from "react-icons/bs";
import { BsArrowLeftRight as Convert } from "react-icons/bs";
import { HiDownload as Downloading } from "react-icons/hi";
import { AiOutlineCheck as Success } from "react-icons/ai";
import { AiOutlineClose as Fail } from "react-icons/ai";
import { FcCancel as Cancel } from "react-icons/fc";

import { ProgressStatus } from "@common/@types/typesAndEnums";

import { Bar, Component, ProgressBarWrapper } from "./styles";

export function Progress({
	percent_0_to_100,
	showStatus,
	status,
}: ProgressProps) {
	return (
		<Component>
			<ProgressBarWrapper>
				<Bar
					css={{
						$$percentage:
							status === ProgressStatus.SUCCESS ? 100 : percent_0_to_100,
					}}
				>
					<div className={status.toString()} />
				</Bar>
			</ProgressBarWrapper>

			{showStatus && icon(status)}
		</Component>
	);
}

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

export const icon = (status: ProgressStatus) =>
	iconObj[status] ?? <QuestionMark size={12} />;

export type ProgressProps = {
	readonly showStatus: boolean;
	percent_0_to_100: number;
	status: ProgressStatus;
};
