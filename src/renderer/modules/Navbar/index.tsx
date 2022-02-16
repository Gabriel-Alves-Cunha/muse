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

import { folders } from "@utils/app";
import { usePage } from "@contexts";

import { FolderButton, Nav, Text } from "./styles";

const { setState: setPage } = usePage;

export function Navbar() {
	const page = usePage().page;

	return (
		<Nav>
			{folders.map(folder => (
				<FolderButton
					className={folder === page ? "active" : ""}
					onClick={() => setPage({ page: folder })}
					onMouseDown={e => e.preventDefault()}
					// ^ Takes focus off of button so that the `outline` css can be applied
					aria-label={"Go to" + folder}
					key={folder}
				>
					<span>{icon(folder)}</span>
					<Text>{folder}</Text>
				</FolderButton>
			))}
		</Nav>
	);
}

Navbar.whyDidYouRender = {
	logOnDifferentValues: true,
	customName: "Navbar",
};

const icon = (folder: Page) => iconMap.get(folder) ?? <Question />;
const iconMap = new Map<Page, JSX.Element>();

iconMap.set("Favorites", <Favorites />);
iconMap.set("Download", <Download />);
iconMap.set("Settings", <Settings />);
iconMap.set("History", <History />);
iconMap.set("Convert", <Convert />);
iconMap.set("Home", <Home />);
