import { selectIsSearching, useSearchInfo } from "./helpers";
import { SearcherWrapper } from "./SearcherWrapper";
import { MainArea } from "@components/MainArea";
import { Loading } from "@components/Loading";
import { Header } from "@components/Header";
import { Result } from "./Result";

////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////
// Main function:

export const Download = (): JSX.Element => (
	<MainArea>
		<Header>
			<SearcherWrapper />

			<IsLoading />
		</Header>

		<Result />
	</MainArea>
);

////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////
// Helper functions:

function IsLoading(): JSX.Element {
	const isLoading = useSearchInfo(selectIsSearching);

	return <div className="w-6 h-6 ml-3">{isLoading && <Loading />}</div>;
}
