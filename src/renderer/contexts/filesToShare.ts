import type { Path } from "@common/@types/generalTypes";

import { proxySet } from "valtio/utils";

export const filesToShare = proxySet<Path>();
