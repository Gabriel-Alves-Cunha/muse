import type { Page } from "@common/@types/generalTypes";

import { proxy } from "valtio";

export const page = proxy<{ curr: Page }>({ curr: "Home" });
