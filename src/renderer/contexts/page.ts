import type { Page } from "@common/@types/generalTypes";

import create from "zustand";

export const usePage = create<{ page: Page }>(() => ({ page: "Home" }));
