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

	const Ref2Url2Search = useRef("");
	const url2Search = Ref2Url2Search.current;

	useEffect(() => {
		if (!url2Search || url2Search.length < 10) return;

		const searchTimeout = setTimeout(async () => await search(url2Search), 300);

		return () => clearTimeout(searchTimeout);
	}, [search, url2Search]);

	return (
		<SearchWrapper>
			<Searcher>
				<SearchIcon size="1.2em" />
				<input
					placeholder="Paste Youtube url here"
					onChange={setSearchTerm}
					autoCapitalize="off"
					value={url2Search}
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
const startDownload = () =>
	getDownloadHelper().download(getDownloadHelper().searcher.searchTerm);

const Result = () => {
	const { result } = useDownloadHelper().searcher;

	return result ? (
		<ResultContainer>
			<img src={result.imageURL} alt="thumbnail" />

			<p>{result.title}</p>

			<Button onClick={startDownload}>Download</Button>
		</ResultContainer>
	) : null;
};
