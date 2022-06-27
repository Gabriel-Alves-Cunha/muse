import { Path } from "@common/@types/generalTypes";
import create from "zustand";

export const useSettings = create<Settings>(() => ({
	assureMediaSizeIsGreaterThan60KB: true,
	ignoreMediaWithLessThan60Seconds: true,
	share: { open: false, files: [] },
}));

export const { getState: getSettings, setState: setSettings } = useSettings;

type Settings = Readonly<
	{
		share: Readonly<{ open: boolean; files: Path[]; }>;
		assureMediaSizeIsGreaterThan60KB: boolean;
		ignoreMediaWithLessThan60Seconds: boolean;
	}
>;
