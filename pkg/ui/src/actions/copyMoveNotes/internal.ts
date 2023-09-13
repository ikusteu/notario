import { type Readable, writable, derived, get } from "svelte/store";

export type NoteMap = Map<string, Set<string>>;

export interface InternalParams {
	noteMap?: NoteMap;
	copy?: (from: string, to: string, notes: string[]) => Promise<void>;
	move?: (from: string, to: string, notes: string[]) => Promise<void>;
}

interface UpdateNoteMap {
	(iterable: Iterable<[string, Iterable<string>]>): void;
}

export interface CopyMoveInternal {
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

export const createCopyMoveInternal = ({ noteMap, copy = async () => {}, move = async () => {} }: InternalParams): CopyMoveInternal => {
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

	const handleCancel = (e: KeyboardEvent) => e.key === "Escape" && reset();
	active.subscribe((a) => (a ? window.addEventListener("keydown", handleCancel) : window.removeEventListener("keydown", handleCancel)));

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

	const toggleSelected = (id: string) => {
		console.log("Toggle");
		return clipboard.update((c) => (c.has(id) ? c.delete(id) : c.add(id), c));
	};
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
