import type { Page } from "@common/@types/typesAndEnums";

import { RiQuestionMark as Question } from "react-icons/ri";
import {
	MdOutlineVideoLibrary as Home,
	MdOutlineSettings as Settings,
	MdFavoriteBorder as Favorites,
	MdCloudDownload as Download,
	MdSwapHoriz as Convert,
	MdHistory as History,
} from "react-icons/md";

import { Downloading, Converting } from "@modules";
import { usePage } from "@contexts";
import { pages } from "@utils/app";

import { ScaleUpIconButton, Nav } from "./styles";

const { setState: setPage } = usePage;

export function Navbar() {
	const currPage = usePage().page;

	return (
		<Nav>
			{pages.map(page => (
				<ScaleUpIconButton
					className={page === currPage ? "active" : ""}
					onMouseDown={e => e.preventDefault()}
					// ^ Takes focus off of button so that the `outline` css can be applied
					onClick={() => setPage({ page })}
					aria-label={"Go to " + page}
					key={page}
				>
					{icon(page)}
				</ScaleUpIconButton>
			))}

			<Downloading />
			<Converting />
		</Nav>
	);
}

const icon = (folder: Page) => iconObj[folder] ?? <Question />;

const iconObj: Record<Page, JSX.Element> = Object.freeze({
	Favorites: <Favorites />,
	Download: <Download />,
	Settings: <Settings />,
	History: <History />,
	Convert: <Convert />,
	Home: <Home />,
});
