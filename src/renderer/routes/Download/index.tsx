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
			<>
				<SearcherWrapper />
				<IsLoading />
			</>

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

	const urlToSearchForRef = useRef("");
	const urlToSearchFor = urlToSearchForRef.current;

	useEffect(() => {
		if (!urlToSearchFor || urlToSearchFor.length < 10) return;

		const searchTimeout = setTimeout(
			async () => await search(urlToSearchFor),
			400,
		);

		return () => clearTimeout(searchTimeout);
	}, [search, urlToSearchFor]);

	return (
		<SearchWrapper>
			<Searcher>
				<SearchIcon size="1.2em" />
				<input
					placeholder="Paste Youtube url here"
					onChange={setSearchTerm}
					value={urlToSearchFor}
					autoCapitalize="off"
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
	const { isLoading } = useDownloadHelper().searcher;

	return <div>{isLoading && <Loading />}</div>;
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
