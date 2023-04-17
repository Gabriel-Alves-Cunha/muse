import type { Path } from "@common/@types/GeneralTypes";

import { create } from "zustand";

import { emptySet } from "@utils/empty";

export const filesToShareRef = create<FilesToShare>(() => ({
	current: emptySet,
}));

export const getFilesToShare = (): FilesToShare["current"] =>
	filesToShareRef.getState().current;

export const setFilesToShare = (filesToShare: FilesToShare["current"]): void =>
	filesToShareRef.setState({ current: filesToShare });

export const clearAllFilesToShare = (): void =>
	filesToShareRef.setState({ current: emptySet });

////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////
// Types:

export type FilesToShare = Readonly<{ current: ReadonlySet<Path> }>;
