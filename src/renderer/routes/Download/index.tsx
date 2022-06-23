import { AiOutlineSearch as SearchIcon } from "react-icons/ai";
import { useEffect } from "react";

import { useSearchInfo, downloadMedia, search, setSearchInfo } from "./helpers";
import { Button } from "@components/Button";
import { Header } from "@components/Header";

import { Loading } from "@styles/appStyles";
import {
	ResultContainer,
	LoadingWrapper,
	SearchWrapper,
	GridWrapper,
	Searcher,
} from "./styles";

export const Download = () => (
	<GridWrapper>
		<Header>
			<SearcherWrapper />
			<IsLoading />
		</Header>

		<Result />
	</GridWrapper>
);

function SearcherWrapper() {
	const { error, url } = useSearchInfo();

	useEffect(() => {
		const searchTimeout = setTimeout(async () => await search(url), 300);

		return () => clearTimeout(searchTimeout);
	}, [url]);

	return (
		<SearchWrapper>
			<Searcher>
				<SearchIcon size={18} />

				<label className={url ? "active" : ""} htmlFor="search-url">
					Paste Youtube url here
				</label>
				<input
					onChange={e => setSearchInfo({ url: e.target.value })}
					autoCapitalize="off"
					spellCheck="false"
					autoCorrect="off"
					id="search-url"
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

				<Button variant="large" onClick={downloadMedia}>Download</Button>
			</ResultContainer>
		) :
		null;
}
