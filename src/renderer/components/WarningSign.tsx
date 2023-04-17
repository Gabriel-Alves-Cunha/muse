// @ts-ignore => That's alright:
import warningSvg from "@assets/warning.svg";

const warningSign = (
	<img src={warningSvg} className="w-9 h-9 ml-3" alt="Warning sign" />
);

export const WarningSign = (): JSX.Element => warningSign;
