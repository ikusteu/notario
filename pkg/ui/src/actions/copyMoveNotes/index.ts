import { createCopyMoveInternal, type CopyMoveInternal, type InternalParams } from "./internal";
import { createActionElementActions, type ButtonAction, type DestinationPickerAction, type InitButtonAction } from "./actionElements";
import { createnEntryActions, type EntryAction, type RemoveEntryButtonAction } from "./entries";

export { ButtonAction, DestinationPickerAction, InitButtonAction, EntryAction, RemoveEntryButtonAction };

interface CopyMoveActions {
	destinationPicker: DestinationPickerAction;
	resetButton: ButtonAction;
	commitButton: ButtonAction;
	initCopyButton: InitButtonAction;
	initMoveButton: InitButtonAction;
	entry: EntryAction;
	removeEntryButton: RemoveEntryButtonAction;
}

type CopyMoveStore = Pick<CopyMoveInternal, "updateElementMap" | "updateSections" | "active" | "src" | "dest"> & CopyMoveActions;

export const copyMoveStore = (params: InternalParams): CopyMoveStore => {
	const internal = createCopyMoveInternal(params);

	return {
		updateSections: internal.updateSections,
		updateElementMap: internal.updateElementMap,
		active: internal.active,
		src: internal.src,
		dest: internal.dest,
		...createActionElementActions(internal),
		...createnEntryActions(internal)
	};
};
