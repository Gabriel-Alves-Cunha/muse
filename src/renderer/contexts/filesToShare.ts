import type { Path } from "@common/@types/generalTypes";

import create from "zustand";

import { emptySet } from "@common/empty";

export const useFilesToShare = create<{ paths: ReadonlySet<Path> }>(() => ({
	paths: emptySet,
}));

export const getFilesToShare = () => useFilesToShare.getState().paths;

export const setFilesToShare = (files: Set<Path>) =>
	useFilesToShare.setState({ paths: files });
