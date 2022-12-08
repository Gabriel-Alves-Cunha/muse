import { useEffect } from "react";

import { useSearchInfo, downloadMedia, search, setSearchInfo } from "./helpers";
import { useTranslation } from "@i18n";
import { BaseInput } from "@components/BaseInput";
import { useTitle } from "@hooks/useTitle";
import { MainArea } from "@components/MainArea";
import { Loading } from "@components/Loading";
import { Button } from "@components/Button";
import { Header } from "@components/Header";

////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////
// Main function:

export function Download() {
	const { t } = useTranslation();

	useTitle(t("titles.download"));

	return (
		<MainArea className="flex flex-col scroll scroll-2">
			<Header>
				<SearcherWrapper />

				<IsLoading />
			</Header>

			<Result />
		</MainArea>
	);
}

////////////////////////////////////////////////
// Helper functions:

const setUrl = (e: React.ChangeEvent<HTMLInputElement>) =>
	setSearchInfo({ url: e.target.value });

////////////////////////////////////////////////

const errorAndUrlSelectors = ({
	error,
	url,
}: ReturnType<typeof useSearchInfo.getState>) => ({ error, url });

////////////////////////////////////////////////

function SearcherWrapper() {
	const { error, url } = useSearchInfo(errorAndUrlSelectors);
	const { t } = useTranslation();

	useEffect(() => {
		const searchTimeout = setTimeout(() => search(url).then(), 300);

		return () => clearTimeout(searchTimeout);
	}, [url]);

	return (
		<>
			<BaseInput
				label={t("labels.pasteVideoURL")}
				autoCapitalize="off"
				spellCheck="false"
				onChange={setUrl}
				autoCorrect="off"
				value={url}
			/>

			<p className="absolute -bottom-3 left-[25%] font-primary tracking-wide text-sm text-red-600 font-normal">
				{error}
			</p>
		</>
	);
}

////////////////////////////////////////////////
////////////////////////////////////////////////

const isLoadingSelector = (state: ReturnType<typeof useSearchInfo.getState>) =>
	state.isLoading;

function IsLoading() {
	const isLoading = useSearchInfo(isLoadingSelector);

	return <div className="w-6 h-6 ml-3">{isLoading && <Loading />}</div>;
}

////////////////////////////////////////////////
////////////////////////////////////////////////

const resultSelector = (state: ReturnType<typeof useSearchInfo.getState>) =>
	state.result;

function Result() {
	// Only need to change on `result`'s change:
	const { imageURL, title } = useSearchInfo(resultSelector);
	const { t } = useTranslation();

	return title ? (
		<div className="flex flex-col mb-5 mt-8">
			<img
				className="object-cover h-44 w-80 shadow-reflect reflect-img transition-transform hover:transition-scale hover:scale-110 focus:scale-x-110"
				alt={t("alts.videoThumbnail")}
				src={imageURL}
			/>

			<p className="my-8 mx-4 font-primary text-center text-lg text-normal">
				{title}
			</p>

			<Button variant="large" onPointerUp={downloadMedia}>
				{t("buttons.download")}
			</Button>
		</div>
	) : null;
}
