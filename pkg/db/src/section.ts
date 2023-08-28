import { Observable } from "rxjs";
import { v4 as uuid } from "uuid";

import { CouchDocument, NotarioDocument } from "./types";

import { DatabaseInterface } from "./index";
import { DocumentNode } from "./document_node";
import { ProjectInterface } from "./project";

import { processId } from "./utils";
import { newSubsectionInterface, SubsectionInterface } from "./subsection";

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
	subsection(id?: string): SubsectionInterface;
}

const sectionZeroValues: Required<SectionData> = {
	docType: "section",
	name: "",
	notes: [],
	subsections: []
};

class Section implements SectionInterface {
	#db: DatabaseInterface;
	#project: ProjectInterface;

	#internal: DocumentNode<SectionData>;

	constructor(db: DatabaseInterface, project: ProjectInterface, id?: string) {
		this.#db = db;
		this.#project = project;
		const _id = processId(`${project.id()}/sections`, id || uuid());
		this.#internal = new DocumentNode<SectionData>(this.#db._pouch, _id, sectionZeroValues);
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

	async addSubsection(subsection: string) {
		await this.#internal.update((data) => ({ ...data, subsections: [...new Set(data.subsections).add(subsection)] }));
		return this;
	}

	subsection(id?: string): SubsectionInterface {
		return newSubsectionInterface(this.#db, this, id);
	}

	stream() {
		return {
			doc: () => this.#internal.stream()
		};
	}
}

export const newSectionInterface = (db: DatabaseInterface, project: ProjectInterface, id?: string) => new Section(db, project, id);
