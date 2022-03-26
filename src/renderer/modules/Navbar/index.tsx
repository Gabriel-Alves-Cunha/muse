import type { Page } from "@common/@types/typesAndEnums";

import {
	CounterClockwiseClockIcon as History,
	QuestionMarkIcon as Question,
	DownloadIcon as Download,
	StarIcon as Favorites,
	WidthIcon as Convert,
	GearIcon as Settings,
	HomeIcon as Home,
} from "@radix-ui/react-icons";

import { usePage } from "@contexts";
import { pages } from "@utils/app";

import { FolderButton, Nav } from "./styles";

const { setState: setPage } = usePage;

export function Navbar() {
	const currPage = usePage().page;

	return (
		<Nav>
			{pages.map(page => (
				<FolderButton
					className={page === currPage ? "active" : ""}
					onMouseDown={e => e.preventDefault()}
					// ^ Takes focus off of button so that the `outline` css can be applied
					onClick={() => setPage({ page })}
					aria-label={"Go to " + page}
					key={page}
				>
					{icon(page)}
				</FolderButton>
			))}
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
