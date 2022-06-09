import { AiOutlineSearch as SearchIcon } from "react-icons/ai";
import { useEffect } from "react";

import { useSearchInfo, downloadMedia, search, setSearchInfo } from "./helpers";

import { BorderedButton } from "../Convert/styles";
import { Loading } from "@styles/appStyles";
import {
	ResultContainer,
	LoadingWrapper,
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

function SearcherWrapper() {
	const { error, url } = useSearchInfo();

	useEffect(() => {
		const searchTimeout = setTimeout(async () => await search(), 400);

		return () => clearTimeout(searchTimeout);
	}, [url]);

	return (
		<SearchWrapper>
			<Searcher>
				<SearchIcon size="1.2rem" />

				<input
					onChange={e => setSearchInfo({ url: e.target.value })}
					placeholder="Paste Youtube url here"
					autoCapitalize="off"
					spellCheck="false"
					autoCorrect="off"
					value={url}
					type="text"
				/>
			</Searcher>

			<p>{error}</p>
		</SearchWrapper>
	);
}

function IsLoading() {
	const { isLoading } = useSearchInfo();

	return <LoadingWrapper>{isLoading && <Loading />}</LoadingWrapper>;
}

function Result() {
	const { result } = useSearchInfo();

	return result ?
		(
			<ResultContainer>
				<img src={result.imageURL} alt="Video thumbnail" />

				<p>{result.title}</p>

				<BorderedButton onClick={downloadMedia}>Download</BorderedButton>
			</ResultContainer>
		) :
		null;
}
