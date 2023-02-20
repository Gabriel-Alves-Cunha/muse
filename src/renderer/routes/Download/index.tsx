import { useSnapshot } from "valtio";

import { SearcherWrapper } from "./SearcherWrapper";
import { searchInfo } from "./helpers";
import { MainArea } from "@components/MainArea";
import { Loading } from "@components/Loading";
import { Header } from "@components/Header";
import { Result } from "./Result";

////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////
// Main function:

export const Download = () => (
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

function IsLoading() {
	const searchInfoAccessor = useSnapshot(searchInfo);

	return (
		<div className="w-6 h-6 ml-3">
			{searchInfoAccessor.isLoading && <Loading />}
		</div>
	);
}
