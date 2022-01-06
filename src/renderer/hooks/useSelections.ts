import { useState, useMemo } from "react";

export function useSelections<T>(
	items: readonly T[],
	defaultSelected: readonly T[] = [],
) {
	const [selected, setSelected] = useState<readonly T[]>(defaultSelected);

	const setOfSelected = useMemo(() => new Set<T>(selected), [selected]);

	const singleActions = useMemo(() => {
		const isSelected = (item: T) => setOfSelected.has(item);

		const select = (item: T) => {
			setOfSelected.add(item);
			setSelected(Array.from(setOfSelected));
		};

		const unselect = (item: T) => {
			setOfSelected.delete(item);
			setSelected(Array.from(setOfSelected));
		};

		const toggle = (item: T) =>
			isSelected(item) ? unselect(item) : select(item);

		return { isSelected, select, unselect, toggle };
	}, [setOfSelected]);

	const allActions = useMemo(() => {
		const selectAll = () => {
			items.forEach(item => setOfSelected.add(item));
			setSelected(Array.from(setOfSelected));
		};

		const unselectAll = () => {
			items.forEach(item => setOfSelected.delete(item));
			setSelected(Array.from(setOfSelected));
		};

		const isNoneSelected = items.every(item => !setOfSelected.has(item));

		const isAllSelected =
			items.every(item => setOfSelected.has(item)) && !isNoneSelected;

		const isPartiallySelected = !isNoneSelected && !isAllSelected;

		const toggleAll = () => (isAllSelected ? unselectAll() : selectAll());

		return {
			isPartiallySelected,
			isNoneSelected,
			isAllSelected,
			unselectAll,
			selectAll,
			toggleAll,
		};
	}, [setOfSelected, items]);

	return {
		selected,
		setSelected,
		...singleActions,
		...allActions,
	} as const;
}
