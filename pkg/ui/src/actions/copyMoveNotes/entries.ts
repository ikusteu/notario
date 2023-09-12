import type { CopyMoveInternal } from "./internal";

import { composeDestroy, subscribeCondition, applyDestroyListeners, applyIf, click } from "../utils";

interface EntryActionParams {
	sectionId: string;
	id: string;
	select?: (v: boolean) => void;
	highlight?: (v: boolean) => void;
	disable?: (v: boolean) => void;
	interactive?: (v: boolean) => void;
}

export interface EntryAction {
	(node?: HTMLElement, params?: EntryActionParams): { destroy: () => void };
}
export interface RemoveEntryButtonAction {
	(node?: HTMLButtonElement, id?: string): { destroy: () => void };
}

export const createnEntryActions = (internal: CopyMoveInternal) => {
	const entry: EntryAction = (node, { id, sectionId, select, highlight, disable, interactive } = { id: "", sectionId: "" }) =>
		composeDestroy(
			// Select
			subscribeCondition(
				[internal.src, internal.clipboardIncludes],
				([src, clipboardIncludes]) => sectionId === src && clipboardIncludes(id),
				select
			),
			// Highlight
			subscribeCondition(
				[internal.dest, internal.clipboardIncludes],
				([dest, clipboardIncludes]) => sectionId === dest && clipboardIncludes(id),
				highlight
			),
			// Disable
			subscribeCondition(
				[internal.src, internal.dest, internal.destIncludes],
				([src, dest, destIncludes]) => [src, dest].includes(sectionId) && destIncludes(id),
				disable
			),
			// Interactive
			subscribeCondition(
				[internal.src, internal.destIncludes],
				([src, destIncludes]) => src === sectionId && !destIncludes(id),
				interactive
			),
			applyDestroyListeners(node)(
				applyIf(
					[internal.src, internal.destIncludes],
					([src, destIncludes]) => src === sectionId && !destIncludes(id),
					click(() => {
						console.log("Click", id);
						internal.toggleSelected(id);
					}, id)
				)
			)
		);

	const removeEntryButton: RemoveEntryButtonAction = (node, id = "") =>
		composeDestroy(applyDestroyListeners(node)(click(() => internal.removeSelected(id))));

	return { entry, removeEntryButton };
};
