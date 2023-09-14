/* eslint-disable @typescript-eslint/no-empty-function */
import { type Readable, writable, derived, get } from "svelte/store";
import { browser } from "$app/environment";

export type NoteMap = Map<string, Set<string>>;

export interface InternalParams {
	copy?: (from: string, to: string, notes: string[]) => Promise<void>;
	move?: (from: string, to: string, notes: string[]) => Promise<void>;
}

interface UpdateElementMap {
	(iterable: Iterable<[string, Iterable<string>]>): void;
}

export interface CopyMoveInternal {
	sections: Readable<string[]>;
	updateSections(sections: Iterable<string>): void;
	updateElementMap: UpdateElementMap;

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
	clipboard: Readable<Set<string>>;
}

export const createCopyMoveInternal = ({ copy = async () => {}, move = async () => {} }: InternalParams): CopyMoveInternal => {
	const elementMapStore = writable(new Map<string, Set<string>>());
	const updateElementMap: UpdateElementMap = (iterable) =>
		elementMapStore.set(
			new Map<string, Set<string>>(
				(function* () {
					for (const [k, v] of iterable) {
						yield [k, new Set<string>(v)];
					}
				})()
			)
		);

	const sections = writable([]);
	const updateSections = (s: Iterable<string>) => sections.set([...s]);
	elementMapStore.subscribe((em) => updateSections(em.keys()));

	const mode = writable<"idle" | "copy" | "move">("idle");
	const active = derived(mode, (m) => m !== "idle");
	const resetMode = () => mode.set("idle");

	const handleCancel = (e: KeyboardEvent) => e.key === "Escape" && reset();
	active.subscribe(
		(a) => browser && (a ? window.addEventListener("keydown", handleCancel) : window.removeEventListener("keydown", handleCancel))
	);

	const src = writable<string>("");
	const dest = writable<string>("");

	const destIncludes = derived(
		[elementMapStore, dest],
		([ems, ct]) =>
			(id: string) =>
				ct && ems.get(ct)?.has(id)
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
				break;
			case "move":
				await move(from, to, notes);
				break;
			default:
				break;
		}

		reset();
	};

	const toggleSelected = (id: string) => {
		return clipboard.update((c) => (c.has(id) ? c.delete(id) : c.add(id), c));
	};
	const removeSelected = (id: string) => clipboard.update((c) => (c.delete(id), c));

	return {
		sections,
		updateElementMap,
		updateSections,

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
		clipboardIncludes,
		clipboard
	};
};
