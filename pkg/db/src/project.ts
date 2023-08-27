import { Observable } from "rxjs";
import { v4 as uuid } from "uuid";

import { DocumentNode } from "./document_node";
import { Section, SectionInterface } from "./section";
import { CouchDocument, NotarioDocument } from "./types";

import { processId } from "./utils";

export type ProjectData = NotarioDocument<
	"project",
	{
		name: string;
		sections: string[];
	}
>;

export interface ProjectInterface {
	id(): string;
	create(): Promise<ProjectInterface>;
	get(): Promise<CouchDocument<ProjectData> | undefined>;
	setName(name: string): Promise<ProjectInterface>;
	stream(): {
		doc(): Observable<CouchDocument<ProjectData>>;
	};
	setSections(sections: string[]): Promise<ProjectInterface>;
	addSection(section: string): Promise<ProjectInterface>;
	section(id: string): SectionInterface;
}

const projectZeroValues: Required<ProjectData> = {
	docType: "project",
	name: "",
	sections: []
};

export class Project implements ProjectInterface {
	#internal: DocumentNode<ProjectData>;
	#db: PouchDB.Database;

	constructor(db: PouchDB.Database, id?: string) {
		const _id = processId("projects", id || uuid());
		this.#db = db;
		this.#internal = new DocumentNode<ProjectData>(this.#db, _id, projectZeroValues);
	}

	id() {
		return this.#internal._id;
	}

	async create() {
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

	async setSections(sections: string[]) {
		await this.#internal.update((data) => ({ ...data, sections }));
		return this;
	}

	async addSection(section: string): Promise<ProjectInterface> {
		await this.#internal.update((data) => ({ ...data, sections: [...new Set(data.sections).add(section)] }));
		return this;
	}

	section(id?: string): SectionInterface {
		return new Section(this.#db, this, id);
	}

	stream() {
		return {
			doc: () => this.#internal.stream()
		};
	}
}
