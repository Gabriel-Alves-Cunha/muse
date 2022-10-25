import { AiOutlineSearch as SearchIcon } from "react-icons/ai";
import { useEffect } from "react";

import { useSearchInfo, downloadMedia, search, setSearchInfo } from "./helpers";
import { t, Translator } from "@components/I18n";
import { useTitle } from "@hooks/useTitle";
import { MainArea } from "@components/MainArea";
import { Loading } from "@components/Loading";
import { Button } from "@components/Button/Button";
import { Header } from "@components/Header";

////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////
// Main function:

export function Download() {
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

const errorAndUrlSelectors = (
	{ error, url }: ReturnType<typeof useSearchInfo.getState>,
) => ({ error, url });

////////////////////////////////////////////////

function SearcherWrapper() {
	const { error, url } = useSearchInfo(errorAndUrlSelectors);

	useEffect(() => {
		const searchTimeout = setTimeout(async () => await search(url), 300);

		return () => clearTimeout(searchTimeout);
	}, [url]);

	return (
		<div className="relative flex justify-start items-center w-[80%] h-16">
			<div className="group relative flex justify-start items-center w-80 h-10 border-2 border-solid border-input cursor-default rounded-xl bg-none transition-all ease-out duration-200 focus-within:border-active hover:border-active focus:border-active">
				<SearchIcon className="w-5 h-5 \
group-focus:border-active
group-focus:text-active

group-focus-within:border-active

group-hover:border-active

text-input cursor-default mx-3" />

				<label
					className={(url ? "active-label" : "") +
						" absolute flex items-center w-[90%] h-10 bottom-0 left-9 right-0 top-0 m-auto p-0 text-placeholder whitespace-nowrap font-secondary tracking-wider text-base font-normal transition-label"}
					htmlFor="searcher:url"
				>
					<Translator path="labels.pasteVideoURL" />
				</label>

				<input
					className="w-[82%] h-10 whitespace-nowrap font-primary cursor-text font-medium tracking-wider text-base bg-none border-none text-input"
					autoCapitalize="off"
					spellCheck="false"
					onChange={setUrl}
					autoCorrect="off"
					id="searcher:url"
					value={url}
				/>
			</div>

			<p className="absolute -bottom-3 left-[25%] font-primary tracking-wide text-sm text-red-600 font-normal">
				{error}
			</p>
		</div>
	);
}
// function SearcherWrapper() {
// 	const { error, url } = useSearchInfo(errorAndUrlSelectors);
//
// 	useEffect(() => {
// 		const searchTimeout = setTimeout(async () => await search(url), 300);
//
// 		return () => clearTimeout(searchTimeout);
// 	}, [url]);
//
// 	return (
// 		<SearchWrapper>
// 			<Searcher>
// 				<SearchIcon size={18} />
//
// 				<label className={url ? "active" : ""} htmlFor="searcher:url">
// 					<Translator path="labels.pasteVideoURL" />
// 				</label>
//
// 				<input
// 					autoCapitalize="off"
// 					spellCheck="false"
// 					onChange={setUrl}
// 					autoCorrect="off"
// 					id="searcher:url"
// 					value={url}
// 				/>
// 			</Searcher>
//
// 			<p>{error}</p>
// 		</SearchWrapper>
// 	);
// }

////////////////////////////////////////////////

const isLoadingSelector = (state: ReturnType<typeof useSearchInfo.getState>) =>
	state.isLoading;

function IsLoading() {
	const isLoading = useSearchInfo(isLoadingSelector);

	return <div className="w-6 h-6 ml-3">{isLoading === true && <Loading />}
	</div>;
}

////////////////////////////////////////////////

const resultSelector = (state: ReturnType<typeof useSearchInfo.getState>) =>
	state.result;

function Result() {
	// Only need to change on `result`'s change:
	const { imageURL, title } = useSearchInfo(resultSelector);

	return title.length > 0 ?
		(
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
					<Translator path="buttons.download" />
				</Button>
			</div>
		) :
		null;
}
// function Result() {
// 	// Only need to change on `result`'s change:
// 	const { imageURL, title } = useSearchInfo(resultSelector);
//
// 	return title.length > 0 ?
// 		(
// 			<ResultContainer>
// 				<img src={imageURL} alt={t("alts.videoThumbnail")} />
//
// 				<p>{title}</p>
//
// 				<Button variant="large" onPointerUp={downloadMedia}>
// 					<Translator path="buttons.download" />
// 				</Button>
// 			</ResultContainer>
// 		) :
// 		null;
// }
