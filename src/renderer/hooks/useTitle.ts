export const useTitle = (title: string): void =>
	(document.title = title) as unknown as void;
