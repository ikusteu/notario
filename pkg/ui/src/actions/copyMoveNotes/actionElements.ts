import { type Writable, writable, get } from "svelte/store";

import type { CopyMoveInternal } from "./internal";

import { composeDestroy, applyDestroyListeners, click, change } from "../utils";

export interface DestinationPickerAction {
	(node?: HTMLSelectElement, from?: string): { destroy: () => void };
}
export interface InitButtonAction {
	(node?: HTMLButtonElement, from?: string): { destroy: () => void };
}
export interface ButtonAction {
	(node?: HTMLButtonElement): { destroy: () => void };
}

export const createActionElementActions = (internal: CopyMoveInternal) => {
	const getSectionsOptions = (id: string) => get(internal.sections).filter((s) => s != id);

	const fromToMap = writable(new Map<string, string>());
	internal.sections.subscribe((sections) =>
		fromToMap.update((m) => new Map(sections.map((s) => [s, m.get(s) || getSectionsOptions(s)[0]])))
	);

	const updateFromTo = (from: string, to: string) => fromToMap.update((m) => m.set(from, to));
	const getFromTo = (from: string) => get(fromToMap).get(from);

	const destinationPicker: DestinationPickerAction = (node, from = "") =>
		composeDestroy(applyDestroyListeners(node)(change((e) => updateFromTo(from, e.currentTarget.value))));

	const resetButton: ButtonAction = (node: HTMLButtonElement) => composeDestroy(applyDestroyListeners(node)(click(internal.reset)));
	const commitButton: ButtonAction = (node: HTMLButtonElement) => composeDestroy(applyDestroyListeners(node)(click(internal.commit)));

	const initCopyButton: InitButtonAction = (node, from = "") =>
		composeDestroy(applyDestroyListeners(node)(click(() => internal.initCopy(from, getFromTo(from)))));

	const initMoveButton: InitButtonAction = (node, from = "") =>
		composeDestroy(applyDestroyListeners(node)(click(() => internal.initMove(from, getFromTo(from)))));

	return {
		destinationPicker,
		initCopyButton,
		initMoveButton,
		resetButton,
		commitButton
	};
};
