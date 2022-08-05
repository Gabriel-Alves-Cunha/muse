const modifierKeys = Object.freeze(
	[
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
	] as const,
);

export function isAModifierKeyPressed(
	event: KeyboardEvent,
	except: typeof modifierKeys[number][] = [],
): Readonly<boolean> {
	for (const key of modifierKeys) {
		if (except.includes(key)) continue;

		if (event.getModifierState(key)) {
			console.log("Modifier key pressed =", key);

			return true;
		}
	}

	return false;
}
