import { Observable } from "rxjs";
import { v4 as uuid } from "uuid";

import { CouchDocument, NotarioDocument } from "./types";

import { DocumentNode } from "./document_node";
import { ProjectInterface } from "./project";

import { processId } from "./utils";

export type SectionData = NotarioDocument<
	"section",
	{
		name: string;
		notes: string[];
		subsections: string[];
	}
>;

export interface SectionInterface {
	id(): string;
	create(): Promise<SectionInterface>;
	get(): Promise<CouchDocument<SectionData> | undefined>;
	setName(name: string): Promise<SectionInterface>;
	setNotes(notes: string[]): Promise<SectionInterface>;
	addNote(note: string): Promise<SectionInterface>;
	setSubsections(sections: string[]): Promise<SectionInterface>;
	addSubsection(section: string): Promise<SectionInterface>;
	stream(): {
		doc(): Observable<CouchDocument<SectionData>>;
	};
	// subsection(id: string): SectionInterface;
}

const sectionZeroValues: Required<SectionData> = {
	docType: "section",
	name: "",
	notes: [],
	subsections: []
};

export class Section implements SectionInterface {
	#db: PouchDB.Database;
	#project: ProjectInterface;

	#internal: DocumentNode<SectionData>;

	constructor(db: PouchDB.Database, project: ProjectInterface, id?: string) {
		this.#db = db;
		this.#project = project;
		const _id = processId(`${project.id()}/sections`, id || uuid());
		this.#internal = new DocumentNode<SectionData>(this.#db, _id, sectionZeroValues);
	}

	id() {
		return this.#internal._id;
	}

	async create() {
		// Create a project (if it doesn't exist) and add this section to it
		await this.#project.create();
		await this.#project.addSection(this.id());

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

	async setSubsections(sections: string[]) {
		await this.#internal.update((data) => ({ ...data, subsections: sections }));
		return this;
	}

	async addSubsection(section: string) {
		await this.#internal.update((data) => ({ ...data, subsections: [...new Set(data.subsections).add(section)] }));
		return this;
	}

	stream() {
		return {
			doc: () => this.#internal.stream()
		};
	}
}
