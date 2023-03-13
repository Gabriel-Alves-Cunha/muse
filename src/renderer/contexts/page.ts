import type { Page } from "@common/@types/GeneralTypes";

import { proxy } from "valtio";

export const page = proxy<{ curr: Page }>({ curr: "Home" });
