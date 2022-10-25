import {
	MdLightbulbOutline as Light,
	MdLightbulb as Dark,
} from "react-icons/md";

import { type Settings, setSettings, useSettings } from "@contexts/settings";
import { t } from "@components/I18n";

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////

export const availableThemes = [
	"theme-light",
	"theme-dark",
] as const;

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////
// Main function:

const themeSelector = (state: ReturnType<typeof useSettings.getState>) =>
	state.theme;

export function ThemeToggler() {
	const currTheme = useSettings(themeSelector);
	const nextTheme: Settings["theme"] = currTheme === availableThemes[0] ?
		availableThemes[1] :
		availableThemes[0];

	function toggleTheme() {
		document.documentElement.classList.remove(currTheme);
		document.documentElement.classList.add(nextTheme);

		setSettings({ theme: nextTheme });
	}

	return (
		<button
			// TODO
			className="relative flex justify-center items-center w-12 h-12 cursor-pointer bg-none border-none text-dea???? "
			title={t("tooltips.toggleTheme")}
			onPointerUp={toggleTheme}
		>
			{currTheme === availableThemes[0] ?
				<Dark size="20px" /> :
				<Light size="20px" />}
		</button>
	);
}

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////
// Styles:

// const ThemeButton = styled("button", {
// 	pos: "relative",
// 	dflex: "center",
// 	size: 50,
//
// 	cursor: "pointer",
// 	bg: "none",
// 	b: "none",
//
// 	c: "$deactivated-icon",
//
// 	"&:hover, &:focus": { c: "$active-icon" },
// });
