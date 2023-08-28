import PouchDB from "pouchdb";
import { Observable } from "rxjs";
import { v4 as uuid } from "uuid";

import { CouchDocument, NotarioDocument } from "./types";

import { DatabaseInterface } from "./index";
import { DocumentNode } from "./document_node";
import { SectionInterface } from "./section";

import { processId } from "./utils";

export type SubsectionData = NotarioDocument<
	"subsection",
	{
		name: string;
		notes: string[];
	}
>;

export interface SubsectionInterface {
	id(): string;
	create(): Promise<SubsectionInterface>;
	get(): Promise<CouchDocument<SubsectionData> | undefined>;
	setName(name: string): Promise<SubsectionInterface>;
	setNotes(notes: string[]): Promise<SubsectionInterface>;
	addNote(note: string): Promise<SubsectionInterface>;
	stream(): {
		doc(): Observable<CouchDocument<SubsectionData>>;
	};
}

const subsectionZeroValues: Required<SubsectionData> = {
	docType: "subsection",
	name: "",
	notes: []
};

class Subsection implements SubsectionInterface {
	#db: DatabaseInterface;
	#section: SectionInterface;

	#internal: DocumentNode<SubsectionData>;

	constructor(db: DatabaseInterface, section: SectionInterface, id?: string) {
		this.#db = db;
		this.#section = section;
		const _id = processId(`${section.id()}/subsections`, id || uuid());
		this.#internal = new DocumentNode<SubsectionData>(this.#db._pouch, _id, subsectionZeroValues);
	}

	id() {
		return this.#internal._id;
	}

	async create() {
		// Create a section (if it doesn't exist) and add this subsection to it
		await this.#section.create();
		await this.#section.addSubsection(this.id());

		await this.#internal.create();
		return this;
	}

	get() {
		return this.#internal.get();
	}

	async setName(name: string) {
		await this.#internal.update((data) => ({ ...data, name }));
		return this;
	}

	async setNotes(notes: string[]) {
		await this.#internal.update((data) => ({ ...data, notes }));
		return this;
	}

	async addNote(note: string) {
		await this.#internal.update((data) => ({ ...data, notes: [...new Set(data.notes).add(note)] }));
		return this;
	}

	stream() {
		return {
			doc: () => this.#internal.stream()
		};
	}
}

export const newSubsectionInterface = (db: DatabaseInterface, section: SectionInterface, id?: string): SubsectionInterface =>
	new Subsection(db, section, id);
