import { Observable } from "rxjs";
import { v4 as uuid } from "uuid";

import { CouchDocument, NotarioDocument } from "./types";

import { DocumentNode } from "./document_node";
import { Note, NoteInterface } from "./note";

import { processId } from "./utils";
import { DatabaseInterface } from ".";

export type ResourceData = NotarioDocument<
	"resource",
	{
		name: string;
		year: number;
		authors: string[];
		path: string;
	}
>;

export interface ResourceInterface {
	id(): string;
	create(): Promise<ResourceInterface>;
	get(): Promise<CouchDocument<ResourceData> | undefined>;
	setPath(path: string): Promise<ResourceInterface>;
	setAuthors(authors: string[]): Promise<ResourceInterface>;
	setYear(year: number): Promise<ResourceInterface>;
	note(id?: string): NoteInterface;
	stream(): {
		doc(): Observable<CouchDocument<ResourceData>>;
	};
}

const resourceZeroValues: Required<ResourceData> = {
	name: "",
	docType: "resource",
	year: 0,
	authors: [],
	path: ""
};

export class Resource implements ResourceInterface {
	#internal: DocumentNode<ResourceData>;
	#db: PouchDB.Database;

	constructor(db: PouchDB.Database, id?: string) {
		const _id = processId("resources", id || uuid());
		this.#db = db;
		this.#internal = new DocumentNode<ResourceData>(this.#db, _id, resourceZeroValues);
	}

	id() {
		return this.#internal._id;
	}

	async create(): Promise<ResourceInterface> {
		await this.#internal.create();
		return this;
	}

	get() {
		return this.#internal.get();
	}

	async setPath(path: string) {
		await this.#internal.update((data) => ({ ...data, path }));
		return this;
	}

	async setAuthors(authors: string[]) {
		await this.#internal.update((data) => ({ ...data, authors }));
		return this;
	}

	async setYear(year: number) {
		await this.#internal.update((data) => ({ ...data, year }));
		return this;
	}

	note(id?: string) {
		return new Note(this.#db, this, id);
	}

	stream() {
		return {
			doc: () => this.#internal.stream()
		};
	}
}

export const newResourceInterface = (db: DatabaseInterface, id?: string) => new Resource(db._pouch, id);
