import { AiOutlineSearch as SearchIcon } from "react-icons/ai";
import { useEffect, useState } from "react";

import {
	getDownloadHelper,
	useDownloadHelper,
	download,
	search,
} from "./helpers";

import { BorderedButton } from "@routes/Convert/styles";
import { Loading } from "@styles/appStyles";
import {
	ResultContainer,
	SearchWrapper,
	Searcher,
	Wrapper,
	Box,
} from "./styles";

export const Download = () => (
	<Wrapper>
		<Box>
			<SearcherWrapper />
			<IsLoading />
		</Box>

		<Result />
	</Wrapper>
);

const SearcherWrapper = () => {
	const { error } = useDownloadHelper().searcher;
	const [url, setUrl] = useState("");

	useEffect(() => {
		if (!url || url.length < 10) return;

		const searchTimeout = setTimeout(async () => await search(url), 400);

		return () => clearTimeout(searchTimeout);
	}, [url]);

	return (
		<SearchWrapper>
			<Searcher>
				<SearchIcon size="1.2rem" />

				<input
					onChange={e => setUrl(e.target.value)}
					placeholder="Paste Youtube url here"
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

	return (
		<div style={{ width: 25, height: 25, marginLeft: 10 }}>
			{isLoading && <Loading />}
		</div>
	);
};

const startDownload = () => download(getDownloadHelper().searcher.searchTerm);

const Result = () => {
	const { result } = useDownloadHelper().searcher;

	return result ? (
		<ResultContainer>
			<img src={result.imageURL} alt="thumbnail" />

			<p>{result.title}</p>

			<BorderedButton onClick={startDownload}>Download</BorderedButton>
		</ResultContainer>
	) : null;
};
