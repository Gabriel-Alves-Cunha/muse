import create from "zustand";

export const useSettings = create<Settings>(() => ({
	assureMediaSizeIsGreaterThan60KB: true,
	ignoreMediaWithLessThan60Seconds: true,
}));
export const { getState: getSettings, setState: setSettings } = useSettings;

type Settings = Readonly<
	{
		assureMediaSizeIsGreaterThan60KB: boolean;
		ignoreMediaWithLessThan60Seconds: boolean;
	}
>;
