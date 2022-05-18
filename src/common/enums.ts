import type { AllowedMedias } from "./utils";
import type { Path } from "./@types/generalTypes";

export type ConvertInfo = Readonly<{
	toExtension: AllowedMedias;
	canStartConvert: boolean;
	path: Path;
}>;

export enum ProgressStatus {
	WAITING_FOR_CONFIRMATION_FROM_ELECTRON,
	SUCCESS,
	ACTIVE,
	CANCEL,
	FAILED,
}
