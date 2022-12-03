import type { Component, JSX } from "solid-js";
import type { Page } from "@common/@types/generalTypes";

import { useI18n } from "@solid-primitives/i18n";

import { DownloadIcon } from "@icons/DownloadIcon";
import { HistoryIcon } from "@icons/HistoryIcon";
import { HeartIcon } from "@icons/HeartIcon";
import { HomeIcon } from "@icons/HomeIcon";
import { SwapIcon } from "@icons/SwapIcon";

import { setPage, usePage } from "@contexts/page";
import { ThemeToggler } from "@components/ThemeToggler";
// import { Downloading } from "@components/Downloading";
// import { Converting } from "@components/Converting";
import { pages } from "@utils/app";

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////
// Main function:

export const Navbar: Component = () => {
	const currPage = usePage((state) => state.page);
	const buttons: JSX.Element[] = [];
	const [t] = useI18n();

	for (const page of pages)
		buttons.push(
			<button
				title={t("tooltips.goto") + t(`pages.${page}`)}
				class={page === currPage ? "active" : ""}
				onPointerUp={() => setPage({ page })}
				type="button"
			>
				{icons[page]}
			</button>,
		);

	return (
		<nav class="nav">
			<ThemeToggler />

			<div class="buttons-for-pages">{buttons}</div>

			{/* <div class="min-h-max flex flex-col justify-center items-center w-full">
			<Converting />

			<Downloading />
		</div> */}
		</nav>
	);
};

const icons: Readonly<Record<Page, JSX.Element>> = {
	Download: <DownloadIcon />,
	Favorites: <HeartIcon />,
	History: <HistoryIcon />,
	Convert: <SwapIcon />,
	Home: <HomeIcon />,
} as const;
