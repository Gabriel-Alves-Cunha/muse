import type { InputChangeEvent } from "@common/@types/solid-js-helpers";

import { type Component, createEffect, onCleanup, Show } from "solid-js";
import { useI18n } from "@solid-primitives/i18n";

import { downloadMedia, search, setSearchInfo, searchInfo } from "./helpers";
import { BaseInput } from "@components/BaseInput";
import { MainArea } from "@components/MainArea";
import { Loading } from "@components/Loading";
import { Button } from "@components/Button";
import { Header } from "@components/Header";

////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////
// Main function:

const Download: Component = () => (
	<MainArea class="flex flex-col scroll scroll-2">
		<Header>
			<SearcherWrapper />

			<div class="w-6 h-6 ml-3">{searchInfo.isLoading && <Loading />}</div>
		</Header>

		<Result />
	</MainArea>
);

////////////////////////////////////////////////
// Helper functions:

const setUrl = (e: InputChangeEvent) =>
	setSearchInfo({ url: e.currentTarget.value });

////////////////////////////////////////////////

const SearcherWrapper: Component = () => {
	const { error, url } = searchInfo;
	const [t] = useI18n();

	createEffect(() => {
		const searchTimeout = setTimeout(async () => await search(url), 300);

		onCleanup(() => clearTimeout(searchTimeout));
	});

	return (
		<>
			<BaseInput
				label={t("labels.pasteVideoURL")}
				autoCapitalize="off"
				spell-check="false"
				onChange={setUrl}
				value={url}
			/>

			<p class="absolute -bottom-3 left-[25%] font-primary tracking-wide text-sm text-red-600 font-normal">
				{error}
			</p>
		</>
	);
};

////////////////////////////////////////////////
////////////////////////////////////////////////

const Result: Component = () => {
	const { imageURL, title } = searchInfo.result;
	const [t] = useI18n();

	return (
		<Show when={title}>
			<div class="flex flex-col mb-5 mt-8">
				<img
					class="object-cover h-44 w-80 shadow-reflect reflect-img transition-transform hover:transition-scale hover:scale-110 focus:scale-x-110"
					alt={t("alts.videoThumbnail")}
					src={imageURL}
				/>

				<p class="my-8 mx-4 font-primary text-center text-lg text-normal">
					{title}
				</p>

				<Button variant="large" onPointerUp={downloadMedia}>
					{t("buttons.download")}
				</Button>
			</div>
		</Show>
	);
};

export default Download;
