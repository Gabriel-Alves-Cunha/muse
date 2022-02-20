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
					percentage={
						status === ProgressStatus.SUCCESS ? 100 : percent_0_to_100
					}
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

const map = new Map<ProgressStatus, JSX.Element>();

export const icon = (status: ProgressStatus) =>
	map.get(status) ?? <QuestionMark size={12} />;

map.set(ProgressStatus.SUCCESS, <Success size={12} color="green" />);
map.set(ProgressStatus.CANCEL, <Cancel size={12} color="blue" />);
map.set(ProgressStatus.FAIL, <Fail size={12} color="red" />);
map.set(ProgressStatus.ACTIVE, <Downloading size={12} />);
map.set(ProgressStatus.CONVERT, <Convert size={12} />);

export type ProgressProps = {
	readonly showStatus: boolean;
	percent_0_to_100: number;
	status: ProgressStatus;
};
