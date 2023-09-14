import { createCopyMoveInternal, type CopyMoveInternal, type InternalParams } from "./internal";
import { createActionElementActions, type ButtonAction, type DestinationPickerAction, type InitAction } from "./actionElements";
import { createnEntryActions, type EntryAction, type RemoveEntryButtonAction } from "./entries";

export { ButtonAction, DestinationPickerAction, InitAction, EntryAction, RemoveEntryButtonAction };

interface CopyMoveActions {
	destinationPicker: DestinationPickerAction;
	resetButton: ButtonAction;
	commitButton: ButtonAction;
	initCopyButton: InitAction;
	initMoveButton: InitAction;
	entry: EntryAction;
	removeEntryButton: RemoveEntryButtonAction;
}

type CopyMoveStore = Pick<CopyMoveInternal, "updateElementMap" | "updateSections" | "active" | "src" | "dest" | "clipboard"> &
	CopyMoveActions;

export const copyMoveStore = (params: InternalParams): CopyMoveStore => {
	const internal = createCopyMoveInternal(params);

	return {
		updateSections: internal.updateSections,
		updateElementMap: internal.updateElementMap,
		active: internal.active,
		src: internal.src,
		dest: internal.dest,
		clipboard: internal.clipboard,
		...createActionElementActions(internal),
		...createnEntryActions(internal)
	};
};
