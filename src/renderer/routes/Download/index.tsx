import { SearcherWrapper } from "./SearcherWrapper";
import { useTranslation } from "@i18n";
import { useSearchInfo } from "./helpers";
import { useTitle } from "@hooks/useTitle";
import { MainArea } from "@components/MainArea";
import { Loading } from "@components/Loading";
import { Header } from "@components/Header";
import { Result } from "./Result";

////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////
// Main function:

export default function Download() {
	const { t } = useTranslation();

	useTitle(t("titles.download"));

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
// Helper functions:

const isLoadingSelector = (state: ReturnType<typeof useSearchInfo.getState>) =>
	state.isLoading;

function IsLoading() {
	const isLoading = useSearchInfo(isLoadingSelector);

	return <div className="w-6 h-6 ml-3">{isLoading && <Loading />}</div>;
}
