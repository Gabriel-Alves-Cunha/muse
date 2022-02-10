import { AiOutlineSearch as SearchIcon } from "react-icons/ai";
import { useEffect, useRef } from "react";

import { useDownloadHelper } from "./helpers";

import { Loading } from "@styles/appStyles";
import {
	ResultContainer,
	SearchWrapper,
	Searcher,
	Wrapper,
	Button,
} from "./styles";

export function Download() {
	return (
		<Wrapper>
			<SearcherWrapper />

			<IsLoading />

			<Result />
		</Wrapper>
	);
}

const SearcherWrapper = () => {
	const {
		searcher: { error },
		setSearchTerm,
		search,
	} = useDownloadHelper();

	const searchTermRef = useRef("");
	const searchTerm = searchTermRef.current;

	useEffect(() => {
		if (!searchTerm || searchTerm.length < 10) return;

		const searchTimeout = setTimeout(async () => await search(searchTerm), 400);

		return () => clearTimeout(searchTimeout);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [searchTerm]);

	return (
		<SearchWrapper>
			<Searcher>
				<SearchIcon size="1.2em" />
				<input
					placeholder="Paste Youtube url here!"
					onChange={setSearchTerm}
					autoCapitalize="off"
					value={searchTerm}
					spellCheck="false"
					autoCorrect="off"
					type="text"
				/>
			</Searcher>

			{error && <p>{error}</p>}
		</SearchWrapper>
	);
};

const IsLoading = () => {
	const {
		searcher: { isLoading },
	} = useDownloadHelper();

	return (
		<div
			style={{
				transform: "scale(0.3)",
				position: "relative",
				marginLeft: "1rem",
			}}
		>
			{isLoading && <Loading />}
		</div>
	);
};

const { getState: getDownloadHelper } = useDownloadHelper;
const makeDownload = () =>
	getDownloadHelper().download(getDownloadHelper().searcher.searchTerm);

const Result = () => {
	const {
		searcher: { result },
	} = useDownloadHelper();

	return result ? (
		<ResultContainer>
			<img src={result.imageURL} alt="thumbnail" />

			<p>{result.title}</p>

			<Button onClick={makeDownload}>Download</Button>
		</ResultContainer>
	) : null;
};

Download.whyDidYouRender = {
	logOnDifferentValues: true,
	customName: "Download",
};
