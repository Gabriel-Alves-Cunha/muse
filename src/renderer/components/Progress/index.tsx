import { BsQuestionLg as QuestionMark } from "react-icons/bs";
import { BsArrowLeftRight as Convert } from "react-icons/bs";
import { HiDownload as Downloading } from "react-icons/hi";
import { AiOutlineCheck as Success } from "react-icons/ai";
import { AiOutlineClose as Fail } from "react-icons/ai";
import { FcCancel as Cancel } from "react-icons/fc";

import { Bar, Component, ProgressBarWrapper } from "./styles";

export function Progress({
	percent_0_to_100,
	showStatus,
	status,
}: ProgressProps) {
	return (
		<Component>
			<ProgressBarWrapper>
				<Bar percentage={percent_0_to_100}>
					<div className={status} />
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

export const icon = (status: ProgressProps["status"] | "convert") =>
	map.get(status) ?? <QuestionMark size={12} />;

const map = new Map<ProgressProps["status"] | "convert", JSX.Element>();

map.set("success", <Success size={12} color="green" />);
map.set("cancel", <Cancel size={12} color="blue" />);
map.set("fail", <Fail size={12} color="red" />);
map.set("active", <Downloading size={12} />);
map.set("convert", <Convert size={12} />);

export type ProgressProps = {
	status: "success" | "fail" | "active" | "cancel";
	percent_0_to_100: number;
	readonly showStatus: boolean;
};
