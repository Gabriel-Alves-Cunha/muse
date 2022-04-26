import type { Page } from "@common/@types/typesAndEnums";

import {
	MdOutlineVideoLibrary as Home,
	MdOutlineSettings as Settings,
	MdFavoriteBorder as Favorites,
	MdCloudDownload as Download,
	MdSwapHoriz as Convert,
	MdHistory as History,
} from "react-icons/md";

import { Downloading, Converting } from "@modules";
import { ThemeToggler } from "@modules/ThemeToggler";
import { Tooltip } from "@components";
import { usePage } from "@contexts";
import { pages } from "@utils/app";

import { ScaleUpIconButton, Nav, Buttons, Popups } from "./styles";

const { setState: setPage } = usePage;

export const Navbar = () => (
	<Nav>
		<ThemeToggler />

		<ButtonsForPages />

		<Popups>
			<Converting />

			<Downloading />
		</Popups>
	</Nav>
);

const ButtonsForPages = () => {
	const currPage = usePage().page;

	return (
		<Buttons>
			{pages.map(page => (
				<Tooltip text={"Go to " + page} key={page} side="right">
					<ScaleUpIconButton
						className={page === currPage ? "active" : ""}
						onClick={() => setPage({ page })}
					>
						{icon(page)}
					</ScaleUpIconButton>
				</Tooltip>
			))}
		</Buttons>
	);
};

const icon = (folder: Page) => iconObj[folder];

const iconObj: Record<Page, JSX.Element> = Object.freeze({
	Favorites: <Favorites />,
	Download: <Download />,
	Settings: <Settings />,
	History: <History />,
	Convert: <Convert />,
	Home: <Home />,
});
