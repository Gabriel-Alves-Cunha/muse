import type { Path } from "types/generalTypes";

import { create } from "zustand";

import { emptySet } from "@utils/empty";

export const useFilesToShare = create<{ filesToShare: ReadonlySet<Path> }>(
	() => ({
		filesToShare: emptySet,
	}),
);

export const getFilesToShare = () => useFilesToShare.getState().filesToShare;

export const setFilesToShare = (filesToShare: ReadonlySet<Path>) =>
	useFilesToShare.setState({ filesToShare });
