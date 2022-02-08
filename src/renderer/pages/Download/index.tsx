import { AiOutlineSearch as SearchIcon } from "react-icons/ai";
import { useEffect } from "react";

import { useDownloadHelper } from "./helpers";

import { Wrapper, SearchWrapper, Searcher, Result, Button } from "./styles";
import { Loading } from "@styles/appStyles";

export function Download() {
	const { searcher, setSearchTerm, download, search } = useDownloadHelper();

	useEffect(() => {
		if (!searcher.searchTerm || searcher.searchTerm.length < 10) return;

		const searchTimeout = setTimeout(
			async () => await search(searcher.searchTerm),
			400,
		);

		return () => clearTimeout(searchTimeout);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [searcher.searchTerm]);

	return (
		<Wrapper>
			<SearchWrapper>
				<Searcher>
					<SearchIcon size="1.2em" />
					<input
						placeholder="Paste Youtube url here!"
						value={searcher.searchTerm}
						onChange={setSearchTerm}
						autoCapitalize="off"
						spellCheck="false"
						autoCorrect="off"
						type="text"
					/>
				</Searcher>

				{searcher.error && <p>{searcher.error}</p>}

				<div
					style={{
						transform: "scale(0.3)",
						position: "relative",
						marginLeft: "1rem",
					}}
				>
					{searcher.isLoading && <Loading />}
				</div>
			</SearchWrapper>

			{searcher.result && (
				<Result>
					<img src={searcher.result.imageURL} alt="thumbnail" />

					<p>{searcher.result.title}</p>

					<Button onClick={() => download(searcher.searchTerm)}>
						Download
					</Button>
				</Result>
			)}
		</Wrapper>
	);
}

Download.whyDidYouRender = {
	logOnDifferentValues: false,
	customName: "Download",
};
