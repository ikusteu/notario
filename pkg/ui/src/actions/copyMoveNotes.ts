import type { ChangeEventHandler } from "svelte/elements";
import { derived, get, writable, type Readable } from "svelte/store";

type Stores = Readable<any> | [Readable<any>, ...Array<Readable<any>>] | Array<Readable<any>>;
type StoresValues<T> = T extends Readable<infer U>
	? U
	: {
			[K in keyof T]: T[K] extends Readable<infer U> ? U : never;
	  };

type NoteMap = Map<string, Set<string>>;

interface Params {
	noteMap?: NoteMap;
	copy?: (from: string, to: string, notes: string[]) => Promise<void>;
	move?: (from: string, to: string, notes: string[]) => Promise<void>;
}

interface UpdateNoteMap {
	(iterable: Iterable<[string, Iterable<string>]>): void;
}

interface CopyMoveInternal {
	sections: Readable<string[]>;
	updateSections(sections: Iterable<string>): void;
	updateElementMap: UpdateNoteMap;

	initCopy(from: string, to: string): void;
	initMove(from: string, to: string): void;

	reset(): void;
	commit(): Promise<void>;

	toggleSelected(id: string): void;
	removeSelected(id: string): void;

	active: Readable<boolean>;
	src: Readable<string>;
	dest: Readable<string>;
	destIncludes: Readable<(id: string) => boolean>;
	clipboardIncludes: Readable<(id: string) => boolean>;
}

const createCopyMoveInternal = ({ noteMap, copy = async () => {}, move = async () => {} }: Params): CopyMoveInternal => {
	const sections = writable([...noteMap.keys()]);
	const updateSections = (s: Iterable<string>) => sections.set([...s]);

	const noteMapStore = writable(noteMap);
	const updateElementMap: UpdateNoteMap = (iterable) =>
		noteMapStore.set(
			new Map<string, Set<string>>(
				(function* () {
					for (let [k, v] of iterable) {
						yield [k, new Set<string>(v)];
					}
				})()
			)
		);

	const mode = writable<"idle" | "copy" | "move">("idle");
	const active = derived(mode, (m) => m !== "idle");
	const resetMode = () => mode.set("idle");

	const src = writable<string>("");
	const dest = writable<string>("");

	const destIncludes = derived(
		[noteMapStore, dest],
		([nms, ct]) =>
			(id: string) =>
				ct && nms.get(ct)?.has(id)
	);

	const clipboard = writable(new Set<string>());
	const resetClipboard = () => clipboard.set(new Set());
	const clipboardIncludes = derived(clipboard, (c) => (id: string) => c.has(id));

	const setCopyMove = (from: string, to: string) => (src.set(from), dest.set(to));
	const initCopy = (from: string, to: string) => (setCopyMove(from, to), mode.set("copy"));
	const initMove = (from: string, to: string) => (setCopyMove(from, to), mode.set("move"));

	const reset = () => (setCopyMove("", ""), resetClipboard(), resetMode());
	const commit = async () => {
		const from = get(src);
		const to = get(dest);
		const notes = [...get(clipboard)];

		switch (get(mode)) {
			case "copy":
				await copy(from, to, notes);
			case "move":
				await move(from, to, notes);
			default:
				break;
		}

		reset();
	};

	const toggleSelected = (id: string) => clipboard.update((c) => (c.has(id) ? c.delete(id) : c.add(id), c));
	const removeSelected = (id: string) => clipboard.update((c) => (c.delete(id), c));

	return {
		sections,
		updateSections,
		updateElementMap,

		initCopy,
		initMove,

		reset,
		commit,

		toggleSelected,
		removeSelected,

		active,
		src,
		dest,
		destIncludes,
		clipboardIncludes
	};
};

// #region action-elements
interface DestinationPickerActionParams {
	setOptions: (sections: string[]) => void;
}
export interface DestinationPickerAction {
	(node: HTMLSelectElement, from: string, params: DestinationPickerActionParams): { destroy: () => void };
}
export interface ResetButtonAction {
	(node: HTMLButtonElement): { destroy: () => void };
}
export interface InitButtonAction {
	(node: HTMLButtonElement, from: string): { destroy: () => void };
}

const createActionElementActions = (internal: CopyMoveInternal) => {
	const getSectionsOptions = (id: string) => get(internal.sections).filter((s) => s != id);

	const fromToMap = writable(new Map<string, string>());
	internal.sections.subscribe((sections) =>
		fromToMap.update((m) => new Map(sections.map((s) => [s, m.get(s) || getSectionsOptions(s)[0]])))
	);

	const updateFromTo = (from: string, to: string) => fromToMap.update((m) => m.set(from, to));
	const getFromTo = (from: string) => get(fromToMap).get(from);

	const destinationPicker: DestinationPickerAction = (node, from, { setOptions = () => {} }) =>
		composeDestroy(
			applyDestroyListeners(node)(change((e) => updateFromTo(from, e.currentTarget.value))),
			internal.sections.subscribe(() => setOptions(getSectionsOptions(from)))
		);

	const resetButton: ResetButtonAction = (node: HTMLButtonElement) => composeDestroy(applyDestroyListeners(node)(click(internal.reset)));

	const initCopyButton: InitButtonAction = (node: HTMLButtonElement, from: string) =>
		composeDestroy(applyDestroyListeners(node)(click(() => internal.initCopy(from, getFromTo(from)))));

	const initMoveButton: InitButtonAction = (node: HTMLButtonElement, from: string) =>
		composeDestroy(applyDestroyListeners(node)(click(() => internal.initMove(from, getFromTo(from)))));

	return {
		destinationPicker,
		resetButton,
		initCopyButton,
		initMoveButton
	};
};
// #endregion action-elements

// #region style-elements
interface ContainerActionParams {
	highlightable: boolean;
	highlight?: (v: boolean) => void;
	disable?: (v: boolean) => void;
}

export interface ContainerAction {
	(node: HTMLElement, sectionId: string, params: ContainerActionParams): { destroy: () => void };
}

const createContainerAction =
	(internal: CopyMoveInternal): ContainerAction =>
	(_, sectionId, { highlightable = false, highlight, disable }) =>
		composeDestroy(
			// Highlight
			subscribeCondition([internal.dest, internal.active], ([dest, active]) => highlightable && active && dest === sectionId, highlight),
			// Disable
			subscribeCondition(
				[internal.src, internal.dest, internal.active],
				([src, dest, active]) => active && src !== sectionId && !(dest === sectionId && highlightable),
				disable
			)
		);

interface EntryActionParams {
	select?: (v: boolean) => void;
	highlight?: (v: boolean) => void;
	disable?: (v: boolean) => void;
}

export interface EntryAction {
	(node: HTMLElement, sectionId: string, id: string, params: EntryActionParams): { destroy: () => void };
}
export interface RemoveEntryButtonAction {
	(node: HTMLButtonElement, id: string): { destroy: () => void };
}

const createnEntryActions = (internal: CopyMoveInternal) => {
	const entry: EntryAction = (node, sectionId, id, { select, highlight, disable }) =>
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
				([src, dest, destIncludes]) => ![src, dest].includes(sectionId) || destIncludes(id),
				disable
			),
			applyDestroyListeners(node)(
				applyIf(
					[internal.src, internal.destIncludes],
					([src, destIncludes]) => src === sectionId && destIncludes(id),
					click(() => internal.toggleSelected(id))
				)
			)
		);

	const removeEntryButton: RemoveEntryButtonAction = (node, id) =>
		composeDestroy(applyDestroyListeners(node)(click(() => internal.removeSelected(id))));

	return { entry, removeEntryButton };
};
// #region style-elements

// #region helpers
const composeDestroy = (...callbacks: (() => void)[]) => ({
	destroy: callbacks.reduce(
		(acc, cb) => () => (acc(), cb()),
		() => {}
	)
});

const applyDestroyListeners =
	<N extends HTMLElement>(node: N) =>
	(...listeners: Array<(node: N) => () => void>) =>
		listeners.reduce(
			(acc, l) => {
				const listener = l(node);
				return () => (acc(), listener());
			},
			() => {}
		);

const click = (handler: () => void) => (node: HTMLElement) => {
	node.addEventListener("click", handler);
	return () => node.removeEventListener("click", handler);
};

const change =
	<N extends HTMLElement>(handler: ChangeEventHandler<N>) =>
	(node: N) => {
		node.addEventListener("change", handler);
		return () => node.removeEventListener("change", handler);
	};

const subscribeCondition = <S extends Stores>(
	stores: S,
	condition: (values: StoresValues<S>) => boolean,
	callback: ((v: boolean) => void) | undefined
) => derived(stores, condition).subscribe((c) => callback?.(c));

const applyIf =
	<S extends Stores, N extends HTMLElement>(
		stores: S,
		condition: (values: StoresValues<S>) => boolean,
		registerEventListener: (node: N) => void
	) =>
	(node: N) => {
		const unregister = () => registerEventListener(node);
		const unsubscribe = derived(stores, condition).subscribe((c) => (c ? registerEventListener(node) : unregister()));

		return () => {
			unregister();
			unsubscribe();
		};
	};
// #endregion helpers

interface MoveCopyActions {
	destinationPicker: DestinationPickerAction;
	resetButton: ResetButtonAction;
	initCopyButton: InitButtonAction;
	initMoveButton: InitButtonAction;
	container: ContainerAction;
	entry: EntryAction;
	removeEntryButton: RemoveEntryButtonAction;
}

type MoveCopyStore = Pick<CopyMoveInternal, "updateElementMap" | "updateSections"> & MoveCopyActions;

export const moveCopyStore = (params: Params): MoveCopyStore => {
	const internal = createCopyMoveInternal(params);

	return {
		updateSections: internal.updateSections,
		updateElementMap: internal.updateElementMap,
		...createActionElementActions(internal),
		container: createContainerAction(internal),
		...createnEntryActions(internal)
	};
};
