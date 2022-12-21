import { dbg } from "@common/debug";

const modifierKeys = [
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

export const isAModifierKeyPressed = (
	event: KeyboardEvent,
	except: typeof modifierKeys[number][] = [],
): Readonly<boolean> => {
	for (const key of modifierKeys) {
		if (except.includes(key)) continue;

		if (event.getModifierState(key)) {
			dbg("Modifier key pressed =", key);

			return true;
		}
	}

	return false;
};
