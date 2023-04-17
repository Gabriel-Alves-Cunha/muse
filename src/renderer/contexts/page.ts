import type { Page } from "@common/@types/GeneralTypes";

import { create } from "zustand";

export const pageRef = create<{ current: Page }>(() => ({ current: "Home" }));

export const setPage = (page: Page): void =>
	pageRef.setState({ current: page });
