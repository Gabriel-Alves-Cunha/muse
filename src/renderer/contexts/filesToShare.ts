import type { Path } from "@common/@types/GeneralTypes";

import { proxySet } from "valtio/utils";

export const filesToShare = proxySet<Path>();
