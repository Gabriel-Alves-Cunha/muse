import type { KeyboardEvent as ReactKeyboardEvent } from "react";

import { dbg } from "@common/debug";

const MODIFIER_KEYS = [
	"SymbolLock",
	"ScrollLock",
	"AltGraph",
	"CapsLock",
	"Control",
	"NumLock",
	"Symbol",
	"FnLock",
	"Hyper",
	"Shift",
	"Super",
	"Meta",
	"Alt",
	"Fn",
] as const;

export function isAModifierKeyPressed(
	event: KeyboardEvent | ReactKeyboardEvent,
	except: typeof MODIFIER_KEYS[number][] = [],
): Readonly<boolean> {
	for (const key of MODIFIER_KEYS) {
		if (except.includes(key)) continue;

		if (event.getModifierState(key)) {
			dbg("Modifier key pressed =", key);

			return true;
		}
	}

	return false;
}
