import { v4 as uuid } from "uuid";

import { CouchDocument, NotarioDocument } from "./types";

import { DocumentNode } from "./document_node";
import { ResourceInterface } from "./resource";

import { processId } from "./utils";

export type NoteData = NotarioDocument<
	"note",
	{
		content: string;
	}
>;

export interface NoteInterface {
	id(): string;
	create(): Promise<NoteInterface>;
	get(): Promise<CouchDocument<NoteData> | undefined>;
	setContent(content: string): Promise<NoteInterface>;
}

export class Note implements NoteInterface {
	#db: PouchDB.Database;
	#resource: ResourceInterface;

	#internal: DocumentNode<NoteData>;

	constructor(db: PouchDB.Database, resource: ResourceInterface, id?: string) {
		this.#db = db;
		this.#resource = resource;
		const _id = processId(`${resource.id()}/notes`, id || uuid());
		this.#internal = new DocumentNode<NoteData>(db, _id, { docType: "note", content: "" });
	}

	id() {
		return this.#internal._id;
	}

	async create(): Promise<NoteInterface> {
		// Create a resource if it doesn't exist
		await this.#resource.create();
		await this.#internal.create();
		return this;
	}

	get() {
		return this.#internal.get();
	}

	async setContent(content: string) {
		await this.#internal.update((data) => ({ ...data, content }));
		return this;
	}
}
