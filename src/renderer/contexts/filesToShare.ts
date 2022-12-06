import type { Path } from "@common/@types/generalTypes";

import { ReactiveSet } from "@solid-primitives/set";

export const filesToShare = new ReactiveSet<Path>();
