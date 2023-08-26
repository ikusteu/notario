import { Observable } from "rxjs";
import { v4 as uuid } from "uuid";

import { CouchDocument, NotarioDocument } from "./types";

import { DocumentNode } from "./document_node";

import { processId } from "./utils";

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

	constructor(db: PouchDB.Database, id?: string) {
		const _id = processId("resources", id || uuid());
		this.#internal = new DocumentNode<ResourceData>(db, _id, resourceZeroValues);
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

	stream() {
		return {
			doc: () => this.#internal.stream()
		};
	}
}
