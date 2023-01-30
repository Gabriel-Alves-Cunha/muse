import { SearcherWrapper } from "./SearcherWrapper";
import { useSearchInfo } from "./helpers";
import { MainArea } from "@components/MainArea";
import { Loading } from "@components/Loading";
import { Header } from "@components/Header";
import { Result } from "./Result";

////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////
// Main function:

export default function Download() {
	return (
		<MainArea>
			<Header>
				<SearcherWrapper />

				<IsLoading />
			</Header>

			<Result />
		</MainArea>
	);
}

////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////
// Helper functions:

const isLoadingSelector = (state: ReturnType<typeof useSearchInfo.getState>) =>
	state.isLoading;

function IsLoading() {
	const isLoading = useSearchInfo(isLoadingSelector);

	return <div className="w-6 h-6 ml-3">{isLoading && <Loading />}</div>;
}
